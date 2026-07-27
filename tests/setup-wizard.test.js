import { spawnSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const setupWizardPath = path.resolve(process.cwd(), 'scripts/setup-wizard.cjs');

describe('Wizard Setup Integration', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'wizard-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  test('Should generate Mongo structure without E-commerce', () => {
    spawnSync('node', [setupWizardPath], {
      cwd: tempDir,
      input: 'n\nmongo\n',
      encoding: 'utf-8'
    });

    expect(fs.existsSync(path.join(tempDir, 'src/infrastructure/persistence/mongodb'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'src/infrastructure/persistence/postgres'))).toBe(false);
    expect(fs.existsSync(path.join(tempDir, 'src/domains/ecommerce'))).toBe(false);
  });

  test('Should generate Postgres structure with E-commerce', () => {
    spawnSync('node', [setupWizardPath], {
      cwd: tempDir,
      input: 's\npostgres\n',
      encoding: 'utf-8'
    });

    expect(fs.existsSync(path.join(tempDir, 'src/infrastructure/persistence/postgres'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'src/infrastructure/persistence/mongodb'))).toBe(false);
    expect(fs.existsSync(path.join(tempDir, 'src/domains/ecommerce'))).toBe(true);
  });
});
