# install-skills.ps1 - 安装 yida-skills 子模块（Windows PowerShell）
#
# 兼容：Windows PowerShell 5.1+ / PowerShell Core 7+
# Mac/Linux 用户请使用：install-skills.sh
#
# 用法：
#   .\install-skills.ps1           # 自动检测网络，国内自动使用加速源
#   .\install-skills.ps1 --cn      # 强制使用国内加速源
#   .\install-skills.ps1 --global  # 强制使用原始 GitHub 地址
#   PowerShell -ExecutionPolicy Bypass -File install-skills.ps1

param(
    [string]$Mode = ""
)

$ErrorActionPreference = "Stop"

$SkillsDir = ".claude\skills"
$GithubUrl = "https://github.com/openyida/yida-skills.git"
# ghproxy.com 是社区维护的 GitHub 加速代理，国内访问 GitHub 时使用
$GhproxyUrl = "https://ghproxy.com/https://github.com/openyida/yida-skills.git"

Write-Host "🔧 正在安装 yida-skills..." -ForegroundColor Cyan

# 检查是否在项目根目录（有 .git 或 config.json）
if (-not (Test-Path "config.json") -and -not (Test-Path ".git")) {
    Write-Host "❌ 请在项目根目录下运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查 git 是否可用
try {
    git --version | Out-Null
} catch {
    Write-Host "❌ 未找到 git，请先安装 Git for Windows：https://git-scm.com/download/win" -ForegroundColor Red
    exit 1
}

# ── 判断使用哪个源 ────────────────────────────────────────────────────

$UseProxy = $false

if ($Mode -eq "--cn") {
    $UseProxy = $true
    Write-Host "🇨🇳 已指定使用国内加速源" -ForegroundColor Cyan
} elseif ($Mode -eq "--global") {
    $UseProxy = $false
    Write-Host "🌐 已指定使用原始 GitHub 地址" -ForegroundColor Cyan
} else {
    # 自动检测：尝试连接 GitHub，超时 3 秒
    Write-Host "🔍 检测网络环境..." -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "https://github.com" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        Write-Host "🌐 GitHub 可直连，使用原始地址" -ForegroundColor Green
        $UseProxy = $false
    } catch {
        Write-Host "🇨🇳 GitHub 连接超时，自动切换到国内加速源（ghproxy.com）" -ForegroundColor Yellow
        $UseProxy = $true
    }
}

$SubmoduleUrl = if ($UseProxy) { $GhproxyUrl } else { $GithubUrl }

# ── 安装 Skills ───────────────────────────────────────────────────────

# 方式一：通过 git submodule 初始化（推荐，已克隆仓库时使用）
if (Test-Path ".gitmodules") {
    Write-Host "📦 检测到 .gitmodules，通过 git submodule 初始化..." -ForegroundColor Yellow
    if ($UseProxy) {
        # 临时将 github.com 重写为 ghproxy 加速地址
        git -c "url.https://ghproxy.com/https://github.com/.insteadOf=https://github.com/" submodule update --init --recursive
    } else {
        git submodule update --init --recursive
    }
    Write-Host "✅ Skills 安装完成：$SkillsDir\skills\" -ForegroundColor Green
    exit 0
}

# 方式二：直接 clone（未使用 submodule 时的备用方案）
if (Test-Path $SkillsDir) {
    Write-Host "📦 $SkillsDir 已存在，跳过克隆" -ForegroundColor Yellow
} else {
    Write-Host "📦 克隆 yida-skills 到 $SkillsDir..." -ForegroundColor Yellow
    git clone $SubmoduleUrl $SkillsDir
}

Write-Host "✅ Skills 安装完成：$SkillsDir\skills\" -ForegroundColor Green
Write-Host ""
Write-Host "已安装的 Skills：" -ForegroundColor Cyan

$SkillsSubDir = Join-Path $SkillsDir "skills"
if (Test-Path $SkillsSubDir) {
    Get-ChildItem -Path $SkillsSubDir -Directory | ForEach-Object {
        Write-Host "  - $($_.Name)"
    }
} else {
    Write-Host "  （未找到 skills 子目录）" -ForegroundColor Yellow
}
