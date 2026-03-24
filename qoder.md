# OpenYida AI 宜搭开发操作手册

> 本文件为 AI 助手（Qoder）专用操作指南。当用户需要搭建宜搭应用时，请先阅读此文件。

---

## 一、项目概述

**OpenYida** 是一个 AI + 低代码开发平台，通过 AI 编程工具自动化完成宜搭应用的创建、开发和发布。

```
用户描述需求 → AI 自动完成 → 输出访问链接
```

**核心能力**：
- AI 理解自然语言需求
- 自动创建宜搭应用和页面
- 编写自定义页面 JSX 代码（React 16）
- 编译并一键发布到线上

---

## 二、环境准备

### 1. 基础依赖

| 依赖 | 版本 | 安装命令 |
|------|------|---------|
| Node.js | ≥ 16 | — |
| Python | ≥ 3.10 | — |
| Playwright | latest | `pip install playwright && playwright install chromium` |

### 2. 安装 Skills

```bash
# Mac/Linux
bash install-skills.sh

# Windows
.\install-skills.ps1

# 国内加速
bash install-skills.sh --cn
```

### 3. 安装发布依赖

```bash
cd .claude/skills/skills/yida-publish-page/scripts && npm install
```

---

## 三、核心技能速查

| 技能 | 调用命令 | 输出 |
|------|---------|------|
| 登录 | `python3 .claude/skills/yida-login/scripts/login.py` | Cookie 保存到 .cache |
| 检查登录 | `python3 .claude/skills/yida-login/scripts/login.py --check-only` | 登录状态信息 |
| 退出登录 | `echo -n "" > .cache/cookies.json` | 清除 Cookie |
| 创建应用 | `node .claude/skills/yida-create-app/scripts/create-app.js "<名称>"` | appType |
| 创建自定义页面 | `node .claude/skills/yida-create-page/scripts/create-page.js <appType> "<页面名>"` | formUuid |
| 创建表单页面 | `node .claude/skills/yida-create-form-page/scripts/create-form-page.js create <appType> "<表单名>" <fieldsJson>` | formUuid |
| 更新表单字段 | `node .claude/skills/yida-create-form-page/scripts/create-form-page.js update <appType> <formUuid> '<changesJson>'` | — |
| 获取 Schema | `node .claude/skills/yida-get-schema/scripts/get-schema.js <appType> <formUuid>` | 字段定义 |
| 发布页面 | `node .claude/skills/yida-publish-page/scripts/publish.js <appType> <formUuid> <源文件>` | 访问链接 |

---

## 四、完整开发流程

### Step 1: 确认登录态

首次使用或 Cookie 失效时，脚本会自动弹出浏览器引导扫码登录。

```bash
# 检查登录状态（可选）
python3 .claude/skills/yida-login/scripts/login.py --check-only
```

**自动登录逻辑**：所有需要登录的脚本会按此顺序尝试：
1. 读取本地 `.cache/cookies.json`
2. 若 Cookie 有效，直接使用
3. 若无效，弹出浏览器扫码登录

### Step 2: 创建应用

```bash
node .claude/skills/yida-create-app/scripts/create-app.js "应用名称"
```

**可选参数**：
- 描述：`"应用名称" "描述文本"`
- 图标：`"应用名称" "描述" "xian-daka" "#00B853"`

**输出示例**：
```
✅ 应用创建成功！
appType: APP_XXXXX
corpId: ding_xxxxxxxx
访问地址: https://www.aliwork.com/APP_XXXXX/admin
```

### Step 3: 创建页面

**方式 A：自定义页面（用于复杂交互、游戏、数据可视化）**
```bash
node .claude/skills/yida-create-page/scripts/create-page.js APP_XXXXX "页面名称"
```

**方式 B：表单页面（用于数据收集、审批流程）**
```bash
node .claude/skills/yida-create-form-page/scripts/create-form-page.js \
  create APP_XXXXX "表单名称" fields.json
```

**fields.json 格式**：
```json
[
  { "type": "TextField", "label": "姓名", "required": true },
  { "type": "SelectField", "label": "部门", "options": ["技术部", "产品部"] },
  { "type": "NumberField", "label": "年龄" },
  { "type": "DateField", "label": "入职日期" },
  { "type": "TableField", "label": "费用明细", "children": [
    { "type": "TextField", "label": "项目" },
    { "type": "NumberField", "label": "金额" }
  ]}
]
```

### Step 4: 编写自定义页面代码

在 `pages/src/` 目录下创建 JSX 文件，如 `pages/src/my-page.js`

