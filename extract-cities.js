var fs = require('fs');
var html = fs.readFileSync('pages 2/src/sandmap.html', 'utf8');
var lines = html.split('\n');
var cityLine = lines.find(function(l) { return l.indexOf('EMBEDDED_CITY_FEATURES') >= 0 && l.indexOf('const') >= 0; });
var cityData = cityLine.match(/const EMBEDDED_CITY_FEATURES = (.*);$/);
if (!cityData) { console.log('找不到'); process.exit(1); }
var obj = JSON.parse(cityData[1]);

// 省份 adcode -> 省份名（从 PROVINCES 列表）
var ADCODE_TO_PROVINCE = {
  '110000': '北京市', '120000': '天津市', '130000': '河北省', '140000': '山西省',
  '150000': '内蒙古自治区', '210000': '辽宁省', '220000': '吉林省', '230000': '黑龙江省',
  '310000': '上海市', '320000': '江苏省', '330000': '浙江省', '340000': '安徽省',
  '350000': '福建省', '360000': '江西省', '370000': '山东省', '410000': '河南省',
  '420000': '湖北省', '430000': '湖南省', '440000': '广东省', '450000': '广西壮族自治区',
  '460000': '海南省', '500000': '重庆市', '510000': '四川省', '520000': '贵州省',
  '530000': '云南省', '540000': '西藏自治区', '610000': '陕西省', '620000': '甘肃省',
  '630000': '青海省', '640000': '宁夏回族自治区', '650000': '新疆维吾尔自治区',
  '710000': '台湾省', '810000': '香港特别行政区', '820000': '澳门特别行政区',
};

var cities = Object.keys(obj);
var byProvince = {};
cities.forEach(function(cityName) {
  var feature = obj[cityName];
  var parentAdcode = feature.properties && feature.properties.parent && String(feature.properties.parent.adcode);
  var provinceName = parentAdcode && ADCODE_TO_PROVINCE[parentAdcode];
  if (!provinceName) { console.log('未找到省份:', cityName, parentAdcode); return; }
  if (!byProvince[provinceName]) byProvince[provinceName] = [];
  byProvince[provinceName].push(cityName);
});
console.log('城市总数:', cities.length);
console.log('省份数:', Object.keys(byProvince).length);
Object.keys(byProvince).sort().forEach(function(p) {
  console.log(p + ': ' + byProvince[p].join(', '));
});
// 输出 JS 格式的省份城市映射
var output = 'var PROVINCE_CITIES = ' + JSON.stringify(byProvince, null, 0) + ';';
fs.writeFileSync('/tmp/province_cities.js', output);
console.log('\n已写入 /tmp/province_cities.js');
