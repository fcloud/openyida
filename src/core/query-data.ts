/**
 * query-data.ts - 宜搭统一数据管理命令
 *
 * 用法：
 *   openyida data <action> <resource> [参数]
 *
 * 支持的操作：
 *   query form / get form / create form / update form / query subform
 *   query process / get process / create process / update process
 *   query operation-records / execute task / query tasks
 */

import * as querystring from 'querystring';
import {
  loadCookieData,
  triggerLogin,
  resolveBaseUrl,
  httpGet,
  httpPost,
  requestWithAutoLogin,
} from './utils';

const USAGE = `openyida data - Unified Yida data CLI

Usage:
  openyida data query form <appType> <formUuid> [--page N] [--size N] [--search-json JSON] [--inst-id ID]
  openyida data get form <appType> --inst-id <formInstId>
  openyida data create form <appType> <formUuid> --data <JSON> [--dept-id ID]
  openyida data update form <appType> --inst-id <formInstId> --data <JSON> [--use-latest-version y]
  openyida data query subform <appType> <formUuid> --inst-id <formInstId> --table-field-id <fieldId> [--page N] [--size N]
  openyida data query process <appType> <formUuid> [--page N] [--size N] [--search-json JSON] [--task-id ID] [--instance-status STATUS] [--approved-result RESULT]
  openyida data get process <appType> --process-inst-id <processInstanceId>
  openyida data create process <appType> <formUuid> --process-code <processCode> --data <JSON> [--dept-id ID]
  openyida data update process <appType> --process-inst-id <processInstanceId> --data <JSON>
  openyida data query operation-records <appType> --process-inst-id <processInstanceId>
  openyida data execute task <appType> --task-id <taskId> --process-inst-id <processInstanceId> --out-result <AGREE|DISAGREE> --remark <text> [--data JSON] [--no-execute-expressions y]
  openyida data query tasks <appType> --type <todo|done|submitted|cc> [--page N] [--size N] [--keyword TEXT] [--process-codes JSON] [--instance-status STATUS]
`;

interface Session {
  cookieData: any;
  cookies: any[];
  csrfToken: string;
  baseUrl: string;
}

interface CliOptions {
  positionals: string[];
  options: Record<string, string | boolean>;
}

function fail(message: string): never {
  console.error(message);
  console.error(USAGE);
  process.exit(1);
}

function parseError(message: string): never {
  console.error(`参数校验失败：${message}`);
  console.error(USAGE);
  process.exit(1);
}

function ensureSession(): Session {
  let cookieData = loadCookieData();
  if (!cookieData || !cookieData.cookies || cookieData.cookies.length === 0 || !cookieData.csrf_token) {
    cookieData = triggerLogin();
  }

  if (!cookieData || !cookieData.cookies || !cookieData.csrf_token) {
    fail('无法获取有效登录态或 CSRF Token');
  }

  return {
    cookieData,
    cookies: cookieData.cookies,
    csrfToken: cookieData.csrf_token,
    baseUrl: resolveBaseUrl(cookieData),
  };
}

function parseCliOptions(tokens: string[]): CliOptions {
  const positionals: string[] = [];
  const options: Record<string, string | boolean> = {};

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.startsWith('--')) {
      const key = token.slice(2).replace(/-/g, '_');
      const next = tokens[i + 1];
      if (next && !next.startsWith('--')) {
        options[key] = next;
        i += 1;
      } else {
        options[key] = true;
      }
    } else {
      positionals.push(token);
    }
  }

  return { positionals, options };
}

function clampPageSize(options: Record<string, string | boolean | number>, defaultSize = 20): void {
  let size = Number.parseInt(String(options.size || defaultSize), 10);
  let page = Number.parseInt(String(options.page || '1'), 10);

  if (!Number.isFinite(size) || size <= 0) { size = defaultSize; }
  if (size > 100) { size = 100; }
  if (!Number.isFinite(page) || page <= 0) { page = 1; }

  options.size = size;
  options.page = page;
}

function requirePositionals(positionals: string[], count: number, names: string[]): void {
  if (positionals.length < count) {
    parseError(`缺少必填参数 ${names.join(' ')}`);
  }
}

function requireOption(options: Record<string, string | boolean>, key: string, flagName?: string): void {
  if (!options[key]) {
    parseError(`缺少必填参数 ${flagName || `--${key.replace(/_/g, '-')}`}`);
  }
}

