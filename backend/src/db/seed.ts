import fs from 'fs';
import path from 'path';
import { query, end } from './client';

const SEED_DIR = path.resolve(__dirname, 'seed');

async function seed() {
  console.log('🌱 NOVAÉ Database — Running seed data...\n');

  const files = fs
    .readdirSync(SEED_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(SEED_DIR, file), 'utf-8');
    try {
      await query(sql);
      console.log(`  ✅ ${file}`);
    } catch (err) {
      console.error(`  ❌ ${file} FAILED:`);
      console.error(err);
      process.exit(1);
    }
  }

  console.log(`\n✅ Seed complete. ${files.length} files applied.\n`);
  await end();
}

seed();
