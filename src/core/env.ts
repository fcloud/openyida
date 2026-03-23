/**
 * env.ts - 宜搭 CLI 环境检测
 *
 * 通过环境变量 + 文件特征检测当前运行环境，并输出环境信息。
 */

'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { detectActiveTool, loadCookieData, resolveBaseUrl, extractInfoFromCookies } from './utils';
import { t } from './i18n';
import type { DetectEnvironmentResult, EnvironmentResult, LoginStatus } from '../types';

const home = os.homedir();

/**
 * 获取所有已安装的 AI 工具列表（用于展示）。
 * 不判断当前是否活跃，只判断是否安装过。
 */
function getInstalledTools(): Array<{ dirName: string; displayName: string }> {
  const tools = [
    { dirName: '.real', displayName: '悟空（Wukong）' },
    {
      dirName: process.platform === 'win32' ? path.join('.config', 'opencode') : '.opencode',
      displayName: 'OpenCode',
    },
    { dirName: '.claudecode', displayName: 'Claude Code' },
    { dirName: '.aone_copilot', displayName: 'Aone Copilot' },
    { dirName: '.cursor', displayName: 'Cursor' },
    { dirName: '.qoder', displayName: 'Qoder' },
  ];

  return tools.filter(({ dirName }) => {
    return fs.existsSync(path.join(home, dirName));
  });
}

/**
 * 检测当前 AI 工具环境。
 * 返回当前活跃工具信息和所有已安装工具列表。
 */
export function detectEnvironment(): DetectEnvironmentResult {
  const activeTool = detectActiveTool();
  const installedTools = getInstalledTools();
  const cwdProject = path.join(process.cwd(), 'project');

  const results: EnvironmentResult[] = installedTools.map(({ dirName, displayName }) => {
    const isWukong = dirName === '.real';
    const isActive = !!(activeTool && activeTool.dirName === dirName);
    const workspaceRoot = isWukong
      ? path.join(home, '.real', 'workspace', 'project')
      : cwdProject;
    const hasProject = fs.existsSync(workspaceRoot);

    return {
      displayName,
      dirName,
      isActive,
      hasProject,
      workspaceRoot,
    };
  });

  const activeToolName = activeTool ? activeTool.displayName : null;
  const activeProjectRoot = activeTool ? activeTool.workspaceRoot : null;

  return { activeToolName, activeProjectRoot, results };
}

/**
 * 检测登录态信息。
 */
export function detectLoginStatus(projectRoot?: string): LoginStatus {
  const cookieData = loadCookieData(projectRoot);
  if (!cookieData || !cookieData.cookies) {
    return { loggedIn: false, csrfToken: null, corpId: null, userId: null, baseUrl: null };
  }

  const { csrfToken, corpId, userId } = extractInfoFromCookies(cookieData.cookies);
  const baseUrl = resolveBaseUrl(cookieData);

  return { loggedIn: !!csrfToken, csrfToken, corpId, userId, baseUrl };
}

/**
 * 执行环境检测并打印结果。
 */
export function run(): void {
  const SEP = t('env.sep55') || '='.repeat(55);
  console.log(SEP);
  console.log(t('env.title'));
  console.log(SEP);

  // ── 系统信息 ──────────────────────────────────────
  console.log(t('env.system_info'));
  console.log(t('env.os', process.platform, os.arch()));
  console.log(t('env.node', process.version));
  console.log(t('env.home', os.homedir()));
  console.log(t('env.cwd', process.cwd()));

  // ── AI 工具检测 ────────────────────────────────────
  console.log(t('env.ai_tools'));
  const { activeToolName, activeProjectRoot, results } = detectEnvironment();

  if (results.length === 0) {
    console.log(t('env.no_tools'));
  } else {
    for (const { displayName, isActive, hasProject } of results) {
      let icon: string;
      let note: string;
      if (isActive && hasProject) {
        icon = '✅';
        note = t('env.tool_active_ready');
      } else if (isActive && !hasProject) {
        icon = '🟡';
        note = t('env.tool_active_no_project');
      } else if (!isActive && hasProject) {
        icon = '⬜';
        note = t('env.tool_installed_has_project');
      } else {
        icon = '⬜';
        note = t('env.tool_installed');
      }
      console.log(`  ${icon} ${displayName.padEnd(18)} ${note}`);
    }
  }

  // ── 当前生效环境 ───────────────────────────────────
  console.log(t('env.active_env'));
  if (activeToolName && activeProjectRoot) {
    console.log(t('env.ai_tool_label', activeToolName));
    console.log(t('env.project_root_label', activeProjectRoot));
  } else {
    const activeOnly = results.filter(r => r.isActive);
    if (activeOnly.length > 0) {
      console.log(t('env.active_no_project', activeOnly.map(r => r.displayName).join(', ')));
    } else {
      console.log(t('env.no_active_tool'));
    }
    console.log(t('env.project_fallback', process.cwd()));
  }

  // ── 登录态检测 ─────────────────────────────────────
  console.log(t('env.login_status'));
  const projectRoot = (activeProjectRoot && fs.existsSync(activeProjectRoot))
    ? activeProjectRoot
    : process.cwd();
  const loginStatus = detectLoginStatus(projectRoot);

  if (loginStatus.loggedIn) {
    console.log(t('env.logged_in'));
    console.log(t('env.base_url_label', loginStatus.baseUrl || ''));
    console.log(t('env.corp_id_label', loginStatus.corpId || t('env.unknown')));
    console.log(t('env.user_id_label', loginStatus.userId || t('env.unknown')));
    console.log(t('env.csrf_label', (loginStatus.csrfToken || '').slice(0, 16)));
  } else {
    console.log(t('env.not_logged_in'));
  }

  console.log('\n' + SEP);
}
