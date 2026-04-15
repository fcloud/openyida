---
name: yida-custom-page
description: 宜搭自定义页面 JSX 开发规范。React 16 类组件模式，宜搭 JS API 调用，状态管理与编码约束。不适用于：原生表单页面开发（无需 JSX），或发布页面（编写完成后需使用 yida-publish-page 发布）。
---

# 自定义页面开发

## 核心规则

### 致命规则（FATAL）

违反会导致页面崩溃或运行时报错：

1. **React 16 类组件**：禁止使用 Hooks（`useState`、`useEffect`），必须使用类组件模式
2. **export function 定义方法**：所有需要 `this` 的方法必须用 `export function` 定义，不得用箭头函数或函数表达式
3. **事件绑定箭头函数包裹**：`onClick={(e) => { this.handleClick(e) }}`，严禁 `onClick={this.handleClick}`
4. **.map()/.filter() 回调用箭头函数**：`.map((item) => ...)`，禁止 `.map(function(item) {...})`，否则回调内 `this` 丢失
5. **输入框非受控模式**：`<input>` 用 `defaultValue` + `onChange` 写入 `_customState`，禁止 `value` 受控模式
6. **禁止 import/require**：第三方库通过 `this.utils.loadScript` 加载 CDN 脚本
7. **字段 ID 必须通过 get-schema 获取**：执行 `openyida get-schema --appType <appType> --formUuid <formUuid>` 获取真实 fieldId，文件顶部定义 `FIELDS` 常量映射字段别名，禁止猜测或手写
8. **所有 API 调用必须 .catch()**：异常通过 `this.utils.toast({ title: message, type: 'error' })` 提示用户

### 重要规则（IMPORTANT）

影响代码质量和用户体验：

1. **代码生成前确认功能摘要**：详见 [编码指南 编注 0](references/coding-guide.md)
2. **pageSize ≤ 100**：分页接口 `searchFormDatas` 等的 `pageSize` 最大 100
3. **didUnmount 清理定时器**：在 `didUnmount` 中清理所有 `setInterval`/`setTimeout`，防止内存泄漏
4. **样式内联**：所有样式通过 JS 对象 + `style` 属性，渐变用 `background` 不用 `backgroundColor`
5. **DateField 时间戳格式**：日期字段值必须是时间戳（毫秒），不能是字符串
6. **forceUpdate 后延迟操作 DOM**：`forceUpdate()` 后 DOM 不会立即更新，需 `setTimeout` 延迟访问新 DOM 元素
7. **多端适配**：使用 `this.utils.isMobile()` 判断设备类型，适配 PC 和移动端
8. **输入法组合输入处理**：使用 `_isComposing` 标记配合 `compositionstart`/`compositionend` 事件，避免输入过程中触发提交
9. **iframe 嵌入表单 URL**：数据列表用 `workbench/{formUuid}?iframe=true`，禁止用 `formDetail`
10. **Tabs 显隐控制**：下拉值变更后自动回退到第一个可见 Tab，内容区用 `display: none` 保留 DOM

> 每条规则的代码示例、反模式和常见错误见 [编码指南](references/coding-guide.md)（编写代码前强制必读）。

## 适用场景

**正向触发**：
- 开发自定义展示页面（"自定义页面"、"JSX 页面"、"自定义组件"）
- 需要调用 `this.utils.yida.*` 读写表单数据
- 复杂交互逻辑（状态管理、事件处理、动态渲染）

**不适用（应使用其他技能）**：

| 场景 | 应使用技能 |
|------|-----------|
| 原生表单页面开发 | `yida-create-form-page` |
| 发布已编写的页面 | `yida-publish-page` |
| 批量表格录入 | `yida-table-form` |
| PPT 幻灯片 | `yida-ppt-slider` |

## 异常处理

| 异常场景 | 处理方式 |
|---------|----------|
| 使用了 React Hooks | 改为类组件模式（React 16 不支持 Hooks） |
| 字段 ID 不确定 | 执行 `openyida get-schema` 获取真实 fieldId |
| `forceUpdate is not a function` | 检查 `this` 绑定，确认方法用 `export function` 定义 |
| API 调用无响应 | 确认 `.catch()` 错误处理，检查登录态 |
| 发布后页面空白 | 检查 `renderJsx` 是否正确导出，查看浏览器控制台 |

## 快速开始

以创建「员工信息查询页」为例，完整流程如下：

