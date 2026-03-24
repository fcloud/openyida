/**
 * env.ts - 宜搭 CLI 环境检测
 *
 * 通过环境变量 + 文件特征检测当前运行环境，并输出环境信息。
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
exports.detectEnvironment = detectEnvironment;
exports.detectLoginStatus = detectLoginStatus;
exports.run = run;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const utils_1 = require("./utils");
const i18n_1 = require("./i18n");
const home = os.homedir();
/**
 * 获取所有已安装的 AI 工具列表（用于展示）。
 * 不判断当前是否活跃，只判断是否安装过。
 */
function getInstalledTools() {
    const tools = [
        { dirName: '.real', displayName: '悟空（Wukong）' },
        {
            dirName: process.platform === 'win32' ? path.join('.config', 'opencode') : '.opencode',
            displayName: 'OpenCode',
        },
        { dirName: '.claudecode', displayName: 'Claude Code' },
        { dirName: '.aone_copilot', displayName: 'Aone Copilot' },
        { dirName: '.cursor', displayName: 'Cursor' },
        { dirName: '.qoder', displayName: 'Qoder' },
    ];
    return tools.filter(({ dirName }) => {
        return fs.existsSync(path.join(home, dirName));
    });
}
/**
 * 检测当前 AI 工具环境。
 * 返回当前活跃工具信息和所有已安装工具列表。
 */
function detectEnvironment() {
    const activeTool = (0, utils_1.detectActiveTool)();
    const installedTools = getInstalledTools();
    const cwdProject = path.join(process.cwd(), 'project');
    const results = installedTools.map(({ dirName, displayName }) => {
        const isWukong = dirName === '.real';
        const isActive = !!(activeTool && activeTool.dirName === dirName);
        const workspaceRoot = isWukong
            ? path.join(home, '.real', 'workspace', 'project')
            : cwdProject;
        const hasProject = fs.existsSync(workspaceRoot);
        return {
            displayName,
            dirName,
            isActive,
            hasProject,
            workspaceRoot,
        };
    });
    const activeToolName = activeTool ? activeTool.displayName : null;
    const activeProjectRoot = activeTool ? activeTool.workspaceRoot : null;
    return { activeToolName, activeProjectRoot, results };
}
/**
 * 检测登录态信息。
 */
function detectLoginStatus(projectRoot) {
    const cookieData = (0, utils_1.loadCookieData)(projectRoot);
    if (!cookieData || !cookieData.cookies) {
        return { loggedIn: false, csrfToken: null, corpId: null, userId: null, baseUrl: null };
    }
    const { csrfToken, corpId, userId } = (0, utils_1.extractInfoFromCookies)(cookieData.cookies);
    const baseUrl = (0, utils_1.resolveBaseUrl)(cookieData);
    return { loggedIn: !!csrfToken, csrfToken, corpId, userId, baseUrl };
}
/**
 * 执行环境检测并打印结果。
 */
function run() {
    const SEP = (0, i18n_1.t)('env.sep55') || '='.repeat(55);
    console.log(SEP);
    console.log((0, i18n_1.t)('env.title'));
    console.log(SEP);
    // ── 系统信息 ──────────────────────────────────────
    console.log((0, i18n_1.t)('env.system_info'));
    console.log((0, i18n_1.t)('env.os', process.platform, os.arch()));
    console.log((0, i18n_1.t)('env.node', process.version));
    console.log((0, i18n_1.t)('env.home', os.homedir()));
    console.log((0, i18n_1.t)('env.cwd', process.cwd()));
    // ── AI 工具检测 ────────────────────────────────────
    console.log((0, i18n_1.t)('env.ai_tools'));
    const { activeToolName, activeProjectRoot, results } = detectEnvironment();
    if (results.length === 0) {
        console.log((0, i18n_1.t)('env.no_tools'));
    }
    else {
        for (const { displayName, isActive, hasProject } of results) {
            let icon;
            let note;
            if (isActive && hasProject) {
                icon = '✅';
                note = (0, i18n_1.t)('env.tool_active_ready');
            }
            else if (isActive && !hasProject) {
                icon = '🟡';
                note = (0, i18n_1.t)('env.tool_active_no_project');
            }
            else if (!isActive && hasProject) {
                icon = '⬜';
                note = (0, i18n_1.t)('env.tool_installed_has_project');
            }
            else {
                icon = '⬜';
                note = (0, i18n_1.t)('env.tool_installed');
            }
            console.log(`  ${icon} ${displayName.padEnd(18)} ${note}`);
        }
    }
    // ── 当前生效环境 ───────────────────────────────────
    console.log((0, i18n_1.t)('env.active_env'));
    if (activeToolName && activeProjectRoot) {
        console.log((0, i18n_1.t)('env.ai_tool_label', activeToolName));
        console.log((0, i18n_1.t)('env.project_root_label', activeProjectRoot));
    }
    else {
        const activeOnly = results.filter(r => r.isActive);
        if (activeOnly.length > 0) {
            console.log((0, i18n_1.t)('env.active_no_project', activeOnly.map(r => r.displayName).join(', ')));
        }
        else {
            console.log((0, i18n_1.t)('env.no_active_tool'));
        }
        console.log((0, i18n_1.t)('env.project_fallback', process.cwd()));
    }
    // ── 登录态检测 ─────────────────────────────────────
    console.log((0, i18n_1.t)('env.login_status'));
    const projectRoot = (activeProjectRoot && fs.existsSync(activeProjectRoot))
        ? activeProjectRoot
        : process.cwd();
    const loginStatus = detectLoginStatus(projectRoot);
    if (loginStatus.loggedIn) {
        console.log((0, i18n_1.t)('env.logged_in'));
        console.log((0, i18n_1.t)('env.base_url_label', loginStatus.baseUrl || ''));
        console.log((0, i18n_1.t)('env.corp_id_label', loginStatus.corpId || (0, i18n_1.t)('env.unknown')));
        console.log((0, i18n_1.t)('env.user_id_label', loginStatus.userId || (0, i18n_1.t)('env.unknown')));
        console.log((0, i18n_1.t)('env.csrf_label', (loginStatus.csrfToken || '').slice(0, 16)));
    }
    else {
        console.log((0, i18n_1.t)('env.not_logged_in'));
    }
    console.log('\n' + SEP);
}
//# sourceMappingURL=env.js.map