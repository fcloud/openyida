/**
 * query-data.ts - 宜搭统一数据管理命令
 * 支持表单数据、流程实例、任务、子表单等资源的增删改查。
 *
 * USAGE:
 *   openyida data query form <appType> <formUuid> [--page N] [--size N] [--search-json JSON]
 *   openyida data get form <appType> <formUuid> --inst-id <instId>
 *   openyida data create form <appType> <formUuid> --data <JSON>
 *   openyida data update form <appType> <formUuid> --inst-id <instId> --data <JSON>
 *   openyida data query subform <appType> <formUuid> --inst-id <instId>
 *   openyida data query process <appType> <formUuid> [--page N] [--size N]
 *   openyida data get process <appType> <processInstanceId>
 *   openyida data create process <appType> <formUuid> --data <JSON>
 *   openyida data update process <appType> <processInstanceId> --data <JSON>
 *   openyida data query operation-records <appType> <processInstanceId>
 *   openyida data execute task <appType> <taskId> --data <JSON>
 *   openyida data query tasks <appType> [--page N] [--size N]
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const utils_1 = require("./utils");
/**
 * 将 snake_case 字符串转为 camelCase。
 */
function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
/**
 * 解析 CLI 参数数组，返回位置参数和命名选项。
 * - 位置参数：不以 -- 开头的参数
 * - 命名选项：--key value 或 --flag（布尔值）
 * - kebab-case 选项名自动转为 snake_case
 */
function parseCliOptions(args) {
    const positionals = [];
    const options = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const key = arg.slice(2).replace(/-/g, '_');
            const nextArg = args[i + 1];
            if (nextArg !== undefined && !nextArg.startsWith('--')) {
                options[key] = nextArg;
                i++;
            }
            else {
                options[key] = true;
            }
        }
        else {
            positionals.push(arg);
        }
    }
    return { positionals, options };
}
/**
 * 规范化 page/size 参数，确保在合法范围内。
 */
