import fs from 'fs';
import path from 'path';
import { query, end } from './client';

const MIGRATIONS_DIR = path.resolve(__dirname, 'migrations');

async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id serial PRIMARY KEY,
      name varchar(255) NOT NULL UNIQUE,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const result = await query('SELECT name FROM _migrations ORDER BY id');
  return new Set(result.rows.map((r: { name: string }) => r.name));
}

async function migrate() {
  console.log('🔄 NOVAÉ Database — Running migrations...\n');

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  ✓ ${file} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    try {
      await query(sql);
      await query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      console.log(`  ✅ ${file}`);
      count++;
    } catch (err) {
      console.error(`  ❌ ${file} FAILED:`);
      console.error(err);
      process.exit(1);
    }
  }

  console.log(`\n✅ Migrations complete. ${count} new, ${files.length - count} skipped.\n`);
  await end();
}

migrate();
