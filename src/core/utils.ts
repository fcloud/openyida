/**
 * utils.ts - 宜搭 CLI 公共工具函数
 *
 * 导出函数：
 *   findProjectRoot()         - 查找项目根目录（兼容悟空环境）
 *   extractInfoFromCookies()  - 从 Cookie 列表中提取 csrf_token / corp_id / user_id
 *   loadCookieData()          - 读取 .cache/cookies.json 登录态缓存
 *   triggerLogin()            - 触发登录（自动区分标准/悟空环境）
 *   refreshCsrfToken()        - 刷新 csrf_token
 *   resolveBaseUrl()          - 从 cookieData 中解析 base_url
 *   isLoginExpired()          - 检测响应体是否表示登录过期
 *   isCsrfTokenExpired()      - 检测响应体是否表示 csrf_token 过期
 */

'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import { t } from './i18n';
import type {
  Cookie,
  CookieData,
  CookieExtractResult,
  ActiveTool,
  AuthRef,
  YidaApiResponse,
} from '../types';

// ── 项目根目录查找 ────────────────────────────────────

/**
 * 检测当前活跃的 AI 工具。
 * 优先级：环境变量 > 兜底检测
 *
 * 注意：只返回当前"活跃"的工具，不返回已安装但未使用的工具。
 */
export function detectActiveTool(): ActiveTool | null {
  const env = process.env;
  const cwd = process.cwd();
  const home = os.homedir();

  // 优先级1：通过环境变量检测

  // Qoder (qoder.com)
  if (env.QODER_IDE || env.QODER_AGENT) {
    return {
      tool: 'qoder',
      displayName: 'Qoder',
      dirName: '.qoder',
      workspaceRoot: path.join(cwd, 'project'),
    };
  }

  // Claude Code
  if (env.CLAUDE_CODE) {
    return {
      tool: 'claude-code',
      displayName: 'Claude Code',
      dirName: '.claudecode',
      workspaceRoot: path.join(cwd, 'project'),
    };
  }

  // OpenCode
  if (env.OPENCODE) {
    const opencodeDirName = process.platform === 'win32'
      ? path.join('.config', 'opencode')
      : '.opencode';
    return {
      tool: 'opencode',
      displayName: 'OpenCode',
      dirName: opencodeDirName,
      workspaceRoot: path.join(cwd, 'project'),
    };
  }

  // Cursor
  if (env.CURSOR_TRACE_ID || (env.VSCODE_GIT_ASKPASS_NODE || '').includes('Cursor')) {
    return {
      tool: 'cursor',
      displayName: 'Cursor',
      dirName: '.cursor',
      workspaceRoot: path.join(cwd, 'project'),
    };
  }

  // 悟空（Wukong）
  if (env.AGENT_WORK_ROOT && (env.AGENT_WORK_ROOT.includes('.real') || env.AGENT_WORK_ROOT.includes(path.join('.real')))) {
    return {
      tool: 'wukong',
      displayName: '悟空（Wukong）',
      dirName: '.real',
      workspaceRoot: path.join(home, '.real', 'workspace', 'project'),
    };
  }

  // 优先级2：兜底检测

  // Aone Copilot
  if (env.TERM_PROGRAM === 'vscode' && fs.existsSync(path.join(home, '.aone_copilot'))) {
    return {
      tool: 'aone-copilot',
      displayName: 'Aone Copilot',
      dirName: '.aone_copilot',
      workspaceRoot: path.join(cwd, 'project'),
    };
  }

  return null;
}

/**
 * 查找项目根目录（project 工作区）。
 */
export function findProjectRoot(): string {
  const activeTool = detectActiveTool();

  if (activeTool) {
    if (fs.existsSync(activeTool.workspaceRoot)) {
      return activeTool.workspaceRoot;
    }
  }

  return process.cwd();
}

// ── Cookie 解析 ───────────────────────────────────────

/**
 * 从 Cookie 列表中提取 csrf_token、corp_id、userId。
 */
