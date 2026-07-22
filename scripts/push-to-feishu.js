#!/usr/bin/env node

// ============================================================================
// AI Daily Digest — Push to Feishu (Lark)
// ============================================================================
// Creates a Feishu document from a Markdown file using lark-cli.
//
// Prerequisites:
//   1. Install lark-cli:  npm install -g @larksuiteoapi/lark-cli
//   2. Log in:            lark-cli auth login
//   3. Set LARK_CLI_FOLDER_TOKEN in .env (or pass --folder flag)
//
// Usage:
//   node push-to-feishu.js <file.md>
//   node push-to-feishu.js <file.md> --folder <folder_token>
//   node push-to-feishu.js <file.md> --as bot
//
// The script reads the folder token from:
//   1. --folder flag
//   2. LARK_CLI_FOLDER_TOKEN env var
//   3. .env file at project root
//
// lark-cli handles authentication with YOUR OWN Feishu account.
// This script does NOT hardcode any credentials.
// ============================================================================

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { config as loadEnv } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

loadEnv({ path: join(__dirname, '..', '.env') });

// -- Main --------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const mdFile = args.find(a => !a.startsWith('--'));
  if (!mdFile) {
    console.error('Usage: node push-to-feishu.js <file.md> [--folder <token>] [--as bot|user]');
    console.error('');
    console.error('Options:');
    console.error('  --folder <token>   Feishu folder token (overrides .env)');
    console.error('  --as bot|user      Identity to use (default: bot)');
    console.error('');
    console.error('Setup:');
    console.error('  1. Install lark-cli:  npm install -g @larksuiteoapi/lark-cli');
    console.error('  2. Log in:            lark-cli auth login');
    console.error('  3. Set LARK_CLI_FOLDER_TOKEN in .env');
    process.exit(1);
  }

  if (!existsSync(mdFile)) {
    console.error(`File not found: ${mdFile}`);
    process.exit(1);
  }

  // Get folder token
  const folderIdx = args.indexOf('--folder');
  const folderToken = folderIdx !== -1 && args[folderIdx + 1]
    ? args[folderIdx + 1]
    : process.env.LARK_CLI_FOLDER_TOKEN;

  if (!folderToken) {
    console.error('Error: No Feishu folder token provided.');
    console.error('');
    console.error('Set it in one of these ways:');
    console.error('  1. Add LARK_CLI_FOLDER_TOKEN=xxx to .env file');
    console.error('  2. Pass --folder <token> on the command line');
    console.error('');
    console.error('The folder token is the last part of your Feishu folder URL:');
    console.error('  https://your-domain.feishu.cn/drive/folder/<FOLDER_TOKEN>');
    process.exit(1);
  }

  // Get identity (bot or user)
  const asIdx = args.indexOf('--as');
  const identity = asIdx !== -1 && args[asIdx + 1] ? args[asIdx + 1] : 'bot';

  // Verify lark-cli is available
  try {
    execFileSync('lark-cli', ['--version'], { stdio: 'pipe' });
  } catch {
    console.error('Error: lark-cli not found.');
    console.error('');
    console.error('Install it first:');
    console.error('  npm install -g @larksuiteoapi/lark-cli');
    console.error('');
    console.error('Then log in with YOUR OWN account:');
    console.error('  lark-cli auth login');
    process.exit(1);
  }

  // Read the markdown content
  const content = await readFile(mdFile, 'utf-8');

  // Create a temporary file for lark-cli to read (avoids shell escaping issues)
  const tmpFile = join(__dirname, '.tmp-feishu-content.md');
  const { writeFile } = await import('fs/promises');
  await writeFile(tmpFile, content, 'utf-8');

  try {
    console.log('Pushing to Feishu...');

    // Use --content @file format to avoid UTF-8 encoding issues
    const result = execFileSync('lark-cli', [
      'docs', '+create',
      '--api-version', 'v2',
      '--doc-format', 'markdown',
      '--parent-token', folderToken,
      '--content', `@${tmpFile}`,
      '--as', identity
    ], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Parse the JSON output
    try {
      const data = JSON.parse(result);
      if (data.document && data.document.url) {
        console.log(`Feishu document created: ${data.document.url}`);
        console.log(`Document token: ${data.document.document_id || 'N/A'}`);
      } else {
        console.log('Feishu response:', result);
      }
    } catch {
      console.log('Feishu response:', result);
    }
  } catch (err) {
    console.error('Failed to push to Feishu:', err.message);
    if (err.stderr) {
      console.error('lark-cli error:', err.stderr.toString());
    }
    console.error('');
    console.error('Make sure you have logged in: lark-cli auth login');
    process.exit(1);
  } finally {
    // Clean up temp file
    const { unlink } = await import('fs/promises');
    try { await unlink(tmpFile); } catch {}
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
