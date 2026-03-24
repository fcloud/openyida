/**
 * 获取宜搭表单的真实字段 ID
 * 用法: node scripts/get-field-ids.js <appId> <formUuid>
 */
var fs = require('fs');
var https = require('https');
var http = require('http');
var urlModule = require('url');
var path = require('path');

var appId = process.argv[2];
var formUuid = process.argv[3];
if (!appId || !formUuid) {
  console.error('用法: node scripts/get-field-ids.js <appId> <formUuid>');
  process.exit(1);
}

var cookieFile = path.join(__dirname, '..', '.cache', 'cookies.json');
var raw = JSON.parse(fs.readFileSync(cookieFile, 'utf8'));
var cookieData = Array.isArray(raw) ? { cookies: raw, base_url: 'https://ding.aliwork.com' } : raw;
// 用 publish.js 同款方式拼接 cookie 字符串（带 tianshu_csrf_token）
var cookieStr = cookieData.cookies.map(function(c) { return c.name + '=' + c.value; }).join('; ');
var baseUrl = (cookieData.base_url || 'https://ding.aliwork.com').replace(/\/$/, '');

var zlib = require('zlib');

// 尝试多个路径格式
var paths = [
  '/alibaba/web/' + appId + '/_view/query/formdesign/getFormSchema.json?formUuid=' + formUuid + '&schemaVersion=V5',
  '/dingtalk/web/' + appId + '/_view/query/formdesign/getFormSchema.json?formUuid=' + formUuid + '&schemaVersion=V5',
];

function doRequest(urlPath, callback) {
  var fullUrl = baseUrl + urlPath;
  var parsed = urlModule.parse(fullUrl);
  var lib = parsed.protocol === 'https:' ? https : http;
  var req = lib.request({
    hostname: parsed.hostname,
    port: parsed.port,
    path: parsed.path,
    method: 'GET',
    headers: {
      'Cookie': cookieStr,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, deflate',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    }
  }, function(res) {
    var chunks = [];
    res.on('data', function(chunk) { chunks.push(chunk); });
    res.on('end', function() {
      var buf = Buffer.concat(chunks);
      var encoding = res.headers['content-encoding'];
      if (encoding === 'gzip') {
        zlib.gunzip(buf, function(err, decoded) {
          if (err) { callback(err); return; }
          callback(null, res.statusCode, decoded.toString('utf8'));
        });
      } else if (encoding === 'deflate') {
        zlib.inflate(buf, function(err, decoded) {
          if (err) { callback(err); return; }
          callback(null, res.statusCode, decoded.toString('utf8'));
        });
      } else {
        callback(null, res.statusCode, buf.toString('utf8'));
      }
    });
  });
  req.on('error', callback);
  req.end();
}

function tryPath(index) {
  if (index >= paths.length) {
    console.error('所有路径均失败');
    return;
  }
  var p = paths[index];
  console.log('\n尝试路径:', p);
  doRequest(p, function(err, status, data) {
    if (err) { console.error('请求错误:', err); tryPath(index + 1); return; }
    console.log('HTTP 状态:', status);
    if (status !== 200) { console.log('响应:', data.substring(0, 200)); tryPath(index + 1); return; }
    try {
      var json = JSON.parse(data);
      var schema = null;
      // 尝试不同的响应结构
      if (json.content && json.content.schema) {
        schema = JSON.parse(json.content.schema);
      } else if (json.result && json.result.schema) {
        schema = JSON.parse(json.result.schema);
      } else if (json.schema) {
        schema = typeof json.schema === 'string' ? JSON.parse(json.schema) : json.schema;
      } else {
        console.log('未知响应结构，原始数据（前500字符）:');
        console.log(data.substring(0, 500));
        tryPath(index + 1);
        return;
      }

      // 递归提取所有字段
      function extractFields(items, depth) {
        if (!items || !Array.isArray(items)) return;
        items.forEach(function(item) {
          if (item.id && item.label && item.componentName !== 'FormLayout') {
            console.log('  fieldId: ' + item.id + ' | label: ' + item.label + ' | type: ' + item.componentName);
          }
          if (item.children) extractFields(item.children, depth + 1);
          if (item.items) extractFields(item.items, depth + 1);
        });
      }

      console.log('\n=== 字段列表 ===');
      extractFields(schema.items || schema.children || []);
    } catch(e) {
      console.log('解析失败:', e.message);
      console.log('原始数据（前500字符）:', data.substring(0, 500));
      tryPath(index + 1);
    }
  });
}

tryPath(0);