```bash
# Step 1：获取表单 Schema，确认字段 ID
openyida get-schema APP_XXX FORM-EMPLOYEE > .cache/employee-schema.json 2>&1

# Step 2：创建自定义页面
openyida create-page APP_XXX "员工信息查询"
# 输出：formUuid = FORM-QUERY001

# Step 3：编写页面代码
# 基于官方模板编写，先获取模板：openyida sample yida-custom-page custom-page-template
# 在 project/pages/src/employee-query.js 中编写

# Step 4：发布页面
openyida publish project/pages/src/employee-query.js APP_XXX FORM-QUERY001
```

预期输出：

```json
{
  "success": true,
  "pageUrl": "https://www.aliwork.com/APP_XXX/custom/FORM-QUERY001"
}
```

**关键说明**：
- **Step 1** 的 get-schema 输出包含所有字段的 fieldId，在代码中必须使用 `FIELDS` 常量映射这些 ID
  - get-schema 输出的 JSON 中，每个字段的 `fieldId`（如 `textField_k8j2n3m4`）即是代码中 `FIELDS` 常量应映射的值
- **Step 3** 的页面代码必须遵循 [编码指南](references/coding-guide.md) 的全部 19 条编码注意事项
- 完整代码模板通过 `openyida sample yida-custom-page custom-page-template` 获取

## 官方示例模板

代码编写前，执行以下命令获取示例模板，再用 `read_file` 完整读取：

```bash
openyida sample yida-custom-page custom-page-template   # 完整页面模板（didMount/renderJsx/状态管理/API调用）
openyida sample yida-custom-page design-tokens          # 设计 token 参考（颜色/间距/字体规范）
```

## API 速查

### 表单数据（`this.utils.yida.<方法>(params)`）

| 方法 | 说明 | 必填参数 |
|------|------|----------|
| `saveFormData` | 新建实例 | `formUuid`, `appType`, `formDataJson` |
| `updateFormData` | 更新实例 | `formInstId`, `updateFormDataJson` |
| `deleteFormData` | 删除实例 | `formUuid` |
| `getFormDataById` | 查询详情 | `formInstId` |
| `searchFormDatas` | 搜索列表 | `formUuid` |
| `searchFormDataIds` | 搜索 ID 列表 | `formUuid` |

### 流程操作（`this.utils.yida.<方法>(params)`）

| 方法 | 说明 | 必填参数 |
|------|------|----------|
| `startProcessInstance` | 发起流程 | `formUuid`, `processCode`, `formDataJson` |
| `getProcessInstanceById` | 查询流程详情 | `processInstanceId` |
| `getProcessInstances` | 搜索流程列表 | — |

### 工具函数（`this.utils.<方法>()`）

| 方法 | 用途 |
|------|------|
| `toast` | 轻提示 |
| `dialog` | 对话框 |
| `formatter` | 日期/金额格式化 |
| `getLoginUserId` / `getLoginUserName` | 获取当前用户 |
| `isMobile` | 判断移动端 |
| `openPage` | 打开新页面 |
| `router.push` | 路由跳转 |
| `loadScript` | 动态加载脚本 |

> **上表为常用 API 速查，完整 API 列表见 [yida-api.md](../../references/yida-api.md)。使用前必须阅读完整参数文档，禁止猜测参数。**

### 大模型 AI 接口

以下接口用于调用大模型 AI 文本生成能力：

| 方法 | 说明 | 调用方式 |
| --- | --- | --- |
| `txtFromAI` | AI 文本生成 | `POST /query/intelligent/txtFromAI.json` |

**主要参数**：`_csrf_token`（CSRF 令牌）、`prompt`（提示词）、`skill`（技能类型，如 `ToText`）、`maxTokens`（最大返回 token 数）

> **使用前必须阅读 [model-api.md](../../references/model-api.md) 查询详细的参数，禁止猜测参数**。

## 参考文档

| 文档 | 覆盖范围 | 何时阅读 |
|------|---------|---------|
| **本技能文档** | | |
| [编码指南](references/coding-guide.md) | 文件结构模板、状态管理、生命周期、19 条编码规范 | 编写任何页面代码前必读 |
| [设计规范](references/design-system.md) | 色彩/圆角/字体/间距系统、7 类组件样式模板、8 条反模式 | 实现 UI 样式时必读 |
| [素材资源](references/assets-guide.md) | 图片/音乐/Icon 素材库、CDN 安全规范 | 需要引入图片、图标、音效时阅读 |
| **全局共享文档** | | |
| [宜搭 API](../../references/yida-api.md) | 表单/流程/工具 API 完整参数文档 | 调用 `this.utils.yida.*` 前必读 |
| [大模型 API](../../references/model-api.md) | AI 文本生成接口参数 | 调用 `txtFromAI` 前必读 |

## 注意事项

- 本技能不读写 memory，所有页面状态（`_customState`）仅在当前页面会话内有效，刷新页面后重置，不跨会话持久化