export function extractInfoFromCookies(cookies: Cookie[]): CookieExtractResult {
  let csrfToken: string | null = null;
  let corpId: string | null = null;
  let userId: string | null = null;

  for (const cookie of cookies) {
    if (cookie.name === 'tianshu_csrf_token') {
      csrfToken = cookie.value;
    } else if (cookie.name === 'tianshu_corp_user') {
      const lastUnderscore = cookie.value.lastIndexOf('_');
      if (lastUnderscore > 0) {
        corpId = cookie.value.slice(0, lastUnderscore);
        userId = cookie.value.slice(lastUnderscore + 1);
      }
    }
  }

  return { csrfToken, corpId, userId };
}

// ── 登录态缓存读取 ────────────────────────────────────

/**
 * 读取 .cache/cookies.json 登录态缓存。
 */
export function loadCookieData(projectRoot?: string, defaultBaseUrl?: string): CookieData | null {
  const root = projectRoot || findProjectRoot();
  const fallbackBaseUrl = defaultBaseUrl || 'https://www.aliwork.com';
  const cookieFile = path.join(root, '.cache', 'cookies.json');

  if (!fs.existsSync(cookieFile)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(cookieFile, 'utf-8').trim();
    if (!raw) {
      return null;
    }

    const parsed: Cookie[] | CookieData = JSON.parse(raw);
    let cookieData: CookieData;

    if (Array.isArray(parsed)) {
      cookieData = { cookies: parsed, base_url: fallbackBaseUrl };
    } else {
      cookieData = parsed as CookieData;
    }

    if (cookieData.cookies && cookieData.cookies.length > 0) {
      const { csrfToken, corpId, userId } = extractInfoFromCookies(cookieData.cookies);
      if (csrfToken) {
        cookieData.csrf_token = csrfToken;
      }
      if (corpId) {
        cookieData.corp_id = corpId;
      }
      if (userId) {
        cookieData.user_id = userId;
      }
    }

    return cookieData;
  } catch {
    return null;
  }
}

// ── 登录触发 ──────────────────────────────────────────

/**
 * 触发登录（Playwright 扫码模式）。
 */
export function triggerLogin(): CookieData {
  console.error(t('login.trigger_login'));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { ensureLogin } = require('../auth/login') as { ensureLogin: () => CookieData };
  return ensureLogin();
}

/**
 * 刷新 csrf_token（从本地缓存重新提取，无需重新扫码）。
 */
export function refreshCsrfToken(): CookieData {
  console.error(t('login.csrf_refresh'));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { refreshCsrfFromCache } = require('../auth/login') as { refreshCsrfFromCache: () => CookieData };
  return refreshCsrfFromCache();
}

// ── 响应检测 ──────────────────────────────────────────

/**
 * 检测响应体是否表示登录过期。
 */
export function isLoginExpired(responseJson: YidaApiResponse | null | undefined): boolean {
  return !!(
    responseJson &&
    responseJson.success === false &&
    (responseJson.errorCode === '307' || responseJson.errorCode === '302')
  );
}

/**
 * 检测响应体是否表示 csrf_token 过期。
 */
export function isCsrfTokenExpired(responseJson: YidaApiResponse | null | undefined): boolean {
  return !!(
    responseJson &&
    responseJson.success === false &&
    responseJson.errorCode === 'TIANSHU_000030'
  );
}

// ── base_url 解析 ─────────────────────────────────────

/**
 * 从 cookieData 中解析 base_url，去除末尾斜杠。
 */
export function resolveBaseUrl(cookieData: CookieData | null | undefined, defaultBaseUrl?: string): string {
  const fallback = defaultBaseUrl || 'https://www.aliwork.com';
  return ((cookieData && cookieData.base_url) || fallback).replace(/\/+$/, '');
}

// ── HTTP 请求工具 ─────────────────────────────────────

interface HttpOptions {
  hostname: string;
  port: number;
  path: string;
  method: string;
  headers: Record<string, string | number>;
  timeout: number;
}

