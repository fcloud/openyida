/**
 * org.ts - 组织管理模块
 *
 * 提供组织切换能力，支持：
 *   - 列出用户可访问的组织
 *   - 切换组织（无需重新登录）
 *   - 交互式组织选择
 *
 * 切换组织原理：
 *   通过一系列 HTTP 请求完成组织切换，无需重新登录。
 *   流程：
 *     1. GET /start.html?corpid={corpId}&switchCorp=true
 *     2. GET /start.html?corpid={corpId}&
 *     3. 跟随重定向获取新 Cookie
 *
 * 导出函数：
 *   listOrganizations()     - 列出可访问的组织
 *   switchOrganization()    - 切换到指定组织
 *   interactiveSwitch()     - 交互式组织选择
 */

'use strict';

import * as https from 'https';
import * as http from 'http';
import { findProjectRoot, loadCookieData, extractInfoFromCookies, resolveBaseUrl } from '../core/utils';
import { saveCookieCache } from './login';
import { saveAuthConfig, loadAuthConfig } from './auth';
import { t } from '../core/i18n';
import type { Cookie, CookieData } from '../types';

const DEFAULT_BASE_URL = 'https://www.aliwork.com';

// ── HTTP 请求工具 ─────────────────────────────────────

interface HttpGetResult {
  statusCode: number | undefined;
  headers: Record<string, string | string[] | undefined>;
  cookies: Cookie[];
  location: string | undefined;
  body: string;
}

function httpGetWithCookies(
  url: string,
  cookies: Cookie[],
  _followRedirect = true
): Promise<HttpGetResult> {
  return new Promise((resolve, reject) => {
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const requestModule = isHttps ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        Cookie: cookieHeader,
      },
      timeout: 30000,
    };

    const req = requestModule.request(options, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk; });
      res.on('end', () => {
        const setCookies = (res.headers['set-cookie'] as string[]) || [];
        const newCookies = parseSetCookies(setCookies, cookies);

        resolve({
          statusCode: res.statusCode,
          headers: res.headers as Record<string, string | string[] | undefined>,
          cookies: newCookies,
          location: res.headers.location as string | undefined,
          body: data,
        });
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error(t('common.request_timeout'))); });
    req.on('error', reject);
    req.end();
  });
}

function parseSetCookies(setCookies: string[], existingCookies: Cookie[]): Cookie[] {
  const cookieMap = new Map<string, Cookie>();

  for (const cookie of existingCookies) {
    cookieMap.set(cookie.name, cookie);
  }

  for (const setCookie of setCookies) {
    const parts = setCookie.split(';')[0].split('=');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      cookieMap.set(name, { name, value } as Cookie);
    }
  }

  return Array.from(cookieMap.values());
}

// ── 组织列表获取 ──────────────────────────────────────

interface Organization {
  corpId: string;
  name: string;
  isCurrent: boolean;
  lastUsed: string;
}

export async function listOrganizations(cookieData: CookieData): Promise<Organization[]> {
  const SEP = '='.repeat(55);
  console.log(SEP);
  console.log(t('org.list_title'));
  console.log(SEP);

  const cookies = cookieData.cookies;

  const { corpId, userId: _userId } = extractInfoFromCookies(cookies);

  if (!corpId) {
    console.log(t('org.no_corp_id'));
    console.log(SEP);
    return [];
  }

  const authConfig = loadAuthConfig();
  const recentCorps = authConfig?.recentCorps || [];

  const organizations: Organization[] = [];

  organizations.push({
    corpId,
    name: t('org.current_org'),
    isCurrent: true,
    lastUsed: new Date().toISOString(),
  });

  for (const org of recentCorps) {
    if (org.corpId !== corpId) {
      organizations.push({
        corpId: org.corpId,
        name: org.name || org.corpId,
        isCurrent: false,
        lastUsed: org.lastUsed,
      });
    }
  }

  if (organizations.length === 0) {
    console.log(t('org.no_organizations'));
  } else {
    for (const org of organizations) {
      const icon = org.isCurrent ? '✅' : '  ';
      const current = org.isCurrent ? ` (${t('org.current')})` : '';
      console.log(`  ${icon} ${org.name}${current}`);
      console.log(`     corpId: ${org.corpId}`);
    }
  }

  console.log(SEP);
  return organizations;
}

// ── 组织切换 ──────────────────────────────────────────

interface SwitchResult {
  success: boolean;
  corpId?: string;
  csrfToken?: string;
  userId?: string | null;
  baseUrl?: string;
  cookies?: Cookie[];
  message?: string;
}

