#!/usr/bin/env node

/**
 * CoherynUI — Native CLI Runner for Node.js / npx
 * Resolves or invokes the native platform-specific Rust binary.
 */

const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const PKG_VERSION = require('../package.json').version;

function getPlatformBinaryName() {
  const type = os.type();
  const arch = os.arch();

  let platformKey = '';
  if (type === 'Darwin') {
    platformKey = arch === 'arm64' ? 'aarch64-apple-darwin' : 'x86_64-apple-darwin';
  } else if (type === 'Linux') {
    platformKey = arch === 'arm64' ? 'aarch64-unknown-linux-gnu' : 'x86_64-unknown-linux-gnu';
  } else if (type === 'Windows_NT') {
    platformKey = 'x86_64-pc-windows-msvc';
  }

  const ext = type === 'Windows_NT' ? '.exe' : '';
  return {
    platformKey,
    binaryName: `coherynui${ext}`
  };
}

function findLocalBinary() {
  const { binaryName } = getPlatformBinaryName();

  // 1. Check workspace target release / debug dirs
  const candidatePaths = [
    path.resolve(__dirname, '../../../target/release', binaryName),
    path.resolve(__dirname, '../../../target/debug', binaryName),
    path.resolve(__dirname, '..', binaryName),
    path.resolve(os.homedir(), '.coheryn', 'bin', binaryName),
    path.resolve(os.homedir(), '.local', 'bin', binaryName)
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        fs.accessSync(p, fs.constants.X_OK);
        return p;
      } catch {
        // Continue searching
      }
    }
  }

  // 2. Check system PATH
  const whichCmd = os.type() === 'Windows_NT' ? 'where' : 'which';
  const check = spawnSync(whichCmd, ['coherynui'], { stdio: 'pipe', encoding: 'utf-8' });
  if (check.status === 0 && check.stdout) {
    const lines = check.stdout.trim().split(/\r?\n/);
    if (lines.length > 0 && fs.existsSync(lines[0])) {
      return lines[0];
    }
  }

  return null;
}

function main() {
  const binaryPath = findLocalBinary();
  const args = process.argv.slice(2);

  if (binaryPath) {
    const child = spawn(binaryPath, args, { stdio: 'inherit' });
    child.on('exit', (code, signal) => {
      if (signal) process.kill(process.pid, signal);
      process.exit(code ?? 0);
    });
    return;
  }

  // Fallback instructions if native binary is not yet compiled or installed
  console.log(`\x1b[1m\x1b[35mCoherynUI CLI v${PKG_VERSION}\x1b[0m — Native Runtime Manager`);
  console.log(`Platform: ${os.type()} (${os.arch()})\n`);
  console.log(`\x1b[33mNotice: Native 'coherynui' binary not found on local PATH.\x1b[0m`);
  console.log(`\nTo install the native high-speed binary directly:`);
  console.log(`  \x1b[36mcurl -fsSL https://coheryntech.com/products/coheryn-ui/install.sh | sh\x1b[0m\n`);
  console.log(`Or build from repository source:`);
  console.log(`  \x1b[36mcargo build --release -p coherynui-cli\x1b[0m\n`);
  console.log(`For documentation and usage guides:`);
  console.log(`  \x1b[4mhttps://coheryntech.com/products/coheryn-ui\x1b[0m\n`);
  process.exit(1);
}

main();
