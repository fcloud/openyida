---
name: yida-logout
description: 退出宜搭登录，清空本地 Cookie 缓存。
---

# 退出登录

## 严格禁止 (NEVER DO)

- 不要在退出登录后立即执行需要登录态的命令，必须先重新登录
- 不要手动删除 `.cache/cookies.json` 文件，必须通过 `openyida logout` 命令清空

## 严格要求 (MUST DO)

- 退出后如需继续使用，必须重新执行 `openyida login` 获取新的登录态

## 适用场景

| 用户意图 | 触发条件 |
|---------|---------|
| 切换账号 | "切换账号"、"换个账号登录" |
| 切换组织 | "切换组织"、Cookie 失效无法自动刷新 |

---


## 命令

```bash
openyida logout
```

清空 `.cache/cookies.json` 文件内容，下次调用任意命令时自动触发重新扫码登录。

**适用场景**：切换账号、切换组织、Cookie 失效无法自动刷新。
