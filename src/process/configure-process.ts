import fs from 'fs';
import querystring from 'querystring';

import {
  loadCookieData,
  triggerLogin,
  resolveBaseUrl,
  requestWithAutoLogin,
  httpGet,
  httpPost,
} from '../core/utils';
import { t } from '../core/i18n';

// ── 参数解析 ──────────────────────────────────────────

function parseArgs(args: string[]): { appType: string; formUuid: string; processCode: string } {
  if (args.length < 3) {
    console.error(t('process.configure_usage'));
    process.exit(1);
  }
  const [appType, formUuid, processCode] = args;
  return { appType, formUuid, processCode };
}

// ── 读取配置文件 ──────────────────────────────────────

function readConfigFile(configPath: string): any {
  if (!fs.existsSync(configPath)) {
    console.error(t('process.configure_config_not_found', configPath));
    process.exit(1);
  }
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(t('process.configure_config_parse_failed', (error as Error).message));
    process.exit(1);
  }
}

// ── 获取流程配置 ──────────────────────────────────────

async function getProcessConfig(authRef: any, appType: string, formUuid: string, processCode: string): Promise<any> {
  const response = await requestWithAutoLogin((auth) => {
    return httpGet(
      auth.baseUrl,
      `/alibaba/web/${appType}/query/simpleProcess/getProcess.json?formUuid=${formUuid}&processCode=${processCode}`,
      null,
      auth.cookies
    );
  }, authRef);

  if (!response || !response.success) {
    const errorMsg = response ? response.errorMsg || JSON.stringify(response) : '请求失败';
    throw new Error(t('process.configure_get_failed', errorMsg));
  }

  let content = response.content;
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch {
      throw new Error(t('process.configure_parse_failed'));
    }
  }

  return content;
}

// ── 保存流程配置 ──────────────────────────────────────

async function saveProcessConfig(
  authRef: any,
  appType: string,
  formUuid: string,
  processCode: string,
  processJson: any,
  viewJson: any,
  isOnline: boolean
): Promise<any> {
  const postData = querystring.stringify({
    _csrf_token: authRef.csrfToken,
    formUuid,
    isLogic: 'true',
    isOnline: String(isOnline),
    json: JSON.stringify(processJson),
    needReportLine: 'y',
    processCode,
    viewJson: JSON.stringify(viewJson),
  });

  const response = await requestWithAutoLogin((auth) => {
    return httpPost(
      auth.baseUrl,
      `/alibaba/web/${appType}/query/simpleProcess/saveProcess.json`,
      postData,
      auth.cookies
    );
  }, authRef);

  if (!response || !response.success) {
    const errorMsg = response ? response.errorMsg || JSON.stringify(response) : '请求失败';
    throw new Error(t('process.configure_save_failed', errorMsg));
  }

  return response.content;
}

// ── 主流程 ────────────────────────────────────────────

async function run(args: string[]): Promise<void> {
  const { appType, formUuid, processCode } = parseArgs(args.slice(1));

  const configPath = args[4] || args[3];
  const shouldPublish = args.includes('--publish');

  const SEP = '='.repeat(50);
  console.error(SEP);
  console.error(t('process.configure_title'));
  console.error(SEP);
  console.error(t('process.configure_app_type', appType));
  console.error(t('process.configure_form_uuid', formUuid));
  console.error(t('process.configure_process_code', processCode));
  console.error(t('process.configure_config_file', configPath || t('process.configure_config_stdin')));
  console.error(shouldPublish ? t('process.configure_mode_publish') : t('process.configure_mode_draft'));

  // Step 1: 读取登录态
  const totalSteps = shouldPublish ? 4 : 3;
  let currentStep = 0;
  const step = (label: string) => {
    currentStep++;
    console.error(t('process.configure_step', String(currentStep), String(totalSteps), label));
  };

  step(t('process.configure_step_login'));
  let cookieData = loadCookieData();
  if (!cookieData) {
    console.error(t('process.configure_no_cache'));
    cookieData = triggerLogin();
  }

  const authRef = {
    csrfToken: cookieData.csrf_token,
    cookies: cookieData.cookies,
    baseUrl: resolveBaseUrl(cookieData),
    cookieData,
  };
  console.error(t('process.configure_login_ok', authRef.baseUrl));

  // Step 2: 读取配置
  step(t('process.configure_step_read_config'));
  let config;
  if (configPath) {
    config = readConfigFile(configPath);
  } else {
    // 从标准输入读取
    const stdinChunks: Buffer[] = [];
    process.stdin.on('data', (chunk) => {
      stdinChunks.push(chunk);
    });
    await new Promise<void>((resolve) => {
      process.stdin.on('end', () => {
        const stdinContent = Buffer.concat(stdinChunks).toString('utf-8');
        try {
          config = JSON.parse(stdinContent);
        } catch (error) {
          console.error(t('process.configure_config_parse_failed', (error as Error).message));
          process.exit(1);
        }
        resolve();
      });
    });
  }

  if (!config || !config.processJson || !config.viewJson) {
    console.error(t('process.configure_invalid_config'));
    process.exit(1);
  }

  console.error(t('process.configure_config_loaded'));

  // Step 3: 获取现有配置并更新
  step(t('process.configure_step_get_current'));
  let currentConfig;
  try {
    currentConfig = await getProcessConfig(authRef, appType, formUuid, processCode);
    console.error(t('process.configure_current_loaded'));
  } catch (error) {
    console.error(t('process.configure_get_current_failed', (error as Error).message));
    console.error(t('process.configure_create_new_hint'));
    currentConfig = null;
  }

  // 合并配置
  const processJson = config.processJson;
  const viewJson = config.viewJson;

  if (currentConfig) {
    // 保留现有配置中的某些字段
    processJson.props = { ...currentConfig.props, ...processJson.props };
  }

  // Step 4: 保存配置
  step(t('process.configure_step_save'));
  await saveProcessConfig(authRef, appType, formUuid, processCode, processJson, viewJson, false);
  console.error(t('process.configure_saved'));

  // Step 5: 发布（可选）
  if (shouldPublish) {
    step(t('process.configure_step_publish'));
    try {
      await saveProcessConfig(authRef, appType, formUuid, processCode, processJson, viewJson, true);
      console.error(t('process.configure_published'));
    } catch (error) {
      console.error(t('process.configure_publish_failed', (error as Error).message));
      console.error(t('process.configure_draft_hint'));
      console.error(SEP);
      console.log(JSON.stringify({
        success: true,
        published: false,
        processCode,
        warning: (error as Error).message,
      }));
      return;
    }
  }

  console.error('\n' + SEP);
  console.error(t('process.configure_done'));
  console.error(t('process.configure_process_code', processCode));
  console.error(shouldPublish ? t('process.configure_published') : t('process.configure_draft'));
  console.error(SEP);

  console.log(JSON.stringify({
    success: true,
    published: shouldPublish,
    processCode,
    appType,
    formUuid,
  }));
}

export { run };