**标准文件结构**：
```javascript
// ============================================================
// 状态管理
// ============================================================

const _customState = {
  // 在此定义所有业务状态的初始值
  count: 0,
  loading: false,
};

/**
 * 获取状态
 * @param {string} [key] - 传入 key 返回单个值，不传返回全部状态的浅拷贝
 */
export function getCustomState(key) {
  if (key) {
    return _customState[key];
  }
  return { ..._customState };
}

/**
 * 设置状态（合并更新，自动触发重新渲染）
 * @param {Object} newState - 需要更新的状态键值对
 */
export function setCustomState(newState) {
  Object.keys(newState).forEach(function(key) {
    _customState[key] = newState[key];
  });
  this.forceUpdate();
}

/**
 * 强制重新渲染（通过更新 timestamp 触发 React 重渲染）
 */
export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}

// ============================================================
// 生命周期
// ============================================================

/**
 * 页面加载完成时调用
 * 用于：初始化数据、启动定时器、绑定事件等
 */
export function didMount() {
  // 初始化逻辑
}

/**
 * 页面卸载时调用
 * 用于：清理定时器、解绑事件、释放资源等
 */
export function didUnmount() {
  // 清理逻辑
}

// ============================================================
// 渲染
// ============================================================

/**
 * 页面渲染函数（等同于 React 类组件的 render 方法）
 * 注意：必须包含隐藏的 timestamp div 以支持 forceUpdate 机制
 */
export function renderJsx() {
  const { timestamp } = this.state;

  return (
    <div>
      {/* 必须保留：用于触发重新渲染 */}
      <div style={{ display: "none" }}>{timestamp}</div>

      {/* 页面内容写在这里 */}
    </div>
  );
}
```

### Step 5: 发布页面

```bash
node .claude/skills/yida-publish-page/scripts/publish.js \
  APP_XXXXX FORM-XXXXX pages/src/my-page.js
```

**成功输出**：
```
✅ 发布成功！
formUuid: FORM-XXXXX
访问地址: https://www.aliwork.com/APP_XXXXX/custom/FORM-XXXXX
```

---

## 五、表单字段类型速查

| 类型 | 说明 | 特殊属性 |
|------|------|---------|
| `TextField` | 单行文本 | — |
| `TextareaField` | 多行文本 | — |
| `NumberField` | 数字 | `precision`, `innerAfter`（单位） |
| `RadioField` | 单选 | `options` |
| `CheckboxField` | 多选 | `options` |
| `SelectField` | 下拉单选 | `options` |
| `MultiSelectField` | 下拉多选 | `options` |
| `DateField` | 日期 | `format: "YYYY-MM-DD"` |
| `CascadeDateField` | 级联日期（范围） | `format` |
| `EmployeeField` | 成员选择 | `multiple` |
| `DepartmentSelectField` | 部门选择 | `multiple` |
| `AddressField` | 地址 | — |
| `AttachmentField` | 附件上传 | — |
| `ImageField` | 图片上传 | — |
| `TableField` | 子表格 | `children` |
| `AssociationFormField` | 关联表单 | `associationForm` |
| `RateField` | 评分 | `count`（星级数） |
| `CountrySelectField` | 国家选择 | `multiple` |

---

## 六、宜搭 JS API 速查

### 表单数据操作（`this.utils.yida.*`）

| 方法 | 说明 | 必填参数 |
|------|------|---------|
| `saveFormData` | 新建表单实例 | `formUuid`, `appType`, `formDataJson` |
| `updateFormData` | 更新表单实例 | `formInstId`, `updateFormDataJson` |
| `deleteFormData` | 删除表单实例 | `formUuid` |
| `getFormDataById` | 根据实例 ID 查询详情 | `formInstId` |
| `searchFormDatas` | 按条件搜索表单实例 | `formUuid`, `searchFieldJson` |

**示例 — 新建表单数据**：
```javascript
this.utils.yida.saveFormData({
  formUuid: 'FORM-XXX',
  appType: window.pageConfig.appType,
  formDataJson: JSON.stringify({
    textField_xxx: '单行文本',
    textareaField_xxx: '多行文本',
  }),
}).then(function(res) {
  console.log('新建成功，实例ID:', res.result);
}).catch(function(err) {
  this.utils.toast({ title: err.message, type: 'error' });
}.bind(this));
```

### 工具函数（`this.utils.*`）

| 方法 | 用途 | 示例 |
|------|------|------|
| `toast({ title, type })` | 轻提示 | `this.utils.toast({ title: '成功', type: 'success' })` |
| `dialog({ title, content })` | 对话框 | `this.utils.dialog({ title: '确认', content: '是否删除？' })` |
| `isMobile()` | 判断移动端 | `const isMobile = this.utils.isMobile()` |
| `getLoginUserId()` | 获取用户 ID | `const userId = this.utils.getLoginUserId()` |
| `openPage(url)` | 打开页面 | `this.utils.openPage('https://...')` |
| `formatter.date(value, format)` | 格式化日期 | — |

---

## 七、代码编写规范

### 1. 输入框必须用非受控组件

```javascript
// ❌ 错误：受控组件，每次输入都触发重渲染导致无法输入
<input value={userAnswer} onChange={function(e) {
  self.setCustomState({ userAnswer: e.target.value });
}} />

// ✅ 正确：非受控组件，仅静默更新状态，不触发重渲染
<input id="my-input" defaultValue="" onChange={function(e) {
  _customState.userAnswer = e.target.value;
}} />

// 需要清空时通过 DOM 操作
var inputEl = document.getElementById("my-input");
if (inputEl) { inputEl.value = ""; }
```

