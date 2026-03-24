/**
 * utils.ts - 宜搭 CLI 公共工具函数
 *
 * 导出函数：
 *   findProjectRoot()         - 查找项目根目录（兼容悟空环境）
 *   extractInfoFromCookies()  - 从 Cookie 列表中提取 csrf_token / corp_id / user_id
 *   loadCookieData()          - 读取 .cache/cookies.json 登录态缓存
 *   triggerLogin()            - 触发登录（自动区分标准/悟空环境）
 *   refreshCsrfToken()        - 刷新 csrf_token
 *   resolveBaseUrl()          - 从 cookieData 中解析 base_url
 *   isLoginExpired()          - 检测响应体是否表示登录过期
 *   isCsrfTokenExpired()      - 检测响应体是否表示 csrf_token 过期
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
exports.detectActiveTool = detectActiveTool;
exports.findProjectRoot = findProjectRoot;
exports.extractInfoFromCookies = extractInfoFromCookies;
exports.loadCookieData = loadCookieData;
exports.triggerLogin = triggerLogin;
exports.refreshCsrfToken = refreshCsrfToken;
exports.isLoginExpired = isLoginExpired;
exports.isCsrfTokenExpired = isCsrfTokenExpired;
exports.resolveBaseUrl = resolveBaseUrl;
exports.httpPost = httpPost;
exports.httpGet = httpGet;
exports.requestWithAutoLogin = requestWithAutoLogin;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
const i18n_1 = require("./i18n");
// ── 项目根目录查找 ────────────────────────────────────
/**
 * 检测当前活跃的 AI 工具。
 * 优先级：环境变量 > 兜底检测
 *
 * 注意：只返回当前"活跃"的工具，不返回已安装但未使用的工具。
 */
function detectActiveTool() {
    const env = process.env;
    const cwd = process.cwd();
    const home = os.homedir();
    // 优先级1：通过环境变量检测
    // Qoder (qoder.com)
    if (env.QODER_IDE || env.QODER_AGENT) {
        return {
            tool: 'qoder',
            displayName: 'Qoder',
            dirName: '.qoder',
            workspaceRoot: path.join(cwd, 'project'),
        };
    }
    // Claude Code
    if (env.CLAUDE_CODE) {
        return {
            tool: 'claude-code',
            displayName: 'Claude Code',
            dirName: '.claudecode',
            workspaceRoot: path.join(cwd, 'project'),
        };
    }
    // OpenCode
    if (env.OPENCODE) {
        const opencodeDirName = process.platform === 'win32'
            ? path.join('.config', 'opencode')
            : '.opencode';
        return {
            tool: 'opencode',
            displayName: 'OpenCode',
            dirName: opencodeDirName,
            workspaceRoot: path.join(cwd, 'project'),
        };
    }
    // Cursor
    if (env.CURSOR_TRACE_ID || (env.VSCODE_GIT_ASKPASS_NODE || '').includes('Cursor')) {
        return {
            tool: 'cursor',
            displayName: 'Cursor',
            dirName: '.cursor',
            workspaceRoot: path.join(cwd, 'project'),
        };
    }
    // 悟空（Wukong）
    if (env.AGENT_WORK_ROOT && (env.AGENT_WORK_ROOT.includes('.real') || env.AGENT_WORK_ROOT.includes(path.join('.real')))) {
        return {
            tool: 'wukong',
            displayName: '悟空（Wukong）',
            dirName: '.real',
            workspaceRoot: path.join(home, '.real', 'workspace', 'project'),
        };
    }
    // 优先级2：兜底检测
    // Aone Copilot
    if (env.TERM_PROGRAM === 'vscode' && fs.existsSync(path.join(home, '.aone_copilot'))) {
        return {
            tool: 'aone-copilot',
            displayName: 'Aone Copilot',
            dirName: '.aone_copilot',
            workspaceRoot: path.join(cwd, 'project'),
        };
    }
    return null;
}
/**
 * 查找项目根目录（project 工作区）。
 */
