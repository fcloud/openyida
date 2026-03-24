"use strict";
/**
 * get-permission.ts - 宜搭表单权限配置查询命令
 *
 * 用法：openyida get-permission <appType> <formUuid>
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const utils_1 = require("../core/utils");
const i18n_1 = require("../core/i18n");
const SEP = '='.repeat(50);
/**
 * 查询权限组列表
 * 接口：GET /{appType}/permission/manage/listPermitPackages.json
 */
function fetchPermitPackages(appType, formUuid, authRef) {
    return new Promise((resolve) => {
        const { cookies, csrfToken, baseUrl } = authRef;
        const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
        const parsedUrl = new URL(baseUrl);
        const isHttps = parsedUrl.protocol === 'https:';
        const requestModule = isHttps ? https_1.default : http_1.default;
        const queryParams = new URLSearchParams({
            _api: 'Permission.getPermitGroupList',
            _mock: 'false',
            _csrf_token: csrfToken,
            _locale_time_zone_offset: '28800000',
            formUuid,
            packageName: '',
            packageType: 'FORM_PACKAGE_VIEW',
            pageIndex: '1',
            pageSize: '20',
            appType,
            _stamp: String(Date.now()),
        });
        const requestPath = `/${appType}/permission/manage/listPermitPackages.json?${queryParams.toString()}`;
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (isHttps ? 443 : 80),
            path: requestPath,
            method: 'GET',
            headers: {
                Cookie: cookieHeader,
                Accept: 'application/json, text/json',
                'X-Requested-With': 'XMLHttpRequest',
                Referer: `${baseUrl}/${appType}/admin/${formUuid}/settings/permission`,
            },
            timeout: 30000,
        };
        const req = requestModule.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                console.error((0, i18n_1.t)('common.http_status', String(res.statusCode ?? '')));
                try {
                    const parsed = JSON.parse(data);
                    // 复用 utils 中的登录/csrf 过期检测逻辑
                    const { isLoginExpired, isCsrfTokenExpired } = require('../core/utils');
                    if (isLoginExpired(parsed)) {
                        resolve({ __needLogin: true });
                        return;
                    }
                    if (isCsrfTokenExpired(parsed)) {
                        resolve({ __csrfExpired: true });
                        return;
                    }
                    resolve(parsed);
                }
                catch {
                    console.error((0, i18n_1.t)('common.http_response', data.substring(0, 500)));
                    resolve({ success: false, errorMsg: (0, i18n_1.t)('common.response_not_json') });
                }
            });
        });
        req.on('timeout', () => { req.destroy(); resolve({ success: false, errorMsg: (0, i18n_1.t)('common.request_timeout') }); });
        req.on('error', () => resolve({ success: false, errorMsg: (0, i18n_1.t)('common.request_error') }));
        req.end();
    });
}
/**
 * 将权限组列表格式化为可读的权限配置摘要
 */
function formatPermissions(packages) {
    return packages.map((pkg) => {
        const packageName = pkg.packageName
            ? (pkg.packageName.zh_CN || pkg.packageName.en_US || JSON.stringify(pkg.packageName))
            : '未命名';
        const description = pkg.description
            ? (pkg.description.zh_CN || pkg.description.en_US || '')
            : '';
        const roleMembers = (pkg.roleMembers || []).map((rm) => ({
            roleType: rm.roleType,
            label: rm.label,
            roleValue: rm.roleValue,
        }));
        let dataPermit = {};
        if (pkg.dataPermit) {
            try {
                dataPermit = typeof pkg.dataPermit === 'string' ? JSON.parse(pkg.dataPermit) : pkg.dataPermit;
            }
            catch {
                dataPermit = {};
            }
        }
        let operatePermit = {};
        if (pkg.operatePermit) {
            try {
                operatePermit = typeof pkg.operatePermit === 'string' ? JSON.parse(pkg.operatePermit) : pkg.operatePermit;
            }
            catch {
                operatePermit = {};
            }
        }
        let fieldPermit = {};
        if (pkg.fieldPermit) {
            try {
                fieldPermit = typeof pkg.fieldPermit === 'string' ? JSON.parse(pkg.fieldPermit) : pkg.fieldPermit;
            }
            catch {
                fieldPermit = {};
            }
        }
        return {
            packageUuid: pkg.packageUuid,
            packageName,
            description,
            packageType: pkg.packageType,
            roleMembers,
            dataPermit,
            operatePermit,
            fieldPermit,
        };
    });
}
async function run(args) {
    if (args.length < 2) {
        console.error('用法: openyida get-permission <appType> <formUuid>');
        console.error('示例: openyida get-permission APP_XXX FORM-XXX');
        process.exit(1);
    }
    const [appType, formUuid] = args;
    console.error(SEP);
    console.error('  get-permission - 宜搭表单权限配置查询');
    console.error(SEP);
    console.error(`\n  应用 ID:   ${appType}`);
    console.error(`  表单 UUID: ${formUuid}`);
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
    // Step 2: 查询权限组列表
    console.error('\n📋 Step 2: 查询权限组列表');
    console.error('  发送 listPermitPackages 请求...');
    const result = await (0, utils_1.requestWithAutoLogin)((auth) => fetchPermitPackages(appType, formUuid, auth), authRef);
    console.error('\n' + SEP);
    if (result && result.success) {
        const packages = (result.content && result.content.formPermit) || [];
        console.error(`  ✅ 权限配置查询成功！共 ${packages.length} 个权限组`);
        console.error(SEP);
        console.log(JSON.stringify({
            success: true,
            totalPackages: packages.length,
            permissions: formatPermissions(packages),
            message: '权限配置查询成功',
        }, null, 2));
    }
    else {
        const errorMsg = result ? result.errorMsg || (0, i18n_1.t)('common.unknown_error') : (0, i18n_1.t)('common.request_failed');
        console.error(`  ❌ 查询失败: ${errorMsg}`);
        console.error(SEP);
        console.log(JSON.stringify({
            success: false,
            message: errorMsg,
            errorCode: result && result.errorCode,
        }, null, 2));
        process.exit(1);
    }
}
//# sourceMappingURL=get-permission.js.map