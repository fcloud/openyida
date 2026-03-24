#!/usr/bin/env node
"use strict";
/**
 * create-process.js - 流程创建工具（入口文件）
 *
 * 实际逻辑已拆分到 lib/process/ 目录：
 *   - lib/process/configure-process.js — 流程配置和保存逻辑
 *
 * 用法：
 *   openyida create-process <appType> <formUuid> <processCode> [config.json] [--publish]
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
var configure_process_1 = require("./configure-process");
Object.defineProperty(exports, "run", { enumerable: true, get: function () { return configure_process_1.run; } });
// 当直接执行时自动运行
if (require.main === module) {
    require('./configure-process').run(process.argv).catch((err) => {
        console.error('执行异常:', err.message);
        process.exit(1);
    });
}
//# sourceMappingURL=create-process.js.map