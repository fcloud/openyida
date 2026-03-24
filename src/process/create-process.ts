#!/usr/bin/env node
/**
 * create-process.ts - 宜搭流程表单一体化创建命令
 *
 * 整合「创建表单 → 转流程表单 → 获取 processCode → 配置流程」四步为一步。
 *
 * 用法 1（创建新表单 + 转流程）：
 *   openyida create-process <appType> <formTitle> <fieldsJsonFile> <processDefinitionFile>
 *
 * 用法 2（复用已有表单 + 转流程，推荐）：
 *   openyida create-process <appType> --formUuid <formUuid> <processDefinitionFile>
 */

import * as fs from 'fs';
import * as path from 'path';
import * as querystring from 'querystring';
import { execSync } from 'child_process';
import {
  loadCookieData,
  triggerLogin,
  resolveBaseUrl,
  httpPost,
  httpGet,
} from '../core/utils';
import { t } from '../core/i18n';

// ── 参数解析 ─────────────────────────────────────────

interface ParsedArgs {
  appType: string;
  formTitle: string | null;
  fieldsJsonFile: string | null;
  processDefinitionFile: string;
  existingFormUuid: string | null;
}

function parseArgs(args: string[]): ParsedArgs {
  const formUuidIndex = args.indexOf('--formUuid');

  // 用法 2: <appType> --formUuid <formUuid> <processDefinitionFile>
  if (formUuidIndex !== -1) {
    if (formUuidIndex + 1 >= args.length) {
      console.error(t('create_process.usage2'));
      process.exit(1);
    }
    let appType: string | null = null;
    const existingFormUuid = args[formUuidIndex + 1];
    const processDefFile = args[formUuidIndex + 2];

    for (let i = 0; i < args.length; i++) {
      if (args[i] !== '--formUuid' && args[i] !== existingFormUuid && args[i] !== processDefFile) {
        appType = args[i];
        break;
      }
    }

    return {
      appType: appType || '',
      formTitle: null,
      fieldsJsonFile: null,
      processDefinitionFile: processDefFile || '',
      existingFormUuid,
    };
  }

  // 用法 1: <appType> <formTitle> <fieldsJsonFile> <processDefinitionFile>
  if (args.length < 4) {
    console.error(t('create_process.usage'));
    process.exit(1);
  }
  return {
    appType: args[0],
    formTitle: args[1],
    fieldsJsonFile: args[2],
    processDefinitionFile: args[3],
    existingFormUuid: null,
  };
}

// ── API 调用函数 ─────────────────────────────────────

interface AuthRef {
  csrfToken: string;
  cookies: any[];
  baseUrl: string;
  cookieData: any;
}

function switchFormType(authRef: AuthRef, appType: string, formUuid: string): Promise<any> {
  const requestPath = '/' + appType + '/query/formdesign/switchFormType.json'
    + '?_api=Nav.transformForm&_mock=false&_stamp=' + Date.now();
  const postData = querystring.stringify({
    _csrf_token: authRef.csrfToken,
    _locale_time_zone_offset: '28800000',
    toFormType: 'process',
    formUuid: formUuid,
  });
  return httpPost(authRef.baseUrl, requestPath, postData, authRef.cookies);
}

async function getProcessCodeFromAppParam(authRef: AuthRef, appType: string, formUuid: string): Promise<string | null> {
  const requestPath = '/' + appType + '/query/app/getAppPlatFormParam.json'
    + '?_api=nattyFetch&_mock=false'
    + '&_csrf_token=' + encodeURIComponent(authRef.csrfToken)
    + '&_locale_time_zone_offset=28800000'
    + '&pageIndex=1&pageSize=50'
    + '&_stamp=' + Date.now();
  const result = await httpGet(authRef.baseUrl, requestPath, null, authRef.cookies) as any;
  if (result.success && result.content && result.content.formNavigationList) {
    const navList = result.content.formNavigationList;
    for (let i = 0; i < navList.length; i++) {
      if (navList[i].formUuid === formUuid && navList[i].processCode) {
        return navList[i].processCode;
      }
    }
  }
  return null;
}

