"use strict";
/**
 * import-app.ts - 宜搭应用导入命令
 *
 * 将 openyida export 生成的迁移包导入到目标宜搭环境，自动重建应用和所有表单页面。
 *
 * 用法：openyida import <file> [name]
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const querystring = __importStar(require("querystring"));
const utils_1 = require("../core/utils");
const i18n_1 = require("../core/i18n");
// ── 创建新应用 ────────────────────────────────────────
async function createApp(appName, authRef) {
    const postData = querystring.stringify({
        _csrf_token: authRef.csrfToken,
        appName: JSON.stringify({ zh_CN: appName, en_US: appName, type: 'i18n' }),
        description: JSON.stringify({ zh_CN: appName, en_US: appName, type: 'i18n' }),
        icon: 'xian-yingyong%%#0089FF',
        iconUrl: 'xian-yingyong%%#0089FF',
        colour: 'blue',
        defaultLanguage: 'zh_CN',
        openExclusive: 'n',
        openPhysicColumn: 'n',
        openIsolationDatabase: 'n',
        openExclusiveUnit: 'n',
        group: 'ALL',
    });
    const result = await (0, utils_1.requestWithAutoLogin)((auth) => {
        return (0, utils_1.httpPost)(auth.baseUrl, '/query/app/registerApp.json', postData, auth.cookies);
    }, authRef);
    if (!result || !result.success || !result.content) {
        throw new Error((0, i18n_1.t)('import.create_app_error') + ': ' + (result ? result.errorMsg || (0, i18n_1.t)('common.unknown_error') : (0, i18n_1.t)('common.request_failed')));
    }
    return result.content; // appType
}
// ── 创建空白表单页面 ──────────────────────────────────
async function createBlankForm(appType, formTitle, authRef) {
    const postData = querystring.stringify({
        _csrf_token: authRef.csrfToken,
        formType: 'receipt',
        title: JSON.stringify({ zh_CN: formTitle, en_US: formTitle, type: 'i18n' }),
    });
    const result = await (0, utils_1.requestWithAutoLogin)((auth) => {
        return (0, utils_1.httpPost)(auth.baseUrl, `/dingtalk/web/${appType}/query/formdesign/saveFormSchemaInfo.json`, postData, auth.cookies);
    }, authRef);
    if (!result || !result.success || !result.content) {
        throw new Error((0, i18n_1.t)('import.create_form_error') + ': ' + (result ? result.errorMsg || (0, i18n_1.t)('common.unknown_error') : (0, i18n_1.t)('common.request_failed')));
    }
    const content = result.content;
    return content.formUuid || content;
}
// ── 保存表单 Schema ───────────────────────────────────
async function saveFormSchema(appType, formUuid, schema, authRef) {
    const postData = querystring.stringify({
        _csrf_token: authRef.csrfToken,
        appType,
        formUuid,
        content: JSON.stringify(schema),
        schemaVersion: 'V5',
    });
    const result = await (0, utils_1.requestWithAutoLogin)((auth) => {
        return (0, utils_1.httpPost)(auth.baseUrl, `/alibaba/web/${appType}/_view/query/formdesign/saveFormSchema.json`, postData, auth.cookies);
    }, authRef);
    return result;
}
// ── 更新表单配置（发布表单）─────────────────────────────
async function updateFormConfig(appType, formUuid, authRef) {
    const postData = querystring.stringify({
        _csrf_token: authRef.csrfToken,
        appType,
        formUuid,
        setting: JSON.stringify({ MINI_RESOURCE: 0 }),
        version: 1,
    });
    const result = await (0, utils_1.requestWithAutoLogin)((auth) => {
        return (0, utils_1.httpPost)(auth.baseUrl, `/dingtalk/web/${appType}/query/formdesign/updateFormConfig.json`, postData, auth.cookies);
    }, authRef);
    return result;
}
// ── 适配 SerialNumberField formula ───────────────────
//
// 将 Schema 中所有 SerialNumberField 的 formula 里的旧 appType 替换为新 appType，
// 同时将旧 formUuid 替换为新 formUuid。
function adaptSerialNumberFormulas(schema, oldAppType, newAppType, oldFormUuid, newFormUuid) {
    const schemaStr = JSON.stringify(schema);
    const adapted = schemaStr
        .replace(new RegExp(escapeRegExp(oldAppType), 'g'), newAppType)
        .replace(new RegExp(escapeRegExp(oldFormUuid), 'g'), newFormUuid);
    return JSON.parse(adapted);
}
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
// ── 从 Schema 中提取表单 Schema 内容 ─────────────────
//
// getFormSchema 接口返回的结构可能是 { content: {...} } 或直接是 schema 对象。
function extractSchemaContent(schemaResult) {
    if (!schemaResult) {
        return null;
    }
    if (schemaResult.content && typeof schemaResult.content === 'object') {
        return schemaResult.content;
    }
    if (schemaResult.pages) {
        return schemaResult;
    }
    return null;
}
// ── 主逻辑 ────────────────────────────────────────────
async function run(args) {
    if (args.length < 1) {
        console.error((0, i18n_1.t)('import.usage'));
        console.error((0, i18n_1.t)('import.example1'));
        console.error((0, i18n_1.t)('import.example2'));
        process.exit(1);
    }
    const exportFilePath = path.resolve(args[0]);
    const targetAppName = args[1] || null;
    console.error('='.repeat(50));
    console.error((0, i18n_1.t)('import.title'));
    console.error('='.repeat(50));
    console.error((0, i18n_1.t)('import.import_file', exportFilePath));
    // Step 1: 读取导出文件
    console.error((0, i18n_1.t)('import.step_read_file'));
    if (!fs.existsSync(exportFilePath)) {
        console.error((0, i18n_1.t)('import.file_not_found', exportFilePath));
        process.exit(1);
    }
    let exportData;
    try {
        exportData = JSON.parse(fs.readFileSync(exportFilePath, 'utf-8'));
    }
    catch (err) {
        console.error((0, i18n_1.t)('import.parse_failed', err.message));
        process.exit(1);
    }
    const { sourceAppType, forms } = exportData;
    if (!sourceAppType || !Array.isArray(forms) || forms.length === 0) {
        console.error((0, i18n_1.t)('import.invalid_format'));
        process.exit(1);
    }
    const appName = targetAppName || (sourceAppType + (0, i18n_1.t)('import.migration_suffix'));
    console.error((0, i18n_1.t)('import.read_ok', forms.length.toString()));
    console.error((0, i18n_1.t)('import.source_app_id', sourceAppType));
    console.error((0, i18n_1.t)('import.target_app_name', appName));
    // Step 2: 读取登录态
    console.error((0, i18n_1.t)('common.step_login_label'));
    let cookieData = (0, utils_1.loadCookieData)();
    if (!cookieData) {
        console.error((0, i18n_1.t)('common.no_login_cache'));
        cookieData = (0, utils_1.triggerLogin)();
    }
    const authRef = {
        csrfToken: cookieData.csrf_token,
        cookies: cookieData.cookies,
        baseUrl: (0, utils_1.resolveBaseUrl)(cookieData),
        cookieData,
    };
    console.error((0, i18n_1.t)('common.login_ready', authRef.baseUrl));
    // Step 3: 创建新应用
    console.error((0, i18n_1.t)('import.step_create_app'));
    let newAppType;
    try {
        newAppType = await createApp(appName, authRef);
    }
    catch (err) {
        console.error('  ❌ ' + err.message);
        process.exit(1);
    }
    console.error((0, i18n_1.t)('import.app_created', newAppType));
    // Step 4: 逐个重建表单页面
    console.error((0, i18n_1.t)('import.step_rebuild_forms'));
    const migrationReport = {
        version: '1.0',
        migratedAt: new Date().toISOString(),
        sourceAppType,
        targetAppType: newAppType,
        targetAppName: appName,
        baseUrl: authRef.baseUrl,
        forms: [],
    };
    let successCount = 0;
    let failCount = 0;
    for (const form of forms) {
        const { formUuid: oldFormUuid, name: formName, schema: formSchemaResult } = form;
        console.error((0, i18n_1.t)('import.migrating', formName, oldFormUuid));
        // 4.1 创建空白表单
        let newFormUuid;
        try {
            newFormUuid = await createBlankForm(newAppType, formName, authRef);
            console.error((0, i18n_1.t)('import.blank_form_created', newFormUuid));
        }
        catch (err) {
            console.error((0, i18n_1.t)('import.create_form_failed', err.message));
            migrationReport.forms.push({
                oldFormUuid,
                newFormUuid: null,
                name: formName,
                status: 'failed',
                error: err.message,
            });
            failCount++;
            continue;
        }
        // 4.2 提取并适配 Schema
        const originalSchema = extractSchemaContent(formSchemaResult);
        if (!originalSchema) {
            console.error((0, i18n_1.t)('import.schema_empty'));
            migrationReport.forms.push({
                oldFormUuid,
                newFormUuid,
                name: formName,
                status: 'skipped',
                error: (0, i18n_1.t)('import.schema_empty_msg'),
            });
            failCount++;
            continue;
        }
        // 将 Schema 中所有旧 appType / formUuid 替换为新值
        const adaptedSchema = adaptSerialNumberFormulas(originalSchema, sourceAppType, newAppType, oldFormUuid, newFormUuid);
        // 4.3 保存 Schema
        const saveResult = await saveFormSchema(newAppType, newFormUuid, adaptedSchema, authRef);
        if (!saveResult || !saveResult.success) {
            const errorMsg = saveResult ? saveResult.errorMsg || (0, i18n_1.t)('common.unknown_error') : (0, i18n_1.t)('common.request_failed');
            console.error((0, i18n_1.t)('import.save_schema_failed', errorMsg));
            migrationReport.forms.push({
                oldFormUuid,
                newFormUuid,
                name: formName,
                status: 'failed',
                error: (0, i18n_1.t)('import.save_schema_failed', errorMsg),
            });
            failCount++;
            continue;
        }
        console.error((0, i18n_1.t)('import.schema_saved'));
        // 4.4 更新表单配置
        const configResult = await updateFormConfig(newAppType, newFormUuid, authRef);
        if (!configResult || !configResult.success) {
            const errorMsg = configResult ? configResult.errorMsg || (0, i18n_1.t)('common.unknown_error') : (0, i18n_1.t)('common.request_failed');
            console.error((0, i18n_1.t)('import.config_failed', errorMsg));
        }
        else {
            console.error((0, i18n_1.t)('import.config_updated'));
        }
        migrationReport.forms.push({
            oldFormUuid,
            newFormUuid,
            name: formName,
            status: 'success',
        });
        successCount++;
    }
    // Step 5: 写入迁移报告
    console.error((0, i18n_1.t)('import.step_write_report'));
    const reportPath = path.join(process.cwd(), 'yida-migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(migrationReport, null, 2), 'utf-8');
    console.error((0, i18n_1.t)('import.report_written', reportPath));
    // 输出结果
    const appUrl = `${authRef.baseUrl}/${newAppType}/admin`;
    console.error('\n' + '='.repeat(50));
    console.error((0, i18n_1.t)('import.done'));
    console.error((0, i18n_1.t)('import.new_app_id', newAppType));
    console.error((0, i18n_1.t)('import.new_app_name', appName));
    console.error((0, i18n_1.t)('import.app_url', appUrl));
    console.error((0, i18n_1.t)('import.success_count', successCount.toString()));
    if (failCount > 0) {
        console.error((0, i18n_1.t)('import.fail_count', failCount.toString()));
    }
    console.error((0, i18n_1.t)('import.report_path', reportPath));
    if (failCount > 0) {
        console.error((0, i18n_1.t)('import.notice_label'));
        console.error((0, i18n_1.t)('import.notice_association'));
        console.error((0, i18n_1.t)('import.notice_custom_page'));
    }
    console.error('='.repeat(50));
    console.log(JSON.stringify({
        success: true,
        sourceAppType,
        targetAppType: newAppType,
        targetAppName: appName,
        appUrl,
        reportPath,
        totalForms: forms.length,
        successCount,
        failCount,
    }));
}
//# sourceMappingURL=import-app.js.map