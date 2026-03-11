#!/usr/bin/env node
// After prisma generate: build default.js so require('@prisma/client') works.
// Prisma 7 only generates .ts; @prisma/client expects .prisma/client/default.js.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
const clientTs = path.join(targetDir, 'client.ts');
const defaultJs = path.join(targetDir, 'default.js');

if (!fs.existsSync(clientTs)) {
  console.warn('scripts/prisma-default-shim.js: .prisma/client/client.ts not found (run prisma generate first)');
  process.exit(0);
}

try {
  // Generated client uses fileURLToPath(import.meta.url); in CJS we must define it (esbuild replaces at build time)
  const defineValue = JSON.stringify('file://' + defaultJs);
  // Single-string command; wrap define in single quotes so shell passes the JSON string to esbuild
  const cmd = `npx esbuild "${clientTs}" --bundle --platform=node --format=cjs --outfile="${defaultJs}" --packages=external --define:import.meta.url='${defineValue}'`;
  execSync(cmd, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('Created .prisma/client/default.js (bundled with esbuild)');
} catch (e) {
  console.error('scripts/prisma-default-shim.js: esbuild failed', e.message);
  // Fallback: create a stub (will fail at runtime with "Cannot find module ./client")
  if (!fs.existsSync(defaultJs) || fs.statSync(defaultJs).size < 1000) {
    fs.writeFileSync(defaultJs, 'module.exports = require("./client");', 'utf8');
    console.log('Created .prisma/client/default.js (stub - run npm install esbuild if you see require errors)');
  }
}
