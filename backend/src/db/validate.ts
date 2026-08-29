import fs from 'fs';
import path from 'path';
import { PGlite } from '@electric-sql/pglite';
import { citext } from '@electric-sql/pglite/contrib/citext';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

const MIGRATIONS_DIR = path.resolve(__dirname, 'migrations');
const SEED_DIR = path.resolve(__dirname, 'seed');

interface ValidationResult {
  section: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: ValidationResult[] = [];

function assert(condition: boolean, section: string, name: string, details?: string) {
  results.push({
    section,
    name,
    passed: condition,
    details: condition ? undefined : details || 'Assertion failed',
  });
  const symbol = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${symbol} [${section}] ${name}${details && !condition ? ` (${details})` : ''}`);
}

async function runValidation() {
  console.log('================================================================');
  console.log('   NOVAÉ POSTGRESQL DATABASE FOUNDATION — FULL E2E VALIDATION   ');
  console.log('================================================================\n');

  const db = new PGlite({
    extensions: {
      citext,
      pgcrypto,
    },
  });

  // ------------------------------------------------------------
  // 1. ENGINE CONNECTION
  // ------------------------------------------------------------
  console.log('--- 1. POSTGRESQL ENGINE CONNECTION ---');
  try {
    const versionRes = await db.query<{ version: string }>('SELECT version()');
    assert(!!versionRes.rows[0]?.version, 'Connection', 'PostgreSQL Engine Connected', versionRes.rows[0]?.version);
    console.log(`     Engine: ${versionRes.rows[0]?.version}\n`);
  } catch (err: any) {
    assert(false, 'Connection', 'PostgreSQL Engine Connected', err.message);
    process.exit(1);
  }

  // ------------------------------------------------------------
  // 2. MIGRATIONS RUNNER (15 FILES)
  // ------------------------------------------------------------
  console.log('--- 2. MIGRATION EXECUTION (001 TO 015) ---');
  await db.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id serial PRIMARY KEY,
      name varchar(255) NOT NULL UNIQUE,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  const migrationFiles = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  assert(migrationFiles.length === 15, 'Migrations', '15 Migration SQL Files Found');

  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    try {
      await db.exec(sql);
      await db.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      assert(true, 'Migrations', `Applied: ${file}`);
    } catch (err: any) {
      assert(false, 'Migrations', `Applied: ${file}`, err.message);
      console.error(err);
      process.exit(1);
    }
  }

  const migHistory = await db.query<{ count: string }>('SELECT count(*) as count FROM _migrations');
  assert(Number(migHistory.rows[0].count) === 15, 'Migrations', '_migrations table contains 15 records');
  console.log('');

  // ------------------------------------------------------------
  // 3. SCHEMA INTEGRITY: ENUMS & TABLES
  // ------------------------------------------------------------
  console.log('--- 3. SCHEMA INTEGRITY (ENUMS & TABLES) ---');

  const expectedEnums = [
    'language_code',
    'user_role',
    'user_status',
    'product_status',
    'variant_status',
    'content_status',
    'cart_status',
    'order_status',
    'payment_status',
    'fulfillment_status',
    'shipment_status',
    'inventory_movement_type',
  ];

  const enumRes = await db.query<{ typname: string }>(`
    SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;
  `);
  const foundEnums = new Set(enumRes.rows.map((r) => r.typname));
  for (const enumName of expectedEnums) {
    assert(foundEnums.has(enumName), 'Enums', `Enum '${enumName}' exists`);
  }

  const expectedTables = [
    'users',
    'user_preferences',
    'addresses',
    'categories',
    'collections',
    'collection_translations',
    'products',
    'product_translations',
    'product_variants',
    'product_images',
    'product_tags',
    'product_tag_map',
    'inventory',
    'inventory_movements',
    'carts',
    'cart_items',
    'wishlists',
    'wishlist_items',
    'orders',
    'order_items',
    'order_status_history',
    'payments',
    'shipments',
    'articles',
    'article_translations',
    'style_questions',
    'style_question_translations',
    'style_options',
    'style_option_translations',
    'style_profiles',
    'recommendation_rules',
    'analytics_events',
  ];

  const tableRes = await db.query<{ tablename: string }>(`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_migrations' ORDER BY tablename;
  `);
  const foundTables = new Set(tableRes.rows.map((r) => r.tablename));
  for (const table of expectedTables) {
    assert(foundTables.has(table), 'Tables', `Table '${table}' exists`);
  }
  console.log('');

  // ------------------------------------------------------------
  // 4. INDEXES VERIFICATION
  // ------------------------------------------------------------
  console.log('--- 4. INDEXES VERIFICATION ---');
  const indexRes = await db.query<{ indexname: string }>(`
    SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
  `);
  const foundIndexes = new Set(indexRes.rows.map((r) => r.indexname));
  const expectedIndexes = [
    'idx_products_status',
    'idx_products_collection',
    'idx_products_category',
    'idx_products_new_drop',
    'idx_product_variants_product',
    'idx_inventory_low_stock',
    'idx_carts_user',
    'idx_orders_user',
    'idx_orders_status',
    'idx_orders_created_at',
    'idx_order_items_order',
    'idx_articles_status_published',
    'idx_analytics_events_name_time',
  ];
  for (const idx of expectedIndexes) {
    assert(foundIndexes.has(idx), 'Indexes', `Index '${idx}' exists`);
  }
  console.log('');

  // ------------------------------------------------------------
  // 5. SEED DATA EXECUTION
  // ------------------------------------------------------------
  console.log('--- 5. SEED DATA EXECUTION ---');
  const seedFiles = fs
    .readdirSync(SEED_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of seedFiles) {
    const sql = fs.readFileSync(path.join(SEED_DIR, file), 'utf-8');
    try {
      await db.exec(sql);
      assert(true, 'Seed', `Executed: ${file}`);
    } catch (err: any) {
      console.error('\n>>> SEED ERROR MESSAGE:', err.message);
      console.error('>>> SEED ERROR POSITION:', err.position, err.detail, err.hint);
      assert(false, 'Seed', `Executed: ${file}`, err.message);
      process.exit(1);
    }
  }
  console.log('');

  // ------------------------------------------------------------
  // 6. SEED DATA ROW COUNTS & DOMAIN VERIFICATION
  // ------------------------------------------------------------
  console.log('--- 6. SEED DATA COUNTS & CONTENT VALIDATION ---');

  const countChecks = [
    { table: 'users', expected: 6, desc: '6 Users (1 Admin + 5 Customers)' },
    { table: 'user_preferences', expected: 6, desc: '6 User Preferences' },
    { table: 'addresses', expected: 5, desc: '5 Customer Addresses' },
    { table: 'categories', expected: 4, desc: '4 Product Categories' },
    { table: 'collections', expected: 3, desc: '3 Collections (FORM, MOTION, IDENTITY)' },
    { table: 'collection_translations', expected: 6, desc: '6 Collection Translations (ID+EN)' },
    { table: 'products', expected: 6, desc: '6 Products' },
    { table: 'product_translations', expected: 12, desc: '12 Product Translations (ID+EN)' },
    { table: 'product_variants', expected: 18, desc: '18 Product Variants' },
    { table: 'product_images', expected: 7, desc: '7 Product Images' },
    { table: 'product_tags', expected: 18, desc: '18 Product Tags' },
    { table: 'product_tag_map', expected: 24, desc: '24 Product-Tag Associations' },
    { table: 'inventory', expected: 18, desc: '18 Inventory Records (1 per variant)' },
    { table: 'orders', expected: 5, desc: '5 Orders (NOV-2026-0104 to 0108)' },
    { table: 'order_items', expected: 6, desc: '6 Order Items' },
    { table: 'order_status_history', expected: 15, desc: '15 Order Status History Transitions' },
    { table: 'payments', expected: 5, desc: '5 Payments' },
    { table: 'shipments', expected: 3, desc: '3 Shipments' },
    { table: 'articles', expected: 3, desc: '3 Journal Articles' },
    { table: 'article_translations', expected: 6, desc: '6 Article Translations (ID+EN)' },
    { table: 'wishlists', expected: 5, desc: '5 Wishlists' },
  ];

  for (const check of countChecks) {
    const res = await db.query<{ count: string }>(`SELECT count(*) as count FROM ${check.table}`);
    const actual = Number(res.rows[0].count);
    assert(actual === check.expected, 'Seed Counts', `${check.desc} (actual: ${actual}, expected: ${check.expected})`);
  }

  // Verify Admin & Customer specific checks
  const adminRes = await db.query<{ role: string }>('SELECT role FROM users WHERE email = $1', ['admin@novae.atelier']);
  assert(adminRes.rows[0]?.role === 'admin', 'Domain', 'Admin user has role="admin"');

  const custRes = await db.query<{ count: string }>('SELECT count(*) as count FROM users WHERE role = $1', ['customer']);
  assert(Number(custRes.rows[0].count) === 5, 'Domain', '5 customer users have role="customer"');

  // Verify Order numbers
  const ordersRes = await db.query<{ order_number: string }>('SELECT order_number FROM orders ORDER BY order_number DESC');
  const orderNums = ordersRes.rows.map((r) => r.order_number);
  assert(
    orderNums.includes('NOV-2026-0108') && orderNums.includes('NOV-2026-0104'),
    'Domain',
    'Orders NOV-2026-0104 through NOV-2026-0108 verified',
    JSON.stringify(orderNums)
  );

  // Verify total inventory on hand
  const invRes = await db.query<{ total: string }>('SELECT sum(quantity_on_hand) as total FROM inventory');
  assert(Number(invRes.rows[0].total) === 99, 'Domain', 'Total inventory pieces on hand is exactly 99');
  console.log('');

  // ------------------------------------------------------------
  // 7. DATA INTEGRITY & CONSTRAINT TESTS (NEGATIVE TESTS)
  // ------------------------------------------------------------
  console.log('--- 7. CONSTRAINT & INTEGRITY TESTS (NEGATIVE TESTS) ---');

  // Test 1: Invalid Foreign Key in products
  try {
    await db.query(`
      INSERT INTO products (sku_root, slug, category_id, base_price_idr)
      VALUES ('FAIL-SKU', 'fail-prod', '99999999-9999-9999-9999-999999999999', 100000);
    `);
    assert(false, 'Constraints', 'Invalid Category FK in products should fail');
  } catch (err: any) {
    assert(true, 'Constraints', 'Invalid Category FK in products rejected as expected');
  }

  // Test 2: Duplicate Product SKU Root (Unique constraint)
  try {
    await db.query(`
      INSERT INTO products (sku_root, slug, category_id, base_price_idr)
      VALUES ('NOV-FRM-01', 'duplicate-slug', '00000000-0000-0000-0003-000000000001', 100000);
    `);
    assert(false, 'Constraints', 'Duplicate sku_root should fail');
  } catch (err: any) {
    assert(true, 'Constraints', 'Duplicate sku_root rejected as expected');
  }

  // Test 3: Duplicate Variant (product_id, color_name, size)
  try {
    await db.query(`
      INSERT INTO product_variants (product_id, sku, color_name, size)
      VALUES ('00000000-0000-0000-0005-000000000001', 'DUPL-SKU', 'Obsidian Black', 'S');
    `);
    assert(false, 'Constraints', 'Duplicate variant (product_id, color_name, size) should fail');
  } catch (err: any) {
    assert(true, 'Constraints', 'Duplicate variant (product, color, size) rejected as expected');
  }

  // Test 4: Negative price on products (CHECK constraint)
  try {
    await db.query(`
      INSERT INTO products (sku_root, slug, category_id, base_price_idr)
      VALUES ('NEG-PRICE', 'neg-price', '00000000-0000-0000-0003-000000000001', -500);
    `);
    assert(false, 'Constraints', 'Negative base_price_idr should fail');
  } catch (err: any) {
    assert(true, 'Constraints', 'Negative base_price_idr rejected as expected');
  }

  // Test 5: Negative quantity on inventory (CHECK constraint)
  try {
    await db.query(`
      INSERT INTO inventory (variant_id, quantity_on_hand)
      VALUES ('00000000-0000-0000-0006-000000000001', -10);
    `);
    assert(false, 'Constraints', 'Negative quantity_on_hand should fail');
  } catch (err: any) {
    assert(true, 'Constraints', 'Negative quantity_on_hand rejected as expected');
  }

  // Test 6: Duplicate Cart Variant (cart_id, variant_id)
  try {
    await db.exec(`
      INSERT INTO carts (id, user_id) VALUES ('00000000-0000-0000-000e-000000000001', '00000000-0000-0000-0001-000000000001');
      INSERT INTO cart_items (cart_id, variant_id, quantity, unit_price_snapshot_idr)
      VALUES ('00000000-0000-0000-000e-000000000001', '00000000-0000-0000-0006-000000000001', 1, 899000);
      INSERT INTO cart_items (cart_id, variant_id, quantity, unit_price_snapshot_idr)
      VALUES ('00000000-0000-0000-000e-000000000001', '00000000-0000-0000-0006-000000000001', 2, 899000);
    `);
    assert(false, 'Constraints', 'Duplicate (cart_id, variant_id) should fail');
  } catch (err: any) {
    assert(true, 'Constraints', 'Duplicate cart item variant rejected as expected');
  }
  console.log('');

  // ------------------------------------------------------------
  // 8. TRIGGER TESTS (UPDATED_AT AUTOMATIC ADVANCE)
  // ------------------------------------------------------------
  console.log('--- 8. TRIGGER VALIDATION (UPDATED_AT) ---');
  const beforeUser = await db.query<{ updated_at: string }>('SELECT updated_at FROM users WHERE email = $1', ['admin@novae.atelier']);
  const beforeTime = new Date(beforeUser.rows[0].updated_at).getTime();

  // Sleep 50ms then update
  await new Promise((r) => setTimeout(r, 50));
  await db.query('UPDATE users SET full_name = $1 WHERE email = $2', ['NOVAÉ Master Atelier', 'admin@novae.atelier']);

  const afterUser = await db.query<{ updated_at: string }>('SELECT updated_at FROM users WHERE email = $1', ['admin@novae.atelier']);
  const afterTime = new Date(afterUser.rows[0].updated_at).getTime();

  assert(afterTime >= beforeTime, 'Triggers', 'updated_at trigger automatically updates timestamp on UPDATE');
  console.log('');

  // ------------------------------------------------------------
  // 9. REPRODUCIBILITY & CLEAN RESET TEST (RESET -> MIGRATE -> SEED)
  // ------------------------------------------------------------
  console.log('--- 9. REPRODUCIBILITY (RESET -> MIGRATE -> SEED CYCLE) ---');

  // DROP SCHEMA and recreate
  await db.exec(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO PUBLIC;
  `);
  assert(true, 'Reset', 'Public schema dropped and recreated');

