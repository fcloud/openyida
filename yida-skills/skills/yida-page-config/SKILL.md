---
name: yida-page-config
description: 页面公开访问和组织内分享配置。支持 URL 验证、配置保存、导航显示控制。
---

# 页面配置

## 严格禁止 (NEVER DO)

- 不要为使用宜搭表单数据的自定义页面配置公开访问（`/o/xxx`），匿名用户无法调用需要登录态的表单接口
- 不要跳过 `verify-short-url` 验证直接保存配置，URL 格式错误会导致配置失败
- 不要编造 `appType` 或 `formUuid`，必须从命令返回或 `config.json` 中提取

## 严格要求 (MUST DO)

- 配置公开访问前必须确认页面类型：纯展示页面才可配置 `/o/` 公开访问
- 必须先运行 `verify-short-url` 验证 URL 有效性，再执行 `save-share-config`
- 配置完成后必须访问生成的 URL 验证页面可正常访问

## 适用场景

| 用户意图 | 触发条件 |
|---------|---------|
| 页面公开访问 | "公开访问"、"分享链接"、"外部访问" |
| 组织内分享 | "组织内分享"、"内部分享" |
| 导航栏显示控制 | "隐藏导航"、"全屏展示" |

---


## ⚠️ 关键限制

**使用宜搭表单数据的自定义页面不支持公开访问（`/o/xxx`）**，因为匿名用户无法调用需要登录态的表单接口。

| 页面类型 | 公开访问 `/o/` | 组织内分享 `/s/` |
|---------|:-:|:-:|
| 纯展示页面（静态/外部 API） | ✅ | ✅ |
| 使用宜搭表单数据 | ❌ | ✅ |

## 命令

### 验证 URL

```bash
openyida verify-short-url <appType> <formUuid> <url>
```

### 保存配置

```bash
openyida save-share-config <appType> <formUuid> <url> <isOpen> [openAuth]
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `url` | 是 | `/o/xxx` 或 `/s/xxx`，关闭时传 `""` |
| `isOpen` | 是 | `y` 开启 / `n` 关闭 |
| `openAuth` | 否 | `y` 需授权 / `n` 不需要（默认） |

### 查询配置

```bash
openyida get-page-config <appType> <formUuid>
```

### 隐藏顶部导航

```bash
openyida update-form-config <appType> <formUuid> false "<页面标题>"
```

## URL 格式

- 公开访问：`/o/xxx`，组织内分享：`/s/xxx`
- 仅支持 `a-z A-Z 0-9 _ -`，路径全局唯一
