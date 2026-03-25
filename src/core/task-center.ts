/**
 * task-center.ts - 宜搭全局任务中心命令
 *
 * 用法：
 *   openyida task-center <type> [参数]
 *
 * 支持的任务类型：
 *   todo       - 待办任务
 *   created    - 我创建的
 *   done       - 我已处理
 *   cc         - 抄送我的
 *   proxy      - 我代提交的
 */

'use strict';

import {
  loadCookieData,
  triggerLogin,
  resolveBaseUrl,
  httpGet,
  requestWithAutoLogin,
} from './utils';
import type { AuthRef, YidaApiResponse, CliArgs } from '../types';

// ── 类型定义 ──────────────────────────────────────────

type TaskType = 'todo' | 'created' | 'done' | 'cc' | 'proxy';

interface TaskCenterOptions {
  page: number;
  size: number;
  keyword?: string;
  no_detail?: boolean;
}

interface TaskCenterQueryParams {
  pageIndex: string;
  currentPage: string;
  pageSize: string;
  page: string;
  limit: string;
  keyword?: string;
  ignoreDetail?: string;
}

interface TaskCenterContent<T> {
  currentPage: number;
  limit: number;
  start: number;
  totalCount: number;
  values: T[] | null;
}

interface TaskCenterResponse<T = unknown> extends YidaApiResponse<TaskCenterContent<T>> {}

// ── 常量 ──────────────────────────────────────────────

const TASK_TYPE_MAP: Record<TaskType, string> = {
  todo: 'getTodoTasksInCorp',
  created: 'getMyCreateInCorp',
  done: 'getDoneTasksInCorp',
  cc: 'getNotifyMeInCorp',
  proxy: 'getSubmitAgentInCorp',
};

const USAGE = `openyida task-center - 宜搭全局任务中心

Usage:
  openyida task-center todo [--page N] [--size N] [--keyword TEXT]
  openyida task-center created [--page N] [--size N] [--keyword TEXT] [--no-detail]
  openyida task-center done [--page N] [--size N] [--keyword TEXT]
  openyida task-center cc [--page N] [--size N] [--keyword TEXT]
  openyida task-center proxy [--page N] [--size N] [--keyword TEXT]

任务类型：
  todo       - 待办任务（需要我处理的）
  created    - 我创建的（我发起的流程）
  done       - 我已处理（我已经处理过的）
  cc         - 抄送我的
  proxy      - 我代提交的（代理提交的流程）

可选参数：
  --page N       页码，默认 1
  --size N       每页条数，默认 20，最大 100
  --keyword TEXT 搜索关键词
  --no-detail    不返回详情（仅 created 类型支持）
`;

// ── 工具函数 ──────────────────────────────────────────

function fail(message: string): never {
  console.error(message);
  console.error(USAGE);
  process.exit(1);
}

function ensureSession(): AuthRef {
  let cookieData = loadCookieData();
  if (!cookieData || !cookieData.cookies || cookieData.cookies.length === 0 || !cookieData.csrf_token) {
    cookieData = triggerLogin();
  }

  if (!cookieData || !cookieData.cookies || !cookieData.csrf_token) {
    fail('无法获取有效登录态或 CSRF Token');
  }

  return {
    cookieData,
    cookies: cookieData.cookies,
    csrfToken: cookieData.csrf_token,
    baseUrl: resolveBaseUrl(cookieData),
  };
}

/**
 * 解析 CLI 参数数组，返回位置参数和命名选项。
 */
function parseCliOptions(args: CliArgs): { positionals: string[]; options: Record<string, string | boolean> } {
  const positionals: string[] = [];
  const options: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i++) {
    const token = args[i];
    if (token.startsWith('--')) {
      const key = token.slice(2).replace(/-/g, '_');
      const next = args[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        options[key] = next;
        i++;
      } else {
        options[key] = true;
      }
    } else {
      positionals.push(token);
    }
  }

  return { positionals, options };
}

/**
 * 规范化 page/size 参数，确保在合法范围内。
 */
function clampPageSize(options: Record<string, string | boolean | number>, defaultSize = 20): void {
  let size = parseInt(String(options.size), 10);
  let page = parseInt(String(options.page), 10);

  if (isNaN(size) || size <= 0) {
    size = defaultSize;
  }
  if (size > 100) {
    size = 100;
  }
  if (isNaN(page) || page <= 0) {
    page = 1;
  }

  options.size = size;
  options.page = page;
}

/**
 * 打印 API 响应结果。
 */
function printResult<T>(result: TaskCenterResponse<T>): void {
  const errorCode = result.errorCode;
  const hasErrorCode = errorCode !== undefined && errorCode !== null && errorCode !== '' && errorCode !== '0';

  if (result.success !== false && !hasErrorCode) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.error(JSON.stringify(result ?? { success: false, errorMsg: '未知错误' }, null, 2));
  process.exit(1);
}

// ── 请求发送 ──────────────────────────────────────────

/**
 * 发送全局任务中心请求。
 * 注意：全局任务中心接口使用不同的路径格式，不需要 appType。
 */
async function sendTaskCenterRequest<T = unknown>(
  session: AuthRef,
  endpoint: string,
  options: TaskCenterOptions,
  taskType: TaskType,
): Promise<TaskCenterResponse<T>> {
  const queryParam: TaskCenterQueryParams = {
    pageIndex: String(options.page),
    currentPage: String(options.page),
    pageSize: String(options.size),
    page: String(options.page),
    limit: String(options.size),
  };

  // "我创建的"接口支持 ignoreDetail 参数
  if (taskType === 'created' && options.no_detail) {
    queryParam.ignoreDetail = 'y';
  }

  if (options.keyword) {
    queryParam.keyword = options.keyword;
  }

  const params: Record<string, string> = {
    _api: 'nattyFetch',
    _mock: 'false',
    query: JSON.stringify(queryParam),
    _csrf_token: session.csrfToken,
    _stamp: `${Date.now()}`,
  };

  // 使用全局任务中心接口路径
  const requestPath = `/query/task/${endpoint}.json`;

  return requestWithAutoLogin(
    (auth) => httpGet(auth.baseUrl, requestPath, params, auth.cookies),
    session,
  ) as Promise<TaskCenterResponse<T>>;
}

// ── 主逻辑 ────────────────────────────────────────────

async function queryTasks(type: TaskType, options: TaskCenterOptions, session: AuthRef): Promise<void> {
  const endpoint = TASK_TYPE_MAP[type];
  if (!endpoint) {
    fail(`不支持的任务类型: ${type}\n支持的类型: todo, created, done, cc, proxy`);
  }

  const result = await sendTaskCenterRequest(session, endpoint, options, type);
  printResult(result);
}

export async function run(args: CliArgs): Promise<void> {
  if (args.length < 1) {
    fail('缺少必填参数 type');
  }

  const type = args[0] as TaskType;
  const { options: rawOptions } = parseCliOptions(args.slice(1));

  // 规范化参数
  clampPageSize(rawOptions);

  const options: TaskCenterOptions = {
    page: typeof rawOptions.page === 'number' ? rawOptions.page : parseInt(String(rawOptions.page), 10) || 1,
    size: typeof rawOptions.size === 'number' ? rawOptions.size : parseInt(String(rawOptions.size), 10) || 20,
    keyword: typeof rawOptions.keyword === 'string' ? rawOptions.keyword : undefined,
    no_detail: rawOptions.no_detail === true,
  };

  const session = ensureSession();
  await queryTasks(type, options, session);
}
