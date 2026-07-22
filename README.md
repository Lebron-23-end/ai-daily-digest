**English** | [中文](README.zh-CN.md)

# AI Daily Digest — AI 建造者日报

> **Forked from [follow-builders](https://github.com/zarazhangrui/follow-builders)** by Zara Zhang.
> Special thanks to the original author for the excellent content curation system.

An AI-powered daily digest that tracks the top builders in AI — researchers, founders, PMs,
and engineers who are actually building things — and delivers curated bilingual (English + Chinese)
summaries of what they're saying.

## What You Get

A daily digest with:

- Summaries of new podcast episodes from top AI podcasts
- Key posts and insights from 25 curated AI builders on X/Twitter
- Full articles from official AI company blogs (Anthropic Engineering, Claude Blog)
- Links to all original content
- **Bilingual format** — English + Chinese side by side
- **Markdown + HTML** output — view in any browser or push to Feishu/Lark
- **Configurable output directory** — save files wherever you want

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-daily-digest.git
cd ai-daily-digest
```

### 2. Install dependencies

```bash
cd scripts && npm install
cd .. && npm install
```

### 3. Configure your settings

```bash
cp .env.example .env
```

Edit `.env` and set your preferences:

| Variable | Description | Default |
|----------|-------------|---------|
| `OUTPUT_DIR` | Where to save MD and HTML files | `./output` |
| `LARK_CLI_FOLDER_TOKEN` | Feishu folder token (optional) | (empty) |
| `HTTP_PROXY` / `HTTPS_PROXY` | Proxy settings (optional) | (empty) |

### 4. Run the digest

#### Option A: With an AI agent (WorkBuddy, OpenClaw, Claude Code)

Install this as a skill and invoke `/ai` or say "run my AI digest". The agent will:
1. Fetch the latest content from the central feed
2. Remix it into a bilingual digest
3. Save the Markdown file to your `OUTPUT_DIR`
4. Convert it to HTML

#### Option B: Manual run

```bash
# Fetch content
cd scripts && node prepare-digest.js > digest-content.json

# (The JSON output is processed by your AI agent to generate the digest)

# Convert MD to HTML after the agent generates the digest
node generate-html.js path/to/digest.md
# Or convert all .md files in your output directory:
node generate-html.js --dir "$OUTPUT_DIR"
```

### 5. Push to Feishu (optional)

```bash
# Prerequisites:
#   1. Install lark-cli:  npm install -g @larksuiteoapi/lark-cli
#   2. Log in with YOUR account:  lark-cli auth login
#   3. Set LARK_CLI_FOLDER_TOKEN in .env

# Push a digest file:
cd scripts && node push-to-feishu.js ../output/AI_Builders_Digest_2024-01-15.md
```

## Features

### Bilingual Digest

The digest is generated in bilingual format — English original followed by Chinese translation,
paragraph by paragraph. This makes it easy to:
- Read the original English for accuracy
- Reference the Chinese translation for speed
- Learn AI industry vocabulary in both languages

### HTML Output

The `generate-html.js` script converts Markdown to a beautifully styled HTML file with:
- Light/dark mode support (follows system preference)
- Responsive design for mobile and desktop
- Proper rendering of tables, blockquotes, code blocks, and links
- Chinese-optimized fonts

### Feishu Integration

Push digests directly to Feishu (Lark) docs using **your own account**:
1. Install `lark-cli` globally
2. Log in with your Feishu account
3. Set the folder token in `.env`
4. Run `node push-to-feishu.js <file.md>`

No credentials are hardcoded — you use your own Feishu account.

### Configurable Output Directory

Set `OUTPUT_DIR` in `.env` to control where MD and HTML files are saved:

```bash
# .env
OUTPUT_DIR=/home/user/my-digests
# or on Windows:
OUTPUT_DIR=E:\AI-Digest
```

## Project Structure

```
ai-daily-digest/
├── .github/workflows/
│   └── generate-feed.yml       # GitHub Actions: daily feed generation
├── .env.example                 # Configuration template
├── .gitignore
├── config/
│   ├── config-schema.json
│   └── default-sources.json     # Curated list of builders, podcasts, blogs
├── prompts/                     # AI agent instructions (plain English)
│   ├── digest-intro.md
│   ├── summarize-podcast.md
│   ├── summarize-tweets.md
│   ├── summarize-blogs.md
│   └── translate.md
├── scripts/
│   ├── prepare-digest.js        # Fetch content from central feed
│   ├── generate-feed.js         # Generate feeds (runs on GitHub Actions)
│   ├── deliver.js               # Telegram/email delivery
│   ├── generate-html.js         # MD → HTML converter
│   ├── push-to-feishu.js        # Push to Feishu (your own account)
│   ├── run-digest.bat           # Windows runner
│   └── run-digest.sh            # Linux/Mac runner
├── examples/
│   └── sample-digest.md
├── SKILL.md                     # AI agent instructions
├── package.json
└── README.md
```

## Default Sources

### Podcasts (6)
- [Latent Space](https://www.youtube.com/@LatentSpacePod)
- [Training Data](https://www.youtube.com/playlist?list=PLOhHNjZItNnMm5tdW61JpnyxeYH5NDDx8)
- [No Priors](https://www.youtube.com/@NoPriorsPodcast)
- [Unsupervised Learning](https://www.youtube.com/@RedpointAI)
- [The MAD Podcast with Matt Turck](https://www.youtube.com/@DataDrivenNYC)
- [AI & I by Every](https://www.youtube.com/playlist?list=PLuMcoKK9mKgHtW_o9h5sGO2vXrffKHwJL)

### AI Builders on X (25)
Andrej Karpathy, Swyx, Josh Woodward, Kevin Weil, Peter Yang, Nan Yu, Madhu Guru,
Amanda Askell, Cat Wu, Thariq, Google Labs, Amjad Masad, Guillermo Rauch, Alex Albert,
Aaron Levie, Ryo Lu, Garry Tan, Matt Turck, Zara Zhang, Nikunj Kothari, Peter Steinberger,
Dan Shipper, Aditya Agarwal, Sam Altman, Claude

### Official Blogs (2)
- [Anthropic Engineering](https://www.anthropic.com/engineering)
- [Claude Blog](https://claude.com/blog)

## How It Works

1. A central feed is updated daily (via GitHub Actions) with the latest content from all sources
2. `prepare-digest.js` fetches the feed — one HTTP request, no API keys needed
3. Your AI agent remixes the raw content into a bilingual digest
4. `generate-html.js` converts the Markdown to styled HTML
5. Optionally, `push-to-feishu.js` pushes the digest to your Feishu workspace

## Requirements

- An AI agent (WorkBuddy, OpenClaw, Claude Code, or similar) — for digest generation
- Node.js 18+ — for running scripts
- Internet connection — to fetch the central feed
- **Optional:** `lark-cli` for Feishu integration
- **Optional:** Telegram bot token for Telegram delivery
- **Optional:** Resend API key for email delivery

## Customization

### Change Summary Style
Edit the prompt files in `prompts/` — they're plain English instructions, not code.

### Change Language
Update your config: `~/.follow-builders/config.json`
- `"language": "en"` — English only
- `"language": "zh"` — Chinese only
- `"language": "bilingual"` — Both (default)

### Change Output Directory
Set `OUTPUT_DIR` in `.env`.

## Privacy

- No API keys are sent anywhere — all content is fetched centrally
- Feishu credentials are managed by `lark-cli` with YOUR OWN account
- The skill only reads public content
- Your configuration stays on your machine

## Acknowledgments

This project is forked from and inspired by **[follow-builders](https://github.com/zarazhangrui/follow-builders)** by Zara Zhang.
The original project provides the excellent content curation system, feed generation, and digest
remixing framework. Special thanks for making it open source.

## License

MIT
