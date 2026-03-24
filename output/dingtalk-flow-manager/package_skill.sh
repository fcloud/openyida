#!/bin/bash

# 钉钉流程管理技能打包脚本
# 使用方法：./package_skill.sh

SKILL_NAME="dingtalk-flow-manager"
SKILL_DIR="/Users/nicky/workspace/open-yida/openyida/output/$SKILL_NAME"
OUTPUT_DIR="/Users/nicky/workspace/open-yida/openyida/output"

echo "📦 开始打包技能：$SKILL_NAME"
echo ""

# 检查目录是否存在
if [ ! -d "$SKILL_DIR" ]; then
    echo "❌ 错误：技能目录不存在 - $SKILL_DIR"
    exit 1
fi

# 进入技能目录
cd "$SKILL_DIR" || exit 1

# 验证必要文件
if [ ! -f "SKILL.md" ]; then
    echo "❌ 错误：缺少 SKILL.md 文件"
    exit 1
fi

echo "✅ 文件检查通过"
echo ""

# 创建 ZIP 包
ZIP_FILE="$OUTPUT_DIR/${SKILL_NAME}.zip"

# 删除旧版本（如果存在）
if [ -f "$ZIP_FILE" ]; then
    rm "$ZIP_FILE"
    echo "🗑️  已删除旧版本：$ZIP_FILE"
fi

# 打包（排除隐藏文件和临时文件）
zip -r "$ZIP_FILE" \
    SKILL.md \
    README.md \
    scripts/ \
    references/ \
    assets/ \
    -x "*.DS_Store" \
    -x "*__pycache__*" \
    -x "*.pyc"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 打包成功！"
    echo ""
    echo "📦 技能包位置：$ZIP_FILE"
    echo ""
    echo "📋 下一步操作："
    echo "   1. 在悟空平台上传此 ZIP 文件"
    echo "   2. 或运行：real_cli skills install $ZIP_FILE"
    echo ""
else
    echo ""
    echo "❌ 打包失败，请检查错误信息"
    exit 1
fi
