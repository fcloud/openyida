/**
 * copy.ts - 复制 project 工作目录模板 / 创建 yida-skills 软链接到当前 AI 工具环境
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
exports.run = run;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const env_1 = require("./env");
const i18n_1 = require("./i18n");
/**
 * 查找 npm 全局安装包根目录。
 */
function findPackageRoot() {
    try {
        const packageJsonPath = require.resolve('openyida/package.json');
        return path.dirname(packageJsonPath);
    }
    catch {
        let dir = path.resolve(__dirname);
        while (dir !== path.dirname(dir)) {
            if (fs.existsSync(path.join(dir, 'package.json'))) {
                return dir;
            }
            dir = path.dirname(dir);
        }
        return null;
    }
}
/**
 * 合并复制目录：源文件强制覆盖，目标目录多余文件保留。
 */
function mergeCopyDir(sourceDir, destDir) {
    if (!fs.existsSync(sourceDir)) {
        return 0;
    }
    fs.mkdirSync(destDir, { recursive: true });
    const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
    let copiedCount = 0;
    for (const entry of entries) {
        const sourcePath = path.join(sourceDir, entry.name);
        const destPath = path.join(destDir, entry.name);
        if (entry.isDirectory()) {
            copiedCount += mergeCopyDir(sourcePath, destPath);
        }
        else {
            fs.copyFileSync(sourcePath, destPath);
            console.log((0, i18n_1.t)('copy.copying', destPath));
            copiedCount++;
        }
    }
    return copiedCount;
}
/**
 * 强制复制目录：先清空目标目录，再完整复制。
 */
function forceCopyDir(sourceDir, destDir) {
    if (!fs.existsSync(sourceDir)) {
        return 0;
    }
    if (fs.existsSync(destDir)) {
        fs.rmSync(destDir, { recursive: true, force: true });
        console.log((0, i18n_1.t)('copy.cleared', destDir));
    }
    return mergeCopyDir(sourceDir, destDir);
}
/**
 * 删除已有的 yida-skills 软链接或目录（悟空环境专用）。
 */
function removeSkillsLink(destLink) {
    let stats;
    try {
        stats = fs.lstatSync(destLink);
    }
    catch {
        console.log((0, i18n_1.t)('copy.wukong_skills_not_found', destLink));
        return false;
    }
    try {
        if (stats.isSymbolicLink()) {
            fs.unlinkSync(destLink);
            console.log((0, i18n_1.t)('copy.symlink_removed', destLink));
        }
        else if (stats.isDirectory()) {
            fs.rmSync(destLink, { recursive: true, force: true });
            console.log((0, i18n_1.t)('copy.dir_deleted', destLink));
        }
        else {
            fs.unlinkSync(destLink);
            console.log((0, i18n_1.t)('copy.removed', destLink));
        }
        return true;
    }
    catch (error) {
        const err = error;
        console.error((0, i18n_1.t)('copy.remove_failed', destLink, err.message));
        return false;
    }
}
/**
 * 创建软链接：如果目标存在实际目录则先删除，再创建软链接。
 */
function createSymlink(sourceDir, destLink) {
    if (!fs.existsSync(sourceDir)) {
        return false;
    }
    if (fs.existsSync(destLink)) {
        try {
            const stats = fs.lstatSync(destLink);
            if (stats.isSymbolicLink()) {
                fs.unlinkSync(destLink);
                console.log((0, i18n_1.t)('copy.symlink_removed', destLink));
            }
            else if (stats.isDirectory()) {
                fs.rmSync(destLink, { recursive: true, force: true });
                console.log((0, i18n_1.t)('copy.dir_deleted', destLink));
            }
            else {
                fs.unlinkSync(destLink);
                console.log((0, i18n_1.t)('copy.removed', destLink));
            }
        }
        catch (error) {
            const err = error;
            console.error((0, i18n_1.t)('copy.remove_failed', destLink, err.message));
            return false;
        }
    }
    const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';
    try {
        fs.symlinkSync(sourceDir, destLink, symlinkType);
        console.log((0, i18n_1.t)('copy.symlink_created', destLink, sourceDir));
        return true;
    }
    catch (error) {
        const err = error;
        if (process.platform === 'win32' && err.code === 'EPERM') {
            console.log((0, i18n_1.t)('copy.symlink_fallback_copy', destLink));
            const count = mergeCopyDir(sourceDir, destLink);
            console.log((0, i18n_1.t)('copy.files_copied', String(count)));
            return true;
        }
        console.error((0, i18n_1.t)('copy.symlink_failed', destLink, err.message));
        return false;
    }
}
/**
 * 根据已检测的环境信息返回目标根目录。
 */
