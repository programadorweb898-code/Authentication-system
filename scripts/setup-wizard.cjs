#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(query) {
  return new Promise(resolve => rl.question(query + ' ', (answer) => {
    resolve(answer.trim());
  }));
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

  const ecommerce = (await ask('¿Deseas habilitar el módulo de E-commerce? (s/n):')).toLowerCase() === 's';
  let stripe = false;
  if (ecommerce) {
    stripe = (await ask('¿Deseas implementar el módulo de pagos con Stripe? (s/n):')).toLowerCase() === 's';
  }
  const dbType = await ask('¿Qué base de datos deseas utilizar? (mongo/postgres):');
  const projectRoot = path.join(__dirname, '..');
  const targetDir = process.cwd();

  console.log('\nConfigurando proyecto...');

  const filterFn = (srcPath) => {
    const normalized = srcPath.replace(/\\/g, '/');
    if (normalized.includes('/repositories/mongodb/') && dbType !== 'mongo') return false;
    if (normalized.includes('/repositories/postgres/') && dbType !== 'postgres') return false;
    if (normalized.includes('src/domains/ecommerce') && !ecommerce) return false;
    if (normalized.includes('domains/payments') && !stripe) return false;
    return true;
  };

  for (const dir of ['src', 'infrastructure', 'tests', 'domains']) {
    await copyRecursive(path.join(projectRoot, dir), path.join(targetDir, dir), filterFn);
  }

  const appPath = path.join(targetDir, 'src/app.js');
  let appContent = await fs.readFile(appPath, 'utf8');

  if (!ecommerce) {
    appContent = appContent
      .replace(/^import .* from '\.\.?\/domains\/ecommerce\/.*';$/gm, '')
      .replace(/^app\.use\('\/api\/products'.*;$/gm, '')
      .replace(/^app\.use\('\/api\/addresses'.*;$/gm, '')
      .replace(/^app\.use\('\/api\/stores'.*;$/gm, '')
      .replace(/\n{3,}/g, '\n\n');
  }

  await fs.writeFile(appPath, appContent);

  if (!stripe) {
    appContent = appContent
      .replace(/^import .* from '\.\.?\/domains\/payments\/.*';$/gm, '')
      .replace(/^app\.use\('\/api\/payments\/webhook'.*;$/gm, '')
      .replace(/^app\.use\('\/api\/payments'.*;$/gm, '')
      .replace(/\n{3,}/g, '\n\n');
    await fs.writeFile(appPath, appContent);
  }

  console.log('\n¡Proyecto configurado exitosamente!');
  rl.close();
}

runWizard().catch(e => {
  console.error('Wizard error:', e);
  process.exit(1);
});