async function getProcessCodeFromSchema(authRef: AuthRef, appType: string, formUuid: string): Promise<string | null> {
  const requestPath = '/dingtalk/web/' + appType + '/query/formdesign/getFormSchema.json'
    + '?formUuid=' + encodeURIComponent(formUuid)
    + '&schemaVersion=V5';
  const result = await httpGet(authRef.baseUrl, requestPath, null, authRef.cookies);
  if (result.success && result.content) {
    const schemaStr = typeof result.content === 'string' ? result.content : JSON.stringify(result.content);
    const matches = schemaStr.match(/TPROC[A-Za-z0-9_-]+/g);
    if (matches && matches.length > 0) {
      const unique: string[] = [];
      const seen: { [key: string]: boolean } = {};
      matches.forEach(function (m) {
        if (!seen[m]) { seen[m] = true; unique.push(m); }
      });
      return unique[0];
    }
  }
  return null;
}

// ── 主流程 ───────────────────────────────────────────

export async function run(args: string[]): Promise<void> {
  const parsed = parseArgs(args);
  const appType = parsed.appType;
  const formTitle = parsed.formTitle;
  const existingFormUuid = parsed.existingFormUuid;
  const useExistingForm = !!existingFormUuid;
  const fieldsJsonFile = parsed.fieldsJsonFile ? path.resolve(parsed.fieldsJsonFile) : null;
  const processDefinitionFile = path.resolve(parsed.processDefinitionFile);

  console.error('═'.repeat(60));
  console.error('  🔧 ' + t('create_process.title'));
  console.error('═'.repeat(60));
  console.error('  ' + t('create_process.app_id') + ':     ' + appType);
  if (useExistingForm) {
    console.error('  ' + t('create_process.mode') + ':        ' + t('create_process.reuse_form'));
    console.error('  formUuid:    ' + existingFormUuid);
  } else {
    console.error('  ' + t('create_process.mode') + ':        ' + t('create_process.new_form'));
    console.error('  ' + t('create_process.form_title') + ':    ' + formTitle);
    console.error('  ' + t('create_process.fields_file') + ':    ' + fieldsJsonFile);
  }
  console.error('  ' + t('create_process.process_def') + ':    ' + processDefinitionFile);
  console.error('');

  // 验证文件存在
  if (!useExistingForm && fieldsJsonFile && !fs.existsSync(fieldsJsonFile)) {
    console.error('  ❌ ' + t('create_process.fields_not_found') + ': ' + fieldsJsonFile);
    process.exit(1);
  }
  if (!fs.existsSync(processDefinitionFile)) {
    console.error('  ❌ ' + t('create_process.process_def_not_found') + ': ' + processDefinitionFile);
    process.exit(1);
  }

  // Step 0: 读取登录态
  console.error('🔑 Step 0: ' + t('create_process.loading_auth') + '...');
  let cookieData = loadCookieData();
  if (!cookieData || !cookieData.cookies || cookieData.cookies.length === 0) {
    cookieData = triggerLogin();
  }

  // 确保 cookieData 不为 null
  if (!cookieData) {
    console.error('  ❌ 登录失败：无法获取登录态');
    process.exit(1);
  }

  const authRef: AuthRef = {
    csrfToken: cookieData.csrf_token || '',
    cookies: cookieData.cookies || [],
    baseUrl: resolveBaseUrl(cookieData) || 'https://www.aliwork.com',
    cookieData: cookieData,
  };
  console.error('  ✅ ' + t('create_process.auth_loaded') + ', baseUrl: ' + authRef.baseUrl);

  // Step 1: 创建或复用表单
  let formUuid: string;
  let fieldCount = 0;

  if (useExistingForm) {
    console.error('\n📋 Step 1: ' + t('create_process.reusing_form') + '...');
    formUuid = existingFormUuid!;
    console.error('  ✅ ' + t('create_process.using_form') + ': ' + formUuid);
  } else {
    console.error('\n📋 Step 1: ' + t('create_process.creating_form') + '...');
    try {
      // 调用 openyida create-form create 命令
      const createFormOutput = execSync(
        'node ' + JSON.stringify(path.resolve(__dirname, '..', '..', 'bin', 'yida.js')) +
        ' create-form create ' +
        JSON.stringify(appType) + ' ' +
        JSON.stringify(formTitle) + ' ' +
        JSON.stringify(fieldsJsonFile),
        { timeout: 60000, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      const outputLines = createFormOutput.trim().split('\n');
      const createFormResult = JSON.parse(outputLines[outputLines.length - 1]);

      if (!createFormResult || !createFormResult.success || !createFormResult.formUuid) {
        console.error('  ❌ ' + t('create_process.create_form_failed') + ': ' + JSON.stringify(createFormResult));
        process.exit(1);
      }

      formUuid = createFormResult.formUuid;
      fieldCount = createFormResult.fieldCount || 0;
      console.error('  ✅ ' + t('create_process.form_created') + ': ' + formUuid);
    } catch (execError: any) {
      console.error('  ❌ ' + t('create_process.create_form_failed') + ': ' + execError.message);
      if (execError.stderr) {
        console.error('  ' + execError.stderr.substring(0, 1000));
      }
      process.exit(1);
    }
  }

  // Step 2: 转为流程表单
  console.error('\n🔄 Step 2: ' + t('create_process.switching_form_type') + '...');
  const switchResult = await switchFormType(authRef, appType, formUuid);
  if (switchResult.success) {
    console.error('  ✅ ' + t('create_process.switch_success'));
  } else {
    const switchMsg = switchResult.errorMsg || '';
    if (switchMsg.indexOf('已转换') >= 0 || switchMsg.indexOf('已经是') >= 0) {
      console.error('  ✅ ' + t('create_process.already_process'));
    } else {
      console.error('  ❌ ' + t('create_process.switch_failed') + ': ' + switchMsg);
      process.exit(1);
    }
  }

  // Step 3: 获取 processCode
  console.error('\n🔍 Step 3: ' + t('create_process.getting_process_code') + '...');
  let processCode: string | null = null;

  // 方法 1: 从 getAppPlatFormParam 接口提取
  console.error('  ' + t('create_process.method1') + '...');
  processCode = await getProcessCodeFromAppParam(authRef, appType, formUuid);
  if (processCode) {
    console.error('  ✅ ' + t('create_process.got_process_code') + ': ' + processCode);
  }

  // 方法 2: 从 getFormSchema 中提取
  if (!processCode) {
    console.error('  ' + t('create_process.method2') + '...');
    processCode = await getProcessCodeFromSchema(authRef, appType, formUuid);
    if (processCode) {
      console.error('  ✅ ' + t('create_process.got_from_schema') + ': ' + processCode);
    }
  }

  if (!processCode) {
    console.error('  ❌ ' + t('create_process.no_process_code'));
    console.error('  💡 ' + t('create_process.manual_hint', formUuid));
    console.log(JSON.stringify({
      success: false,
      formUuid: formUuid,
      formTitle: formTitle || '(existing form)',
      appType: appType,
      fieldCount: fieldCount,
      error: t('create_process.no_process_code'),
    }));
    process.exit(1);
  }

  // Step 4: 配置并发布流程
  console.error('\n⚙️  Step 4: ' + t('create_process.configuring_process') + '...');
  try {
    const { run: runConfigureProcess } = require('./configure-process');
    await runConfigureProcess([appType, formUuid, processDefinitionFile, processCode]);
  } catch (configError: any) {
    console.error('  ❌ ' + t('create_process.configure_failed') + ': ' + configError.message);
    process.exit(1);
  }

  // 输出最终结果
  const finalResult = {
    success: true,
    formUuid: formUuid,
    formTitle: formTitle || '(existing form)',
    appType: appType,
    fieldCount: fieldCount,
    processCode: processCode,
    url: authRef.baseUrl + '/' + appType + '/workbench/' + formUuid,
  };

  console.error('\n' + '═'.repeat(60));
  console.error('  🎉 ' + t('create_process.done'));
  console.error('  formUuid:       ' + formUuid);
  console.error('  processCode:    ' + processCode);
  console.error('  ' + t('create_process.url') + ':       ' + finalResult.url);
  console.error('═'.repeat(60));

  console.log(JSON.stringify(finalResult));
}

// 当直接执行时自动运行
if (require.main === module) {
  run(process.argv).catch((err: any) => {
    console.error('执行异常:', err.message);
    process.exit(1);
  });
}
