/**
 * verify-short-url.ts - 宜搭公开访问/分享 URL 验证命令
 *
 * 用法：yidacli verify-short-url <appType> <formUuid> <url>
 *
 * 参数：
 *   appType  - 应用 ID（必填），如 APP_XXX
 *   formUuid - 表单 UUID（必填），如 FORM-XXX
 *   url      - 公开访问或分享路径（必填），如 /o/xxx 或 /s/xxx
 *
 * URL 格式要求：
 *   - /o/xxx：公开访问（对外）
 *   - /s/xxx：组织内分享（对内）
 *   - 路径部分只支持英文、数字、- 和 _
 *
 * 示例：
 *   yidacli verify-short-url APP_XXX FORM-XXX /o/myapp
 */

import https from 'https';
import http from 'http';
import querystring from 'querystring';
import {
  loadCookieData,
  triggerLogin,
  refreshCsrfToken,
  resolveBaseUrl,
  isLoginExpired,
  isCsrfTokenExpired,
} from '../core/utils';
import { t } from '../core/i18n';

interface ParseArgsResult {
  appType: string;
  formUuid: string;
  url: string;
  urlType: 'open' | 'share' | null;
}

function parseArgs(): ParseArgsResult {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error(t('verify_short_url.usage'));
    console.error(t('verify_short_url.example'));
    console.error(t('verify_short_url.formats_label'));
    console.error(t('verify_short_url.format_open'));
    console.error(t('verify_short_url.format_share'));
    process.exit(1);
  }
  const url = args[2];
  const urlType = url.startsWith('/o/') ? 'open' : url.startsWith('/s/') ? 'share' : null;
  return {
    appType: args[0],
    formUuid: args[1],
    url: url,
    urlType: urlType,
  };
}

/**
 * 验证 URL 格式
 * - /o/xxx - 公开访问（对外）
 * - /s/xxx - 组织内分享（对内）
 */
function validateUrl(url: string, urlType: 'open' | 'share' | null): void {
  if (!urlType) {
    throw new Error(t('verify_short_url.err_url_prefix', url));
  }
  const pathPart = url.slice(3);
  if (!/^[a-zA-Z0-9_-]+$/.test(pathPart)) {
    throw new Error(t('verify_short_url.err_url_chars', url));
  }
  if (pathPart.length === 0) {
    throw new Error(t('verify_short_url.err_url_empty', url));
  }
}

function sendGetRequest(baseUrl: string, cookies: any[], requestPath: string, queryParams: Record<string, string>): Promise<any> {
  return new Promise((resolve) => {
    const queryString = querystring.stringify(queryParams);
    const fullPath = `${requestPath}?${queryString}`;

    const cookieHeader = cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    const parsedUrl = new URL(baseUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const requestModule = isHttps ? https : http;

    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: fullPath,
      method: 'GET',
      headers: {
        Origin: baseUrl,
        Referer: baseUrl + '/',
        Cookie: cookieHeader,
        Accept: 'application/json, text/json',
        'x-requested-with': 'XMLHttpRequest',
      },
      timeout: 30000,
    };

    const request = requestModule.request(requestOptions, (response) => {
      let responseData = '';
      response.on('data', (chunk) => { responseData += chunk; });
      response.on('end', () => {
        console.error(t('common.http_status', String(response.statusCode ?? '')));
        let parsed;
        try {
          parsed = JSON.parse(responseData);
        } catch (parseError) {
          console.error(t('common.response_body', responseData.substring(0, 500)));
          resolve({ success: false, errorMsg: 'HTTP ' + response.statusCode + ': ' + t('common.response_not_json') });
          return;
        }
        // 检测登录过期（errorCode: "307"）
        if (isLoginExpired(parsed)) {
          console.error(t('common.login_expired', parsed.errorMsg));
          resolve({ __needLogin: true });
          return;
        }
        // 检测 csrf_token 过期（errorCode: "TIANSHU_000030"）
        if (isCsrfTokenExpired(parsed)) {
          console.error(t('common.csrf_expired', parsed.errorMsg));
          resolve({ __csrfExpired: true });
          return;
        }
        resolve(parsed);
      });
    });

    request.on('timeout', () => {
      console.error(t('common.request_timeout'));
      request.destroy();
      resolve({ success: false, errorMsg: t('common.request_timeout') });
    });

    request.on('error', () => {
      resolve({ success: false, errorMsg: t('common.request_error') });
    });

    request.end();
  });
}

