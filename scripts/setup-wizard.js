#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => readline.question(query, resolve));

async function copyRecursive(src, dest, filter = () => true) {
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

  const ecommerceRes = await question('¿Deseas habilitar el módulo de E-commerce? (s/n): ');
  const dbType = await question('¿Qué base de datos deseas utilizar? (mongo/postgres): ');

  const ecommerce = ecommerceRes.toLowerCase() === 's';
  const templateDir = path.join(__dirname, '../template');
  const targetDir = process.cwd();

  console.log('\nConfigurando proyecto...');

  // 1. Copiar estructura base excluyendo carpetas de persistencia no seleccionadas
  await copyRecursive(templateDir, targetDir, (srcPath) => {
    // Filtrar carpetas de infraestructura no deseadas
    if (srcPath.includes('infrastructure/persistence/')) {
      const parts = srcPath.split('persistence/');
      if (parts[1] && !parts[1].startsWith(dbType)) return false;
    }
    // Filtrar ecommerce si no se seleccionó
    if (srcPath.includes('src/domains/ecommerce') && !ecommerce) return false;
    
    return true;
  });

  // 2. Ajustar app.js dinámicamente
  const appPath = path.join(targetDir, 'src/app.js');
  let appContent = await fs.readFile(appPath, 'utf8');

  if (ecommerce) {
    appContent = appContent.replace(
      '// {{ECOMMERCE_IMPORT}}', 
      "import ecommerceRoutes from './domains/ecommerce/routes/products.routes.js';"
    );
    appContent = appContent.replace(
      '// {{ECOMMERCE_ROUTE}}', 
      "app.use('/api/ecommerce', ecommerceRoutes);"
    );
  } else {
    // Limpiar marcadores si no se eligió
    appContent = appContent.replace('// {{ECOMMERCE_IMPORT}}', '');
    appContent = appContent.replace('// {{ECOMMERCE_ROUTE}}', '');
  }

  await fs.writeFile(appPath, appContent);

  readline.close();
  console.log('\n¡Proyecto configurado exitosamente!');
}

runWizard();
