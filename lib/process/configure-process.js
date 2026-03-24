"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const fs_1 = __importDefault(require("fs"));
const querystring_1 = __importDefault(require("querystring"));
const utils_1 = require("../core/utils");
const i18n_1 = require("../core/i18n");
// ── 参数解析 ──────────────────────────────────────────
function parseArgs(args) {
    if (args.length < 3) {
        console.error((0, i18n_1.t)('process.configure_usage'));
        process.exit(1);
    }
    const [appType, formUuid, processCode] = args;
    return { appType, formUuid, processCode };
}
// ── 读取配置文件 ──────────────────────────────────────
function readConfigFile(configPath) {
    if (!fs_1.default.existsSync(configPath)) {
        console.error((0, i18n_1.t)('process.configure_config_not_found', configPath));
        process.exit(1);
    }
    try {
        const content = fs_1.default.readFileSync(configPath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        console.error((0, i18n_1.t)('process.configure_config_parse_failed', error.message));
        process.exit(1);
    }
}
// ── 获取流程配置 ──────────────────────────────────────
async function getProcessConfig(authRef, appType, formUuid, processCode) {
    const response = await (0, utils_1.requestWithAutoLogin)((auth) => {
        return (0, utils_1.httpGet)(auth.baseUrl, `/alibaba/web/${appType}/query/simpleProcess/getProcess.json?formUuid=${formUuid}&processCode=${processCode}`, null, auth.cookies);
    }, authRef);
    if (!response || !response.success) {
        const errorMsg = response ? response.errorMsg || JSON.stringify(response) : '请求失败';
        throw new Error((0, i18n_1.t)('process.configure_get_failed', errorMsg));
    }
    let content = response.content;
    if (typeof content === 'string') {
        try {
            content = JSON.parse(content);
        }
        catch {
            throw new Error((0, i18n_1.t)('process.configure_parse_failed'));
        }
    }
    return content;
}
// ── 保存流程配置 ──────────────────────────────────────
async function saveProcessConfig(authRef, appType, formUuid, processCode, processJson, viewJson, isOnline) {
    const postData = querystring_1.default.stringify({
        _csrf_token: authRef.csrfToken,
        formUuid,
        isLogic: 'true',
        isOnline: String(isOnline),
        json: JSON.stringify(processJson),
        needReportLine: 'y',
        processCode,
        viewJson: JSON.stringify(viewJson),
    });
    const response = await (0, utils_1.requestWithAutoLogin)((auth) => {
        return (0, utils_1.httpPost)(auth.baseUrl, `/alibaba/web/${appType}/query/simpleProcess/saveProcess.json`, postData, auth.cookies);
    }, authRef);
    if (!response || !response.success) {
        const errorMsg = response ? response.errorMsg || JSON.stringify(response) : '请求失败';
        throw new Error((0, i18n_1.t)('process.configure_save_failed', errorMsg));
    }
    return response.content;
}
// ── 主流程 ────────────────────────────────────────────
async function run(args) {
    const { appType, formUuid, processCode } = parseArgs(args.slice(1));
    const configPath = args[4] || args[3];
    const shouldPublish = args.includes('--publish');
    const SEP = '='.repeat(50);
    console.error(SEP);
    console.error((0, i18n_1.t)('process.configure_title'));
    console.error(SEP);
    console.error((0, i18n_1.t)('process.configure_app_type', appType));
    console.error((0, i18n_1.t)('process.configure_form_uuid', formUuid));
    console.error((0, i18n_1.t)('process.configure_process_code', processCode));
    console.error((0, i18n_1.t)('process.configure_config_file', configPath || (0, i18n_1.t)('process.configure_config_stdin')));
    console.error(shouldPublish ? (0, i18n_1.t)('process.configure_mode_publish') : (0, i18n_1.t)('process.configure_mode_draft'));
    // Step 1: 读取登录态
    const totalSteps = shouldPublish ? 4 : 3;
    let currentStep = 0;
    const step = (label) => {
        currentStep++;
        console.error((0, i18n_1.t)('process.configure_step', String(currentStep), String(totalSteps), label));
    };
    step((0, i18n_1.t)('process.configure_step_login'));
    let cookieData = (0, utils_1.loadCookieData)();
    if (!cookieData) {
        console.error((0, i18n_1.t)('process.configure_no_cache'));
        cookieData = (0, utils_1.triggerLogin)();
    }
    const authRef = {
        csrfToken: cookieData.csrf_token,
        cookies: cookieData.cookies,
        baseUrl: (0, utils_1.resolveBaseUrl)(cookieData),
        cookieData,
    };
    console.error((0, i18n_1.t)('process.configure_login_ok', authRef.baseUrl));
    // Step 2: 读取配置
    step((0, i18n_1.t)('process.configure_step_read_config'));
    let config;
    if (configPath) {
        config = readConfigFile(configPath);
    }
    else {
        // 从标准输入读取
        const stdinChunks = [];
        process.stdin.on('data', (chunk) => {
            stdinChunks.push(chunk);
        });
        await new Promise((resolve) => {
            process.stdin.on('end', () => {
                const stdinContent = Buffer.concat(stdinChunks).toString('utf-8');
                try {
                    config = JSON.parse(stdinContent);
                }
                catch (error) {
                    console.error((0, i18n_1.t)('process.configure_config_parse_failed', error.message));
                    process.exit(1);
                }
                resolve();
            });
        });
    }
    if (!config || !config.processJson || !config.viewJson) {
        console.error((0, i18n_1.t)('process.configure_invalid_config'));
        process.exit(1);
    }
    console.error((0, i18n_1.t)('process.configure_config_loaded'));
    // Step 3: 获取现有配置并更新
    step((0, i18n_1.t)('process.configure_step_get_current'));
    let currentConfig;
    try {
        currentConfig = await getProcessConfig(authRef, appType, formUuid, processCode);
        console.error((0, i18n_1.t)('process.configure_current_loaded'));
    }
    catch (error) {
        console.error((0, i18n_1.t)('process.configure_get_current_failed', error.message));
        console.error((0, i18n_1.t)('process.configure_create_new_hint'));
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
    step((0, i18n_1.t)('process.configure_step_save'));
    await saveProcessConfig(authRef, appType, formUuid, processCode, processJson, viewJson, false);
    console.error((0, i18n_1.t)('process.configure_saved'));
    // Step 5: 发布（可选）
    if (shouldPublish) {
        step((0, i18n_1.t)('process.configure_step_publish'));
        try {
            await saveProcessConfig(authRef, appType, formUuid, processCode, processJson, viewJson, true);
            console.error((0, i18n_1.t)('process.configure_published'));
        }
        catch (error) {
            console.error((0, i18n_1.t)('process.configure_publish_failed', error.message));
            console.error((0, i18n_1.t)('process.configure_draft_hint'));
            console.error(SEP);
            console.log(JSON.stringify({
                success: true,
                published: false,
                processCode,
                warning: error.message,
            }));
            return;
        }
    }
    console.error('\n' + SEP);
    console.error((0, i18n_1.t)('process.configure_done'));
    console.error((0, i18n_1.t)('process.configure_process_code', processCode));
    console.error(shouldPublish ? (0, i18n_1.t)('process.configure_published') : (0, i18n_1.t)('process.configure_draft'));
    console.error(SEP);
    console.log(JSON.stringify({
        success: true,
        published: shouldPublish,
        processCode,
        appType,
        formUuid,
    }));
}
//# sourceMappingURL=configure-process.js.map