function findProjectRoot() {
    const activeTool = detectActiveTool();
    if (activeTool) {
        if (fs.existsSync(activeTool.workspaceRoot)) {
            return activeTool.workspaceRoot;
        }
    }
    return process.cwd();
}
// ── Cookie 解析 ───────────────────────────────────────
/**
 * 从 Cookie 列表中提取 csrf_token、corp_id、userId。
 */
function extractInfoFromCookies(cookies) {
    let csrfToken = null;
    let corpId = null;
    let userId = null;
    for (const cookie of cookies) {
        if (cookie.name === 'tianshu_csrf_token') {
            csrfToken = cookie.value;
        }
        else if (cookie.name === 'tianshu_corp_user') {
            const lastUnderscore = cookie.value.lastIndexOf('_');
            if (lastUnderscore > 0) {
                corpId = cookie.value.slice(0, lastUnderscore);
                userId = cookie.value.slice(lastUnderscore + 1);
            }
        }
    }
    return { csrfToken, corpId, userId };
}
// ── 登录态缓存读取 ────────────────────────────────────
/**
 * 读取 .cache/cookies.json 登录态缓存。
 */
function loadCookieData(projectRoot, defaultBaseUrl) {
    const root = projectRoot || findProjectRoot();
    const fallbackBaseUrl = defaultBaseUrl || 'https://www.aliwork.com';
    const cookieFile = path.join(root, '.cache', 'cookies.json');
    if (!fs.existsSync(cookieFile)) {
        return null;
    }
    try {
        const raw = fs.readFileSync(cookieFile, 'utf-8').trim();
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        let cookieData;
        if (Array.isArray(parsed)) {
            cookieData = { cookies: parsed, base_url: fallbackBaseUrl };
        }
        else {
            cookieData = parsed;
        }
        if (cookieData.cookies && cookieData.cookies.length > 0) {
            const { csrfToken, corpId, userId } = extractInfoFromCookies(cookieData.cookies);
            if (csrfToken) {
                cookieData.csrf_token = csrfToken;
            }
            if (corpId) {
                cookieData.corp_id = corpId;
            }
            if (userId) {
                cookieData.user_id = userId;
            }
        }
        return cookieData;
    }
    catch {
        return null;
    }
}
// ── 登录触发 ──────────────────────────────────────────
/**
 * 触发登录（Playwright 扫码模式）。
 */
function triggerLogin() {
    console.error((0, i18n_1.t)('login.trigger_login'));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ensureLogin } = require('../auth/login');
    return ensureLogin();
}
/**
 * 刷新 csrf_token（从本地缓存重新提取，无需重新扫码）。
 */
function refreshCsrfToken() {
    console.error((0, i18n_1.t)('login.csrf_refresh'));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { refreshCsrfFromCache } = require('../auth/login');
    return refreshCsrfFromCache();
}
// ── 响应检测 ──────────────────────────────────────────
/**
 * 检测响应体是否表示登录过期。
 */
function isLoginExpired(responseJson) {
    return !!(responseJson &&
        responseJson.success === false &&
        (responseJson.errorCode === '307' || responseJson.errorCode === '302'));
}
/**
 * 检测响应体是否表示 csrf_token 过期。
 */
function isCsrfTokenExpired(responseJson) {
    return !!(responseJson &&
        responseJson.success === false &&
        responseJson.errorCode === 'TIANSHU_000030');
}
// ── base_url 解析 ─────────────────────────────────────
/**
 * 从 cookieData 中解析 base_url，去除末尾斜杠。
 */
