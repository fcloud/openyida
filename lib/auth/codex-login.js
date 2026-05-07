/**
 * codex-login.js - 内置浏览器登录模式（Codex / Qoder / Wukong）
 *
 * Codex、Qoder 和悟空优先通过 CDP 打开浏览器并导入 Cookie。
 * CDP 不可用时，再返回一个明确的浏览器登录 handoff，由 Agent 打开 URL 让用户扫码。
 */

'use strict';

const { detectActiveTool } = require('../core/utils');
const { resolveLoginUrl } = require('../core/env-manager');
const { t } = require('../core/i18n');

/** 支持内置浏览器 handoff 的工具列表 */
const BROWSER_HANDOFF_TOOLS = ['codex', 'qoder', 'wukong'];

function isCdpLoginDisabled() {
  return ['1', 'true', 'yes'].includes(String(process.env.OPENYIDA_DISABLE_CDP_LOGIN || '').toLowerCase());
}

/**
 * 内置浏览器登录入口：优先 CDP，不依赖 Playwright，也不走终端二维码接口。
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
  if (options.useCdp !== false && !isCdpLoginDisabled()) {
    try {
      const { cdpLogin } = require('./cdp-login');
      const result = cdpLogin({ loginUrl, timeoutMs: options.timeoutMs });
      if (result && result.csrf_token && result.cookies) {
        return result;
      }
    } catch (error) {
      warn(error.message || String(error));
    }
  }

  info(t('codex_login.no_playwright'));
  info(t('codex_login.using_browser'));
  label('URL', loginUrl);
  hint(t('codex_login.browser_handoff_hint'));

  const browserName = toolName && BROWSER_HANDOFF_TOOLS.includes(toolName) ? toolName : 'codex';

  return {
    status: 'need_codex_browser_login',
    handoff_type: 'browser',
    can_auto_use: false,
    login_url: loginUrl,
    browser: browserName,
    message: t('codex_login.handoff_message'),
  };
}

module.exports = { codexLogin };
