const fs = require('fs');
const raw = fs.readFileSync('/Users/yuyun/Documents/openyida-main-2026-03-19/.cache/qc-schema-output.txt', 'utf-8');
const jsonStart = raw.indexOf('{');
const lines = raw.substring(jsonStart).split('\n');
let depth = 0, end = 0;
for (let i = 0; i < lines.length; i++) {
  for (const ch of lines[i]) { if (ch === '{') depth++; if (ch === '}') depth--; }
  if (depth === 0) { end = i; break; }
}
const jsonStr = lines.slice(0, end + 1).join('\n');
const data = JSON.parse(jsonStr);
const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;

function findFields(obj, fields) {
  if (!obj) return;
  if (typeof obj === 'object' && !Array.isArray(obj)) {
    if (obj.fieldId && obj.label) {
      const opts = (obj.options || []).map(function(o) { return o.value || o.label || ''; }).slice(0, 10);
      var label = typeof obj.label === 'object' ? (obj.label.zh_CN || obj.label.en_US || JSON.stringify(obj.label)) : obj.label;
      var optVals = opts.map(function(o) { return typeof o === 'object' ? (o.zh_CN || o.en_US || JSON.stringify(o)) : o; });
      fields.push({ fieldId: obj.fieldId, label: label, componentName: obj.componentName || '', options: optVals.length ? optVals : null });
    }
    Object.values(obj).forEach(function(v) { findFields(v, fields); });
  } else if (Array.isArray(obj)) {
    obj.forEach(function(v) { findFields(v, fields); });
  }
}

const fields = [];
findFields(content, fields);
fields.forEach(function(f) {
  const opts = f.options ? ' | 选项: ' + f.options.join(', ') : '';
  console.log(f.fieldId + ' | ' + f.componentName + ' | ' + f.label + opts);
});