function resolveBaseUrl(cookieData, defaultBaseUrl) {
    const fallback = defaultBaseUrl || 'https://www.aliwork.com';
    return ((cookieData && cookieData.base_url) || fallback).replace(/\/+$/, '');
}
function buildCookieHeader(baseUrl, cookies) {
    const parsedUrl = new URL(baseUrl);
    const requestHost = parsedUrl.hostname;
    const filteredCookies = cookies.filter(c => {
        const cookieDomain = (c.domain || '').replace(/^\./, '');
        return requestHost === cookieDomain || requestHost.endsWith('.' + cookieDomain);
    });
    const cookieHeader = filteredCookies.map(c => `${c.name}=${c.value}`).join('; ');
    const csrfCookie = filteredCookies.find(c => c.name === 'tianshu_csrf_token');
    const globalCsrfToken = csrfCookie ? csrfCookie.value : '';
    return { cookieHeader, globalCsrfToken };
}
function makeRequest(baseUrl, requestPath, method, postData, extraHeaders, cookies) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const https = require('https');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const http = require('http');
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(baseUrl);
        const { cookieHeader, globalCsrfToken } = buildCookieHeader(baseUrl, cookies);
        const isHttps = parsedUrl.protocol === 'https:';
        const requestModule = isHttps ? https : http;
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : (isHttps ? 443 : 80),
            path: requestPath,
            method,
            headers: {
                Accept: 'application/json, text/plain, */*',
                Origin: baseUrl,
                Referer: baseUrl + '/',
                Cookie: cookieHeader,
                'x-requested-with': 'XMLHttpRequest',
                global_csrf_token: globalCsrfToken,
                ...extraHeaders,
            },
            timeout: 30000,
        };
        const req = requestModule.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                console.error((0, i18n_1.t)('common.http_status', String(res.statusCode)));
                try {
                    const parsed = JSON.parse(data);
                    if (isLoginExpired(parsed)) {
                        resolve({ success: false, __needLogin: true });
                        return;
                    }
                    if (isCsrfTokenExpired(parsed)) {
                        resolve({ success: false, __csrfExpired: true });
                        return;
                    }
                    resolve(parsed);
                }
                catch {
                    console.error((0, i18n_1.t)('common.http_response', data.substring(0, 500)));
                    resolve({ success: false, errorMsg: `HTTP ${res.statusCode}: ` + (0, i18n_1.t)('common.response_not_json') });
                }
            });
        });
        req.on('timeout', () => { req.destroy(); reject(new Error((0, i18n_1.t)('common.request_timeout'))); });
        req.on('error', reject);
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}
/**
 * 发送 HTTP POST 请求（application/x-www-form-urlencoded）
 */
function httpPost(baseUrl, requestPath, postData, cookies) {
    return makeRequest(baseUrl, requestPath, 'POST', postData, {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
    }, cookies);
}
/**
 * 发送 HTTP GET 请求
 */
function httpGet(baseUrl, requestPath, queryParams, cookies) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const querystring = require('querystring');
    const fullPath = queryParams ? `${requestPath}?${querystring.stringify(queryParams)}` : requestPath;
    return makeRequest(baseUrl, fullPath, 'GET', null, {}, cookies);
}
/**
 * 带自动重登录的请求封装。
 */
async function requestWithAutoLogin(requestFn, authRef) {
    let result = await requestFn(authRef);
    if (result && result.__csrfExpired) {
        const refreshedData = refreshCsrfToken();
        authRef.cookieData = refreshedData;
        authRef.csrfToken = refreshedData.csrf_token || '';
        authRef.cookies = refreshedData.cookies;
        authRef.baseUrl = resolveBaseUrl(refreshedData);
        console.error((0, i18n_1.t)('common.csrf_refreshed'));
        result = await requestFn(authRef);
    }
    if (result && result.__needLogin) {
        const newCookieData = triggerLogin();
        authRef.cookieData = newCookieData;
        authRef.csrfToken = newCookieData.csrf_token || '';
        authRef.cookies = newCookieData.cookies;
        authRef.baseUrl = resolveBaseUrl(newCookieData);
        console.error((0, i18n_1.t)('common.relogin_retry'));
        result = await requestFn(authRef);
    }
    return result;
}
// 保持对 execSync 的引用（避免 unused import 警告）
void child_process_1.execSync;
//# sourceMappingURL=utils.js.map