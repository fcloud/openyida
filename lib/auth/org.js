/**
 * org.ts - 组织管理模块
 *
 * 提供组织切换能力，支持：
 *   - 列出用户可访问的组织
 *   - 切换组织（无需重新登录）
 *   - 交互式组织选择
 *
 * 切换组织原理：
 *   通过一系列 HTTP 请求完成组织切换，无需重新登录。
 *   流程：
 *     1. GET /start.html?corpid={corpId}&switchCorp=true
 *     2. GET /start.html?corpid={corpId}&
 *     3. 跟随重定向获取新 Cookie
 *
 * 导出函数：
 *   listOrganizations()     - 列出可访问的组织
 *   switchOrganization()    - 切换到指定组织
 *   interactiveSwitch()     - 交互式组织选择
 */
'use strict';
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
exports.listOrganizations = listOrganizations;
exports.switchOrganization = switchOrganization;
exports.interactiveSwitch = interactiveSwitch;
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const utils_1 = require("../core/utils");
const login_1 = require("./login");
const auth_1 = require("./auth");
const i18n_1 = require("../core/i18n");
const DEFAULT_BASE_URL = 'https://www.aliwork.com';
function httpGetWithCookies(url, cookies, _followRedirect = true) {
    return new Promise((resolve, reject) => {
        const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
        const parsedUrl = new URL(url);
        const isHttps = parsedUrl.protocol === 'https:';
        const requestModule = isHttps ? https : http;
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (isHttps ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                Cookie: cookieHeader,
            },
            timeout: 30000,
        };
        const req = requestModule.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const setCookies = res.headers['set-cookie'] || [];
                const newCookies = parseSetCookies(setCookies, cookies);
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    cookies: newCookies,
                    location: res.headers.location,
                    body: data,
                });
            });
        });
        req.on('timeout', () => { req.destroy(); reject(new Error((0, i18n_1.t)('common.request_timeout'))); });
        req.on('error', reject);
        req.end();
    });
}
function parseSetCookies(setCookies, existingCookies) {
    const cookieMap = new Map();
    for (const cookie of existingCookies) {
        cookieMap.set(cookie.name, cookie);
    }
    for (const setCookie of setCookies) {
        const parts = setCookie.split(';')[0].split('=');
        if (parts.length >= 2) {
            const name = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            cookieMap.set(name, { name, value });
        }
    }
    return Array.from(cookieMap.values());
}
async function listOrganizations(cookieData) {
    const SEP = '='.repeat(55);
    console.log(SEP);
    console.log((0, i18n_1.t)('org.list_title'));
    console.log(SEP);
    const cookies = cookieData.cookies;
    const { corpId, userId: _userId } = (0, utils_1.extractInfoFromCookies)(cookies);
    if (!corpId) {
        console.log((0, i18n_1.t)('org.no_corp_id'));
        console.log(SEP);
        return [];
    }
    const authConfig = (0, auth_1.loadAuthConfig)();
    const recentCorps = authConfig?.recentCorps || [];
    const organizations = [];
    organizations.push({
        corpId,
        name: (0, i18n_1.t)('org.current_org'),
        isCurrent: true,
        lastUsed: new Date().toISOString(),
    });
    for (const org of recentCorps) {
        if (org.corpId !== corpId) {
            organizations.push({
                corpId: org.corpId,
                name: org.name || org.corpId,
                isCurrent: false,
                lastUsed: org.lastUsed,
            });
        }
    }
    if (organizations.length === 0) {
        console.log((0, i18n_1.t)('org.no_organizations'));
    }
    else {
        for (const org of organizations) {
            const icon = org.isCurrent ? '✅' : '  ';
            const current = org.isCurrent ? ` (${(0, i18n_1.t)('org.current')})` : '';
            console.log(`  ${icon} ${org.name}${current}`);
            console.log(`     corpId: ${org.corpId}`);
        }
    }
    console.log(SEP);
    return organizations;
}
async function switchOrganization(targetCorpId, cookieData) {
    const SEP = '='.repeat(55);
    console.log(SEP);
    console.log((0, i18n_1.t)('org.switch_title'));
    console.log(SEP);
    const cookies = cookieData.cookies;
    const { corpId: currentCorpId } = (0, utils_1.extractInfoFromCookies)(cookies);
    console.log((0, i18n_1.t)('org.switch_from', currentCorpId || (0, i18n_1.t)('org.unknown')));
    console.log((0, i18n_1.t)('org.switch_to', targetCorpId));
    if (currentCorpId === targetCorpId) {
        console.log((0, i18n_1.t)('org.already_in_org'));
        console.log(SEP);
        return {
            success: true,
            corpId: targetCorpId,
            message: 'Already in target organization',
        };
    }
    try {
        console.log((0, i18n_1.t)('org.step1'));
        const step1Url = `${DEFAULT_BASE_URL}/start.html?corpid=${targetCorpId}&switchCorp=true`;
        const step1Result = await httpGetWithCookies(step1Url, cookies, false);
        console.log((0, i18n_1.t)('org.step2'));
        const step2Url = `${DEFAULT_BASE_URL}/start.html?corpid=${targetCorpId}&`;
        const step2Result = await httpGetWithCookies(step2Url, step1Result.cookies, false);
        console.log((0, i18n_1.t)('org.step3'));
        const step3Url = `https://ding.aliwork.com/start.html?corpid=${targetCorpId}&`;
        const step3Result = await httpGetWithCookies(step3Url, step2Result.cookies, false);
        let finalCookies = step3Result.cookies;
        let currentUrl = step3Result.location;
        let redirectCount = 0;
        while (currentUrl && redirectCount < 5) {
            redirectCount++;
            console.log((0, i18n_1.t)('org.redirect', String(redirectCount)));
            if (!currentUrl.startsWith('http')) {
                currentUrl = `https://ding.aliwork.com${currentUrl}`;
            }
            const redirectResult = await httpGetWithCookies(currentUrl, finalCookies, false);
            finalCookies = redirectResult.cookies;
            currentUrl = redirectResult.location;
            if (currentUrl && currentUrl.includes('workPlatform')) {
                break;
            }
        }
        const { csrfToken, corpId: newCorpId, userId } = (0, utils_1.extractInfoFromCookies)(finalCookies);
        if (!csrfToken) {
            console.log((0, i18n_1.t)('org.switch_failed_no_csrf'));
            console.log(SEP);
            return { success: false, message: 'No csrf_token in new cookies' };
        }
        const newBaseUrl = 'https://ding.aliwork.com';
        (0, login_1.saveCookieCache)(finalCookies, newBaseUrl);
        const authConfig = (0, auth_1.loadAuthConfig)() || {};
        authConfig.corpId = newCorpId;
        authConfig.userId = userId;
        authConfig.switchTime = new Date().toISOString();
        if (!authConfig.recentCorps) {
            authConfig.recentCorps = [];
        }
        authConfig.recentCorps = authConfig.recentCorps.filter((c) => c.corpId !== newCorpId);
        authConfig.recentCorps.unshift({
            corpId: newCorpId || targetCorpId,
            name: (0, i18n_1.t)('org.switched_org'),
            lastUsed: new Date().toISOString(),
        });
        authConfig.recentCorps = authConfig.recentCorps.slice(0, 10);
        (0, auth_1.saveAuthConfig)(authConfig);
        console.log((0, i18n_1.t)('org.switch_success'));
        console.log((0, i18n_1.t)('org.new_corp_id', newCorpId || ''));
        console.log((0, i18n_1.t)('org.new_csrf', csrfToken.slice(0, 16)));
        console.log(SEP);
        return {
            success: true,
            corpId: newCorpId || undefined,
            csrfToken,
            userId,
            baseUrl: newBaseUrl,
            cookies: finalCookies,
        };
    }
    catch (error) {
        const err = error;
        console.log((0, i18n_1.t)('org.switch_error', err.message));
        console.log(SEP);
        return { success: false, message: err.message };
    }
}
async function interactiveSwitch(cookieData) {
    const organizations = await listOrganizations(cookieData);
    if (organizations.length === 0) {
        return { success: false, message: 'No organizations available' };
    }
    const switchableOrgs = organizations.filter((org) => !org.isCurrent);
    if (switchableOrgs.length === 0) {
        console.log((0, i18n_1.t)('org.only_one_org'));
        return { success: false, message: 'Only one organization available' };
    }
    console.log((0, i18n_1.t)('org.select_prompt'));
    switchableOrgs.forEach((org, index) => {
        console.log(`  ${index + 1}. ${org.name} (${org.corpId})`);
    });
    console.log((0, i18n_1.t)('org.use_corp_id_hint'));
    return {
        success: false,
        message: 'Interactive mode not supported, please use --corp-id option',
        organizations: switchableOrgs,
    };
}
//# sourceMappingURL=org.js.map