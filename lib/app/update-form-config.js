"use strict";
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
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const querystring = __importStar(require("querystring"));
const utils_1 = require("../core/utils");
const i18n_1 = require("../core/i18n");
function parseArgs() {
    const args = process.argv.slice(2);
    if (args.length < 4) {
        console.error((0, i18n_1.t)('update_form_config.usage'));
        console.error((0, i18n_1.t)('update_form_config.example'));
        console.error('');
        console.error((0, i18n_1.t)('update_form_config.params_label'));
        console.error((0, i18n_1.t)('update_form_config.param_is_render_nav'));
        console.error((0, i18n_1.t)('update_form_config.param_title'));
        process.exit(1);
    }
    return {
        appType: args[0],
        formUuid: args[1],
        isRenderNav: args[2],
        title: args[3],
    };
}
function buildPostData(csrfToken, formUuid, isRenderNav, title) {
    const titleJson = JSON.stringify({
        pureEn_US: title,
        en_US: title,
        zh_CN: title,
        envLocale: null,
        type: 'i18n',
        ja_JP: null,
        key: null,
    });
    return querystring.stringify({
        _api: 'Form.updateFormSchemaInfo',
        _csrf_token: csrfToken,
        _locale_time_zone_offset: '28800000',
        formUuid: formUuid,
        serialSwitch: 'n',
        consultPerson: '',
        defaultManager: 'n',
        submissionRule: 'RESUBMIT',
        redirectConfig: '',
        pushTask: 'y',
        defaultOrder: 'cd',
        showPrint: 'y',
        relateUuid: '',
        title: titleJson,
        pageType: 'web,mobile',
        isInner: 'y',
        isNew: 'n',
        isAgent: 'y',
        showAgent: 'n',
        showDingGroup: 'y',
        reStart: 'n',
        previewConfig: 'y',
        formulaType: 'n',
        displayTitle: '%24%7Blegao_creator%7D%E5%8F%91%E8%B5%B7%E7%9A%84%24%7Blegao_formname%7D',
        displayType: 'RE',
        isRenderNav: isRenderNav,
        manageCustomActionInfo: '[]',
    });
}
function sendPostRequest(baseUrl, cookies, requestPath, postData) {
    return new Promise((resolve, reject) => {
        const cookieHeader = cookies
            .map((cookie) => `${cookie.name}=${cookie.value}`)
            .join('; ');
        const parsedUrl = new URL(baseUrl);
        const isHttps = parsedUrl.protocol === 'https:';
        const requestModule = isHttps ? https : http;
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
                console.error((0, i18n_1.t)('common.http_status', String(response.statusCode)));
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
            reject(new Error((0, i18n_1.t)('common.request_timeout')));
        });
        request.on('error', (requestError) => {
            reject(requestError);
        });
        request.write(postData);
        request.end();
    });
}
async function main() {
    const { appType, formUuid, isRenderNav, title } = parseArgs();
    console.error('='.repeat(50));
    console.error((0, i18n_1.t)('update_form_config.title'));
    console.error('='.repeat(50));
    console.error((0, i18n_1.t)('update_form_config.app_id', appType));
    console.error((0, i18n_1.t)('update_form_config.form_uuid', formUuid));
    console.error((0, i18n_1.t)('update_form_config.is_render_nav', isRenderNav === 'true' ? (0, i18n_1.t)('common.yes') : (0, i18n_1.t)('common.no')));
    console.error((0, i18n_1.t)('update_form_config.page_title', title));
    console.error((0, i18n_1.t)('common.step_login_label'));
    let cookieData = (0, utils_1.loadCookieData)();
    if (!cookieData) {
        console.error((0, i18n_1.t)('common.no_login_cache'));
        cookieData = (0, utils_1.triggerLogin)();
    }
    let { cookies } = cookieData;
    let baseUrl = (0, utils_1.resolveBaseUrl)(cookieData);
    console.error((0, i18n_1.t)('common.login_ready', baseUrl));
    console.error((0, i18n_1.t)('update_form_config.step_update'));
    console.error((0, i18n_1.t)('update_form_config.sending_request'));
    let { csrf_token: csrfToken } = cookieData;
    const postData = buildPostData(csrfToken, formUuid, isRenderNav, title);
    let result = await sendPostRequest(baseUrl, cookies, `/dingtalk/web/${appType}/query/formdesign/updateFormSchemaInfo.json`, postData);
    if (result && result.__csrfExpired) {
        cookieData = (0, utils_1.refreshCsrfToken)();
        csrfToken = cookieData.csrf_token;
        cookies = cookieData.cookies;
        baseUrl = (0, utils_1.resolveBaseUrl)(cookieData);
        const newPostData = buildPostData(csrfToken, formUuid, isRenderNav, title);
        console.error((0, i18n_1.t)('common.resend_csrf'));
        result = await sendPostRequest(baseUrl, cookies, `/dingtalk/web/${appType}/query/formdesign/updateFormSchemaInfo.json`, newPostData);
    }
    if (result && result.__needLogin) {
        cookieData = (0, utils_1.triggerLogin)();
        csrfToken = cookieData.csrf_token;
        cookies = cookieData.cookies;
        baseUrl = (0, utils_1.resolveBaseUrl)(cookieData);
        const newPostData = buildPostData(csrfToken, formUuid, isRenderNav, title);
        console.error((0, i18n_1.t)('common.resend'));
        result = await sendPostRequest(baseUrl, cookies, `/dingtalk/web/${appType}/query/formdesign/updateFormSchemaInfo.json`, newPostData);
    }
    console.error('\n' + '='.repeat(50));
    if (result && !result.__needLogin && !result.__csrfExpired) {
        if (result.success) {
            console.error((0, i18n_1.t)('update_form_config.update_ok'));
            console.error('='.repeat(50));
            console.log(JSON.stringify({
                success: true,
                isRenderNav: isRenderNav === 'true',
                message: isRenderNav === 'true' ? (0, i18n_1.t)('update_form_config.nav_shown') : (0, i18n_1.t)('update_form_config.nav_hidden')
            }, null, 2));
        }
        else {
            console.error((0, i18n_1.t)('update_form_config.update_failed', result.errorMsg || (0, i18n_1.t)('common.unknown_error')));
            console.error('='.repeat(50));
            console.log(JSON.stringify({
                success: false,
                message: result.errorMsg || (0, i18n_1.t)('update_form_config.update_failed_msg'),
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
//# sourceMappingURL=update-form-config.js.map