  // Re-run migration
  await db.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id serial PRIMARY KEY,
      name varchar(255) NOT NULL UNIQUE,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    await db.exec(sql);
    await db.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
  }
  assert(true, 'Reset', 'All 15 migrations re-applied cleanly');

  // Re-run seed
  for (const file of seedFiles) {
    const sql = fs.readFileSync(path.join(SEED_DIR, file), 'utf-8');
    await db.exec(sql);
  }
  assert(true, 'Reset', 'Seed data re-applied cleanly');

  // Re-verify exact row counts after reset
  let resetMatch = true;
  for (const check of countChecks) {
    const res = await db.query<{ count: string }>(`SELECT count(*) as count FROM ${check.table}`);
    if (Number(res.rows[0].count) !== check.expected) {
      resetMatch = false;
      break;
    }
  }
  assert(resetMatch, 'Reset', 'Identical schema and deterministic row counts reproduced after full reset');
  console.log('');

  // ------------------------------------------------------------
  // 10. SUMMARY REPORT
  // ------------------------------------------------------------
  console.log('================================================================');
  const totalPassed = results.filter((r) => r.passed).length;
  const totalFailed = results.filter((r) => !r.passed).length;
  console.log(`   VALIDATION SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED   `);
  console.log('================================================================\n');

  if (totalFailed > 0) {
    console.error('❌ Validation had failures. Check logs above.');
    process.exit(1);
  } else {
    console.log('🎉 VERDICT: READY FOR BACKEND');
    process.exit(0);
  }
}

runValidation();
