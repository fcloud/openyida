/**
 * create-page.js - 宜搭自定义页面创建命令
 *
 * 用法：openyida create-page <appType> "<pageName>"
 */

'use strict';

const querystring = require('querystring');
const {
  loadCookieData,
  triggerLogin,
  resolveBaseUrl,
  httpGet,
  httpPost,
  requestWithAutoLogin,
} = require('../core/utils');
const { t } = require('../core/i18n');

const DASHBOARD_NAME_PATTERN = /(dashboard|看板|驾驶舱|大屏|cockpit|control\s*tower)/i;

function buildTitleJson(pageName) {
  return JSON.stringify({
    pureEn_US: pageName,
    en_US: pageName,
    zh_CN: pageName,
    envLocale: null,
    type: 'i18n',
    ja_JP: null,
    key: null,
  });
}

function isDashboardPage(pageName) {
  return DASHBOARD_NAME_PATTERN.test(pageName || '');
}

function normalizeShortUrlSeed(pageName) {
  const text = String(pageName || '').trim().toLowerCase();
  if (/供应链/.test(text)) {
    return 'supply_chain_dashboard';
  }
  if (/看板|驾驶舱|大屏/.test(text)) {
    return 'dashboard';
  }
  const seed = text
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_{2,}/g, '_')
    .slice(0, 32);
  return seed || 'dashboard';
}

function buildShareCandidates(pageName, pageId) {
  const seed = normalizeShortUrlSeed(pageName);
  const suffix = String(pageId || '')
    .replace(/[^a-z0-9]/gi, '')
    .slice(-6)
    .toLowerCase();
  const candidates = [`/s/${seed}`];
  if (suffix) {
    candidates.push(`/s/${seed}_${suffix}`);
  }
  candidates.push(`/s/${seed}_${Date.now().toString(36).slice(-6)}`);
  return candidates;
}

async function updateDashboardDisplayConfig(authRef, appType, pageId, pageName) {
  return requestWithAutoLogin((auth) => {
    const postData = querystring.stringify({
      _api: 'Form.updateFormSchemaInfo',
      _csrf_token: auth.csrfToken,
      _locale_time_zone_offset: '28800000',
      formUuid: pageId,
      serialSwitch: 'n',
      consultPerson: '',
      defaultManager: 'n',
      submissionRule: 'RESUBMIT',
      redirectConfig: '',
      pushTask: 'y',
      defaultOrder: 'cd',
      showPrint: 'y',
      relateUuid: '',
      title: buildTitleJson(pageName),
      pageType: 'web,mobile',
      isInner: 'y',
      isNew: 'n',
      isAgent: 'y',
      showAgent: 'n',
      showDingGroup: 'y',
      reStart: 'n',
      previewConfig: 'y',
      formulaType: 'n',
      displayTitle: '%24%7Blegao_creator%7D%E5%8F%91%E8%B5%B7%E7%9A%84%24%7Blegao_formname%7D',
      displayType: 'RE',
      isRenderNav: 'false',
      manageCustomActionInfo: '[]',
    });
    return httpPost(
      auth.baseUrl,
      `/dingtalk/web/${appType}/query/formdesign/updateFormSchemaInfo.json`,
      postData,
      auth.cookies
    );
  }, authRef);
}

async function verifyDashboardShareUrl(authRef, appType, pageId, shareUrl) {
  return requestWithAutoLogin((auth) => httpGet(
    auth.baseUrl,
    `/dingtalk/web/${appType}/query/formdesign/verifyShortUrl.json`,
    {
      _api: 'App.verifyShortUrlForm',
      formUuid: pageId,
      shareUrl,
      _csrf_token: auth.csrfToken,
      _locale_time_zone_offset: '28800000',
      _stamp: Date.now().toString(),
    },
    auth.cookies
  ), authRef);
}

async function saveDashboardShareUrl(authRef, appType, pageId, shareUrl) {
  return requestWithAutoLogin((auth) => {
    const postData = querystring.stringify({
      _api: 'Share.saveShareConfig',
      _csrf_token: auth.csrfToken,
      _locale_time_zone_offset: '28800000',
      formUuid: pageId,
      shareUrl,
    });
    return httpPost(
      auth.baseUrl,
      `/dingtalk/web/${appType}/query/formdesign/saveShareConfig.json`,
      postData,
      auth.cookies
    );
  }, authRef);
}

