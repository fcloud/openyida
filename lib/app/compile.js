"use strict";
/**
 * compile.ts - 宜搭自定义页面仅编译工具（不发布）
 *
 * 用法：
 *   openyida compile <源文件路径>
 *
 * 示例：
 *   openyida compile pages/src/demo.js
 *
 * 编译逻辑复用 publish.js 中的 compileSource，产物输出到 project/pages/dist/<name>.js。
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
const publish_1 = require("./publish");
const i18n_1 = require("../core/i18n");
/**
 * 主流程：编译源文件，产物已由 compileSource 写入 dist 目录
 * @param args - CLI 参数，args[0] 为源文件路径
 */
async function run(args) {
    const sourceFile = args[0];
    if (!sourceFile) {
        console.error((0, i18n_1.t)('compile.usage'));
        console.error((0, i18n_1.t)('compile.example'));
        process.exit(1);
    }
    const sourcePath = path.resolve(sourceFile);
    if (!fs.existsSync(sourcePath)) {
        console.error((0, i18n_1.t)('compile.source_not_found', sourcePath));
        process.exit(1);
    }
    try {
        (0, publish_1.compileSource)(sourcePath);
    }
    catch (error) {
        console.error((0, i18n_1.t)('compile.exception', error.message));
        process.exit(1);
    }
}
//# sourceMappingURL=compile.js.map