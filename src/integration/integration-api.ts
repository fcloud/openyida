import querystring from 'querystring';
import { httpGet, httpPost, requestWithAutoLogin } from '../core/utils';

/**
 * integration-api.js - 集成&自动化相关宜搭 API 调用封装
 *
 * 包含：
 *   - getFormSchema：获取目标表单字段 Schema
 *   - saveProcess：保存/发布逻辑流
 *   - createLogicflow：新建逻辑流绑定关系
 *   - listLogicflows：查询应用内逻辑流列表（支持关键字/表单/状态筛选）
 *   - switchLogicflow：开启或关闭逻辑流
 */

/**
 * 获取目标表单的字段 Schema 列表
 * 接口地址：GET /alibaba/web/{appType}/_view/query/formdesign/getFormSchema.json?formUuid=xxx&schemaVersion=V5
 */
async function getFormSchema(authRef: any, params: { appType: string; formUuid: string }): Promise<any[]> {
  const { appType, formUuid } = params;

  const response = await requestWithAutoLogin((auth) => {
    return httpGet(
      auth.baseUrl,
      `/alibaba/web/${appType}/_view/query/formdesign/getFormSchema.json?formUuid=${formUuid}&schemaVersion=V5`,
      null,
      auth.cookies
    );
  }, authRef);

  if (!response || !response.success) {
    const errorMsg = response ? response.errorMsg || JSON.stringify(response) : '请求失败';
    throw new Error(`获取表单 Schema 失败：${errorMsg}`);
  }

  // content 是 JSON 字符串，需要解析
  let schemaContent = response.content;
  if (typeof schemaContent === 'string') {
    try {
      schemaContent = JSON.parse(schemaContent);
    } catch {
      throw new Error(`解析表单 Schema 失败：${schemaContent}`);
    }
  }

  // 提取 components 数组（字段列表）
  const components = (schemaContent as any) && (schemaContent as any).components;
  if (!Array.isArray(components)) {
    return [];
  }
  return components;
}

/**
 * 调用 saveProcess 接口保存或发布逻辑流
 * 接口地址：POST /alibaba/web/{appType}/query/simpleProcess/saveProcess.json
 */
async function saveProcess(authRef: any, params: {
  appType: string;
  formUuid: string;
  processCode: string;
  processJson: any;
  viewJson: any;
  isOnline: boolean;
}): Promise<any> {
  const { appType, formUuid, processCode, processJson, viewJson, isOnline } = params;

  return requestWithAutoLogin((auth) => {
    const postData = querystring.stringify({
      _csrf_token: auth.csrfToken,
      formUuid,
      isLogic: 'true',
      isOnline: String(isOnline),
      json: JSON.stringify(processJson),
      needReportLine: 'y',
      processCode,
      viewJson: JSON.stringify(viewJson),
    });
    return httpPost(
      auth.baseUrl,
      `/alibaba/web/${appType}/query/simpleProcess/saveProcess.json`,
      postData,
      auth.cookies
    );
  }, authRef);
}

/**
 * 调用 createLogicflow 接口新建逻辑流绑定关系，获取宜搭分配的真实 processCode
 * 接口地址：POST /alibaba/web/{appType}/query/formLogicflowBinding/createLogicflow.json
 */
async function createLogicflow(authRef: any, params: {
  appType: string;
  formUuid: string;
  flowName: string;
}): Promise<string> {
  const { appType, formUuid, flowName } = params;

  const response = await requestWithAutoLogin((auth) => {
    const postData = querystring.stringify({
      _csrf_token: auth.csrfToken,
      _locale_time_zone_offset: '28800000',
      name: flowName,
      type: '1',
      formUuid,
    });
    return httpPost(
      auth.baseUrl,
      `/alibaba/web/${appType}/query/formLogicflowBinding/createLogicflow.json`,
      postData,
      auth.cookies
    );
  }, authRef);

  if (!response || !response.success) {
    const errorMsg = response ? response.errorMsg || JSON.stringify(response) : '请求失败';
    throw new Error(`新建逻辑流失败：${errorMsg}`);
  }

  const processCode = (response.content as any) && (response.content as any).processCode;
  if (!processCode) {
    throw new Error(`新建逻辑流成功但未返回 processCode，响应：${JSON.stringify(response)}`);
  }

  return processCode;
}

/**
 * 查询应用内所有逻辑流（自动化）列表，支持按关键字/表单/状态筛选
 * 接口地址：GET /alibaba/web/{appType}/query/appLogicflowBinding/listflow.json
 */
async function listLogicflows(authRef: any, params: {
  appType: string;
  key?: string;
  formUuid?: string;
  status?: string;
  pageIndex?: number;
  pageSize?: number;
}): Promise<{ data: any[]; totalCount: number; hasMore: boolean }> {
  const {
    appType,
    key = '',
    formUuid = '',
    status = '',
    pageIndex = 1,
    pageSize = 10,
  } = params;

  const response = await requestWithAutoLogin((auth) => {
    const stamp = Date.now();
    const query = new URLSearchParams({
      _api: 'Connector.getListflow',
      _mock: 'false',
      _csrf_token: auth.csrfToken,
      _locale_time_zone_offset: '28800000',
      type: '1',
      key,
      appType,
      formUuid,
      status,
      pageIndex: String(pageIndex),
      pageSize: String(pageSize),
      _stamp: String(stamp),
    });
    return httpGet(
      auth.baseUrl,
      `/alibaba/web/${appType}/query/appLogicflowBinding/listflow.json?${query}`,
      null,
      auth.cookies
    );
  }, authRef);

  if (!response || !response.success) {
    const errorMsg = response ? response.errorMsg || JSON.stringify(response) : '请求失败';
    throw new Error(`查询逻辑流列表失败：${errorMsg}`);
  }

  const content = (response.content as any) || {};
  // 返回结构：data 为按表单分组的列表，每组含 flowList；totalCount 为表单组数
  return {
    data: content.data || [],
    totalCount: content.totalCount || 0,
    hasMore: content.hasMore || false,
  };
}

/**
 * 开启或关闭逻辑流（自动化）
 * 接口地址：POST /alibaba/web/{appType}/query/formLogicflowBinding/switchflow.json
 */
async function switchLogicflow(authRef: any, params: {
  appType: string;
  formUuid: string;
  processCode: string;
  enable: boolean;
}): Promise<any> {
  const { appType, formUuid, processCode, enable } = params;

  const response = await requestWithAutoLogin((auth) => {
    const stamp = Date.now();
    const postData = querystring.stringify({
      _csrf_token: auth.csrfToken,
      _locale_time_zone_offset: '28800000',
      enable: enable ? 'y' : 'n',
      processCode,
      formUuid,
      type: '1',
    });
    return httpPost(
      auth.baseUrl,
      `/alibaba/web/${appType}/query/formLogicflowBinding/switchflow.json?_api=Connector.switchFlow&_mock=false&_stamp=${stamp}`,
      postData,
      auth.cookies
    );
  }, authRef);

  if (!response || !response.success) {
    const errorMsg = response ? response.errorMsg || JSON.stringify(response) : '请求失败';
    throw new Error(`切换逻辑流状态失败：${errorMsg}`);
  }

  return response.content;
}

export { getFormSchema, saveProcess, createLogicflow, listLogicflows, switchLogicflow };
