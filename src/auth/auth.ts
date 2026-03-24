/**
 * auth.ts - 登录态管理模块
 *
 * 提供统一的登录态管理能力，支持：
 *   - 登录态状态查询
 *   - 钉钉扫码登录
 *   - 登录态刷新
 *   - 安全退出
 *
 * 导出函数：
 *   authStatus()     - 查询当前登录状态
 *   authLogin()      - 执行登录（扫码/钉钉自动登录）
 *   authRefresh()    - 刷新登录态
 *   authLogout()     - 退出登录
 */

'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { findProjectRoot, loadCookieData, extractInfoFromCookies, resolveBaseUrl } from '../core/utils';
import { ensureLogin, logout } from './login';
import { t } from '../core/i18n';
import type { LoginResult } from '../types';

const AUTH_CACHE_FILE = '.cache/auth.json';

// ── 配置读取 ──────────────────────────────────────────

interface AuthConfig {
  loginType?: string;
  loginTime?: string;
  refreshTime?: string;
  corpId?: string | null;
  userId?: string | null;
  recentCorps?: Array<{ corpId: string; name: string; lastUsed: string }>;
}

export function loadAuthConfig(): AuthConfig | null {
  const projectRoot = findProjectRoot();
  const authConfigPath = path.join(projectRoot, AUTH_CACHE_FILE);

  if (fs.existsSync(authConfigPath)) {
    try {
      const content = fs.readFileSync(authConfigPath, 'utf-8').trim();
      if (content) {
        return JSON.parse(content) as AuthConfig;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export function saveAuthConfig(config: AuthConfig): void {
  const projectRoot = findProjectRoot();
  const cacheDir = path.join(projectRoot, '.cache');
  const authConfigPath = path.join(cacheDir, 'auth.json');

  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(authConfigPath, JSON.stringify(config, null, 2), 'utf-8');
}

// ── 登录态状态查询 ────────────────────────────────────

interface AuthStatusResult {
  status: string;
  canAutoUse: boolean;
  csrfToken?: string;
  corpId?: string | null;
  userId?: string | null;
  baseUrl?: string;
  loginType?: string;
  loginTime?: string;
}

export function authStatus(): AuthStatusResult {
  const SEP = '='.repeat(55);
  console.log(SEP);
  console.log(t('auth.status_title'));
  console.log(SEP);

  const cookieData = loadCookieData();

  if (!cookieData || !cookieData.cookies || cookieData.cookies.length === 0) {
    console.log(t('auth.not_logged_in'));
    console.log(t('auth.login_hint'));
    console.log(SEP);
    return { status: 'not_logged_in', canAutoUse: false };
  }

  const { csrfToken, corpId, userId } = extractInfoFromCookies(cookieData.cookies);
  const baseUrl = resolveBaseUrl(cookieData);
  const authConfig = loadAuthConfig();

  if (!csrfToken) {
    console.log(t('auth.no_csrf_token'));
    console.log(t('auth.relogin_hint'));
    console.log(SEP);
    return { status: 'invalid', canAutoUse: false };
  }

  console.log(t('auth.logged_in'));
  console.log(t('auth.base_url_label', baseUrl));
  if (corpId) {
    console.log(t('auth.corp_id_label', corpId));
  }
  if (userId) {
    console.log(t('auth.user_id_label', userId));
  }
  console.log(t('auth.csrf_label', csrfToken.slice(0, 16)));

  if (authConfig) {
    if (authConfig.loginType) {
      console.log(t('auth.login_type_label', authConfig.loginType));
    }
    if (authConfig.loginTime) {
      console.log(t('auth.login_time_label', authConfig.loginTime));
    }
  }

  console.log(SEP);

  return {
    status: 'ok',
    canAutoUse: true,
    csrfToken,
    corpId,
    userId,
    baseUrl,
    loginType: authConfig?.loginType,
    loginTime: authConfig?.loginTime,
  };
}

// ── 执行登录 ──────────────────────────────────────────

interface AuthLoginOptions {
  type?: string;
}

export function authLogin(options: AuthLoginOptions = {}): LoginResult {
  const { type = 'qrcode' } = options;

  console.error(t('auth.login_start', type));

  const result = ensureLogin();

  const authConfig: AuthConfig = {
    loginType: type,
    loginTime: new Date().toISOString(),
    corpId: result.corp_id,
    userId: result.user_id,
  };
  saveAuthConfig(authConfig);

  console.error(t('auth.login_success'));
  if (result.corp_id) {
    console.error(t('auth.corp_id_ok', result.corp_id));
  }

  return result;
}

// ── 刷新登录态 ────────────────────────────────────────

interface AuthRefreshResult {
  status: string;
  message?: string;
  csrfToken?: string;
  corpId?: string | null;
  userId?: string | null;
  baseUrl?: string;
}

export function authRefresh(): AuthRefreshResult {
  console.error(t('auth.refresh_start'));

  const cookieData = loadCookieData();

  if (!cookieData || !cookieData.cookies) {
    console.error(t('auth.no_cookie_cache'));
    return { status: 'error', message: 'No cookie cache' };
  }

  const { csrfToken, corpId, userId } = extractInfoFromCookies(cookieData.cookies);

  if (!csrfToken) {
    console.error(t('auth.no_csrf_in_cache'));
    return { status: 'error', message: 'No csrf_token in cache' };
  }

  const baseUrl = resolveBaseUrl(cookieData);

  const authConfig: AuthConfig = loadAuthConfig() || {};
  authConfig.refreshTime = new Date().toISOString();
  authConfig.corpId = corpId;
  authConfig.userId = userId;
  saveAuthConfig(authConfig);

  console.error(t('auth.refresh_success'));
  console.error(t('auth.csrf_ok', csrfToken.slice(0, 16)));

  return { status: 'ok', csrfToken, corpId, userId, baseUrl };
}

// ── 退出登录 ──────────────────────────────────────────

export function authLogout(): void {
  logout();

  const projectRoot = findProjectRoot();
  const authConfigPath = path.join(projectRoot, AUTH_CACHE_FILE);

  if (fs.existsSync(authConfigPath)) {
    fs.writeFileSync(authConfigPath, '{}', 'utf-8');
    console.error(t('auth.auth_config_cleared'));
  }
}