async function main(): Promise<void> {
  const { appType, formUuid, url, urlType } = parseArgs();
  const urlLabel = urlType === 'open' ? t('verify_short_url.open_url_label') : t('verify_short_url.share_url_label');

  console.error('='.repeat(50));
  console.error(t('verify_short_url.title'));
  console.error('='.repeat(50));
  console.error(t('verify_short_url.app_id', appType));
  console.error(t('verify_short_url.form_uuid', formUuid));
  console.error('  ' + urlLabel + ': ' + url);

  // Step 0: 验证 URL 格式
  console.error(t('verify_short_url.step_validate'));
  try {
    validateUrl(url, urlType);
    console.error(t('verify_short_url.validate_ok'));
  } catch (err) {
    console.error(t('verify_short_url.validate_failed', (err as Error).message));
    process.exit(1);
  }

  // Step 1: 读取本地登录态
  console.error(t('common.step_login_label'));
  let cookieData = loadCookieData();
  if (!cookieData) {
    console.error(t('common.no_login_cache'));
    cookieData = triggerLogin();
  }
  let { cookies } = cookieData;
  let baseUrl = resolveBaseUrl(cookieData);
  console.error(t('common.login_ready', baseUrl));

  // Step 2: 验证 URL
  console.error(t('verify_short_url.step_verify'));
  console.error(t('verify_short_url.sending_request'));
  let csrfToken = cookieData.csrf_token!;

  // 构建请求参数（根据 URL 类型选择参数名）
  const requestParams: Record<string, string> = {
    _api: 'App.verifyShortUrlForm',
    formUuid: formUuid,
    _csrf_token: csrfToken,
    _locale_time_zone_offset: '28800000',
    _stamp: Date.now().toString(),
  };

  if (urlType === 'open') {
    requestParams.openUrl = url;
  } else {
    requestParams.shareUrl = url;
  }

  let result = await sendGetRequest(
    baseUrl,
    cookies,
    `/dingtalk/web/${appType}/query/formdesign/verifyShortUrl.json`,
    requestParams
  );

  if (result && result.__csrfExpired) {
    cookieData = refreshCsrfToken();
    csrfToken = cookieData.csrf_token!;
    cookies = cookieData.cookies;
    baseUrl = resolveBaseUrl(cookieData);
    requestParams._csrf_token = csrfToken;
    requestParams._stamp = Date.now().toString();
    console.error(t('common.resend_csrf'));
    result = await sendGetRequest(
      baseUrl,
      cookies,
      `/dingtalk/web/${appType}/query/formdesign/verifyShortUrl.json`,
      requestParams
    );
  }

  if (result && result.__needLogin) {
    cookieData = triggerLogin();
    csrfToken = cookieData.csrf_token!;
    cookies = cookieData.cookies;
    baseUrl = resolveBaseUrl(cookieData);
    requestParams._csrf_token = csrfToken;
    requestParams._stamp = Date.now().toString();
    console.error(t('common.resend'));
    result = await sendGetRequest(
      baseUrl,
      cookies,
      `/dingtalk/web/${appType}/query/formdesign/verifyShortUrl.json`,
      requestParams
    );
  }

  // 输出结果
  console.error('\n' + '='.repeat(50));
  if (result && !result.__needLogin && !result.__csrfExpired) {
    if (result.success && result.content) {
      console.error(t('verify_short_url.url_available'));
      console.error('='.repeat(50));
      console.log(JSON.stringify({
        available: true,
        url: url,
        urlType: urlType,
        message: urlType === 'open' ? t('verify_short_url.open_available_msg') : t('verify_short_url.share_available_msg')
      }, null, 2));
    } else {
      console.error(t('verify_short_url.url_taken'));
      console.error('='.repeat(50));
      console.log(JSON.stringify({
        available: false,
        url: url,
        urlType: urlType,
        message: result.errorMsg || t('verify_short_url.url_taken_msg'),
        errorCode: result.errorCode
      }, null, 2));
    }
  } else {
    console.error(t('verify_short_url.verify_failed'));
    console.error('='.repeat(50));
    process.exit(1);
  }
}
main().catch((error) => {
  console.error(t('common.exception', (error as Error).message));
  process.exit(1);
});