function snakeToCamel(str: string): string {
  const parts = str.split('_');
  return parts[0] + parts.slice(1).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function buildRequestParams(session: Session, params: Record<string, any>): Record<string, any> {
  return {
    _api: 'nattyFetch',
    _mock: 'false',
    _csrf_token: session.csrfToken,
    _stamp: `${Date.now()}`,
    ...params,
  };
}

async function sendGet(session: Session, appType: string, requestPath: string, params: Record<string, any>): Promise<any> {
  return requestWithAutoLogin(
    (auth) => httpGet(auth.baseUrl, requestPath, buildRequestParams(auth, params), auth.cookies),
    session,
  );
}

async function sendPost(session: Session, appType: string, requestPath: string, params: Record<string, any>): Promise<any> {
  return requestWithAutoLogin(
    (auth) => httpPost(auth.baseUrl, requestPath, querystring.stringify(buildRequestParams(auth, params)), auth.cookies),
    session,
  );
}

function printResult(result: any): void {
  const errorCode = result && result.errorCode;
  const hasErrorCode = errorCode !== undefined && errorCode !== null && errorCode !== '' && errorCode !== 0 && errorCode !== '0';

  if (result && result.success && !hasErrorCode) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.error(JSON.stringify(result || { success: false, errorMsg: '未知错误' }, null, 2));
  process.exit(1);
}

async function queryForm(positionals: string[], options: Record<string, string | boolean>, session: Session): Promise<void> {
  requirePositionals(positionals, 2, ['appType', 'formUuid']);
  const [appType, formUuid] = positionals;
  clampPageSize(options);

  let result;
  if (options.inst_id) {
    result = await sendGet(session, appType, `/dingtalk/web/${appType}/v1/form/getFormDataById.json`, {
      formInstId: options.inst_id,
    });
  } else {
    const params: Record<string, any> = {
      formUuid,
      appType,
      currentPage: String(options.page),
      pageSize: String(options.size),
    };
    if (options.search_json) { params.searchFieldJson = options.search_json; }
    for (const key of ['originator_id', 'create_from', 'create_to', 'modified_from', 'modified_to', 'dynamic_order']) {
      if (options[key]) { params[snakeToCamel(key)] = options[key]; }
    }
    const requestPath = options.ids_only
      ? `/dingtalk/web/${appType}/v1/form/searchFormDataIds.json`
      : `/dingtalk/web/${appType}/v1/form/searchFormDatas.json`;
    result = await sendGet(session, appType, requestPath, params);
  }

  printResult(result);
}

async function getForm(positionals: string[], options: Record<string, string | boolean>, session: Session): Promise<void> {
  requirePositionals(positionals, 1, ['appType']);
  requireOption(options, 'inst_id');
  const [appType] = positionals;
  printResult(await sendGet(session, appType, `/dingtalk/web/${appType}/v1/form/getFormDataById.json`, {
    formInstId: options.inst_id,
  }));
}

/**
 * 从 Schema 中提取字段标签到字段 ID 的映射
 */
function extractLabelToFieldIdMap(schema: any): Record<string, string> {
  const labelMap: Record<string, string> = {};

  function traverse(node: any): void {
    if (!node) { return; }

    // 提取当前节点的 label 和 fieldId
    if (node.props) {
      const { label, fieldId } = node.props;
      if (fieldId && label) {
        // 支持 i18n 格式的 label
        const labelText = typeof label === 'object' ? (label.zh_CN || label.en_US) : label;
        if (labelText) {
          labelMap[labelText] = fieldId;
        }
      }
    }

    // 递归处理子节点
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(traverse);
    }
    if (node.items && Array.isArray(node.items)) {
      node.items.forEach(traverse);
    }
  }

  // 遍历 componentsTree
  if (schema?.content?.pages) {
    for (const page of schema.content.pages) {
      if (page.componentsTree) {
        page.componentsTree.forEach(traverse);
      }
    }
  }

  return labelMap;
}

/**
 * 将用户数据中的字段标签替换为字段 ID
 */
function convertLabelToFieldId(data: Record<string, any>, labelMap: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    // 如果 key 在 labelMap 中，说明是标签，需要转换为 fieldId
    if (labelMap[key]) {
      result[labelMap[key]] = value;
    } else {
      // 否则保持原样（可能已经是 fieldId）
      result[key] = value;
    }
  }
  return result;
}

