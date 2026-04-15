---
name: yida-formula
description: 宜搭表单公式编写规范，包含函数速查、语法规则、常见场景示例。不适用于：配置业务关联规则（应使用 yida-integration），或创建表单字段结构（应使用 yida-create-form-page）。
---

# yida-formula — 宜搭表单公式编写规范

## 核心规则

**致命（FATAL）**：
1. **公式中的 fieldId 必须是真实 ID**：必须通过 `openyida get-schema` 获取，禁止猜测
2. **比较运算必须使用函数**（EQ/NE/GT/GE/LT/LE），**禁止使用 `>`、`<`、`==`、`!=`、`>=`、`<=` 等符号**
3. **函数名必须全大写**：`SUM`、`IF`、`CONCATENATE`，不能写成 `sum`、`if`

**重要（IMPORTANT）**：
1. **字段引用格式**：`#{fieldId}`，子表字段 `#{tableField_xxx.numberField_yyy}`
2. **所有符号必须是英文**：括号 `()`、逗号 `,`、引号 `""`
3. **字符串常量用双引号**：`"优秀"`、`"已完成"`
4. **隐藏字段需开启「始终提交」**：否则隐藏字段不参与公式计算

## 适用场景

**正向触发**：
- 用户说"配置公式"、"计算字段"、"自动计算"、"字段联动"、"求和"、"条件判断"、"IF 公式"
- 需要在表单字段上配置默认值公式、计算公式、自定义校验规则

**不适用场景**：
| 场景 | 使用技能 |
|------|---------|
| 提交后跨表数据联动 | `yida-integration` |
| 创建/修改表单字段结构 | `yida-create-form-page` |
| 查询表单数据记录 | `yida-data-management` |
| 配置审批流程条件 | `yida-process-rule` |

## 公式配置方式

**宜搭没有独立的"公式字段"组件**。公式配置在普通字段的属性上：

| 配置位置 | 说明 | 典型场景 |
|---------|------|---------|
| 字段的「默认值」→「公式」 | 打开时自动计算并填入值 | 总金额 = 单价 × 数量 |
| 字段的「校验」→「自定义校验」 | 提交时校验字段值是否合法 | 结束日期必须晚于开始日期 |
| 表单属性的「业务关联规则」 | 提交后触发跨表数据操作 | 提交后自动更新库存表 |

## 公式字段的 Schema 结构

通过 `openyida create-form` 的 create 或 update 模式配置公式，需同时设置三个属性：

| 属性 | 值 | 说明 |
|------|-----|------|
| `valueType` | `"formula"` | 声明该字段值由公式计算 |
| `complexValue` | `{"complexType":"formula","formula":"<公式>"}` | 公式配置对象 |
| `formula` | `"<公式>"` | 与 complexValue.formula 相同 |

### 正确工作流程

```
Step 1: create 模式创建基础字段（不含公式）
         ↓
Step 2: openyida get-schema 获取各字段的真实 fieldId
         ↓
Step 3: create 或 update 模式添加/更新带公式的字段，引用真实 #{fieldId}
```

### create 模式示例

```json
[{
  "type": "NumberField", "label": "总金额", "behavior": "READONLY",
  "valueType": "formula",
  "complexValue": { "complexType": "formula", "formula": "ROUND(#{numberField_price} * #{numberField_qty}, 2)" },
  "formula": "ROUND(#{numberField_price} * #{numberField_qty}, 2)"
}]
```

### update 模式示例

```json
[{
  "action": "update", "label": "总金额",
  "changes": {
    "valueType": "formula",
    "complexValue": { "complexType": "formula", "formula": "ROUND(#{numberField_price} * #{numberField_qty}, 2)" },
    "formula": "ROUND(#{numberField_price} * #{numberField_qty}, 2)"
  }
}]
```

### 赋值类型限制

| 公式结果类型 | 可配置的字段类型 |
|------------|----------------|
| 数值计算结果 | `NumberField`、`TextField`、`TextareaField` |
| 文本函数结果 | `TextField`、`TextareaField` |
| 日期函数结果 | `DateField` |
| 人员函数结果 | `EmployeeField` |
| 单选/下拉单选 | 单选、下拉单选 |
| 复选/下拉复选 | 复选、下拉复选 |

## 函数分类速查

