"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBlankReport = createBlankReport;
exports.saveReportSchema = saveReportSchema;
const querystring_1 = __importDefault(require("querystring"));
const utils_1 = require("../core/utils");
/**
 * 调用 saveFormSchemaInfo 创建空白报表
 */
async function createBlankReport(baseUrl, csrfToken, cookies, appType, reportTitle) {
    const postData = querystring_1.default.stringify({
        _csrf_token: csrfToken,
        formType: 'report',
        title: JSON.stringify({ zh_CN: reportTitle, en_US: reportTitle, type: 'i18n' }),
    });
    return (0, utils_1.httpPost)(baseUrl, `/dingtalk/web/${appType}/query/formdesign/saveFormSchemaInfo.json`, postData, cookies);
}
/**
 * 调用 saveFormSchema 保存报表 Schema
 */
async function saveReportSchema(baseUrl, csrfToken, cookies, appType, reportId, schema) {
    const postData = querystring_1.default.stringify({
        _csrf_token: csrfToken,
        formUuid: reportId,
        content: JSON.stringify(schema),
        schemaVersion: 'V5',
        importSchema: 'true',
    });
    return (0, utils_1.httpPost)(baseUrl, `/dingtalk/web/${appType}/_view/query/formdesign/saveFormSchema.json`, postData, cookies);
}
//# sourceMappingURL=http.js.map