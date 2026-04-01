---
name: yida-login
description: 宜搭登录态管理。支持标准环境扫码登录和悟空环境 CDP 提取 Cookie，Cookie 持久化到 .cache/cookies.json。
---

# 宜搭登录态管理

## 严格禁止 (NEVER DO)

- 不要在代码中硬编码 Cookie 或凭证，Cookie 必须通过 `openyida login` 命令获取并缓存到 `.cache/cookies.json`
- 不要在悟空环境直接运行 `openyida login`（无 `--wukong` 参数），必须先用悟空内置浏览器打开登录页完成扫码
- 不要在 Cookie 失效时手动修改 `.cache/cookies.json`，必须重新执行登录流程

## 严格要求 (MUST DO)

- 执行任何宜搭操作前，必须先运行 `openyida env` 确认环境和登录态
- 悟空环境必须按步骤：① 读取 `config.json` 获取 `loginUrl` → ② 用悟空浏览器打开 → ③ 扫码后执行 `openyida login --wukong`
- Cookie 失效时，重新登录后必须验证新 Cookie 可用（运行任意查询命令确认）

## 适用场景

| 用户意图 | 触发条件 |
|---------|---------|
| 首次使用或 Cookie 失效 | 其他命令报 401/未登录错误时自动触发 |
| 切换账号/组织 | 先 `openyida logout` 再重新登录 |
| 悟空环境登录 | 必须手动按步骤操作 |

---


> 通常无需手动调用，其他命令在 Cookie 失效时会自动触发登录。

## 命令

### 标准环境

```bash
openyida login
```

### 悟空环境

> ⚠️ 悟空环境必须按以下步骤操作，不能直接运行脚本。

1. 读取 `config.json` 获取 `loginUrl`
2. 用悟空内置浏览器打开登录页面，等待用户完成扫码
3. 扫码完成后执行：

```bash
openyida login --wukong
```

## 输出

```json
{"csrf_token":"b2a5d192-xxx","corp_id":"dingxxx","user_id":"1955225xxx","base_url":"https://abcd.aliwork.com"}
```

> `base_url` 取自登录后浏览器实际跳转到的域名，可能与 `config.json` 中的 `loginUrl` 不同。后续所有 API 请求使用此值。

## 错误处理

各命令通过响应体 `errorCode` 自动处理登录态异常：

| errorCode | 含义 | 标准环境 | 悟空环境 |
|-----------|------|---------|----------|
| `TIANSHU_000030` | CSRF Token 过期 | 自动无头刷新 | `openyida login --wukong` |
| `307` | Cookie 失效 | 自动重新登录 | `openyida login --wukong` |
