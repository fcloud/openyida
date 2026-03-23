/**
 * auth.ts - 登录态管理模块
 *
 * 提供统一的登录态管理能力，支持：
 *   - 登录态状态查询
 *   - 钉钉扫码登录
 *   - 登录态刷新
 *   - 安全退出
 *
 * 导出函数：
 *   authStatus()     - 查询当前登录状态
 *   authLogin()      - 执行登录（扫码/钉钉自动登录）
 *   authRefresh()    - 刷新登录态
 *   authLogout()     - 退出登录
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
exports.loadAuthConfig = loadAuthConfig;
exports.saveAuthConfig = saveAuthConfig;
exports.authStatus = authStatus;
exports.authLogin = authLogin;
exports.authRefresh = authRefresh;
exports.authLogout = authLogout;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const utils_1 = require("../core/utils");
const login_1 = require("./login");
const i18n_1 = require("../core/i18n");
const AUTH_CACHE_FILE = '.cache/auth.json';
function loadAuthConfig() {
    const projectRoot = (0, utils_1.findProjectRoot)();
    const authConfigPath = path.join(projectRoot, AUTH_CACHE_FILE);
    if (fs.existsSync(authConfigPath)) {
        try {
            const content = fs.readFileSync(authConfigPath, 'utf-8').trim();
            if (content) {
                return JSON.parse(content);
            }
        }
        catch {
            // ignore
        }
    }
    return null;
}
function saveAuthConfig(config) {
    const projectRoot = (0, utils_1.findProjectRoot)();
    const cacheDir = path.join(projectRoot, '.cache');
    const authConfigPath = path.join(cacheDir, 'auth.json');
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(authConfigPath, JSON.stringify(config, null, 2), 'utf-8');
}
function authStatus() {
    const SEP = '='.repeat(55);
    console.log(SEP);
    console.log((0, i18n_1.t)('auth.status_title'));
    console.log(SEP);
    const cookieData = (0, utils_1.loadCookieData)();
    if (!cookieData || !cookieData.cookies || cookieData.cookies.length === 0) {
        console.log((0, i18n_1.t)('auth.not_logged_in'));
        console.log((0, i18n_1.t)('auth.login_hint'));
        console.log(SEP);
        return { status: 'not_logged_in', canAutoUse: false };
    }
    const { csrfToken, corpId, userId } = (0, utils_1.extractInfoFromCookies)(cookieData.cookies);
    const baseUrl = (0, utils_1.resolveBaseUrl)(cookieData);
    const authConfig = loadAuthConfig();
    if (!csrfToken) {
        console.log((0, i18n_1.t)('auth.no_csrf_token'));
        console.log((0, i18n_1.t)('auth.relogin_hint'));
        console.log(SEP);
        return { status: 'invalid', canAutoUse: false };
    }
    console.log((0, i18n_1.t)('auth.logged_in'));
    console.log((0, i18n_1.t)('auth.base_url_label', baseUrl));
    if (corpId) {
        console.log((0, i18n_1.t)('auth.corp_id_label', corpId));
    }
    if (userId) {
        console.log((0, i18n_1.t)('auth.user_id_label', userId));
    }
    console.log((0, i18n_1.t)('auth.csrf_label', csrfToken.slice(0, 16)));
    if (authConfig) {
        if (authConfig.loginType) {
            console.log((0, i18n_1.t)('auth.login_type_label', authConfig.loginType));
        }
        if (authConfig.loginTime) {
            console.log((0, i18n_1.t)('auth.login_time_label', authConfig.loginTime));
        }
    }
    console.log(SEP);
    return {
        status: 'ok',
        canAutoUse: true,
        csrfToken,
        corpId,
        userId,
        baseUrl,
        loginType: authConfig?.loginType,
        loginTime: authConfig?.loginTime,
    };
}
function authLogin(options = {}) {
    const { type = 'qrcode' } = options;
    console.error((0, i18n_1.t)('auth.login_start', type));
    const result = (0, login_1.ensureLogin)();
    const authConfig = {
        loginType: type,
        loginTime: new Date().toISOString(),
        corpId: result.corp_id,
        userId: result.user_id,
    };
    saveAuthConfig(authConfig);
    console.error((0, i18n_1.t)('auth.login_success'));
    if (result.corp_id) {
        console.error((0, i18n_1.t)('auth.corp_id_ok', result.corp_id));
    }
    return result;
}
function authRefresh() {
    console.error((0, i18n_1.t)('auth.refresh_start'));
    const cookieData = (0, utils_1.loadCookieData)();
    if (!cookieData || !cookieData.cookies) {
        console.error((0, i18n_1.t)('auth.no_cookie_cache'));
        return { status: 'error', message: 'No cookie cache' };
    }
    const { csrfToken, corpId, userId } = (0, utils_1.extractInfoFromCookies)(cookieData.cookies);
    if (!csrfToken) {
        console.error((0, i18n_1.t)('auth.no_csrf_in_cache'));
        return { status: 'error', message: 'No csrf_token in cache' };
    }
    const baseUrl = (0, utils_1.resolveBaseUrl)(cookieData);
    const authConfig = loadAuthConfig() || {};
    authConfig.refreshTime = new Date().toISOString();
    authConfig.corpId = corpId;
    authConfig.userId = userId;
    saveAuthConfig(authConfig);
    console.error((0, i18n_1.t)('auth.refresh_success'));
    console.error((0, i18n_1.t)('auth.csrf_ok', csrfToken.slice(0, 16)));
    return { status: 'ok', csrfToken, corpId, userId, baseUrl };
}
// ── 退出登录 ──────────────────────────────────────────
function authLogout() {
    (0, login_1.logout)();
    const projectRoot = (0, utils_1.findProjectRoot)();
    const authConfigPath = path.join(projectRoot, AUTH_CACHE_FILE);
    if (fs.existsSync(authConfigPath)) {
        fs.writeFileSync(authConfigPath, '{}', 'utf-8');
        console.error((0, i18n_1.t)('auth.auth_config_cleared'));
    }
}
//# sourceMappingURL=auth.js.map