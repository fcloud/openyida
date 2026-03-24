#!/usr/bin/env node
/**
 * create-process.js - 流程创建工具（入口文件）
 *
 * 实际逻辑已拆分到 lib/process/ 目录：
 *   - lib/process/configure-process.js — 流程配置和保存逻辑
 *
 * 用法：
 *   openyida create-process <appType> <formUuid> <processCode> [config.json] [--publish]
 */

export { run } from './configure-process';

// 当直接执行时自动运行
if (require.main === module) {
  require('./configure-process').run(process.argv).catch((err: any) => {
    console.error('执行异常:', (err as Error).message);
    process.exit(1);
  });
}
