# 施工管理数字化应用 - 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 创建包含智慧工地、节点验收、工期预警三大模块的施工管理数字化应用

**Architecture:** 单体应用包含4个表单（项目信息/节点验收/打卡记录/工期节点计划）和3个自定义页面

**Tech Stack:** 宜搭低代码平台 + React 16 JSX

---

## 开发流程

```
创建应用 → 创建4个表单 → 创建3个自定义页面 → 编写页面代码 → 发布部署
```

---

## Task 1: 创建宜搭应用

**Step 1: 创建应用**

Run: `node .claude/skills/skills/yida-create-app/scripts/create-app.js "施工管理数字化"`

**Step 2: 记录 appType**

将返回的 appType 记录到 `prd/construction-digital.md` 和 `.cache/construction-digital-schema.json`

---

## Task 2: 创建项目信息表

**Step 1: 创建表单**

Run: `node .claude/skills/skills/yida-create-form-page/scripts/create-form-page.js create <appType> "项目信息" '[...]'`

字段定义:
```json
[
  {"type": "TextField", "label": "项目名称", "required": true},
  {"type": "AddressField", "label": "项目地址", "required": true},
  {"type": "EmployeeField", "label": "项目负责人", "required": true},
  {"type": "EmployeeField", "label": "分公司总经理", "required": true},
  {"type": "DateField", "label": "计划开始日期", "required": true},
  {"type": "NumberField", "label": "计划工期（天）", "required": true}
]
```

**Step 2: 记录 formUuid**

将返回的 formUuid 写入 `.cache/construction-digital-schema.json`

---

## Task 3: 创建节点验收表

**Step 1: 创建表单**

Run: `node .claude/skills/skills/yida-create-form-page/scripts/create-form-page.js create <appType> "节点验收" '[...]'`

字段定义:
```json
[
  {"type": "AssociationFormField", "label": "项目名称", "required": true},
  {"type": "RadioField", "label": "节点类型", "required": true, "options": ["开工", "交底", "隐蔽", "竣工"]},
  {"type": "EmployeeField", "label": "业主签字", "required": true},
  {"type": "EmployeeField", "label": "监理签字", "required": true},
  {"type": "RadioField", "label": "系统确认", "required": true, "options": ["待确认", "已确认"]},
  {"type": "DateField", "label": "验收日期", "required": true},
  {"type": "TextareaField", "label": "备注", "required": false}
]
```

**Step 2: 记录 formUuid**

---

## Task 4: 创建打卡记录表

**Step 1: 创建表单**

Run: `node .claude/skills/skills/yida-create-form-page/scripts/create-form-page.js create <appType> "打卡记录" '[...]'`

字段定义:
```json
[
  {"type": "AssociationFormField", "label": "项目名称", "required": true},
  {"type": "EmployeeField", "label": "打卡人", "required": true},
  {"type": "DateField", "label": "打卡时间", "required": true},
  {"type": "ImageField", "label": "施工照片", "required": true},
  {"type": "AttachmentField", "label": "施工视频", "required": false},
  {"type": "MultiSelectField", "label": "违规类型", "required": false, "options": ["未戴安全帽", "工艺不达标", "其他"]},
  {"type": "TextareaField", "label": "备注", "required": false}
]
```

**Step 2: 记录 formUuid**

---

## Task 5: 创建工期节点计划表

**Step 1: 创建表单**

Run: `node .claude/skills/skills/yida-create-form-page/scripts/create-form-page.js create <appType> "工期节点计划" '[...]'`

字段定义:
```json
[
  {"type": "AssociationFormField", "label": "项目名称", "required": true},
  {"type": "RadioField", "label": "节点类型", "required": true, "options": ["开工", "交底", "隐蔽", "竣工"]},
  {"type": "DateField", "label": "计划完成日期", "required": true},
  {"type": "DateField", "label": "实际完成日期", "required": false},
  {"type": "RadioField", "label": "是否延期", "required": true, "options": ["是", "否"]},
  {"type": "RadioField", "label": "预警状态", "required": true, "options": ["未预警", "已预警", "已处理"]}
]
```

**Step 2: 记录 formUuid**

---

## Task 6: 创建自定义页面 - 智慧工地

**Step 1: 创建页面**

Run: `node .claude/skills/skills/yida-create-page/scripts/create-page.js <appType> "智慧工地"`

**Step 2: 记录 pageId (formUuid)**

---

## Task 7: 创建自定义页面 - 节点验收

**Step 1: 创建页面**

Run: `node .claude/skills/skills/yida-create-page/scripts/create-page.js <appType> "节点验收"`

**Step 2: 记录 pageId**

---

## Task 8: 创建自定义页面 - 工期预警

**Step 1: 创建页面**

Run: `node .claude/skills/skills/yida-create-page/scripts/create-page.js <appType> "工期预警"`

**Step 2: 记录 pageId**

---

## Task 9: 编写智慧工地页面代码

**文件:** `pages/src/construction-smart-site.js`

功能:
- 打卡入口按钮
- 打卡表单（调用打卡记录表）
- 今日打卡列表展示
- 违规检测统计卡片

---

## Task 10: 编写节点验收页面代码

**文件:** `pages/src/construction-node-acceptance.js`

功能:
- 项目下拉选择
- 节点状态看板（开工/交底/隐蔽/竣工）
- 待验收列表 + 已验收列表
- 验收确认表单

---

## Task 11: 编写工期预警页面代码

**文件:** `pages/src/construction-warn.js`

功能:
- 延期项目列表
- 预警状态筛选
- 预警推送记录
- 手动触发预警按钮

---

## Task 12: 发布智慧工地页面

**Step 1: 编译 JSX**

使用 Babel 编译 `pages/src/construction-smart-site.js` 输出到 `pages/dist/`

**Step 2: 发布页面**

Run: `node .claude/skills/skills/yida-publish-page/scripts/publish.js <appType> <pageId> pages/dist/construction-smart-site.js`

---

## Task 13: 发布节点验收页面

Run: `node .claude/skills/skills/yida-publish-page/scripts/publish.js <appType> <pageId> pages/dist/construction-node-acceptance.js`

---

## Task 14: 发布工期预警页面

Run: `node .claude/skills/skills/yida-publish-page/scripts/publish.js <appType> <pageId> pages/dist/construction-warn.js`

---

## Task 15: 输出访问链接

生成三个页面的访问 URL 并输出给用户

---

**Plan complete. Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