| 分类 | 常用函数 |
|------|---------|
| 文本 | TEXT, CONCATENATE, LEFT, RIGHT, MID, LEN, REPLACE, UPPER, LOWER, TRIM, VALUE, UUID, RMBFORMAT, SPLIT, ARRAYGET |
| 时间 | TODAY, NOW, YEAR, MONTH, DAY, DAYS, DATEDELTA, NETWORKDAYS, TIMESTAMP, DATE, CASCADEDATEINTERVAL |
| 逻辑 | IF, AND, OR, NOT, EQ, NE, GT, GE, LT, LE, ISEMPTY, TIMECOMPARE |
| 数学 | SUM, AVERAGE, MAX, MIN, ROUND, INT, ABS, MOD, PRODUCT, SUMPRODUCT, SQRT, POWER, COUNT |
| 人员 | USER, GETUSERNAME, LOGINUSERWORKNO, DEPTNAME, DIRECTOR |
| 集合 | UNIONSET, INTERSECTIONSET, DIFFERENCESET, EXIST |
| 校验 | EXACT, ARRAYREPEATED |
| 高级 | INSERT, UPDATE, DELETE, UPSERT（跨表操作，有用量限制） |

> 完整函数参数说明见 [formula-functions.md](../../references/formula-functions.md)

## 常见陷阱

1. **循环依赖**：公式中不能引用当前字段本身，否则报「循环依赖」错误
2. **隐藏字段不计算**：`behavior: "HIDDEN"` 的字段默认不参与公式计算，需开启「始终提交」
3. **日期字段做判断条件不准确**：底层是时间戳，推荐先用文本字段接收日期值再做判断
4. **业务关联规则的 EQ 条件**：被更新表单的比较字段必须放 `EQ` 第一个参数，且不能嵌套其他公式
5. **业务关联规则与集成自动化混用**：执行顺序不可控，推荐优先使用 `yida-integration`
6. **比较运算符报错**：禁止 `>=`、`<=` 等符号，必须改用 `GE()`、`LE()` 等函数

> 完整场景示例见 [examples.md](references/examples.md)

## 异常处理

| 异常场景 | 处理方式 |
|---------|----------|
| 公式报"函数不存在" | 只能使用 formula-functions.md 中列出的函数，检查函数名拼写和大小写 |
| 公式报"循环依赖" | 公式中不能引用当前字段本身，检查是否存在循环引用 |
| 字段值未自动计算 | 确认已设置 `valueType: "formula"`，隐藏字段需开启「始终提交」 |
| 比较运算符报错 | 禁止使用 `>=`、`<=` 等符号，必须改用 `GE()`、`LE()` 等函数 |
| 业务关联规则未触发 | 确认配置在「业务关联规则」中，而非字段默认值公式中 |
| 字段 ID 引用错误 | 先用 `openyida get-schema` 获取真实 fieldId，用 `#{fieldId}` 格式引用 |

## Agent 错误处理策略

| 错误类型 | 默认处理策略 |
|---------|-------------|
| 命令执行失败 | 停止执行，向用户展示完整错误信息，询问是否重试 |
| fieldId 不存在 | 停止执行，提示先执行 `openyida get-schema` 获取真实 ID |
| 公式语法错误 | 停止执行，检查函数名大写、英文符号、`#{}` 引用格式 |
| 登录态失效 | 提示用户执行 `openyida login` 重新登录 |

## 参考文档

| 文档 | 覆盖范围 | 何时阅读 |
|------|---------|---------|
| [函数完整参考](../../references/formula-functions.md) | 完整函数的参数、适用场域、示例（详见 formula-functions.md） | 需要查询函数用法时 |
| [场景示例](references/examples.md) | 报销计算、IF 嵌套、子表求和、自动填充 | 首次使用参考 |
| [宜搭 API](../../references/yida-api.md) | 表单/流程 API 完整参数 | 需要查询数据时 |

## 与其他技能配合

| 步骤 | 技能 | 产出 |
|------|------|------|
| 创建表单字段结构 | `yida-create-form-page` | fieldId |
| 获取字段真实 ID | `yida-get-schema` | fieldId 用于 `#{fieldId}` 引用 |
| 配置跨表数据联动 | `yida-integration` | 替代高级函数 INSERT/UPDATE |

## Memory 策略

本技能不读写 memory。公式配置通过 `openyida create-form` 写入宜搭平台，fieldId 等信息写入 `.cache/` 临时文件。