async function createForm(positionals: string[], options: Record<string, string | boolean>, session: Session): Promise<void> {
  requirePositionals(positionals, 2, ['appType', 'formUuid']);
  requireOption(options, 'data');
  const [appType, formUuid] = positionals;

  // 解析用户输入的数据
  let userData: Record<string, any>;
  try {
    userData = JSON.parse(options.data as string);
  } catch (e) {
    fail('--data 参数必须是有效的 JSON 格式');
  }

  // 检查数据中是否包含中文标签（需要转换）
  const hasChineseKey = Object.keys(userData).some(key => /[\u4e00-\u9fa5]/.test(key));

  let formDataJson = options.data as string;

  if (hasChineseKey) {
    // 获取表单 Schema 以提取字段映射
    console.error('  📋 检测到字段标签，正在获取字段映射...');
    const schemaResult = await sendGet(session, appType,
      `/alibaba/web/${appType}/_view/query/formdesign/getFormSchema.json`,
      { formUuid }
    );

    if (schemaResult && schemaResult.content) {
      const labelMap = extractLabelToFieldIdMap(schemaResult);
      const convertedData = convertLabelToFieldId(userData, labelMap);
      formDataJson = JSON.stringify(convertedData);
      console.error('  ✅ 字段标签已转换为字段 ID');
    }
  }

  const params: Record<string, any> = {
    appType,
    formUuid,
    formDataJson,
  };
  if (options.dept_id) { params.deptId = options.dept_id; }
  printResult(await sendPost(session, appType, `/dingtalk/web/${appType}/v1/form/saveFormData.json`, params));
}

async function updateForm(positionals: string[], options: Record<string, string | boolean>, session: Session): Promise<void> {
  requirePositionals(positionals, 1, ['appType']);
  requireOption(options, 'inst_id');
  requireOption(options, 'data');
  const [appType] = positionals;
  const params: Record<string, any> = {
    formInstId: options.inst_id,
    updateFormDataJson: options.data,
  };
  if (options.use_latest_version) { params.useLatestVersion = options.use_latest_version; }
  printResult(await sendPost(session, appType, `/dingtalk/web/${appType}/v1/form/updateFormData.json`, params));
}

async function querySubform(positionals: string[], options: Record<string, string | boolean>, session: Session): Promise<void> {
  requirePositionals(positionals, 2, ['appType', 'formUuid']);
  requireOption(options, 'inst_id');
  requireOption(options, 'table_field_id');
  clampPageSize(options, 10);
  const [appType, formUuid] = positionals;
  const params = {
    formUuid,
    formInstanceId: options.inst_id,
    tableFieldId: options.table_field_id,
    currentPage: String(options.page),
    pageSize: String(options.size),
  };
  printResult(await sendGet(session, appType, `/dingtalk/web/${appType}/v1/form/listTableDataByFormInstIdAndTableId.json`, params));
}

async function queryProcess(positionals: string[], options: Record<string, string | boolean>, session: Session): Promise<void> {
  requirePositionals(positionals, 2, ['appType', 'formUuid']);
  clampPageSize(options, 10);
  const [appType, formUuid] = positionals;
  const params: Record<string, any> = {
    formUuid,
    currentPage: String(options.page),
    pageSize: String(options.size),
  };
  for (const key of ['search_json', 'task_id', 'instance_status', 'approved_result', 'originator_id', 'create_from', 'create_to', 'modified_from', 'modified_to']) {
    if (options[key]) { params[key === 'search_json' ? 'searchFieldJson' : snakeToCamel(key)] = options[key]; }
  }
  const requestPath = options.ids_only
    ? `/dingtalk/web/${appType}/v1/process/getInstanceIds.json`
    : `/dingtalk/web/${appType}/v1/process/getInstances.json`;
  printResult(await sendGet(session, appType, requestPath, params));
}

async function getProcess(positionals: string[], options: Record<string, string | boolean>, session: Session): Promise<void> {
  requirePositionals(positionals, 1, ['appType']);
  requireOption(options, 'process_inst_id');
  const [appType] = positionals;
  printResult(await sendGet(session, appType, `/dingtalk/web/${appType}/v1/process/getInstanceById.json`, {
    processInstanceId: options.process_inst_id,
  }));
}

async function createProcess(positionals: string[], options: Record<string, string | boolean>, session: Session): Promise<void> {
  requirePositionals(positionals, 2, ['appType', 'formUuid']);
  requireOption(options, 'process_code');
  requireOption(options, 'data');
  const [appType, formUuid] = positionals;
  const params: Record<string, any> = {
    processCode: options.process_code,
    formUuid,
    formDataJson: options.data,
  };
  if (options.dept_id) { params.deptId = options.dept_id; }
  printResult(await sendPost(session, appType, `/dingtalk/web/${appType}/v1/process/startInstance.json`, params));
}

