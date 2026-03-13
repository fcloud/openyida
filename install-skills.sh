#!/usr/bin/env sh
# install-skills.sh - 安装 yida-skills 子模块
#
# 兼容：macOS / Linux（sh/bash/zsh）
# Windows 用户请使用：install-skills.ps1
#
# 用法：
#   bash install-skills.sh           # 自动检测网络，国内自动使用加速源
#   bash install-skills.sh --cn      # 强制使用国内加速源
#   bash install-skills.sh --global  # 强制使用原始 GitHub 地址

set -e

SKILLS_DIR=".claude/skills"
GITHUB_URL="https://github.com/openyida/yida-skills.git"
# ghproxy.com 是社区维护的 GitHub 加速代理，国内访问 GitHub 时使用
GHPROXY_URL="https://ghproxy.com/https://github.com/openyida/yida-skills.git"

echo "🔧 正在安装 yida-skills..."

# 检查是否在项目根目录（有 .git 或 config.json）
if [ ! -f "config.json" ] && [ ! -d ".git" ]; then
  echo "❌ 请在项目根目录下运行此脚本"
  exit 1
fi

# ── 判断使用哪个源 ────────────────────────────────────────────────────

USE_PROXY=0

if [ "$1" = "--cn" ]; then
  USE_PROXY=1
  echo "🇨🇳 已指定使用国内加速源"
elif [ "$1" = "--global" ]; then
  USE_PROXY=0
  echo "🌐 已指定使用原始 GitHub 地址"
else
  # 自动检测：尝试连接 GitHub，超时 3 秒
  echo "🔍 检测网络环境..."
  if curl -s --connect-timeout 3 https://github.com > /dev/null 2>&1; then
    echo "🌐 GitHub 可直连，使用原始地址"
    USE_PROXY=0
  else
    echo "🇨🇳 GitHub 连接超时，自动切换到国内加速源（ghproxy.com）"
    USE_PROXY=1
  fi
fi

if [ "$USE_PROXY" = "1" ]; then
  SUBMODULE_URL="${GHPROXY_URL}"
else
  SUBMODULE_URL="${GITHUB_URL}"
fi

# ── 安装 Skills ───────────────────────────────────────────────────────

# 方式一：通过 git submodule 初始化（推荐，已克隆仓库时使用）
if [ -f ".gitmodules" ]; then
  echo "📦 检测到 .gitmodules，通过 git submodule 初始化..."
  if [ "$USE_PROXY" = "1" ]; then
    # 临时将 github.com 重写为 ghproxy 加速地址
    git -c url."https://ghproxy.com/https://github.com/".insteadOf="https://github.com/" \
      submodule update --init --recursive
  else
    git submodule update --init --recursive
  fi
  echo "✅ Skills 安装完成：${SKILLS_DIR}/skills/"
  exit 0
fi

# 方式二：直接 clone（未使用 submodule 时的备用方案）
if [ -d "${SKILLS_DIR}" ]; then
  echo "📦 ${SKILLS_DIR} 已存在，跳过克隆"
else
  echo "📦 克隆 yida-skills 到 ${SKILLS_DIR}..."
  git clone "${SUBMODULE_URL}" "${SKILLS_DIR}"
fi

echo "✅ Skills 安装完成：${SKILLS_DIR}/skills/"
echo ""
echo "已安装的 Skills："
if [ -d "${SKILLS_DIR}/skills" ]; then
  for skill_dir in "${SKILLS_DIR}/skills"/*/; do
    skill_name=$(basename "${skill_dir}")
    echo "  - ${skill_name}"
  done
else
  echo "  （未找到 skills 子目录）"
fi
