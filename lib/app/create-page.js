"use strict";
/**
 * create-page.ts - 宜搭自定义页面创建命令
 *
 * 用法：openyida create-page <appType> "<pageName>" [--datasource <jsonOrFile>]
 *
 * --datasource 参数（可选）：JSON 字符串或文件路径，用于在页面创建后注入连接器数据源。
 * 数据源定义格式：
 *   [{ "id": "myApi", "connectorId": "G-CONN-xxx", "actionId": "G-ACT-xxx" }]
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
const querystring = __importStar(require("querystring"));
const utils_1 = require("../core/utils");
const i18n_1 = require("../core/i18n");
const datasource_utils_1 = require("./datasource-utils");
async function run(args) {
    // 从参数中提取 --datasource 选项，解构返回值并更新 mutableArgs
    const mutableArgs = [...args];
    const { datasourceValue, remainingArgs } = (0, datasource_utils_1.extractDatasourceArg)(mutableArgs);
    mutableArgs.splice(0, mutableArgs.length, ...remainingArgs);
    if (mutableArgs.length < 2) {
        console.error((0, i18n_1.t)('create_page.usage'));
        console.error((0, i18n_1.t)('create_page.example'));
        process.exit(1);
    }
    const appType = mutableArgs[0];
    const pageName = mutableArgs[1];
    const SEPARATOR = '='.repeat(50);
    console.error(SEPARATOR);
    console.error((0, i18n_1.t)('create_page.title'));
    console.error(SEPARATOR);
    console.error((0, i18n_1.t)('create_page.app_id', appType));
    console.error((0, i18n_1.t)('create_page.page_name', pageName));
    // Step 1: 读取登录态
    console.error((0, i18n_1.t)('common.step_login', '1'));
    let cookieData = (0, utils_1.loadCookieData)();
    if (!cookieData) {
        console.error((0, i18n_1.t)('common.login_no_cache'));
        cookieData = (0, utils_1.triggerLogin)();
    }
    const authRef = {
        csrfToken: cookieData.csrf_token ?? '',
        cookies: cookieData.cookies,
        baseUrl: (0, utils_1.resolveBaseUrl)(cookieData),
        cookieData,
    };
    console.error((0, i18n_1.t)('common.login_ready', authRef.baseUrl));
    // Step 2: 创建自定义页面
    console.error((0, i18n_1.t)('create_page.step_create'));
    console.error((0, i18n_1.t)('create_page.sending'));
    const response = await (0, utils_1.requestWithAutoLogin)((auth) => {
        const postData = querystring.stringify({
            _csrf_token: auth.csrfToken,
            formType: 'display',
            title: JSON.stringify({ zh_CN: pageName, en_US: pageName, type: 'i18n' }),
        });
        return (0, utils_1.httpPost)(auth.baseUrl, `/dingtalk/web/${appType}/query/formdesign/saveFormSchemaInfo.json`, postData, auth.cookies);
    }, authRef);
    if (!response || !response.success || !response.content) {
        const errorMsg = response ? response.errorMsg || (0, i18n_1.t)('common.unknown_error') : (0, i18n_1.t)('common.request_failed');
        console.error((0, i18n_1.t)('create_page.failed', errorMsg));
        console.error('='.repeat(50));
        console.log(JSON.stringify({ success: false, error: errorMsg }));
        process.exit(1);
    }
    const rawContent = response.content;
    const pageId = (typeof rawContent === 'object' && rawContent !== null)
        ? rawContent.formUuid || rawContent.pageId
        : String(rawContent);
    if (!pageId) {
        console.error((0, i18n_1.t)('create_page.invalid_response'));
        console.log(JSON.stringify({ success: false, error: (0, i18n_1.t)('create_page.invalid_response') }));
        process.exit(1);
    }
    const pageUrl = `${authRef.baseUrl}/${appType}/workbench/${pageId}`;
    // Step 3: 注入连接器数据源（如果提供了 --datasource 参数）
    const datasourceDefinitions = (0, datasource_utils_1.parseDatasourceArg)(datasourceValue ?? undefined);
    if (datasourceDefinitions.length > 0) {
        console.error((0, i18n_1.t)('create_page.datasource_injecting', datasourceDefinitions.length.toString()));
        const dataSourceList = (0, datasource_utils_1.buildDataSourceList)(datasourceDefinitions);
        const schema = {
            schemaType: 'superform',
            schemaVersion: '5.0',
            dataSourceList: dataSourceList,
        };
        const saveSchemaResponse = await (0, utils_1.requestWithAutoLogin)((auth) => {
            const postData = querystring.stringify({
                _csrf_token: auth.csrfToken,
                formUuid: pageId,
                schemaVersion: 1,
                content: JSON.stringify(schema),
            });
            return (0, utils_1.httpPost)(auth.baseUrl, `/dingtalk/web/${appType}/query/formdesign/saveFormSchema.json`, postData, auth.cookies);
        }, authRef);
        if (saveSchemaResponse && saveSchemaResponse.success) {
            console.error((0, i18n_1.t)('create_page.datasource_success'));
        }
        else {
            const schemaErrorMsg = saveSchemaResponse
                ? saveSchemaResponse.errorMsg || (0, i18n_1.t)('common.unknown_error')
                : (0, i18n_1.t)('common.request_failed');
            console.error((0, i18n_1.t)('create_page.datasource_failed', schemaErrorMsg));
        }
    }
    // 输出结果
    console.error('\n' + SEPARATOR);
    console.error((0, i18n_1.t)('create_page.success'));
    console.error((0, i18n_1.t)('create_page.page_id_label', pageId));
    console.error((0, i18n_1.t)('create_page.url_label', pageUrl));
    console.error(SEPARATOR);
    console.log(JSON.stringify({ success: true, pageId, pageName, appType, url: pageUrl }));
}
//# sourceMappingURL=create-page.js.map