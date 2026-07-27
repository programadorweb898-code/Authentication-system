#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

async function readStdinLines(prompts) {
  const rl = readline.createInterface({ input: process.stdin });
  const answers = [];
  for await (const line of rl) {
    answers.push(line);
    if (answers.length >= prompts.length) break;
  }
  rl.close();
  return answers;
}

async function copyRecursive(src, dest, filter = () => true) {
  const exists = await fs.pathExists(src);
  if (!exists) return;

  await fs.ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (!filter(srcPath)) continue;

    if (entry.isDirectory()) {
      await copyRecursive(srcPath, destPath, filter);
    } else {
      await fs.copy(srcPath, destPath);
    }
  }
}

async function runWizard() {
  console.log('--- Configuración del Proyecto ---');

  console.log('¿Deseas habilitar el módulo de E-commerce? (s/n):');
  console.log('¿Qué base de datos deseas utilizar? (mongo/postgres):');
  const answers = await readStdinLines([1, 2]);

  const ecommerce = answers[0].toLowerCase() === 's';
  const dbType = answers[1].trim();
  const projectRoot = path.join(__dirname, '..');
  const targetDir = process.cwd();

  console.log('\nConfigurando proyecto...');

  const filterFn = (srcPath) => {
    const normalized = srcPath.replace(/\\/g, '/');
    if (normalized.includes('infrastructure/persistence/')) {
      const parts = normalized.split('persistence/');
      if (parts[1] && !parts[1].startsWith(dbType)) return false;
    }
    if (normalized.includes('src/domains/ecommerce') && !ecommerce) return false;
    return true;
  };

  for (const dir of ['src', 'infrastructure', 'tests']) {
    await copyRecursive(path.join(projectRoot, dir), path.join(targetDir, dir), filterFn);
  }

  const appPath = path.join(targetDir, 'src/app.js');
  let appContent = await fs.readFile(appPath, 'utf8');

  if (!ecommerce) {
    appContent = appContent
      .replace(/^import .* from '\.\/domains\/ecommerce\/.*';$/gm, '')
      .replace(/^app\.use\('\/api\/products'.*;$/gm, '')
      .replace(/^app\.use\('\/api\/addresses'.*;$/gm, '')
      .replace(/^app\.use\('\/api\/stores'.*;$/gm, '')
      .replace(/\n{3,}/g, '\n\n');
  }

  await fs.writeFile(appPath, appContent);

  console.log('\n¡Proyecto configurado exitosamente!');
}

runWizard();
