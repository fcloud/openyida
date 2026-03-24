"use strict";
/**
 * export-app.ts - 宜搭应用导出命令
 *
 * 导出应用的所有表单 Schema，生成可移植的迁移包（yida-export.json）。
 *
 * 用法：openyida export <appType> [output]
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
const utils_1 = require("../core/utils");
const i18n_1 = require("../core/i18n");
async function fetchFormPageList(appType, authRef) {
    const result = await (0, utils_1.requestWithAutoLogin)((auth) => {
        return (0, utils_1.httpGet)(auth.baseUrl, `/alibaba/web/${appType}/_view/query/app/getAppItemList.json`, { appType }, auth.cookies);
    }, authRef);
    if (!result || result.success === false) {
        throw new Error((0, i18n_1.t)('export.fetch_forms_failed') + ': ' + (result ? result.errorMsg || (0, i18n_1.t)('common.unknown_error') : (0, i18n_1.t)('common.request_failed')));
    }
    // 过滤出表单类型的页面（formType 为 form 或 report）
    const items = result.content || result.data || [];
    const formPages = [];
    function collectFormPages(nodes) {
        for (const node of nodes) {
            if (node.formType === 'form' || node.formType === 'report' || node.formType === 'subForm') {
                formPages.push({
                    formUuid: node.formUuid || node.pageId,
                    name: node.name || node.formName || node.pageTitle || (0, i18n_1.t)('export.unnamed_form'),
                    formType: node.formType,
                });
            }
            if (node.children && node.children.length > 0) {
                collectFormPages(node.children);
            }
        }
    }
    collectFormPages(Array.isArray(items) ? items : [items]);
    return formPages;
}
// ── 获取单个表单 Schema ───────────────────────────────
async function fetchFormSchema(appType, formUuid, authRef) {
    const result = await (0, utils_1.requestWithAutoLogin)((auth) => {
        return (0, utils_1.httpGet)(auth.baseUrl, `/alibaba/web/${appType}/_view/query/formdesign/getFormSchema.json`, { formUuid, schemaVersion: 'V5' }, auth.cookies);
    }, authRef);
    if (!result || result.success === false) {
        return null;
    }
    return result;
}
// ── 主逻辑 ────────────────────────────────────────────
async function run(args) {
    if (args.length < 1) {
        console.error((0, i18n_1.t)('export.usage'));
        console.error((0, i18n_1.t)('export.example1'));
        console.error((0, i18n_1.t)('export.example2'));
        process.exit(1);
    }
    const appType = args[0];
    const outputPath = args[1] || path.join(process.cwd(), 'yida-export.json');
    console.error('='.repeat(50));
    console.error((0, i18n_1.t)('export.title'));
    console.error('='.repeat(50));
    console.error((0, i18n_1.t)('export.app_id', appType));
    console.error((0, i18n_1.t)('export.output_file', outputPath));
    // Step 1: 读取登录态
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
    // Step 2: 获取表单页面列表
    console.error((0, i18n_1.t)('export.step_get_forms'));
    let formPages;
    try {
        formPages = await fetchFormPageList(appType, authRef);
    }
    catch (err) {
        console.error('  ❌ ' + err.message);
        process.exit(1);
    }
    if (formPages.length === 0) {
        console.error((0, i18n_1.t)('export.no_forms'));
        process.exit(1);
    }
    console.error((0, i18n_1.t)('export.forms_found', formPages.length.toString()));
    formPages.forEach((page, index) => {
        console.error('     ' + (index + 1) + '. ' + page.name + ' (' + page.formUuid + ')');
    });
    // Step 3: 逐个导出表单 Schema
    console.error((0, i18n_1.t)('export.step_export_schema'));
    const exportedForms = [];
    let successCount = 0;
    let failCount = 0;
    for (const page of formPages) {
        console.error((0, i18n_1.t)('export.exporting', page.name, page.formUuid));
        const schema = await fetchFormSchema(appType, page.formUuid, authRef);
        if (schema) {
            exportedForms.push({
                formUuid: page.formUuid,
                name: page.name,
                formType: page.formType,
                schema,
            });
            console.error((0, i18n_1.t)('export.export_ok'));
            successCount++;
        }
        else {
            console.error((0, i18n_1.t)('export.export_failed'));
            failCount++;
        }
    }
    // Step 4: 写入导出文件
    console.error((0, i18n_1.t)('export.step_write_file'));
    const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        sourceAppType: appType,
        baseUrl: authRef.baseUrl,
        forms: exportedForms,
    };
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');
    // 输出结果
    console.error('\n' + '='.repeat(50));
    console.error((0, i18n_1.t)('export.done'));
    console.error((0, i18n_1.t)('export.success_count', successCount.toString()));
    if (failCount > 0) {
        console.error((0, i18n_1.t)('export.fail_count', failCount.toString()));
    }
    console.error((0, i18n_1.t)('export.output_file', outputPath));
    console.error('='.repeat(50));
    console.log(JSON.stringify({
        success: true,
        appType,
        outputPath,
        totalForms: formPages.length,
        successCount,
        failCount,
    }));
}
//# sourceMappingURL=export-app.js.map