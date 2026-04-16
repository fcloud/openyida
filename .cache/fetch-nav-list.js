const fs = require('fs');
const path = require('path');

const cookiePath = path.join(require('os').homedir(), '.real', 'workspace', 'openyida', '.cache', 'cookies.json');
const raw = fs.readFileSync(cookiePath, 'utf8');
const cookieData = JSON.parse(raw);

let cookies;
if (Array.isArray(cookieData.cookies)) {
  cookies = cookieData.cookies.map(c => c.name + '=' + c.value).join('; ');
} else {
  cookies = cookieData.cookies;
}

const baseUrl = cookieData.base_url || 'https://www.aliwork.com';
const appType = process.argv[2] || 'APP_NWHYKQUO4U92HXTHHSNK';
const url = baseUrl + '/alibaba/web/' + appType + '/_view/query/formdesign/getFormNavigationListByOrder.json';

console.log('Fetching:', url);

fetch(url, {
  method: 'GET',
  headers: {
    'cookie': cookies,
    'accept': 'application/json, text/json',
    'x-requested-with': 'XMLHttpRequest',
  },
}).then(r => {
  console.log('Status:', r.status);
  return r.json();
}).then(res => {
  if (res.success && res.content) {
    const items = res.content;
    console.log('Total items:', items.length);
    items.forEach(item => {
      if (item.formUuid && item.formUuid.indexOf('REPORT') >= 0) {
        console.log(JSON.stringify({
          formUuid: item.formUuid,
          topicId: item.topicId,
          title: item.title,
          formType: item.formType,
        }, null, 2));
      }
    });
  } else {
    console.log('API response:', JSON.stringify(res).substring(0, 500));
  }
}).catch(e => {
  console.error('Error:', e.message);
});
