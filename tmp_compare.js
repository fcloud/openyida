const fs = require('fs');
const ref = JSON.parse(fs.readFileSync('.cache/ref-report-schema.json', 'utf8'));
const our = JSON.parse(fs.readFileSync('.cache/report-v7-schema.json', 'utf8'));

function findTimeFilter(obj) {
  if (!obj) return null;
  if (obj.componentName === 'YoushuTimeFilter') return obj;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = findTimeFilter(item);
      if (result) return result;
    }
  } else if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const result = findTimeFilter(obj[key]);
      if (result) return result;
    }
  }
  return null;
}

const refFilter = findTimeFilter(ref);
const ourFilter = findTimeFilter(our);

console.log('=== 参考报表时间筛选 ===');
console.log('titleConfig.label:', JSON.stringify(refFilter?.props?.settings?.titleConfig?.label));
console.log('dataConfig:', JSON.stringify(refFilter?.props?.settings?.dataConfig));
console.log('fieldDefinitionList[0]:', JSON.stringify(refFilter?.props?.dataSetModelMap?.filterData?.dataViewQueryModel?.fieldDefinitionList?.[0], null, 2));

console.log('\n=== 我们生成的时间筛选 ===');
console.log('titleConfig.label:', JSON.stringify(ourFilter?.props?.settings?.titleConfig?.label));
console.log('dataConfig:', JSON.stringify(ourFilter?.props?.settings?.dataConfig));
console.log('fieldDefinitionList[0]:', JSON.stringify(ourFilter?.props?.dataSetModelMap?.filterData?.dataViewQueryModel?.fieldDefinitionList?.[0], null, 2));
