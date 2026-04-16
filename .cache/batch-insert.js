/**
 * 批量向宜搭表单插入 300 条模拟任务数据
 * 使用方式: node .cache/batch-insert.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ===== 配置 =====
const APP_TYPE = 'APP_KNILKT41DC5XXR5D4QEC';
const FORM_UUID = 'FORM-C390F55E49DA4B1BB7EE5F7DE687A2054OG1';
const TOTAL_COUNT = 300;
const CONCURRENCY = 5; // 并发数

// ===== 字段 ID =====
const FIELD = {
  taskName: 'textField_jr2gbmkf',
  taskDesc: 'textareaField_jr2gs3re',
  project: 'textField_jr2gsc5g',
  startDate: 'dateField_jr2gufqh',
  endDate: 'dateField_jr2gjkqm',
  status: 'selectField_jr2g93k9',
  priority: 'selectField_jr2hz8wp',
  progress: 'rateField_jr2h5mft',
};

// ===== 模拟数据池 =====
const PROJECTS = ['CRM系统升级', '移动端App开发', '数据中台建设', '官网改版', '供应链优化', 'ERP系统迁移', '智能客服平台', '内部OA系统', '大数据分析平台', '微服务架构改造'];
const TASK_PREFIXES = ['设计', '开发', '测试', '部署', '优化', '重构', '调研', '评审', '修复', '集成'];
const TASK_SUFFIXES = ['用户模块', '权限系统', '数据接口', '前端页面', '后端服务', '数据库', '缓存层', '消息队列', '日志系统', '监控告警', '支付模块', '搜索引擎', '推荐算法', '报表功能', '审批流程'];
const STATUSES = ['未开始', '进行中', '已完成', '已延期', '已取消'];
const PRIORITIES = ['高', '中', '低'];
const DESCRIPTIONS = [
  '需要完成核心功能的开发和单元测试',
  '对现有模块进行性能优化和代码重构',
  '编写技术方案文档并进行团队评审',
  '完成接口联调和集成测试',
  '修复线上反馈的关键Bug',
  '进行系统压力测试和安全扫描',
  '完成UI设计稿的前端还原',
  '搭建CI/CD自动化部署流水线',
  '编写用户操作手册和API文档',
  '进行数据迁移和兼容性验证',
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(startYear, endYear) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return start + Math.floor(Math.random() * (end - start));
}

function generateRecord(index) {
  const prefix = randomItem(TASK_PREFIXES);
  const suffix = randomItem(TASK_SUFFIXES);
  const project = randomItem(PROJECTS);
  const status = randomItem(STATUSES);
  const priority = randomItem(PRIORITIES);
  const progress = Math.floor(Math.random() * 5) + 1;
  const startTs = randomDate(2025, 2026);
  const endTs = startTs + (Math.floor(Math.random() * 60) + 7) * 86400000;

  const formData = {};
  formData[FIELD.taskName] = `${prefix}${suffix} #${index + 1}`;
  formData[FIELD.taskDesc] = randomItem(DESCRIPTIONS);
  formData[FIELD.project] = project;
  formData[FIELD.startDate] = startTs;
  formData[FIELD.endDate] = endTs;
  formData[FIELD.status] = status;
  formData[FIELD.priority] = priority;
  formData[FIELD.progress] = progress;

  return formData;
}

// ===== 读取登录态 =====
function loadCookies() {
  const cookiePath = path.join(__dirname, 'cookies.json');
  if (!fs.existsSync(cookiePath)) {
    console.error('❌ 未找到 .cache/cookies.json，请先执行 openyida login');
    process.exit(1);
  }
  const cookieData = JSON.parse(fs.readFileSync(cookiePath, 'utf-8'));

  // cookies 是数组格式 [{name, value, domain, path}, ...]，需要拼接成字符串
  const cookiesArr = cookieData.cookies || [];
  const cookieString = cookiesArr.map(c => `${c.name}=${c.value}`).join('; ');

  // 提取 CSRF token
  const csrfCookie = cookiesArr.find(c => c.name === 'tianshu_csrf_token');
  const csrfToken = csrfCookie ? csrfCookie.value : '';

  return {
    cookie: cookieString,
    csrfToken: csrfToken,
    baseUrl: cookieData.base_url || 'https://www.aliwork.com',
  };
}

// ===== HTTP 请求 =====
function postFormData(baseUrl, cookie, csrfToken, formDataJson) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      formUuid: FORM_UUID,
      appType: APP_TYPE,
      formDataJson: JSON.stringify(formDataJson),
      _csrf_token: csrfToken,
    }).toString();

    const urlObj = new URL(`/dingtalk/web/${APP_TYPE}/v1/form/saveFormData.json`, baseUrl);
    const isHttps = urlObj.protocol === 'https:';
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie,
        'Content-Length': Buffer.byteLength(body),
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Referer': baseUrl,
        'Origin': baseUrl,
        'Accept-Encoding': 'identity',
      },
    };

    const client = isHttps ? https : http;
    const req = client.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => { chunks.push(chunk); });
      res.on('end', () => {
        const rawData = Buffer.concat(chunks).toString('utf-8');
        try {
          const json = JSON.parse(rawData);
          if (json.success) {
            resolve(json);
          } else {
            reject(new Error(json.errorMsg || json.errorCode || 'Unknown error'));
          }
        } catch (e) {
          reject(new Error(`Parse error (status ${res.statusCode}): ${rawData.substring(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ===== 并发控制 =====
async function runWithConcurrency(tasks, concurrency) {
  const results = [];
  let index = 0;
  let successCount = 0;
  let failCount = 0;

  async function worker() {
    while (index < tasks.length) {
      const currentIndex = index++;
      try {
        await tasks[currentIndex]();
        successCount++;
        if (successCount % 10 === 0 || successCount === TOTAL_COUNT) {
          process.stderr.write(`\r✅ 进度: ${successCount}/${TOTAL_COUNT} 成功, ${failCount} 失败`);
        }
      } catch (err) {
        failCount++;
        process.stderr.write(`\n❌ 第 ${currentIndex + 1} 条失败: ${err.message}\n`);
      }
    }
  }

  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);
  process.stderr.write('\n');
  return { successCount, failCount };
}

// ===== 主流程 =====
async function main() {
  console.log('🚀 开始批量插入数据...');
  console.log(`📋 表单: ${FORM_UUID}`);
  console.log(`📊 目标数量: ${TOTAL_COUNT} 条`);
  console.log(`⚡ 并发数: ${CONCURRENCY}`);
  console.log('');

  const { cookie, csrfToken, baseUrl } = loadCookies();

  if (!cookie) {
    console.error('❌ Cookie 为空，请重新登录: openyida login');
    process.exit(1);
  }

  console.log(`🔑 CSRF Token: ${csrfToken ? csrfToken.substring(0, 8) + '...' : '未找到'}`);
  console.log(`🌐 Base URL: ${baseUrl}`);

  // 先测试一条
  console.log('🔍 测试插入第 1 条数据...');
  const testRecord = generateRecord(0);
  try {
    await postFormData(baseUrl, cookie, csrfToken, testRecord);
    console.log('✅ 测试成功，开始批量插入...\n');
  } catch (err) {
    console.error(`❌ 测试失败: ${err.message}`);
    console.error('请检查登录态是否有效，可尝试: openyida login');
    process.exit(1);
  }

  // 批量插入剩余 299 条
  const tasks = [];
  for (let i = 1; i < TOTAL_COUNT; i++) {
    const record = generateRecord(i);
    tasks.push(() => postFormData(baseUrl, cookie, csrfToken, record));
  }

  const { successCount, failCount } = await runWithConcurrency(tasks, CONCURRENCY);

  console.log('\n📊 插入完成！');
  console.log(`   ✅ 成功: ${successCount + 1} 条（含测试数据）`);
  console.log(`   ❌ 失败: ${failCount} 条`);
}

main().catch((err) => {
  console.error('❌ 执行出错:', err.message);
  process.exit(1);
});