async function updateProcess(positionals: string[], options: Record<string, string | boolean>, session: Session): Promise<void> {
  requirePositionals(positionals, 1, ['appType']);
  requireOption(options, 'process_inst_id');
  requireOption(options, 'data');
  const [appType] = positionals;
  printResult(await sendPost(session, appType, `/dingtalk/web/${appType}/v1/process/updateInstance.json`, {
    processInstanceId: options.process_inst_id,
    updateFormDataJson: options.data,
  }));
}

async function queryOperationRecords(positionals: string[], options: Record<string, string | boolean>, session: Session): Promise<void> {
  requirePositionals(positionals, 1, ['appType']);
  requireOption(options, 'process_inst_id');
  const [appType] = positionals;
  printResult(await sendGet(session, appType, `/dingtalk/web/${appType}/v1/process/getOperationRecords.json`, {
    processInstanceId: options.process_inst_id,
  }));
}

async function executeTask(positionals: string[], options: Record<string, string | boolean>, session: Session): Promise<void> {
  requirePositionals(positionals, 1, ['appType']);
  for (const key of ['task_id', 'process_inst_id', 'out_result', 'remark']) {
    requireOption(options, key);
  }
  const [appType] = positionals;
  const params: Record<string, any> = {
    taskId: options.task_id,
    procInstId: options.process_inst_id,
    outResult: options.out_result,
    remark: options.remark,
  };
  if (options.data) { params.formDataJson = options.data; }
  if (options.no_execute_expressions) { params.noExecuteExpressions = options.no_execute_expressions; }
  printResult(await sendPost(session, appType, `/dingtalk/web/${appType}/v1/task/executeTask.json`, params));
}

async function queryTasks(positionals: string[], options: Record<string, string | boolean>, session: Session): Promise<void> {
  requirePositionals(positionals, 1, ['appType']);
  requireOption(options, 'type');
  clampPageSize(options, 10);
  const [appType] = positionals;
  const typeMap: Record<string, string> = {
    todo: 'task/getTodoTasksInApp',
    done: 'task/getDoneTasksInApp',
    submitted: 'process/getMySubmitInApp',
    cc: 'task/getNotifyMeTasksInApp',
  };
  const endpoint = typeMap[String(options.type)];
  if (!endpoint) {
    parseError('--type 仅支持 todo|done|submitted|cc');
  }

  const params: Record<string, any> = {
    currentPage: String(options.page),
    pageSize: String(options.size),
  };
  if (options.keyword) { params.keyword = options.keyword; }
  if (options.process_codes) { params.processCodes = options.process_codes; }
  if (options.instance_status) { params.instanceStatus = options.instance_status; }
  printResult(await sendGet(session, appType, `/dingtalk/web/${appType}/v1/${endpoint}.json`, params));
}

export async function run(args: string[]): Promise<void> {
  if (args.length < 2) {
    parseError('缺少必填参数 action 或 resource');
  }

  const action = args[0];
  const resource = args[1];
  const { positionals, options } = parseCliOptions(args.slice(2));
  const session = ensureSession();

  if (action === 'query' && resource === 'form') { return queryForm(positionals, options, session); }
  if (action === 'get' && resource === 'form') { return getForm(positionals, options, session); }
  if (action === 'create' && resource === 'form') { return createForm(positionals, options, session); }
  if (action === 'update' && resource === 'form') { return updateForm(positionals, options, session); }
  if (action === 'query' && resource === 'subform') { return querySubform(positionals, options, session); }
  if (action === 'query' && resource === 'process') { return queryProcess(positionals, options, session); }
  if (action === 'get' && resource === 'process') { return getProcess(positionals, options, session); }
  if (action === 'create' && resource === 'process') { return createProcess(positionals, options, session); }
  if (action === 'update' && resource === 'process') { return updateProcess(positionals, options, session); }
  if (action === 'query' && resource === 'operation-records') { return queryOperationRecords(positionals, options, session); }
  if (action === 'execute' && resource === 'task') { return executeTask(positionals, options, session); }
  if (action === 'query' && resource === 'tasks') { return queryTasks(positionals, options, session); }

  fail(`暂未实现的命令：${action} ${resource}`);
}