### 2. 日期字段必须是时间戳

```javascript
// ❌ 错误：字符串格式
dateField_xxx: '2024-01-15'

// ✅ 正确：时间戳格式（毫秒）
dateField_xxx: new Date().getTime()
```

### 3. pageSize 不得超过 100

```javascript
// 搜索表单数据
this.utils.yida.searchFormDatas({
  formUuid: 'FORM-XXX',
  pageSize: 10,  // 最大 100，推荐 10~100
  currentPage: 1
});
```

### 4. 定时器需在 didUnmount 清理

```javascript
export function didMount() {
  _customState.timer = setInterval(() => {
    // 定时逻辑
  }, 1000);
}

export function didUnmount() {
  if (_customState.timer) {
    clearInterval(_customState.timer);
  }
}
```

### 5. this 指向问题

在 renderJsx 内定义的事件处理函数中，this 不指向页面实例：

```javascript
// 方案一（推荐）：使用箭头函数
export function renderJsx() {
  const handleClick = () => {
    this.setCustomState({ clicked: true });
    this.utils.toast({ title: '点击成功', type: 'success' });
  };

  return <button onClick={handleClick}>点击</button>;
}

// 方案二：保存 self 引用
export function renderJsx() {
  const self = this;

  function handleClick() {
    self.setCustomState({ clicked: true });
  }

  return <button onClick={handleClick}>点击</button>;
}
```

### 6. 移动端适配

```javascript
const isMobile = this.utils.isMobile();

var styles = {
  container: {
    padding: isMobile ? '12px' : '16px',
    minHeight: '100vh'
  },
  card: {
    padding: isMobile ? '12px' : '16px',
    marginBottom: isMobile ? '8px' : '12px'
  }
};
```

### 7. 清除默认样式

```javascript
var styles = {
  container: {
    padding: '0 16px',
    borderRadius: '0 !important',  // 清除默认圆角
    minHeight: '100vh'
  }
};
```

---

## 八、宜搭 URL 规则

| 页面类型 | URL 格式 |
|---------|---------|
| 应用首页 | `{base_url}/{appType}/workbench` |
| 表单提交页 | `{base_url}/{appType}/submission/{formUuid}` |
| 自定义页面 | `{base_url}/{appType}/custom/{formUuid}` |
| 自定义页面（隐藏导航） | `{base_url}/{appType}/custom/{formUuid}?isRenderNav=false` |
| 表单详情页 | `{base_url}/{appType}/formDetail/{formUuid}?formInstId={id}` |

> 所有地址拼接 `&corpid={corpId}` 可自动切换到对应组织。

---

## 九、iframe 嵌入表单 URL

### 嵌入表单提交页
```
{base_url}/{appType}/submission/{formUuid}
```

### 嵌入数据管理列表页（必须使用 workbench）
```
{base_url}/{appType}/workbench/{formUuid}?iframe=true
```

### 嵌入指定多视图
```
{base_url}/{appType}/workbench/{formUuid}?viewUuid={viewUuid}&iframe=true
```

---

## 十、故障排除

### Q1: 提示登录失效

```bash
# 清除 Cookie 重新登录
echo -n "" > .cache/cookies.json
# 然后重新执行需要登录的操作
```

### Q2: csrf_token 过期

脚本会自动刷新，无需手动处理。自动处理逻辑：
- 检测响应中 `errorCode: "TIANSHU_000030"`
- 自动从 Cookie 重新提取新的 csrf_token
- 重试失败的请求

### Q3: corpId 不一致

确认 prd 文档中的 corpId 与当前登录组织是否一致：
- **一致**：继续执行
- **不一致**：询问用户是否切换组织或新建应用

### Q4: 编译报错

检查 JSX 代码是否符合 React 16 规范：
- 使用 `export function` 导出
- 必须有 `renderJsx` 函数（入口函数）
- 禁止使用 Hooks（useState、useEffect 等）
- 状态管理使用 `_customState` + `setCustomState`

---

## 十一、文件存储规范

| 信息类型 | 存储位置 |
|---------|---------|
| 业务需求 | `prd/<项目名>.md` |
| 应用配置 | `prd/<项目名>.md` 中的应用配置表格 |
| Schema ID | `.cache/<项目名>-schema.json` |
| 登录态 | `.cache/cookies.json` |
| 全局配置 | `config.json` |
| 页面源码 | `pages/src/<项目名>.js` |
| 编译产物 | `pages/dist/<项目名>.js` |

---

## 十二、PRD 文档结构

```markdown
# 项目名称

## 功能需求
- 功能点1
- 功能点2

## UI 设计
- 色彩规范
- 布局规范

## 应用配置（自动生成）
| 配置项 | 值 |
| --- | --- |
| appType | APP_XXX |
| corpId | ding_xxx |
| baseUrl | https://www.aliwork.com |
```
