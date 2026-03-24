# 钉钉流程管理技能 - 快速安装指南

## 🚀 一键安装

### 方法一：使用 real_cli（推荐）

在终端执行以下命令：

```bash
real_cli skills install /Users/nicky/workspace/open-yida/openyida/output/dingtalk-flow-manager.zip
```

安装成功后会显示：
```
✅ 技能安装成功：dingtalk-flow-manager
```

### 方法二：在悟空平台手动上传

1. 打开悟空平台
2. 进入"技能管理"或"我的技能"
3. 点击"上传技能"或"+"按钮
4. 选择文件：`/Users/nicky/workspace/open-yida/openyida/output/dingtalk-flow-manager.zip`
5. 等待上传完成
6. 启用技能

---

## ✅ 验证安装

安装完成后，测试技能是否正常工作：

### 测试 1：查询技能列表
```bash
real_cli skills list-enabled
```

确认列表中包含 `dingtalk-flow-manager`。

### 测试 2：对话测试

在对话框中输入：
```
我的流程有哪些？
```

如果技能正常工作，会显示您的待办和待审批流程列表。

### 测试 3：指令测试

输入：
```
第一个，同意
```

应该会执行审批操作并返回结果。

---

## 🔧 故障排查

### 问题 1：技能未触发

**症状**：说"我的流程有哪些"没有反应

**解决方法**：
1. 检查技能是否已启用：`real_cli skills list-enabled`
2. 如未启用：`real_cli skills enable dingtalk-flow-manager`
3. 确保 `dws` (钉钉工作台) 技能也已启用

### 问题 2：权限错误

**症状**：提示"无权限访问待办数据"

**解决方法**：
1. 确认已登录钉钉账号
2. 检查钉钉授权设置
3. 联系管理员开通待办和审批接口权限

### 问题 3：依赖技能缺失

**症状**：提示"dws 技能不存在"

**解决方法**：
```bash
real_cli skills enable dws
```

或检查技能名称是否正确。

---

## 📝 卸载技能

如需卸载此技能：

```bash
real_cli skills disable dingtalk-flow-manager
real_cli skills delete dingtalk-flow-manager
```

---

## 🔄 更新技能

当技能有更新版本时：

1. 重新下载 ZIP 包
2. 先卸载旧版本：
   ```bash
   real_cli skills delete dingtalk-flow-manager
   ```
3. 安装新版本：
   ```bash
   real_cli skills install /path/to/new/dingtalk-flow-manager.zip
   ```

---

## 📞 获取帮助

如遇问题，可以：

1. 查看技能文档：`real_cli skills read dingtalk-flow-manager`
2. 检查日志文件（如有）
3. 联系技能开发者

---

## ⚙️ 系统要求

- 悟空平台版本：最新版
- 依赖技能：`dws` (钉钉工作台)
- 钉钉账号：已授权待办和审批权限
- 网络环境：可访问钉钉 API
