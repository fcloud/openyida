#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const cookieData = JSON.parse(fs.readFileSync(path.join(__dirname, '.cache/cookies.json'), 'utf-8'));
const baseUrl = cookieData.base_url; // https://uxmojw.aliwork.com
const csrfToken = cookieData.csrf_token;
const cookies = cookieData.cookies;

// 发送所有 cookies（不过滤）
const cookieHeader = cookies.map(c => c.name + '=' + c.value).join('; ');

const appName = '钉钉CDS沙盘地图';
const postData = querystring.stringify({
  _csrf_token: csrfToken,
  appName: JSON.stringify({ zh_CN: appName, en_US: appName, type: 'i18n' }),
  description: JSON.stringify({ zh_CN: '钉钉CDS排兵布阵沙盘地图', en_US: 'Sandmap', type: 'i18n' }),
  icon: 'xian-diqiu%%#0089FF',
  iconUrl: 'xian-diqiu%%#0089FF',
  colour: 'blue',
  defaultLanguage: 'zh_CN',
  openExclusive: 'n',
  openPhysicColumn: 'n',
  openIsolationDatabase: 'n',
  openExclusiveUnit: 'n',
  group: '全部应用',
});

// 用企业子域名发 registerApp 请求
const parsedUrl = new URL(baseUrl);
const options = {
  hostname: parsedUrl.hostname,
  port: 443,
  path: '/query/app/registerApp.json',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData),
    'Origin': baseUrl,
    'Referer': baseUrl + '/',
    'Cookie': cookieHeader,
  }
};

console.log('Sending to:', baseUrl + options.path);

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data.substring(0, 1000));
  });
});
req.on('error', e => console.error('Error:', e.message));
req.write(postData);
req.end();