function buildCookieHeader(baseUrl: string, cookies: Cookie[]): { cookieHeader: string; globalCsrfToken: string } {
  const parsedUrl = new URL(baseUrl);
  const requestHost = parsedUrl.hostname;
  const filteredCookies = cookies.filter(c => {
    const cookieDomain = (c.domain || '').replace(/^\./, '');
    return requestHost === cookieDomain || requestHost.endsWith('.' + cookieDomain);
  });
  const cookieHeader = filteredCookies.map(c => `${c.name}=${c.value}`).join('; ');
  const csrfCookie = filteredCookies.find(c => c.name === 'tianshu_csrf_token');
  const globalCsrfToken = csrfCookie ? csrfCookie.value : '';
  return { cookieHeader, globalCsrfToken };
}

function makeRequest(
  baseUrl: string,
  requestPath: string,
  method: string,
  postData: string | null,
  extraHeaders: Record<string, string | number>,
  cookies: Cookie[]
): Promise<YidaApiResponse> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const https = require('https') as typeof import('https');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const http = require('http') as typeof import('http');

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(baseUrl);
    const { cookieHeader, globalCsrfToken } = buildCookieHeader(baseUrl, cookies);
    const isHttps = parsedUrl.protocol === 'https:';
    const requestModule = isHttps ? https : http;

    const options: HttpOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : (isHttps ? 443 : 80),
      path: requestPath,
      method,
      headers: {
        Accept: 'application/json, text/plain, */*',
        Origin: baseUrl,
        Referer: baseUrl + '/',
        Cookie: cookieHeader,
        'x-requested-with': 'XMLHttpRequest',
        global_csrf_token: globalCsrfToken,
        ...extraHeaders,
      },
      timeout: 30000,
    };

    const req = requestModule.request(options, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk; });
      res.on('end', () => {
        console.error(t('common.http_status', String(res.statusCode)));
        try {
          const parsed = JSON.parse(data) as YidaApiResponse;
          if (isLoginExpired(parsed)) {
            resolve({ success: false, __needLogin: true });
            return;
          }
          if (isCsrfTokenExpired(parsed)) {
            resolve({ success: false, __csrfExpired: true });
            return;
          }
          resolve(parsed);
        } catch {
          console.error(t('common.http_response', data.substring(0, 500)));
          resolve({ success: false, errorMsg: `HTTP ${res.statusCode}: ` + t('common.response_not_json') });
        }
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error(t('common.request_timeout'))); });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

/**
 * 发送 HTTP POST 请求（application/x-www-form-urlencoded）
 */
export function httpPost(
  baseUrl: string,
  requestPath: string,
  postData: string,
  cookies: Cookie[]
): Promise<YidaApiResponse> {
  return makeRequest(baseUrl, requestPath, 'POST', postData, {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData),
  }, cookies);
}

/**
 * 发送 HTTP GET 请求
 */
export function httpGet(
  baseUrl: string,
  requestPath: string,
  queryParams: Record<string, string> | null,
  cookies: Cookie[]
): Promise<YidaApiResponse> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const querystring = require('querystring') as typeof import('querystring');
  const fullPath = queryParams ? `${requestPath}?${querystring.stringify(queryParams)}` : requestPath;
  return makeRequest(baseUrl, fullPath, 'GET', null, {}, cookies);
}

/**
 * 带自动重登录的请求封装。
 */
export async function requestWithAutoLogin(
  requestFn: (authRef: AuthRef) => Promise<YidaApiResponse>,
  authRef: AuthRef
): Promise<YidaApiResponse> {
  let result = await requestFn(authRef);

  if (result && result.__csrfExpired) {
    const refreshedData = refreshCsrfToken();
    authRef.cookieData = refreshedData;
    authRef.csrfToken = refreshedData.csrf_token || '';
    authRef.cookies = refreshedData.cookies;
    authRef.baseUrl = resolveBaseUrl(refreshedData);
    console.error(t('common.csrf_refreshed'));
    result = await requestFn(authRef);
  }

  if (result && result.__needLogin) {
    const newCookieData = triggerLogin();
    authRef.cookieData = newCookieData;
    authRef.csrfToken = newCookieData.csrf_token || '';
    authRef.cookies = newCookieData.cookies;
    authRef.baseUrl = resolveBaseUrl(newCookieData);
    console.error(t('common.relogin_retry'));
    result = await requestFn(authRef);
  }

  return result;
}

// 保持对 execSync 的引用（避免 unused import 警告）
void execSync;