function resolveDestBaseFromEnv(activeToolName, activeProjectRoot, envResults) {
    const activeResult = envResults.find(r => r.displayName === activeToolName);
    const isWukong = activeResult && activeResult.dirName === '.real';
    if (isWukong) {
        return activeProjectRoot
            ? path.dirname(activeProjectRoot)
            : path.join(os.homedir(), '.real', 'workspace');
    }
    if (activeToolName) {
        return process.cwd();
    }
    console.error((0, i18n_1.t)('copy.no_ai_tool'));
    envResults.forEach(r => {
        console.error(`     ${r.isActive ? '✅' : '⬜'} ${r.displayName}`);
    });
    console.error((0, i18n_1.t)('copy.force_hint'));
    process.exit(1);
}
/**
 * 执行单项复制任务，打印结果。
 */
function copyItem(label, sourceDir, destDir, isForce) {
    console.log((0, i18n_1.t)('copy.copying_label', label));
    return isForce
        ? forceCopyDir(sourceDir, destDir)
        : mergeCopyDir(sourceDir, destDir);
}
/**
 * 执行 copy 命令主逻辑。
 */
function run() {
    const SEP = '='.repeat(55);
    console.log(SEP);
    console.log((0, i18n_1.t)('copy.title'));
    console.log(SEP);
    const args = process.argv.slice(3);
    const isForce = args.includes('--force');
    const wantsSkills = args.includes('-skills');
    const wantsProject = args.includes('-project');
    // 1. 查找 npm 包根目录
    const packageRoot = findPackageRoot();
    if (!packageRoot) {
        console.error((0, i18n_1.t)('copy.no_package'));
        console.error((0, i18n_1.t)('copy.no_package_hint1'));
        console.error((0, i18n_1.t)('copy.no_package_hint2'));
        process.exit(1);
    }
    const packageProjectDir = path.join(packageRoot, 'project');
    const packageYidaSkillsDir = path.join(packageRoot, 'yida-skills');
    console.log((0, i18n_1.t)('copy.package_root', packageRoot));
    // 2. 确定目标根目录（检测 AI 工具环境）
    const { activeToolName, activeProjectRoot, results: envResults } = (0, env_1.detectEnvironment)();
    const activeEnvResult = envResults.find(r => r.isActive);
    const isWukong = !!(activeEnvResult && activeEnvResult.dirName === '.real');
    const destBase = resolveDestBaseFromEnv(activeToolName, activeProjectRoot, envResults);
    console.log((0, i18n_1.t)('copy.dest_base', destBase));
    if (isForce) {
        console.log((0, i18n_1.t)('copy.force_mode'));
    }
    const shouldCopyProject = wantsProject || (!wantsSkills);
    const shouldLinkSkills = wantsSkills;
    const results = [];
    if (shouldCopyProject) {
        const count = copyItem('project/', packageProjectDir, path.join(destBase, 'project'), isForce);
        results.push({ label: 'project/', dest: path.join(destBase, 'project'), count, type: 'copy' });
    }
    if (shouldLinkSkills) {
        const destSkillsLink = path.join(destBase, 'yida-skills');
        if (isWukong) {
            console.log((0, i18n_1.t)('copy.wukong_skills_cleanup'));
            const removed = removeSkillsLink(destSkillsLink);
            results.push({
                label: 'yida-skills/',
                dest: destSkillsLink,
                count: removed ? 1 : 0,
                type: 'wukong-cleanup',
            });
        }
        else {
            console.log((0, i18n_1.t)('copy.creating_symlink'));
            const success = createSymlink(packageYidaSkillsDir, destSkillsLink);
            results.push({
                label: 'yida-skills/',
                dest: destSkillsLink,
                count: success ? 1 : 0,
                type: 'symlink',
            });
        }
    }
    // 4. 打印汇总
    const copyCount = results.filter(r => r.type === 'copy').reduce((sum, r) => sum + r.count, 0);
    const linkCount = results.filter(r => r.type === 'symlink').length;
    console.log(`\n${SEP}`);
    console.log((0, i18n_1.t)('copy.done'));
    if (copyCount > 0) {
        console.log((0, i18n_1.t)('copy.files_copied', String(copyCount)));
    }
    if (linkCount > 0) {
        console.log((0, i18n_1.t)('copy.symlinks_created', String(linkCount)));
    }
    results.forEach(r => {
        if (r.type === 'symlink') {
            console.log(`   ${r.label.padEnd(14)} → ${r.dest} (${(0, i18n_1.t)('copy.symlink_label')})`);
        }
        else if (r.type === 'wukong-cleanup') {
            const statusText = r.count > 0 ? (0, i18n_1.t)('copy.wukong_skills_cleaned') : (0, i18n_1.t)('copy.wukong_skills_not_found', r.dest);
            console.log(`   ${r.label.padEnd(14)} → ${r.dest} (${statusText})`);
        }
        else {
            console.log(`   ${r.label.padEnd(14)} → ${r.dest} (${(0, i18n_1.t)('copy.files_count', String(r.count))})`);
        }
    });
    console.log(SEP);
}
//# sourceMappingURL=copy.js.map