export async function switchOrganization(
  targetCorpId: string,
  cookieData: CookieData
): Promise<SwitchResult> {
  const SEP = '='.repeat(55);
  console.log(SEP);
  console.log(t('org.switch_title'));
  console.log(SEP);

  const cookies = cookieData.cookies;
  const { corpId: currentCorpId } = extractInfoFromCookies(cookies);

  console.log(t('org.switch_from', currentCorpId || t('org.unknown')));
  console.log(t('org.switch_to', targetCorpId));

  if (currentCorpId === targetCorpId) {
    console.log(t('org.already_in_org'));
    console.log(SEP);
    return {
      success: true,
      corpId: targetCorpId,
      message: 'Already in target organization',
    };
  }

  try {
    console.log(t('org.step1'));
    const step1Url = `${DEFAULT_BASE_URL}/start.html?corpid=${targetCorpId}&switchCorp=true`;
    const step1Result = await httpGetWithCookies(step1Url, cookies, false);

    console.log(t('org.step2'));
    const step2Url = `${DEFAULT_BASE_URL}/start.html?corpid=${targetCorpId}&`;
    const step2Result = await httpGetWithCookies(step2Url, step1Result.cookies, false);

    console.log(t('org.step3'));
    const step3Url = `https://ding.aliwork.com/start.html?corpid=${targetCorpId}&`;
    const step3Result = await httpGetWithCookies(step3Url, step2Result.cookies, false);

    let finalCookies = step3Result.cookies;
    let currentUrl = step3Result.location;

    let redirectCount = 0;
    while (currentUrl && redirectCount < 5) {
      redirectCount++;
      console.log(t('org.redirect', String(redirectCount)));

      if (!currentUrl.startsWith('http')) {
        currentUrl = `https://ding.aliwork.com${currentUrl}`;
      }

      const redirectResult = await httpGetWithCookies(currentUrl, finalCookies, false);
      finalCookies = redirectResult.cookies;
      currentUrl = redirectResult.location;

      if (currentUrl && currentUrl.includes('workPlatform')) {
        break;
      }
    }

    const { csrfToken, corpId: newCorpId, userId } = extractInfoFromCookies(finalCookies);

    if (!csrfToken) {
      console.log(t('org.switch_failed_no_csrf'));
      console.log(SEP);
      return { success: false, message: 'No csrf_token in new cookies' };
    }

    const newBaseUrl = 'https://ding.aliwork.com';
    saveCookieCache(finalCookies, newBaseUrl);

    const authConfig = loadAuthConfig() || {};
    authConfig.corpId = newCorpId;
    authConfig.userId = userId;
    (authConfig as Record<string, unknown>).switchTime = new Date().toISOString();

    if (!authConfig.recentCorps) {
      authConfig.recentCorps = [];
    }

    authConfig.recentCorps = authConfig.recentCorps.filter((c) => c.corpId !== newCorpId);
    authConfig.recentCorps.unshift({
      corpId: newCorpId || targetCorpId,
      name: t('org.switched_org'),
      lastUsed: new Date().toISOString(),
    });

    authConfig.recentCorps = authConfig.recentCorps.slice(0, 10);
    saveAuthConfig(authConfig);

    console.log(t('org.switch_success'));
    console.log(t('org.new_corp_id', newCorpId || ''));
    console.log(t('org.new_csrf', csrfToken.slice(0, 16)));
    console.log(SEP);

    return {
      success: true,
      corpId: newCorpId || undefined,
      csrfToken,
      userId,
      baseUrl: newBaseUrl,
      cookies: finalCookies,
    };
  } catch (error) {
    const err = error as Error;
    console.log(t('org.switch_error', err.message));
    console.log(SEP);
    return { success: false, message: err.message };
  }
}

// ── 交互式组织选择 ────────────────────────────────────

interface InteractiveSwitchResult {
  success: boolean;
  message: string;
  organizations?: Organization[];
}

export async function interactiveSwitch(cookieData: CookieData): Promise<InteractiveSwitchResult> {
  const organizations = await listOrganizations(cookieData);

  if (organizations.length === 0) {
    return { success: false, message: 'No organizations available' };
  }

  const switchableOrgs = organizations.filter((org) => !org.isCurrent);

  if (switchableOrgs.length === 0) {
    console.log(t('org.only_one_org'));
    return { success: false, message: 'Only one organization available' };
  }

  console.log(t('org.select_prompt'));
  switchableOrgs.forEach((org, index) => {
    console.log(`  ${index + 1}. ${org.name} (${org.corpId})`);
  });

  console.log(t('org.use_corp_id_hint'));

  return {
    success: false,
    message: 'Interactive mode not supported, please use --corp-id option',
    organizations: switchableOrgs,
  };
}
