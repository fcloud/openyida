const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('.cache/report-schema-clean.json', 'utf8'));
const content = typeof raw.content === 'string' ? JSON.parse(raw.content) : raw.content;
const page = content.pages[0];
const tree = page.componentsTree[0];
const rootContent = tree.children[1];
const header = tree.children[0];

// 搜索 prdId
var prdId = null;
var schemaStr = JSON.stringify(content);
var prdMatch = schemaStr.match(/"prdId":"([^"]+)"/);
if (prdMatch) prdId = prdMatch[1];

// 提取筛选器
var filters = [];
function findFilters(node) {
  if (!node) return;
  if (node.componentName && (node.componentName.toLowerCase().includes('filter') || node.componentName.toLowerCase().includes('select'))) {
    filters.push({ id: node.id, componentName: node.componentName, props: node.props });
  }
  if (node.children) node.children.forEach(findFilters);
}
findFilters(header);

// 提取组件摘要
var summary = rootContent.children.map(function(comp) {
  var title = comp.props.componentTitle && comp.props.componentTitle.zh_CN || '';
  var dsm = comp.props.dataSetModelMap || {};
  var dataSetKeys = Object.keys(dsm);
  var info = { id: comp.id, type: comp.componentName, title: title, dataSetKeys: dataSetKeys };
  
  dataSetKeys.forEach(function(key) {
    var ds = dsm[key];
    info.dataSetKey = key;
    if (ds.dataViewQueryModel) {
      info.cid = comp.props.cid || comp.id;
      info.cubeCode = ds.dataViewQueryModel.cubeCode;
      info.cubeTenantId = ds.dataViewQueryModel.cubeTenantId;
      info.fieldDefinitionList = ds.dataViewQueryModel.fieldDefinitionList;
      info.filterList = ds.dataViewQueryModel.filterList;
      info.fieldList = ds.dataViewQueryModel.fieldList;
    }
    // 提取 xField/yField/kpi 的标题
    if (ds.xField) info.xFieldTitles = ds.xField.map(function(f) { return f.text || f.title; });
    if (ds.yField) info.yFieldTitles = ds.yField.map(function(f) { return f.text || f.title; });
    if (ds.kpi) info.kpiTitles = ds.kpi.map(function(f) { return f.text || f.title; });
    if (ds.groupField && ds.groupField.length > 0) info.groupFieldTitles = ds.groupField.map(function(f) { return f.text || f.title; });
  });
  return info;
});

var result = { prdId: prdId, filters: filters, componentsSummary: summary };
fs.writeFileSync('.cache/report-summary.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
