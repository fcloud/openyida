/**
 * check-update.ts - openyida 版本更新检查
 *
 * 向 npm registry 查询最新版本，有新版本时打印提示。
 * 全程异步，不阻塞主命令流程。
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
exports.fetchLatestVersion = fetchLatestVersion;
exports.isNewer = isNewer;
exports.checkUpdate = checkUpdate;
const https = __importStar(require("https"));
const i18n_1 = require("./i18n");
const REGISTRY_URL = 'https://registry.npmjs.org/openyida/latest';
/**
 * 从 npm registry 获取最新版本号。
 */
function fetchLatestVersion() {
    return new Promise((resolve) => {
        const req = https.get(REGISTRY_URL, { timeout: 5000 }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed.version || null);
                }
                catch {
                    resolve(null);
                }
            });
        });
        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
    });
}
/**
 * 比较版本号，返回 latestVersion 是否比 currentVersion 更新。
 * 仅支持 semver 格式（major.minor.patch）。
 */
function isNewer(currentVersion, latestVersion) {
    const parseParts = (v) => (v || '').split('.').map(n => parseInt(n, 10) || 0);
    const [cMajor, cMinor, cPatch] = parseParts(currentVersion);
    const [lMajor, lMinor, lPatch] = parseParts(latestVersion);
    if (lMajor !== cMajor) {
        return lMajor > cMajor;
    }
    if (lMinor !== cMinor) {
        return lMinor > cMinor;
    }
    return lPatch > cPatch;
}
/**
 * 检查是否有新版本，有则打印提示。
 */
async function checkUpdate(currentVersion) {
    try {
        const latestVersion = await fetchLatestVersion();
        if (latestVersion && isNewer(currentVersion, latestVersion)) {
            process.nextTick(() => {
                console.error((0, i18n_1.t)('check_update.new_version', latestVersion, currentVersion));
            });
        }
    }
    catch {
        // 版本检查失败静默忽略，不影响主流程
    }
}
//# sourceMappingURL=check-update.js.map