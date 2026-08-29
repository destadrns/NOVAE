import { query, end } from './client';
import { execSync } from 'child_process';
import path from 'path';

async function reset() {
  console.log('🗑️  NOVAÉ Database — Full reset...\n');

  try {
    await query('DROP SCHEMA public CASCADE;');
    await query('CREATE SCHEMA public;');
    await query('GRANT ALL ON SCHEMA public TO PUBLIC;');
    console.log('  ✅ Schema dropped and recreated.\n');
  } catch (err) {
    console.error('  ❌ Schema reset failed:', err);
    process.exit(1);
  }

  await end();

  const cwd = path.resolve(__dirname, '../..');

  // Run migrate then seed via child processes
  console.log('--- Running migrations ---');
  execSync('npx tsx src/db/migrate.ts', { stdio: 'inherit', cwd });

  console.log('--- Running seed ---');
  execSync('npx tsx src/db/seed.ts', { stdio: 'inherit', cwd });

  console.log('\n🎉 NOVAÉ Database reset complete.\n');
}

reset();
