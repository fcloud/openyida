---
name: yida-connector
description: 宜搭 HTTP 连接器管理。创建、配置、测试连接器，打通钉钉/自建系统/第三方 API。支持 6 种鉴权方式。不适用于：管理表单数据（应使用 yida-data-management），或配置集成自动化逻辑流（应使用 yida-integration）。
---

# HTTP 连接器管理

## 核心规则

### 致命规则（FATAL）

违反会导致功能失败或运行时报错：

1. **不要编造 connector-id 或 action-id** — 必须从命令返回中提取
2. **不要在代码中硬编码凭证** — API Key、密码等通过连接器鉴权配置管理
3. **删除连接器前必须确认无依赖** — 确认无表单/页面正在使用

### 重要规则（IMPORTANT）

影响代码质量和用户体验：

1. **优先使用 `smart-create`** — 从 curl 命令或接口文档智能创建
2. **创建后记录 connector-id** — 写入 `.cache/<项目名>-schema.json`
3. **本技能不读写 memory** — 连接器配置通过 CLI 命令写入宜搭平台，不依赖跨会话的 memory 状态

## 适用场景

用户需要"接入外部接口"、"调用第三方 API"、"连接钉钉开放平台"、"HTTP 连接器"时使用。

## 触发条件

**正向触发**：
- "接入外部接口"、"调用第三方 API"
- "连接钉钉开放平台"、"HTTP 连接器"
- "打通自建系统"、"API 集成"
- "配置鉴权"、"创建连接器"

**不适用场景（不要触发）**：
- 管理宜搭表单数据（增删改查）→ `yida-data-management`
- 配置集成自动化逻辑流 → `yida-integration`
- 在自定义页面直接写 fetch 调用 → `yida-custom-page`

## 危险操作确认

删除连接器为不可逆操作，执行前必须确认无表单/页面依赖此连接器。

## 异常处理

| 异常场景 | 处理方式 |
|---------|----------|
| 连接器不存在（connector-id 无效） | 重新执行 `openyida connector list` 获取有效 ID，不得编造 |
| 鉴权失败（401/403） | 检查鉴权方式和凭证配置，重新创建连接器或更新鉴权账号 |
| API 调用超时 | 检查目标域名是否可达，确认网络连通性后重试 |
| action-id 不存在 | 执行 `openyida connector list-actions <connector-id>` 重新获取有效 action-id |
| 连接器被依赖无法删除 | 先在宜搭平台确认哪些表单/页面依赖此连接器，解除依赖后再删除 |
| 智能创建解析失败 | 改用 `openyida connector gen-template` 生成模板，手动填写后再创建 |

## Agent 错误处理策略

当 Agent 执行本技能遇到错误时，必须遵循以下默认行为：

| 错误类型 | 默认处理策略 |
|---------|-------------|
| 命令执行失败 | 停止执行，向用户展示错误信息，询问是否重试或调整参数 |
| 参数缺失（connector-id/action-id 等） | 执行 `connector list` 或 `list-actions` 获取有效 ID，不得编造 |
| 权限不足 / 登录态失效 | 停止执行，提示用户执行 `openyida auth status` 检查登录态 |
| 鉴权配置错误 | 停止执行，引导用户检查鉴权方式和凭证配置 |
| 智能创建解析失败 | 降级为模板创建方式，引导用户使用 `gen-template` |
| 网络超时 | 重试 1 次，仍失败则停止并提示用户检查网络 |
| 删除操作前 | 必须先确认无依赖，展示确认提示后再执行 |
| 未知错误 | 停止执行，完整展示错误信息，建议用户反馈问题 |

---


## 鉴权方式

| 界面显示 | 内部类型 | 适用场景 | `--auth` 参数值 |
|---------|---------|----------|-------------|
| 无身份验证 | `NONE` | 公开 API | 不需传 `--auth` |
| 基本身份验证 | `BasicAuth` | 用户名密码 | `--auth "基本身份验证"` |
| API 密钥 | `ApiKeyAuth` | Header/Query 传密钥 | `--auth "API 密钥"` |
| 钉钉开放平台验证 | `DingAuth` | 钉钉 OpenAPI | `--auth "钉钉开放平台验证"` |
| 阿里云 API 网关 | `AliyunApiGateway` | 阿里云网关 | `--auth "阿里云 API 网关"` |
| 钉钉零信任网关 | `DingTrustGW` | 零信任网关 | `--auth "钉钉零信任网关"` |

> **注意**：`--auth` 参数必须使用上表「界面显示」列的中文名称（用双引号包裹），不要使用内部类型名。

## 命令

### 连接器管理

```bash
# 列出所有连接器
openyida connector list

# 创建连接器
openyida connector create "<名称>" "<域名>" [--auth "<鉴权方式>" --username/--password/--api-key/--app-key/--app-secret]

# 获取详情
openyida connector detail <connector-id>

# 删除连接器
openyida connector delete <connector-id>
```

### 执行动作管理

```bash
# 列出执行动作
openyida connector list-actions <connector-id>

# 添加执行动作（智能匹配已有连接器）
openyida connector add-action --operations <action-file> --host <域名>
# action-file 文件格式见 [connector-action-format.md](references/connector-action-format.md)

# 删除执行动作
openyida connector delete-action <connector-id> <action-id>

# 测试连接器
openyida connector test --connector-id <id> --action <action-file>
```

### 鉴权账号管理

```bash
openyida connector list-connections <connector-id>
openyida connector create-connection <connector-id> "<账号名>" [鉴权参数]
```

### 智能创建（推荐）

```bash
# 从 curl 命令创建
openyida connector smart-create --curl "curl 'https://api.example.com/v1/data' -H 'Authorization: Bearer xxx'" --name "<连接器名>"

# 解析接口文档
openyida connector parse-api --doc ./api-doc.md

# 生成接口文档模板
openyida connector gen-template
```

## 创建示例

```bash
# 无鉴权
openyida connector create "测试API" "api.example.com"

# 基本身份验证
openyida connector create "内部系统" "internal.company.com" --auth "基本身份验证" --username admin --password 123456

# 钉钉开放平台
openyida connector create "钉钉API" "api.dingtalk.com" --auth "钉钉开放平台验证" --app-key "xxx" --app-secret "xxx"
```

## 执行动作配置

详见 [连接器执行动作配置文件格式](references/connector-action-format.md)。

## 模板

- [接口文档模板](templates/api-document-template.md)：帮助用户填写接口信息以创建连接器，可通过 `openyida connector gen-template` 命令生成

## 参考文档

| 文档 | 内容 | 阅读时机 |
|------|------|----------|
| [connector-action-format.md](references/connector-action-format.md) | 连接器执行动作配置文件格式 | 添加/配置执行动作时必读 |
| [api-document-template.md](templates/api-document-template.md) | 接口文档模板 | 帮助用户填写接口信息时参考 |
| [宜搭 HTTP 连接器官方文档](https://docs.aliwork.com/docs/yida_support/_10/zbq17y) | 官方文档 | 了解连接器完整能力时参考 |
| [钉钉开放平台 API](https://open.dingtalk.com/document/isvapp-server/create-an-app) | 钉钉 OpenAPI 文档 | 接入钉钉开放平台时参考 |
