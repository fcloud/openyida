---
name: yida-connector
description: 宜搭 HTTP 连接器管理。创建、配置、测试连接器，打通钉钉/自建系统/第三方 API。支持 6 种鉴权方式。
---

# HTTP 连接器管理

## 严格禁止 (NEVER DO)

- 不要在代码中硬编码 API Key、密码等凭证，通过连接器鉴权配置管理
- 不要编造 connector-id 或 action-id，必须从命令返回中提取
- 不要删除连接器前确认是否有表单/页面正在使用

## 严格要求 (MUST DO)

- 优先使用 `smart-create` 从 curl 命令或接口文档智能创建
- 创建连接器后，将 connector-id 记录到 `.cache/<项目名>-schema.json`

## 适用场景

用户需要"接入外部接口"、"调用第三方 API"、"连接钉钉开放平台"、"HTTP 连接器"时使用。

## 危险操作确认

删除连接器为不可逆操作，执行前必须确认无表单/页面依赖此连接器。

---


## 鉴权方式

| 界面显示 | 内部类型 | 适用场景 |
|---------|---------|----------|
| 无身份验证 | `NONE` | 公开 API |
| 基本身份验证 | `BasicAuth` | 用户名密码 |
| API 密钥 | `ApiKeyAuth` | Header/Query 传密钥 |
| 钉钉开放平台验证 | `DingAuth` | 钉钉 OpenAPI |
| 阿里云 API 网关 | `AliyunApiGateway` | 阿里云网关 |
| 钉钉零信任网关 | `DingTrustGW` | 零信任网关 |

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

- [宜搭 HTTP 连接器官方文档](https://docs.aliwork.com/docs/yida_support/_10/zbq17y)
- [钉钉开放平台 API](https://open.dingtalk.com/document/isvapp-server/create-an-app)
