"use strict";
/**
 * get-schema.ts - 宜搭表单 Schema 获取命令
 *
 * 用法：yidacli get-schema <appType> <formUuid>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const utils_1 = require("../core/utils");
const i18n_1 = require("../core/i18n");
async function run(args) {
    if (args.length < 2) {
        console.error((0, i18n_1.t)('get_schema.usage'));
        console.error((0, i18n_1.t)('get_schema.example'));
        process.exit(1);
    }
    const appType = args[0];
    const formUuid = args[1];
    const SEP = '='.repeat(50);
    console.error(SEP);
    console.error((0, i18n_1.t)('get_schema.title'));
    console.error(SEP);
    console.error((0, i18n_1.t)('get_schema.app_id', appType));
    console.error((0, i18n_1.t)('get_schema.form_uuid', formUuid));
    // Step 1: 读取登录态
    console.error((0, i18n_1.t)('common.step_login', '1'));
    let cookieData = (0, utils_1.loadCookieData)();
    if (!cookieData) {
        console.error((0, i18n_1.t)('common.login_no_cache'));
        cookieData = (0, utils_1.triggerLogin)();
    }
    const authRef = {
        csrfToken: cookieData.csrf_token,
        cookies: cookieData.cookies,
        baseUrl: (0, utils_1.resolveBaseUrl)(cookieData),
        cookieData,
    };
    console.error((0, i18n_1.t)('common.login_ready', authRef.baseUrl));
    // Step 2: 获取表单 Schema
    console.error((0, i18n_1.t)('get_schema.step_get'));
    console.error((0, i18n_1.t)('get_schema.sending'));
    const result = await (0, utils_1.requestWithAutoLogin)((auth) => {
        return (0, utils_1.httpGet)(auth.baseUrl, `/alibaba/web/${appType}/_view/query/formdesign/getFormSchema.json`, { formUuid, schemaVersion: 'V5' }, auth.cookies);
    }, authRef);
    // 输出结果
    console.error('\n' + SEP);
    if (result && result.success !== false && !result.__needLogin && !result.__csrfExpired) {
        console.error((0, i18n_1.t)('get_schema.success'));
        console.error(SEP);
        console.log(JSON.stringify(result, null, 2));
    }
    else {
        const errorMsg = result ? result.errorMsg || (0, i18n_1.t)('common.unknown_error') : (0, i18n_1.t)('common.request_failed');
        console.error((0, i18n_1.t)('get_schema.failed', errorMsg));
        console.error(SEP);
        process.exit(1);
    }
}
//# sourceMappingURL=get-schema.js.map