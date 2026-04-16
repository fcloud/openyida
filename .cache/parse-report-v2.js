const fs = require('fs');
const path = require('path');

const schemaFile = path.join(__dirname, 'report-schema.json');
const rawData = JSON.parse(fs.readFileSync(schemaFile, 'utf-8'));

const pages = rawData.content.pages;
if (!pages || pages.length === 0) {
  console.log('没有找到 pages');
  process.exit(1);
}

const page = pages[0];
const componentsTree = page.componentsTree;

function extractComponents(node, depth = 0) {
  const results = [];
  if (!node) return results;

  const componentName = node.componentName || 'unknown';
  const props = node.props || {};

  const info = {
    depth,
    componentName,
    id: node.id,
  };

  // 提取 settings
  if (props.settings) {
    info.settings = {};
    const s = props.settings;
    if (s.titleConfig) info.settings.titleConfig = s.titleConfig;
    if (s.height !== undefined) info.settings.height = s.height;
    if (s.theme) info.settings.theme = s.theme;
    if (s.columnCount !== undefined) info.settings.columnCount = s.columnCount;
    if (s.mode) info.settings.mode = s.mode;
    if (s.labelConfig) info.settings.labelConfig = s.labelConfig;
    if (s.innerRadius !== undefined) info.settings.innerRadius = s.innerRadius;
    if (s.smooth !== undefined) info.settings.smooth = s.smooth;
    if (s.isStack !== undefined) info.settings.isStack = s.isStack;
    if (s.fixedHeader !== undefined) info.settings.fixedHeader = s.fixedHeader;
    if (s.pagination) info.settings.pagination = s.pagination;
    if (s.maxBodyHeight !== undefined) info.settings.maxBodyHeight = s.maxBodyHeight;
    if (s.colorType) info.settings.colorType = s.colorType;
    if (s.customColor) info.settings.customColor = s.customColor;
    if (s.showTag !== undefined) info.settings.showTag = s.showTag;
    if (s.columnCountForH5 !== undefined) info.settings.columnCountForH5 = s.columnCountForH5;
    if (s.dataConfig) info.settings.dataConfig = s.dataConfig;
    if (s.contentConfig) info.settings.contentConfig = s.contentConfig;
  }

  // 提取 dataSetModelMap
  if (props.dataSetModelMap) {
    info.dataSetModelMap = {};
    for (const [key, value] of Object.entries(props.dataSetModelMap)) {
      const dsInfo = {
        cubeCode: value.cubeCode,
        cubeTenantId: value.cubeTenantId,
      };
      if (value.fieldDefinitionList) {
        dsInfo.fieldDefinitionList = value.fieldDefinitionList.map(f => ({
          alias: f.alias,
          aliasName: f.aliasName,
          fieldCode: f.fieldCode,
          isDim: f.isDim,
          dataType: f.dataType,
          aggregateType: f.aggregateType,
          timeGranularityType: f.timeGranularityType || null,
        }));
      }
      if (value.fieldList) dsInfo.fieldList = value.fieldList;
      if (value.filterList && value.filterList.length > 0) dsInfo.filterList = value.filterList;
      if (value.orderByList && value.orderByList.length > 0) dsInfo.orderByList = value.orderByList;
      if (value.cubeCodes) dsInfo.cubeCodes = value.cubeCodes;
      if (value.valueField) dsInfo.valueField = value.valueField;
      if (value.labelField) dsInfo.labelField = value.labelField;
      if (value.limit !== undefined) dsInfo.limit = value.limit;
      info.dataSetModelMap[key] = dsInfo;
    }
  }

  // 提取 titleContent (PageHeader)
  if (props.titleContent) info.titleContent = props.titleContent;
  if (props.titleTip) info.titleTip = props.titleTip;

  results.push(info);

  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      results.push(...extractComponents(child, depth + 1));
    }
  }

  return results;
}

const allComponents = extractComponents(componentsTree);

// 过滤出有意义的组件
const meaningfulComponents = allComponents.filter(c =>
  c.dataSetModelMap ||
  c.componentName.includes('Youshu') ||
  c.componentName === 'Page' ||
  c.componentName === 'RootHeader' ||
  c.componentName === 'RootContent' ||
  c.componentName === 'PageHeaderContent' ||
  c.titleContent
);

const output = {
  title: rawData.content.title || componentsTree?.props?.titleContent,
  componentsMap: page.componentsMap?.map(c => c.componentName),
  componentTree: meaningfulComponents,
};

const outputFile = path.join(__dirname, 'report-analysis.json');
fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));

console.log('=== 报表分析结果 ===');
console.log('组件总数:', allComponents.length);
console.log('有效组件:', meaningfulComponents.length);
console.log('\n=== 组件结构 ===');
meaningfulComponents.forEach(c => {
  const indent = '  '.repeat(c.depth);
  let extra = '';
  if (c.titleContent) extra += ` title="${c.titleContent}"`;
  if (c.settings?.titleConfig?.label) extra += ` title="${c.settings.titleConfig.label}"`;
  if (c.settings?.labelConfig?.label) extra += ` label="${c.settings.labelConfig.label}"`;

  const dsKeys = c.dataSetModelMap ? Object.keys(c.dataSetModelMap) : [];
  if (dsKeys.length > 0) {
    const ds = c.dataSetModelMap[dsKeys[0]];
    if (ds.cubeCode) extra += ` cube=${ds.cubeCode}`;
    if (ds.fieldDefinitionList) {
      const fields = ds.fieldDefinitionList.map(f => {
        const dimLabel = f.isDim ? 'DIM' : `${f.aggregateType || 'NONE'}`;
        return `${f.aliasName}(${f.alias},${dimLabel})`;
      });
      extra += `\n${indent}    字段: ${fields.join(', ')}`;
    }
  }
  console.log(`${indent}[${c.componentName}]${extra}`);
});
