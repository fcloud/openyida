/**
 * codex-login.js - 内置浏览器登录模式（Codex / Qoder / Wukong）
 *
 * Codex、Qoder 和悟空自带 in-app browser。CLI 进程不能直接调用其内置浏览器工具，
 * 因此这里返回一个明确的浏览器登录 handoff，由 Agent 打开 URL 让用户扫码。
 */

'use strict';

const { detectActiveTool, findProjectRoot } = require('../core/utils');
const { getCookieFilePath, resolveLoginUrl } = require('../core/env-manager');
const { t } = require('../core/i18n');

/** 支持内置浏览器 handoff 的工具列表 */
const BROWSER_HANDOFF_TOOLS = ['codex', 'qoder', 'wukong'];

function resolveUrlOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function buildCookieDomains(loginUrl) {
  const domains = ['.aliwork.com', 'www.aliwork.com'];
  const origin = resolveUrlOrigin(loginUrl);
  if (!origin) {
    return domains;
  }

  const hostname = new URL(origin).hostname;
  if (!domains.includes(hostname)) {
    domains.push(hostname);
  }
  return domains;
}

/**
 * 内置浏览器登录入口：不依赖 Playwright，也不走终端二维码接口。
 * 支持 Codex、Qoder 和悟空环境。
 * @param {object} [options]
 * @returns {Promise<object>} loginResult
 */
async function codexLogin(options = {}) {
  const { banner, info, warn, hint, label } = require('../core/chalk');
  const activeTool = detectActiveTool();

  banner(t('codex_login.title'));

  const toolName = activeTool ? activeTool.tool : null;
  if (!toolName || !BROWSER_HANDOFF_TOOLS.includes(toolName)) {
    warn(t('codex_login.not_codex'));
  }

  const loginUrl = options.loginUrl || resolveLoginUrl();
  const projectRoot = findProjectRoot();
  const cookieFile = getCookieFilePath(projectRoot);
  const loginOrigin = resolveUrlOrigin(loginUrl);
  const cookieImportCommand = [
    'openyida login --import-cookies <cookies.json>',
    loginOrigin ? `--base-url ${loginOrigin}` : null,
  ].filter(Boolean).join(' ');

  info(t('codex_login.no_playwright'));
  info(t('codex_login.using_browser'));
  label('URL', loginUrl);
  label('Cookie file', cookieFile);
  label('Import command', cookieImportCommand);
  hint(t('codex_login.browser_handoff_hint'));

  const browserName = toolName && BROWSER_HANDOFF_TOOLS.includes(toolName) ? toolName : 'codex';

  return {
    status: 'need_codex_browser_login',
    handoff_type: 'browser',
    handoff_version: 2,
    can_auto_use: false,
    login_url: loginUrl,
    browser: browserName,
    cookie_file: cookieFile,
    cookie_import_command: cookieImportCommand,
    post_login_check_command: 'openyida login --check-only --json',
    cookie_domains: buildCookieDomains(loginUrl),
    required_cookie_names: ['tianshu_csrf_token'],
    cookie_export_format: 'browser_context_cookies_json',
    message: t('codex_login.handoff_message'),
  };
}

module.exports = { codexLogin };
