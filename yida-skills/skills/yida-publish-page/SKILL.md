---
name: yida-publish-page
description: 将 JSX 源码编译发布到宜搭自定义页面。Babel 转 ES5 + UglifyJS 压缩 + Schema 构建 + saveFormSchema 接口部署。
---

# 发布自定义页面

## 严格禁止 (NEVER DO)

- 不要在未读取 `yida-custom-page` SKILL.md 的情况下编写 JSX 源码
- 不要使用 React Hooks（useState、useEffect 等），宜搭自定义页面不支持
- 不要编造 appType 和 formUuid，必须从已有记录或命令返回中获取

## 严格要求 (MUST DO)

- 发布前确认 JSX 源码已通过 `yida-custom-page` 规范编写
- 发布前确认 `openyida env` 检测通过，登录态有效
- corpId 不匹配时，必须询问用户是否切换组织，不得强行发布

## 适用场景

编写完自定义页面 JSX 代码后，执行此技能将代码编译发布到宜搭平台。
通常在 `yida-custom-page`（编写代码）之后执行。

---


## 命令

```bash
openyida publish <源文件路径> <appType> <formUuid>
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `源文件路径` | 是 | JSX 源码路径，如 `pages/src/my-page.js` |
| `appType` | 是 | 应用 ID |
| `formUuid` | 是 | 自定义页面 ID |

## 输出

```json
{"success":true,"formUuid":"FORM-XXX","version":0}
```

## 自动注入的 CSS

发布时自动注入以下样式，覆盖宜搭平台默认 padding/margin：

```css
body { background-color: #f2f3f5; }
.vc-page-yida-page { --yida-form-content-padding: 0; --yida-form-content-margin: 0; --yida-layout-padding: 0; }
.vc-deep-container-entry.vc-rootcontent { padding: 0 !important; margin-top: 0 !important; margin-right: 0 !important; margin-bottom: 0 !important; margin-left: 0 !important; }
```

> 使用展开属性而非 `margin: 0` 简写，因为宜搭平台的展开属性 `!important` 优先级更高。
> 如仍有残留样式，可在 `didMount` 中动态注入 `<style>` 标签覆盖。

## 注意事项

- 发布目标地址由 `.cache/cookies.json` 中的 `base_url` 决定
- 碰到组织 corpId 不匹配时，询问用户是否创建新应用发布
- **编写源码前必须先读取 `yida-custom-page` 的 SKILL.md**，禁止使用 React Hooks
