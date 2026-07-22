#!/bin/bash
# AI Daily Digest - Run Script (Linux/Mac)
set -e

cd "$(dirname "$0")"

echo ""
echo "==============================================="
echo "  AI Builders Digest - Daily Report"
echo "==============================================="
echo ""

# Load .env if it exists
if [ -f "../.env" ]; then
    export $(grep -v '^#' ../.env | xargs 2>/dev/null || true)
fi

# Step 1: Fetch content
echo "[1/3] Fetching content from feeds..."
node prepare-digest.js > digest-content.json 2>/dev/null || {
    echo "Failed to fetch content. Check your internet connection."
    exit 1
}
echo "Content fetched successfully."

# Step 2: Process with AI agent
echo ""
echo "[2/3] The AI agent will now process the content and generate the digest."
echo "Run this skill in your AI agent (WorkBuddy/OpenClaw/Claude Code)."
echo ""

# Step 3: Convert MD to HTML (after agent generates the MD)
echo "[3/3] To convert MD to HTML after the agent generates the digest:"
echo "  node generate-html.js <file.md> [output.html]"
echo "  node generate-html.js --dir \"\$OUTPUT_DIR\""
echo ""
