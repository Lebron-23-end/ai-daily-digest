@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ================================================
echo   AI Builders Digest - Daily Report
echo ================================================
echo.

REM Load .env if it exists
if exist "..\.env" (
    for /f "usebackq tokens=1,* delims==" %%a in ("..\.env") do (
        set "%%a=%%b"
    )
)

REM Step 1: Fetch content
echo [1/3] Fetching content from feeds...
node prepare-digest.js > digest-content.json 2>nul
if %errorlevel% neq 0 (
    echo Failed to fetch content. Check your internet connection.
    pause
    exit /b 1
)
echo Content fetched successfully.

REM Step 2: Process with AI agent
echo.
echo [2/3] The AI agent will now process the content and generate the digest.
echo Run this skill in your AI agent (WorkBuddy/OpenClaw/Claude Code).
echo.

REM Step 3: Convert MD to HTML (after agent generates the MD)
echo [3/3] To convert MD to HTML after the agent generates the digest:
echo   node generate-html.js ^<file.md^> [output.html]
echo   node generate-html.js --dir "%%OUTPUT_DIR%%"
echo.

pause
