const { spawnSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

describe('Wizard Setup Integration', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'wizard-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  test('Should generate Mongo structure without E-commerce', () => {
    const result = spawnSync('node', [path.join(__dirname, '../scripts/setup-wizard.js')], {
      cwd: tempDir,
      input: 'n\nmongo\n', // Entradas: ecommerce=n, db=mongo
      encoding: 'utf-8'
    });

    expect(fs.existsSync(path.join(tempDir, 'infrastructure/persistence/mongodb'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'infrastructure/persistence/postgres'))).toBe(false);
    expect(fs.existsSync(path.join(tempDir, 'src/domains/ecommerce'))).toBe(false);
  });

  test('Should generate Postgres structure with E-commerce', () => {
    const result = spawnSync('node', [path.join(__dirname, '../scripts/setup-wizard.js')], {
      cwd: tempDir,
      input: 's\npostgres\n', // Entradas: ecommerce=s, db=postgres
      encoding: 'utf-8'
    });

    expect(fs.existsSync(path.join(tempDir, 'infrastructure/persistence/postgres'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'infrastructure/persistence/mongodb'))).toBe(false);
    expect(fs.existsSync(path.join(tempDir, 'src/domains/ecommerce'))).toBe(true);
  });
});
