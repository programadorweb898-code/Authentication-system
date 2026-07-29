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

  test('Should generate Mongo-only configuration', async () => {
    spawnSync('node', [setupWizardPath], {
      cwd: tempDir,
      input: 'n\n1\nmongo\n',
      encoding: 'utf-8'
    });

    const dbContent = await fs.readFile(path.join(tempDir, 'config/db.js'), 'utf8');
    const envContent = await fs.readFile(path.join(tempDir, '.env.example'), 'utf8');

    expect(dbContent).toContain('mongoose.connect');
    expect(dbContent).not.toContain('pg.Pool');
    expect(envContent).toContain('DB_TYPE=mongo');
    expect(envContent).toContain('MONGO_URI');
    expect(envContent).not.toContain('DATABASE_URL');
  });

  test('Should generate Postgres-only configuration', async () => {
    spawnSync('node', [setupWizardPath], {
      cwd: tempDir,
      input: 'n\n1\npostgres\n',
      encoding: 'utf-8'
    });

    const dbContent = await fs.readFile(path.join(tempDir, 'config/db.js'), 'utf8');
    const envContent = await fs.readFile(path.join(tempDir, '.env.example'), 'utf8');

    expect(dbContent).toContain('pg.Pool');
    expect(dbContent).not.toContain('mongoose.connect');
    expect(envContent).toContain('DB_TYPE=postgres');
    expect(envContent).toContain('DATABASE_URL');
    expect(envContent).not.toContain('MONGO_URI');
  });

  test('Should generate Both-database configuration', async () => {
    spawnSync('node', [setupWizardPath], {
      cwd: tempDir,
      input: 'n\n2\n',
      encoding: 'utf-8'
    });

    const dbContent = await fs.readFile(path.join(tempDir, 'config/db.js'), 'utf8');
    const envContent = await fs.readFile(path.join(tempDir, '.env.example'), 'utf8');

    expect(dbContent).toContain('mongoose.connect');
    expect(dbContent).toContain('pg.Pool');
    expect(envContent).toContain('DB_TYPE=both');
    expect(envContent).toContain('MONGO_URI');
    expect(envContent).toContain('DATABASE_URL');
  });
});