async function configureDashboardDefaults(authRef, appType, pageId, pageName) {
  const config = {
    isDashboard: false,
    isRenderNav: true,
    shareUrl: null,
    shareFullUrl: null,
  };

  if (!isDashboardPage(pageName)) {
    return config;
  }

  config.isDashboard = true;
  const displayResult = await updateDashboardDisplayConfig(authRef, appType, pageId, pageName);
  if (displayResult && displayResult.success) {
    config.isRenderNav = false;
  }

  const candidates = buildShareCandidates(pageName, pageId);
  for (const shareUrl of candidates) {
    const verifyResult = await verifyDashboardShareUrl(authRef, appType, pageId, shareUrl);
    if (!verifyResult || !verifyResult.success) {
      continue;
    }
    const saveResult = await saveDashboardShareUrl(authRef, appType, pageId, shareUrl);
    if (saveResult && saveResult.success) {
      config.shareUrl = shareUrl;
      config.shareFullUrl = `${authRef.baseUrl}${shareUrl}`;
      break;
    }
  }

  return config;
}

async function run(args) {
  if (args.length < 2) {
    const { error: chalkError } = require('../core/chalk');
    chalkError(t('create_page.usage'), { hint: t('create_page.example') });
  }

  const appType = args[0];
  const pageName = args[1];

  const { c, banner, step, label, info, success: chalkSuccess, warn, result: chalkResult } = require('../core/chalk');

  banner(t('create_page.title'));
  label('App', appType);
  label('Page', pageName);

  // Step 1: 读取登录态
  step(1, t('common.step_login', 1));
  let cookieData = loadCookieData();
  if (!cookieData) {
    info(t('common.login_no_cache'));
    cookieData = triggerLogin();
  }

  const authRef = {
    csrfToken: cookieData.csrf_token,
    cookies: cookieData.cookies,
    baseUrl: resolveBaseUrl(cookieData),
    cookieData,
  };
  chalkSuccess(t('common.login_ready', authRef.baseUrl));

  // Step 2: 创建自定义页面
  step(2, t('create_page.step_create'));
  info(t('create_page.sending'));

  const response = await requestWithAutoLogin((auth) => {
    const postData = querystring.stringify({
      _csrf_token: auth.csrfToken,
      formType: 'display',
      title: JSON.stringify({ zh_CN: pageName, en_US: pageName, type: 'i18n' }),
    });
    return httpPost(
      auth.baseUrl,
      `/dingtalk/web/${appType}/query/formdesign/saveFormSchemaInfo.json`,
      postData,
      auth.cookies
    );
  }, authRef);

  // 输出结果
  if (response && response.success && response.content) {
    const pageId = response.content.formUuid || response.content;
    const pageUrl = `${authRef.baseUrl}/${appType}/workbench/${pageId}`;
    let dashboardDefaults = {
      isDashboard: false,
      isRenderNav: true,
      shareUrl: null,
      shareFullUrl: null,
    };

    if (isDashboardPage(pageName)) {
      step(3, t('create_page.step_dashboard'));
      try {
        dashboardDefaults = await configureDashboardDefaults(authRef, appType, pageId, pageName);
      } catch (error) {
        warn(t('create_page.dashboard_config_failed', error.message));
      }
    }

    const resultRows = [
      ['Page ID', pageId],
      ['URL', `${c.cyan}${pageUrl}${c.reset}`],
    ];
    if (dashboardDefaults.isDashboard) {
      resultRows.push(['Render Nav', dashboardDefaults.isRenderNav ? 'shown' : 'hidden']);
      if (dashboardDefaults.shareFullUrl) {
        resultRows.push(['Share URL', `${c.cyan}${dashboardDefaults.shareFullUrl}${c.reset}`]);
      }
    }

    chalkResult(true, t('create_page.success'), resultRows);

    console.log(JSON.stringify({
      success: true,
      pageId,
      pageName,
      appType,
      url: pageUrl,
      isDashboard: dashboardDefaults.isDashboard,
      isRenderNav: dashboardDefaults.isRenderNav,
      shareUrl: dashboardDefaults.shareUrl,
      shareFullUrl: dashboardDefaults.shareFullUrl,
    }));
  } else {
    const errorMsg = response ? response.errorMsg || response.error || t('common.unknown_error') : t('common.request_failed');
    chalkResult(false, t('create_page.failed', errorMsg));
    console.log(JSON.stringify({ success: false, error: errorMsg }));
    process.exit(1);
  }
}

module.exports = { run };
