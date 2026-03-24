"use strict";
/**
 * get-page-config.ts - 宜搭页面公开访问/分享配置查询命令
 *
 * 用法：yidacli get-page-config <appType> <formUuid>
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const querystring_1 = __importDefault(require("querystring"));
const utils_1 = require("../core/utils");
const i18n_1 = require("../core/i18n");
function parseArgs() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error((0, i18n_1.t)('get_page_config.usage'));
        console.error((0, i18n_1.t)('get_page_config.example'));
        process.exit(1);
    }
    return { appType: args[0], formUuid: args[1] };
}
async function main() {
    const { appType, formUuid } = parseArgs();
    console.error('='.repeat(50));
    console.error((0, i18n_1.t)('get_page_config.title'));
    console.error('='.repeat(50));
    console.error((0, i18n_1.t)('get_page_config.app_id', appType));
    console.error((0, i18n_1.t)('get_page_config.form_uuid', formUuid));
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
    // Step 2: 查询分享配置
    console.error((0, i18n_1.t)('get_page_config.step_query'));
    console.error((0, i18n_1.t)('get_page_config.sending_request'));
    const shareConfig = await (0, utils_1.requestWithAutoLogin)((auth) => {
        const postData = querystring_1.default.stringify({
            _api: 'Share.getShareConfig',
            _csrf_token: auth.csrfToken,
            _locale_time_zone_offset: '28800000',
            formUuid,
        });
        return (0, utils_1.httpPost)(auth.baseUrl, `/dingtalk/web/${appType}/query/formdesign/getShareConfig.json`, postData, auth.cookies);
    }, authRef);
    // 输出结果
    console.error('\n' + '='.repeat(50));
    if (shareConfig && shareConfig.success !== false && !shareConfig.__needLogin && !shareConfig.__csrfExpired) {
        const content = shareConfig.content || {};
        const result = {
            isOpen: content.isOpen === 'y',
            openUrl: content.openUrl || null,
            shareUrl: content.shareUrl || null,
        };
        console.error((0, i18n_1.t)('get_page_config.query_ok'));
        console.error('='.repeat(50));
        if (result.openUrl) {
            console.error((0, i18n_1.t)('get_page_config.open_url', authRef.baseUrl + result.openUrl));
        }
        if (result.shareUrl) {
            console.error((0, i18n_1.t)('get_page_config.share_url', authRef.baseUrl + result.shareUrl));
        }
        if (!result.openUrl && !result.shareUrl) {
            console.error((0, i18n_1.t)('get_page_config.no_config'));
        }
        console.log(JSON.stringify(result, null, 2));
    }
    else {
        const errorMsg = shareConfig ? shareConfig.errorMsg || (0, i18n_1.t)('common.unknown_error') : (0, i18n_1.t)('common.request_failed');
        console.error((0, i18n_1.t)('get_page_config.query_failed', errorMsg));
        console.error('='.repeat(50));
        process.exit(1);
    }
}
main().catch((error) => {
    console.error((0, i18n_1.t)('common.exception', error.message));
    process.exit(1);
});
//# sourceMappingURL=get-page-config.js.map