/**
 * cdp-login.js - Codex/Qoder/Wukong 环境的 CDP 登录入口
 *
 * 通过本机 Chrome DevTools Protocol 打开登录页、等待用户扫码、
 * 读取浏览器 Cookie 并写入 OpenYida Cookie 缓存。
 */

'use strict';

const path = require('path');
const { execFileSync } = require('child_process');
const { resolveLoginUrl } = require('../core/env-manager');
const { extractInfoFromCookies } = require('../core/utils');
const { t } = require('../core/i18n');
const { info, label, success } = require('../core/chalk');
const { saveCookieCache } = require('./login');

/**
 * 使用 CDP 登录并保存 Cookie。
 * @param {object} [options]
 * @param {string} [options.loginUrl]
 * @param {number} [options.timeoutMs]
 * @returns {object|null}
 */
function cdpLogin(options = {}) {
  const loginUrl = options.loginUrl || resolveLoginUrl();
  const timeoutMs = options.timeoutMs || 600000;
  const runner = path.join(__dirname, 'cdp-login-runner.js');

  info(t('login.browser_opening'));
  label('URL', loginUrl);
  info(t('login.waiting_login'));

  const stdout = execFileSync(process.execPath, [
    runner,
    JSON.stringify({ loginUrl, timeoutMs }),
  ], {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'inherit'],
    timeout: timeoutMs + 60000,
  });

  const lines = stdout.trim().split('\n');
  const jsonLine = lines[lines.length - 1];
  const result = JSON.parse(jsonLine);
  const cookies = result.cookies || [];
  const { csrfToken, corpId, userId } = extractInfoFromCookies(cookies);

  if (!csrfToken) {
    throw new Error(t('login.no_csrf_in_cookie'));
  }

  saveCookieCache(cookies, result.base_url);
  success(t('login.login_success'));
  success(t('login.csrf_ok', csrfToken.slice(0, 16)));
  if (corpId) {
    success(t('login.corp_id_ok', corpId));
  }

  return {
    csrf_token: csrfToken,
    corp_id: corpId,
    user_id: userId,
    base_url: result.base_url,
    cookies,
  };
}

module.exports = { cdpLogin };
