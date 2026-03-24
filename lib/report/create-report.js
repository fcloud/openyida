#!/usr/bin/env node
"use strict";
/**
 * create-report.js - 宜搭报表创建工具（入口文件）
 *
 * 实际逻辑已拆分到 lib/report/ 目录：
 *   - lib/report/constants.js    — 常量和 ID 生成工具
 *   - lib/report/chart-builder.js — 图表 Schema 构建逻辑
 *   - lib/report/http.js          — HTTP 请求封装
 *   - lib/report/index.js         — 主流程入口
 *
 * 用法：
 *   openyida create-report <appType> "<报表名称>" <图表定义JSON或文件路径>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
var index_1 = require("./index");
Object.defineProperty(exports, "run", { enumerable: true, get: function () { return index_1.run; } });
// 当直接执行时（node lib/create-report.js）自动运行
if (require.main === module) {
    require('./index').run().catch((err) => {
        console.error('执行异常:', err.message);
        process.exit(1);
    });
}
//# sourceMappingURL=create-report.js.map