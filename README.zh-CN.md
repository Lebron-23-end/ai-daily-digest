[English](README.md) | **中文**

# AI Daily Digest — AI 建造者日报

> **基于 [follow-builders](https://github.com/zarazhangrui/follow-builders)** by Zara Zhang 二次开发。
> 特别感谢原作者提供的优秀内容聚合系统。

一个 AI 驱动的每日信息聚合工具，追踪 AI 领域最顶尖的建造者——研究员、创始人、产品经理和工程师——
并将他们的最新动态整理成中英双语摘要推送给你。

**理念：** 追踪那些真正在做产品、有独立见解的人，而非只会搬运信息的网红。

## 你会得到什么

每日摘要包含：

- 顶级 AI 播客新节目的精华摘要
- 25 位精选 AI 建造者在 X/Twitter 上的关键观点和洞察
- AI 公司官方博客的完整文章（Anthropic Engineering、Claude Blog）
- 所有原始内容的链接
- **中英双语**格式 — 英文原文 + 中文翻译
- **Markdown + HTML** 输出 — 浏览器直接打开或推送到飞书
- **可自定义保存目录** — 文件想存哪里就存哪里

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/YOUR_USERNAME/ai-daily-digest.git
cd ai-daily-digest
```

### 2. 安装依赖

```bash
cd scripts && npm install
cd .. && npm install
```

### 3. 配置你的设置

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置你的偏好：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `OUTPUT_DIR` | MD 和 HTML 文件保存目录 | `./output` |
| `LARK_CLI_FOLDER_TOKEN` | 飞书文件夹 token（可选） | (空) |
| `HTTP_PROXY` / `HTTPS_PROXY` | 代理设置（可选） | (空) |

### 4. 运行日报

#### 方式 A：配合 AI agent（WorkBuddy、OpenClaw、Claude Code）

将此项目安装为 skill，然后输入 `/ai` 或说"运行我的 AI 日报"。Agent 会：
1. 从中心化 feed 获取最新内容
2. 重新混编为双语摘要
3. 将 Markdown 文件保存到你的 `OUTPUT_DIR`
4. 转换为 HTML

#### 方式 B：手动运行

```bash
# 获取内容
cd scripts && node prepare-digest.js > digest-content.json

# （JSON 输出由你的 AI agent 处理，生成摘要）

# Agent 生成摘要后，将 MD 转为 HTML
node generate-html.js path/to/digest.md
# 或者转换输出目录中的所有 .md 文件：
node generate-html.js --dir "$OUTPUT_DIR"
```

### 5. 推送到飞书（可选）

```bash
# 前提条件：
#   1. 安装 lark-cli:  npm install -g @larksuiteoapi/lark-cli
#   2. 用你自己的账号登录:  lark-cli auth login
#   3. 在 .env 中设置 LARK_CLI_FOLDER_TOKEN

# 推送摘要文件：
cd scripts && node push-to-feishu.js ../output/AI_Builders_Digest_2024-01-15.md
```

## 功能特性

### 双语摘要

摘要以双语格式生成 — 英文原文后跟中文翻译，逐段交替。方便你：
- 阅读英文原文确保准确性
- 参考中文翻译提高速度
- 同时学习 AI 行业中英双语词汇

### HTML 输出

`generate-html.js` 脚本将 Markdown 转换为精美的 HTML 文件：
- 支持浅色/深色模式（跟随系统设置）
- 响应式设计，适配手机和桌面
- 正确渲染表格、引用、代码块和链接
- 中文字体优化

### 飞书集成

使用**你自己的飞书账号**推送日报到飞书文档：
1. 全局安装 `lark-cli`
2. 用你的飞书账号登录
3. 在 `.env` 中设置文件夹 token
4. 运行 `node push-to-feishu.js <file.md>`

不硬编码任何凭证 — 完全使用你自己的飞书账号。

### 可自定义保存目录

在 `.env` 中设置 `OUTPUT_DIR` 控制 MD 和 HTML 文件的保存位置：

```bash
# .env
OUTPUT_DIR=/home/user/my-digests
# Windows:
OUTPUT_DIR=E:\AI-Digest
```

## 项目结构

```
ai-daily-digest/
├── .github/workflows/
│   └── generate-feed.yml       # GitHub Actions: 每日生成 feed
├── .env.example                 # 配置模板
├── .gitignore
├── config/
│   ├── config-schema.json
│   └── default-sources.json     # 精选的建造者、播客、博客列表
├── prompts/                     # AI agent 指令文件（纯文本）
│   ├── digest-intro.md
│   ├── summarize-podcast.md
│   ├── summarize-tweets.md
│   ├── summarize-blogs.md
│   └── translate.md
├── scripts/
│   ├── prepare-digest.js        # 从中心 feed 获取内容
│   ├── generate-feed.js         # 生成 feed（在 GitHub Actions 上运行）
│   ├── deliver.js               # Telegram/邮件推送
│   ├── generate-html.js         # MD → HTML 转换器
│   ├── push-to-feishu.js        # 推送到飞书（用你自己的账号）
│   ├── run-digest.bat           # Windows 启动脚本
│   └── run-digest.sh            # Linux/Mac 启动脚本
├── examples/
│   └── sample-digest.md
├── SKILL.md                     # AI agent 指令
├── package.json
└── README.md
```

## 默认信息源

### 播客（6个）
- [Latent Space](https://www.youtube.com/@LatentSpacePod)
- [Training Data](https://www.youtube.com/playlist?list=PLOhHNjZItNnMm5tdW61JpnyxeYH5NDDx8)
- [No Priors](https://www.youtube.com/@NoPriorsPodcast)
- [Unsupervised Learning](https://www.youtube.com/@RedpointAI)
- [The MAD Podcast with Matt Turck](https://www.youtube.com/@DataDrivenNYC)
- [AI & I by Every](https://www.youtube.com/playlist?list=PLuMcoKK9mKgHtW_o9h5sGO2vXrffKHwJL)

### X 上的 AI 建造者（25位）
Andrej Karpathy, Swyx, Josh Woodward, Kevin Weil, Peter Yang, Nan Yu, Madhu Guru,
Amanda Askell, Cat Wu, Thariq, Google Labs, Amjad Masad, Guillermo Rauch, Alex Albert,
Aaron Levie, Ryo Lu, Garry Tan, Matt Turck, Zara Zhang, Nikunj Kothari, Peter Steinberger,
Dan Shipper, Aditya Agarwal, Sam Altman, Claude

### 官方博客（2个）
- [Anthropic Engineering](https://www.anthropic.com/engineering) — Anthropic 团队的技术深度文章
- [Claude Blog](https://claude.com/blog) — Claude 的产品公告与更新

## 工作原理

1. 中心化 feed 每日更新（通过 GitHub Actions），抓取所有信息源的最新内容
2. `prepare-digest.js` 获取 feed — 一次 HTTP 请求，不需要 API key
3. 你的 AI agent 根据偏好将原始内容重新混编为双语摘要
4. `generate-html.js` 将 Markdown 转换为带样式的 HTML
5. 可选：`push-to-feishu.js` 将摘要推送到你的飞书工作空间

## 系统要求

- 一个 AI agent（WorkBuddy、OpenClaw、Claude Code 或类似工具）— 用于生成摘要
- Node.js 18+ — 用于运行脚本
- 网络连接 — 用于获取中心化 feed
- **可选：** `lark-cli` 用于飞书集成
- **可选：** Telegram bot token 用于 Telegram 推送
- **可选：** Resend API key 用于邮件推送

## 自定义

### 修改摘要风格
编辑 `prompts/` 文件夹中的文件 — 它们是纯文本指令，不是代码。

### 修改语言
更新配置文件：`~/.follow-builders/config.json`
- `"language": "en"` — 仅英文
- `"language": "zh"` — 仅中文
- `"language": "bilingual"` — 双语（默认）

### 修改保存目录
在 `.env` 中设置 `OUTPUT_DIR`。

## 隐私

- 不发送任何 API key — 所有内容由中心化服务获取
- 飞书凭证由 `lark-cli` 用**你自己的账号**管理
- Skill 只读取公开内容
- 你的配置保留在你自己的设备上

## 致谢

本项目基于 **[follow-builders](https://github.com/zarazhangrui/follow-builders)**（作者 Zara Zhang）二次开发。
原项目提供了优秀的内容聚合系统、feed 生成和摘要混编框架。特别感谢原作者将其开源。

## 许可证

MIT