function clampPageSize(options, defaultSize) {
    const resolvedDefaultSize = defaultSize !== undefined ? defaultSize : 20;
    let page = parseInt(String(options.page), 10);
    if (isNaN(page) || page < 1) {
        page = 1;
    }
    options.page = page;
    let size = parseInt(String(options.size), 10);
    if (isNaN(size) || size < 1) {
        size = resolvedDefaultSize;
    }
    if (size > 100) {
        size = 100;
    }
    options.size = size;
}
async function run(args) {
    const { positionals, options } = parseCliOptions(args);
    const action = positionals[0];
    const resource = positionals[1];
    const appType = positionals[2];
    const formUuid = positionals[3];
    const SEP = '='.repeat(50);
    if (!action || !resource || !appType) {
        console.error('用法：openyida data <action> <resource> <appType> [formUuid] [options]');
        console.error('示例：');
        console.error('  openyida data query form <appType> <formUuid>');
        console.error('  openyida data create form <appType> <formUuid> --data <JSON>');
        console.error('  openyida data execute task <appType> <taskId> --data <JSON>');
        process.exit(1);
    }
    console.error(SEP);
    console.error(`  data ${action} ${resource}`);
    console.error(SEP);
    const cookieData = (0, utils_1.loadCookieData)();
    if (!cookieData || !cookieData.cookies) {
        console.error('  ❌ 未登录，请先执行 openyida login');
        process.exit(1);
    }
    const authRef = {
        cookieData,
        cookies: cookieData.cookies,
        csrfToken: cookieData.csrf_token || '',
        baseUrl: (0, utils_1.resolveBaseUrl)(cookieData),
    };
    let result;
    if (action === 'query' && resource === 'form') {
        clampPageSize(options);
        const queryParams = {
            _csrf_token: authRef.csrfToken,
            _stamp: String(Date.now()),
            formUuid,
            appType,
            currentPage: String(options.page),
            pageSize: String(options.size),
        };
        if (options.search_json) {
            queryParams.searchFieldJson = String(options.search_json);
        }
        result = await (0, utils_1.requestWithAutoLogin)((auth) => (0, utils_1.httpGet)(auth.baseUrl, `/dingtalk/web/${appType}/v1/form/searchFormDatas.json`, queryParams, auth.cookies), authRef);
    }
    else if (action === 'get' && resource === 'form') {
        const queryParams = {
            _csrf_token: authRef.csrfToken,
            _stamp: String(Date.now()),
            formInstId: String(options.inst_id),
        };
        result = await (0, utils_1.requestWithAutoLogin)((auth) => (0, utils_1.httpGet)(auth.baseUrl, `/dingtalk/web/${appType}/v1/form/getFormDataById.json`, queryParams, auth.cookies), authRef);
    }
    else if (action === 'create' && resource === 'form') {
        result = await (0, utils_1.requestWithAutoLogin)((auth) => (0, utils_1.httpPost)(auth.baseUrl, `/dingtalk/web/${appType}/v1/form/saveFormData.json`, `_csrf_token=${encodeURIComponent(auth.csrfToken)}&formUuid=${encodeURIComponent(formUuid)}&appType=${encodeURIComponent(appType)}&formDataJson=${encodeURIComponent(String(options.data || '{}'))}`, auth.cookies), authRef);
    }
    else if (action === 'update' && resource === 'form') {
        result = await (0, utils_1.requestWithAutoLogin)((auth) => (0, utils_1.httpPost)(auth.baseUrl, `/dingtalk/web/${appType}/v1/form/updateFormData.json`, `_csrf_token=${encodeURIComponent(auth.csrfToken)}&formInstId=${encodeURIComponent(String(options.inst_id))}&appType=${encodeURIComponent(appType)}&updateFormDataJson=${encodeURIComponent(String(options.data || '{}'))}`, auth.cookies), authRef);
    }
    else if (action === 'query' && resource === 'subform') {
        result = await (0, utils_1.requestWithAutoLogin)((auth) => (0, utils_1.httpGet)(auth.baseUrl, `/dingtalk/web/${appType}/v1/form/getSubFormDatas.json`, {
            _csrf_token: auth.csrfToken,
            _stamp: String(Date.now()),
            formInstId: String(options.inst_id),
            appType,
        }, auth.cookies), authRef);
    }
    else if (action === 'query' && resource === 'process') {
        clampPageSize(options);
        result = await (0, utils_1.requestWithAutoLogin)((auth) => (0, utils_1.httpGet)(auth.baseUrl, `/dingtalk/web/${appType}/v1/process/getInstances.json`, {
            _csrf_token: auth.csrfToken,
            _stamp: String(Date.now()),
            formUuid,
            appType,
            currentPage: String(options.page),
            pageSize: String(options.size),
        }, auth.cookies), authRef);
    }
    else if (action === 'get' && resource === 'process') {
        result = await (0, utils_1.requestWithAutoLogin)((auth) => (0, utils_1.httpGet)(auth.baseUrl, `/dingtalk/web/${appType}/v1/process/getInstanceById.json`, {
            _csrf_token: auth.csrfToken,
            _stamp: String(Date.now()),
            processInstanceId: formUuid,
            appType,
        }, auth.cookies), authRef);
    }
    else if (action === 'create' && resource === 'process') {
        result = await (0, utils_1.requestWithAutoLogin)((auth) => (0, utils_1.httpPost)(auth.baseUrl, `/dingtalk/web/${appType}/v1/process/startInstance.json`, `_csrf_token=${encodeURIComponent(auth.csrfToken)}&formUuid=${encodeURIComponent(formUuid)}&appType=${encodeURIComponent(appType)}&formDataJson=${encodeURIComponent(String(options.data || '{}'))}`, auth.cookies), authRef);
    }
    else if (action === 'update' && resource === 'process') {
        result = await (0, utils_1.requestWithAutoLogin)((auth) => (0, utils_1.httpPost)(auth.baseUrl, `/dingtalk/web/${appType}/v1/process/updateInstance.json`, `_csrf_token=${encodeURIComponent(auth.csrfToken)}&processInstanceId=${encodeURIComponent(formUuid)}&appType=${encodeURIComponent(appType)}&updateFormDataJson=${encodeURIComponent(String(options.data || '{}'))}`, auth.cookies), authRef);
    }
    else if (action === 'query' && resource === 'operation-records') {
        result = await (0, utils_1.requestWithAutoLogin)((auth) => (0, utils_1.httpGet)(auth.baseUrl, `/dingtalk/web/${appType}/v1/process/getOperationRecords.json`, {
            _csrf_token: auth.csrfToken,
            _stamp: String(Date.now()),
            processInstanceId: formUuid,
            appType,
        }, auth.cookies), authRef);
    }
    else if (action === 'execute' && resource === 'task') {
        result = await (0, utils_1.requestWithAutoLogin)((auth) => (0, utils_1.httpPost)(auth.baseUrl, `/dingtalk/web/${appType}/v1/task/executeTask.json`, `_csrf_token=${encodeURIComponent(auth.csrfToken)}&taskId=${encodeURIComponent(formUuid)}&appType=${encodeURIComponent(appType)}&formDataJson=${encodeURIComponent(String(options.data || '{}'))}`, auth.cookies), authRef);
    }
    else if (action === 'query' && resource === 'tasks') {
        clampPageSize(options);
        result = await (0, utils_1.requestWithAutoLogin)((auth) => (0, utils_1.httpGet)(auth.baseUrl, `/dingtalk/web/${appType}/v1/task/getTasks.json`, {
            _csrf_token: auth.csrfToken,
            _stamp: String(Date.now()),
            appType,
            currentPage: String(options.page),
            pageSize: String(options.size),
        }, auth.cookies), authRef);
    }
    else {
        console.error(`  ❌ 不支持的操作：${action} ${resource}`);
        console.error('  支持的操作：query/get/create/update form, query subform, query/get/create/update process, query operation-records, execute task, query tasks');
        process.exit(1);
    }
    console.error('\n' + SEP);
    if (result && result.success) {
        console.error('  ✅ 操作成功！');
        console.error(SEP);
        console.log(JSON.stringify(result, null, 2));
    }
    else {
        const errorMsg = result?.errorMsg ?? '未知错误';
        const errorCode = result?.errorCode ?? '';
        console.error(`  ❌ 操作失败：${errorMsg}`);
        if (errorCode) {
            console.error(`  错误码：${errorCode}`);
        }
        console.error(SEP);
        process.exit(1);
    }
}
//# sourceMappingURL=query-data.js.map