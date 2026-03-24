/**
 * export-app.ts - 宜搭应用导出命令
 *
 * 导出应用的所有表单 Schema，生成可移植的迁移包（yida-export.json）。
 *
 * 用法：openyida export <appType> [output]
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  loadCookieData,
  triggerLogin,
  resolveBaseUrl,
  httpGet,
  requestWithAutoLogin,
} from '../core/utils';
import { t } from '../core/i18n';

// ── 获取应用下所有表单页面列表 ────────────────────────

interface FormPage {
  formUuid: string;
  name: string;
  formType: string;
}

async function fetchFormPageList(appType: string, authRef: any): Promise<FormPage[]> {
  const result: any = await requestWithAutoLogin((auth) => {
    return httpGet(
      auth.baseUrl,
      `/alibaba/web/${appType}/_view/query/app/getAppItemList.json`,
      { appType },
      auth.cookies
    );
  }, authRef);

  if (!result || result.success === false) {
    throw new Error(t('export.fetch_forms_failed') + ': ' + (result ? result.errorMsg || t('common.unknown_error') : t('common.request_failed')));
  }

  // 过滤出表单类型的页面（formType 为 form 或 report）
  const items = result.content || result.data || [];
  const formPages: FormPage[] = [];

  function collectFormPages(nodes: any[]): void {
    for (const node of nodes) {
      if (node.formType === 'form' || node.formType === 'report' || node.formType === 'subForm') {
        formPages.push({
          formUuid: node.formUuid || node.pageId,
          name: node.name || node.formName || node.pageTitle || t('export.unnamed_form'),
          formType: node.formType,
        });
      }
      if (node.children && node.children.length > 0) {
        collectFormPages(node.children);
      }
    }
  }

  collectFormPages(Array.isArray(items) ? items : [items]);
  return formPages;
}

// ── 获取单个表单 Schema ───────────────────────────────

async function fetchFormSchema(appType: string, formUuid: string, authRef: any): Promise<any> {
  const result: any = await requestWithAutoLogin((auth) => {
    return httpGet(
      auth.baseUrl,
      `/alibaba/web/${appType}/_view/query/formdesign/getFormSchema.json`,
      { formUuid, schemaVersion: 'V5' },
      auth.cookies
    );
  }, authRef);

  if (!result || result.success === false) {
    return null;
  }

  return result;
}

// ── 主逻辑 ────────────────────────────────────────────

export async function run(args: string[]): Promise<void> {
  if (args.length < 1) {
    console.error(t('export.usage'));
    console.error(t('export.example1'));
    console.error(t('export.example2'));
    process.exit(1);
  }

  const appType = args[0];
  const outputPath = args[1] || path.join(process.cwd(), 'yida-export.json');

  console.error('='.repeat(50));
  console.error(t('export.title'));
  console.error('='.repeat(50));
  console.error(t('export.app_id', appType));
  console.error(t('export.output_file', outputPath));

  // Step 1: 读取登录态
  console.error(t('common.step_login_label'));
  let cookieData: any = loadCookieData();
  if (!cookieData) {
    console.error(t('common.no_login_cache'));
    cookieData = triggerLogin();
  }

  const authRef = {
    csrfToken: cookieData.csrf_token,
    cookies: cookieData.cookies,
    baseUrl: resolveBaseUrl(cookieData),
    cookieData,
  };
  console.error(t('common.login_ready', authRef.baseUrl));

  // Step 2: 获取表单页面列表
  console.error(t('export.step_get_forms'));
  let formPages: FormPage[];
  try {
    formPages = await fetchFormPageList(appType, authRef);
  } catch (err: any) {
    console.error('  ❌ ' + err.message);
    process.exit(1);
  }

  if (formPages.length === 0) {
    console.error(t('export.no_forms'));
    process.exit(1);
  }

  console.error(t('export.forms_found', formPages.length.toString()));
  formPages.forEach((page, index) => {
    console.error('     ' + (index + 1) + '. ' + page.name + ' (' + page.formUuid + ')');
  });

  // Step 3: 逐个导出表单 Schema
  console.error(t('export.step_export_schema'));
  const exportedForms: any[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const page of formPages) {
    console.error(t('export.exporting', page.name, page.formUuid));
    const schema = await fetchFormSchema(appType, page.formUuid, authRef);
    if (schema) {
      exportedForms.push({
        formUuid: page.formUuid,
        name: page.name,
        formType: page.formType,
        schema,
      });
      console.error(t('export.export_ok'));
      successCount++;
    } else {
      console.error(t('export.export_failed'));
      failCount++;
    }
  }

  // Step 4: 写入导出文件
  console.error(t('export.step_write_file'));
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    sourceAppType: appType,
    baseUrl: authRef.baseUrl,
    forms: exportedForms,
  };

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');

  // 输出结果
  console.error('\n' + '='.repeat(50));
  console.error(t('export.done'));
  console.error(t('export.success_count', successCount.toString()));
  if (failCount > 0) {
    console.error(t('export.fail_count', failCount.toString()));
  }
  console.error(t('export.output_file', outputPath));
  console.error('='.repeat(50));

  console.log(
    JSON.stringify({
      success: true,
      appType,
      outputPath,
      totalForms: formPages.length,
      successCount,
      failCount,
    })
  );
}
