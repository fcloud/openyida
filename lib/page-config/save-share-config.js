"use strict";
/**
 * save-share-config.ts - 宜搭页面公开访问/分享配置保存命令
 *
 * 用法：yidacli save-share-config <appType> <formUuid> <url> <isOpen> [openAuth]
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const querystring_1 = __importDefault(require("querystring"));
const utils_1 = require("../core/utils");
const i18n_1 = require("../core/i18n");
function parseArgs() {
    const args = process.argv.slice(2);
    if (args.length < 4) {
        console.error((0, i18n_1.t)('save_share_config.usage'));
        console.error((0, i18n_1.t)('save_share_config.example'));
        console.error((0, i18n_1.t)('save_share_config.is_open_hint'));
        console.error((0, i18n_1.t)('save_share_config.open_auth_hint'));
        process.exit(1);
    }
    return {
        appType: args[0],
        formUuid: args[1],
        openUrl: args[2],
        isOpen: args[3],
        openAuth: args[4] || 'n',
    };
}
function validateParams(params) {
    if (params.isOpen !== 'y' && params.isOpen !== 'n') {
        throw new Error((0, i18n_1.t)('save_share_config.err_is_open_invalid', params.isOpen));
    }
    if (params.openAuth !== 'y' && params.openAuth !== 'n') {
        throw new Error((0, i18n_1.t)('save_share_config.err_open_auth_invalid', params.openAuth));
    }
    if (params.isOpen === 'y' && !params.openUrl) {
        throw new Error((0, i18n_1.t)('save_share_config.err_open_url_required'));
    }
    if (params.isOpen === 'n') {
        return;
    }
    if (!params.openUrl.startsWith('/o/') && !params.openUrl.startsWith('/s/')) {
        throw new Error((0, i18n_1.t)('save_share_config.err_open_url_prefix', params.openUrl) + '（也支持 /s/ 前缀用于组织内分享）');
    }
    const pathPart = params.openUrl.slice(3);
    if (!/^[a-zA-Z0-9_-]+$/.test(pathPart)) {
        throw new Error((0, i18n_1.t)('save_share_config.err_open_url_chars', params.openUrl));
    }
}
function sendPostRequest(baseUrl, cookies, requestPath, postData) {
    return new Promise((resolve) => {
        const cookieHeader = cookies
            .map((cookie) => `${cookie.name}=${cookie.value}`)
            .join('; ');
        const parsedUrl = new URL(baseUrl);
        const isHttps = parsedUrl.protocol === 'https:';
        const requestModule = isHttps ? https_1.default : http_1.default;
        const requestOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (isHttps ? 443 : 80),
            path: requestPath,
            method: 'POST',
            headers: {
                Origin: baseUrl,
                Referer: baseUrl + '/',
                Cookie: cookieHeader,
                Accept: 'application/json, text/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-requested-with': 'XMLHttpRequest',
            },
            timeout: 30000,
        };
        const request = requestModule.request(requestOptions, (response) => {
            let responseData = '';
            response.on('data', (chunk) => { responseData += chunk; });
            response.on('end', () => {
                console.error((0, i18n_1.t)('common.http_status', String(response.statusCode ?? '')));
                let parsed;
                try {
                    parsed = JSON.parse(responseData);
                }
                catch (parseError) {
                    console.error((0, i18n_1.t)('common.response_body', responseData.substring(0, 500)));
                    resolve({ success: false, errorMsg: 'HTTP ' + response.statusCode + ': ' + (0, i18n_1.t)('common.response_not_json') });
                    return;
                }
                if ((0, utils_1.isLoginExpired)(parsed)) {
                    console.error((0, i18n_1.t)('common.login_expired', parsed.errorMsg));
                    resolve({ __needLogin: true });
                    return;
                }
                if ((0, utils_1.isCsrfTokenExpired)(parsed)) {
                    console.error((0, i18n_1.t)('common.csrf_expired', parsed.errorMsg));
                    resolve({ __csrfExpired: true });
                    return;
                }
                resolve(parsed);
            });
        });
        request.on('timeout', () => {
            console.error((0, i18n_1.t)('common.request_timeout'));
            request.destroy();
            resolve({ success: false, errorMsg: (0, i18n_1.t)('common.request_timeout') });
        });
        request.on('error', () => {
            resolve({ success: false, errorMsg: (0, i18n_1.t)('common.request_error') });
        });
        request.write(postData);
        request.end();
    });
}
async function main() {
    const { appType, formUuid, openUrl, isOpen, openAuth } = parseArgs();
    console.error('='.repeat(50));
    console.error((0, i18n_1.t)('save_share_config.title'));
    console.error('='.repeat(50));
    console.error((0, i18n_1.t)('save_share_config.app_id', appType));
    console.error((0, i18n_1.t)('save_share_config.form_uuid', formUuid));
    console.error((0, i18n_1.t)('save_share_config.open_url', openUrl || (0, i18n_1.t)('common.empty')));
    console.error((0, i18n_1.t)('save_share_config.is_open', isOpen === 'y' ? (0, i18n_1.t)('common.yes') : (0, i18n_1.t)('common.no')));
    console.error((0, i18n_1.t)('save_share_config.open_auth', openAuth === 'y' ? (0, i18n_1.t)('common.yes') : (0, i18n_1.t)('common.no')));
    console.error((0, i18n_1.t)('save_share_config.step_validate'));
    try {
        validateParams({ openUrl, isOpen, openAuth });
        console.error((0, i18n_1.t)('save_share_config.validate_ok'));
    }
    catch (err) {
        console.error((0, i18n_1.t)('save_share_config.validate_failed', err.message));
        process.exit(1);
    }
    console.error((0, i18n_1.t)('common.step_login_label'));
    let cookieData = (0, utils_1.loadCookieData)();
    if (!cookieData) {
        console.error((0, i18n_1.t)('common.no_login_cache'));
        cookieData = (0, utils_1.triggerLogin)();
    }
    let { cookies } = cookieData;
    let baseUrl = (0, utils_1.resolveBaseUrl)(cookieData);
    console.error((0, i18n_1.t)('common.login_ready', baseUrl));
    console.error((0, i18n_1.t)('save_share_config.step_save'));
    console.error((0, i18n_1.t)('save_share_config.sending_request'));
    let csrfToken = cookieData.csrf_token;
    const authConfig = JSON.stringify({
        openAuth: openAuth,
        authSources: [],
    });
    // 根据 URL 前缀区分：/s/ 传 shareUrl，/o/ 传 openUrl
    const isShareUrl = openUrl.startsWith('/s/');
    function buildPostData(token) {
        const params = {
            _api: 'Share.saveShareConfig',
            _csrf_token: token,
            _locale_time_zone_offset: '28800000',
            formUuid: formUuid,
        };
        if (isShareUrl) {
            params.shareUrl = openUrl;
        }
        else {
            params.openUrl = openUrl;
            params.isOpen = isOpen;
            params.openPageAuthConfig = authConfig;
        }
        return querystring_1.default.stringify(params);
    }
    const postData = buildPostData(csrfToken);
    let result = await sendPostRequest(baseUrl, cookies, `/dingtalk/web/${appType}/query/formdesign/saveShareConfig.json`, postData);
    if (result && result.__csrfExpired) {
        cookieData = (0, utils_1.refreshCsrfToken)();
        csrfToken = cookieData.csrf_token;
        cookies = cookieData.cookies;
        baseUrl = (0, utils_1.resolveBaseUrl)(cookieData);
        console.error((0, i18n_1.t)('common.resend_csrf'));
        result = await sendPostRequest(baseUrl, cookies, `/dingtalk/web/${appType}/query/formdesign/saveShareConfig.json`, buildPostData(csrfToken));
    }
    if (result && result.__needLogin) {
        cookieData = (0, utils_1.triggerLogin)();
        csrfToken = cookieData.csrf_token;
        cookies = cookieData.cookies;
        baseUrl = (0, utils_1.resolveBaseUrl)(cookieData);
        console.error((0, i18n_1.t)('common.resend'));
        result = await sendPostRequest(baseUrl, cookies, `/dingtalk/web/${appType}/query/formdesign/saveShareConfig.json`, buildPostData(csrfToken));
    }
    console.error('\n' + '='.repeat(50));
    if (result && !result.__needLogin && !result.__csrfExpired) {
        if (result.success) {
            console.error((0, i18n_1.t)('save_share_config.save_ok'));
            console.error('='.repeat(50));
            console.log(JSON.stringify({
                success: true,
                openUrl: isOpen === 'y' ? openUrl : null,
                isOpen: isOpen === 'y',
                message: (0, i18n_1.t)('save_share_config.save_ok_msg')
            }, null, 2));
        }
        else {
            console.error((0, i18n_1.t)('save_share_config.save_failed', result.errorMsg || (0, i18n_1.t)('common.unknown_error')));
            console.error('='.repeat(50));
            console.log(JSON.stringify({
                success: false,
                message: result.errorMsg || (0, i18n_1.t)('save_share_config.save_failed_msg'),
                errorCode: result.errorCode
            }, null, 2));
        }
    }
    else {
        console.error((0, i18n_1.t)('common.request_failed_label'));
        console.error('='.repeat(50));
        process.exit(1);
    }
}
main().catch((error) => {
    console.error((0, i18n_1.t)('common.exception', error.message));
    process.exit(1);
});
//# sourceMappingURL=save-share-config.js.map