"use strict";
/**
 * create-app.ts - 宜搭应用创建命令
 *
 * 用法：yidacli create-app "<appName>" [description] [icon] [iconColor]
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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const querystring = __importStar(require("querystring"));
const utils_1 = require("../core/utils");
const i18n_1 = require("../core/i18n");
// ── prd 文档更新 ──────────────────────────────────────
function findPrdFile() {
    let currentDir = process.cwd();
    for (let i = 0; i < 5; i++) {
        const prdDir = path.join(currentDir, 'prd');
        if (fs.existsSync(prdDir)) {
            const files = fs.readdirSync(prdDir);
            const mdFile = files.find((f) => f.endsWith('.md'));
            if (mdFile) {
                return path.join(prdDir, mdFile);
            }
        }
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) {
            break;
        }
        currentDir = parentDir;
    }
    return null;
}
function updatePrdCorpId(prdFilePath, corpId, appType, baseUrl) {
    if (!prdFilePath || !fs.existsSync(prdFilePath)) {
        console.error((0, i18n_1.t)('create_app.prd_not_found'));
        return false;
    }
    try {
        let content = fs.readFileSync(prdFilePath, 'utf-8');
        const hasAppConfig = content.includes('## 应用配置') || content.includes('## App Config') || content.includes('## アプリ設定') || content.includes('| appType |');
        if (hasAppConfig) {
            const corpIdRegex = /\| corpId \| [^|]*\|/;
            if (corpIdRegex.test(content)) {
                content = content.replace(corpIdRegex, `| corpId | ${corpId} |`);
            }
            else {
                content = content.replace(/(\| appType \| [^|]*\|)(\r?\n)/, `$1$2| corpId | ${corpId} |$2`);
            }
            content = content.replace(/\| appType \| [^|]*\|/, `| appType | ${appType} |`);
            content = content.replace(/\| baseUrl \| [^|]*\|/, `| baseUrl | ${baseUrl} |`);
        }
        else {
            const appConfigSection = `${(0, i18n_1.t)('create_app.prd_config_title')}\n\n| ${(0, i18n_1.t)('create_app.prd_config_key')} | ${(0, i18n_1.t)('create_app.prd_config_value')} |\n| --- | --- |\n| appType | ${appType} |\n| corpId | ${corpId} |\n| baseUrl | ${baseUrl} |\n\n`;
            if (content.startsWith('#')) {
                content = content.replace(/^(# .*\r?\n)/, `$1\n${appConfigSection}`);
            }
            else {
                content = appConfigSection + content;
            }
        }
        fs.writeFileSync(prdFilePath, content, 'utf-8');
        console.error((0, i18n_1.t)('create_app.prd_updated', path.basename(prdFilePath)));
        return true;
    }
    catch (err) {
        console.error((0, i18n_1.t)('create_app.prd_update_failed', err.message));
        return false;
    }
}
// ── 主逻辑 ────────────────────────────────────────────
async function run(args) {
    if (args.length < 1) {
        console.error((0, i18n_1.t)('create_app.usage'));
        console.error((0, i18n_1.t)('create_app.example'));
        console.error((0, i18n_1.t)('create_app.available_icons'));
        console.error((0, i18n_1.t)('create_app.icons_list'));
        console.error((0, i18n_1.t)('create_app.available_colors'));
        console.error((0, i18n_1.t)('create_app.colors_list'));
        process.exit(1);
    }
    const appName = args[0];
    const description = args[1] || appName;
    const icon = args[2] || 'xian-yingyong';
    const iconColor = args[3] || '#0089FF';
    const themeColor = args[4] || 'blue';
    const SEP = '='.repeat(50);
    console.error(SEP);
    console.error((0, i18n_1.t)('create_app.title'));
    console.error(SEP);
    console.error((0, i18n_1.t)('create_app.app_name', appName));
    console.error((0, i18n_1.t)('create_app.app_desc', description));
    console.error((0, i18n_1.t)('create_app.app_icon', icon, iconColor));
    console.error((0, i18n_1.t)('create_app.app_theme', themeColor));
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
    // Step 2: 创建应用
    console.error((0, i18n_1.t)('create_app.step_create'));
    // 查询企业专属域名配置，动态决定 openExclusive / openPhysicColumn 参数
    // 避免在开启了专属数据库策略的企业中硬编码 "n" 导致创建失败
    let openExclusive = 'n';
    let openPhysicColumn = 'n';
    try {
        const corpConfig = await (0, utils_1.httpPost)(authRef.baseUrl, `/query/exclusive/queryCorpAppConfig.json?_api=Global.queryCorpAppConfig&_mock=false&_csrf_token=${authRef.csrfToken}&_locale_time_zone_offset=28800000&_stamp=${Date.now()}`, '', authRef.cookies);
        if (corpConfig && corpConfig.content) {
            if (corpConfig.content.forceExclusiveDb === 'y') {
                openExclusive = 'y';
            }
            if (corpConfig.content.forcePhysicalColumn === 'y') {
                openPhysicColumn = 'y';
            }
        }
    }
    catch {
        // 查询失败时使用默认值，不影响主流程
    }
    const iconValue = `${icon}%%${iconColor}`;
    const response = await (0, utils_1.requestWithAutoLogin)((auth) => {
        const postData = querystring.stringify({
            _csrf_token: auth.csrfToken,
            appName: JSON.stringify({ zh_CN: appName, en_US: appName, type: 'i18n' }),
            description: JSON.stringify({ zh_CN: description, en_US: description, type: 'i18n' }),
            icon: iconValue,
            iconUrl: iconValue,
            colour: themeColor,
            defaultLanguage: 'zh_CN',
            openExclusive: openExclusive,
            openPhysicColumn: openPhysicColumn,
            openIsolationDatabase: 'n',
            openExclusiveUnit: 'n',
            group: 'ALL',
        });
        return (0, utils_1.httpPost)(auth.baseUrl, '/query/app/registerApp.json', postData, auth.cookies);
    }, authRef);
    // 输出结果
    const SEP2 = '='.repeat(50);
    console.error('\n' + SEP2);
    if (response && response.success && response.content) {
        const appType = response.content;
        const appUrl = `${authRef.baseUrl}/${appType}/admin`;
        const corpId = authRef.cookieData.corp_id || '';
        console.error((0, i18n_1.t)('create_app.success'));
        console.error((0, i18n_1.t)('create_app.app_type_label', appType));
        console.error((0, i18n_1.t)('create_app.corp_id_label', corpId || (0, i18n_1.t)('common.unknown_error')));
        console.error((0, i18n_1.t)('create_app.url_label', appUrl));
        console.error(SEP2);
        const prdFile = findPrdFile();
        if (prdFile) {
            updatePrdCorpId(prdFile, corpId, appType, authRef.baseUrl);
        }
        console.log(JSON.stringify({ success: true, appType, appName, corpId, url: appUrl }));
    }
    else {
        const errorMsg = response ? response.errorMsg || (0, i18n_1.t)('common.unknown_error') : (0, i18n_1.t)('common.request_failed');
        console.error((0, i18n_1.t)('create_app.failed', errorMsg));
        console.error(SEP2);
        console.log(JSON.stringify({ success: false, error: errorMsg }));
        process.exit(1);
    }
}
//# sourceMappingURL=create-app.js.map