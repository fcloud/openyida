#!/usr/bin/env node
/**
 * 将 sandmap.html 中的内嵌 GeoJSON 数据注入到 mapconfig.html
 * 解决 mapconfig 页面 echarts 地图未注册导致的 regions 报错
 */
const fs = require('fs');
const path = require('path');

const sandmapPath = path.join(__dirname, 'pages 2', 'src', 'sandmap.html');
const mapconfigPath = path.join(__dirname, 'pages', 'src', 'mapconfig.html');

const sandmap = fs.readFileSync(sandmapPath, 'utf8');
const sandLines = sandmap.split('\n');

// 找到 EMBEDDED_CHINA_GEOJSON 和 EMBEDDED_CITY_FEATURES 所在行（1-indexed: 694, 695）
let geoJsonLine = '';
let cityFeaturesLine = '';

for (let i = 0; i < sandLines.length; i++) {
  const line = sandLines[i];
  if (line.includes('const EMBEDDED_CHINA_GEOJSON') || line.includes('var EMBEDDED_CHINA_GEOJSON')) {
    geoJsonLine = line.trim();
  }
  if (line.includes('const EMBEDDED_CITY_FEATURES') || line.includes('var EMBEDDED_CITY_FEATURES')) {
    cityFeaturesLine = line.trim();
  }
}

if (!geoJsonLine) {
  console.error('❌ 找不到 EMBEDDED_CHINA_GEOJSON');
  process.exit(1);
}
if (!cityFeaturesLine) {
  console.error('❌ 找不到 EMBEDDED_CITY_FEATURES');
  process.exit(1);
}

console.log('✅ 找到 EMBEDDED_CHINA_GEOJSON，长度:', geoJsonLine.length);
console.log('✅ 找到 EMBEDDED_CITY_FEATURES，长度:', cityFeaturesLine.length);

// 构建注入代码块
const insertBlock = [
  '',
  '// ═══════════════════════════════════════════════════════════',
  '// 内嵌中国地图 GeoJSON 数据（避免 CSP/跨域限制，无需外部 CDN）',
  '// ═══════════════════════════════════════════════════════════',
  geoJsonLine,
  cityFeaturesLine,
  '',
  '// 注册中国地图（省级 + 城市级合并）',
  '(function registerChinaMap() {',
  '  var mergedFeatures = EMBEDDED_CHINA_GEOJSON.features.map(function(provinceFeature) {',
  '    var provinceName = provinceFeature.properties && provinceFeature.properties.name;',
  '    var cityFeature = provinceName && EMBEDDED_CITY_FEATURES[provinceName];',
  '    if (cityFeature) {',
  '      return Object.assign({}, provinceFeature, {',
  '        geometry: cityFeature.geometry || provinceFeature.geometry,',
  '      });',
  '    }',
  '    return provinceFeature;',
  '  });',
  '  var mergedGeoJson = Object.assign({}, EMBEDDED_CHINA_GEOJSON, { features: mergedFeatures });',
  '  echarts.registerMap(\'china\', mergedGeoJson);',
  '})();',
  '',
].join('\n');

// 读取 mapconfig.html，在 <script> 标签后插入
let mapconfig = fs.readFileSync(mapconfigPath, 'utf8');

// 检查是否已经注入过
if (mapconfig.includes('EMBEDDED_CHINA_GEOJSON')) {
  console.log('⚠️  mapconfig.html 已包含 EMBEDDED_CHINA_GEOJSON，跳过注入');
  process.exit(0);
}

const scriptTag = '<script>';
const scriptTagIndex = mapconfig.indexOf(scriptTag);
if (scriptTagIndex === -1) {
  console.error('❌ 找不到 <script> 标签');
  process.exit(1);
}

const newContent = mapconfig.slice(0, scriptTagIndex + scriptTag.length) +
  insertBlock +
  mapconfig.slice(scriptTagIndex + scriptTag.length);

fs.writeFileSync(mapconfigPath, newContent, 'utf8');
console.log('✅ 已注入内嵌 GeoJSON 数据并注册地图');
console.log('新文件行数:', newContent.split('\n').length);
