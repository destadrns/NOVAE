-- NOVAÉ Seed Data
-- Deterministic RFC 4122 hexadecimal UUIDs matching admin mock data
-- Per NOVAE_DATABASE_SCHEMA.md §26

BEGIN;

-- ============================================================
-- USERS (1 admin + 5 customers)
-- ============================================================

INSERT INTO users (id, email, full_name, role, status, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@novae.atelier', 'NOVAÉ Admin', 'admin', 'active', '2026-01-01T00:00:00Z'),
  ('00000000-0000-0000-0001-000000000001', 'aria.wirasasmita@example.com', 'Aria Wirasasmita', 'customer', 'active', '2026-06-12T00:00:00Z'),
  ('00000000-0000-0000-0001-000000000002', 'dimas.prasetyo@atelier.id', 'Dimas Prasetyo', 'customer', 'active', '2026-07-04T00:00:00Z'),
  ('00000000-0000-0000-0001-000000000003', 'nadia.s@studio.co.id', 'Nadia Sastrowardoyo', 'customer', 'active', '2026-07-19T00:00:00Z'),
  ('00000000-0000-0000-0001-000000000004', 'reza.rahardian@creative.id', 'Reza Rahardian', 'customer', 'active', '2026-05-30T00:00:00Z'),
  ('00000000-0000-0000-0001-000000000005', 'clarissa.t@arch.com', 'Clarissa Tanoe', 'customer', 'active', '2026-08-20T00:00:00Z');

INSERT INTO user_preferences (user_id, language) VALUES
  ('00000000-0000-0000-0000-000000000001', 'id'),
  ('00000000-0000-0000-0001-000000000001', 'id'),
  ('00000000-0000-0000-0001-000000000002', 'id'),
  ('00000000-0000-0000-0001-000000000003', 'en'),
  ('00000000-0000-0000-0001-000000000004', 'id'),
  ('00000000-0000-0000-0001-000000000005', 'en');

-- ============================================================
-- ADDRESSES (1 per customer matching mock order shipping)
-- ============================================================

INSERT INTO addresses (id, user_id, label, recipient_name, phone, address_line1, city, province, postal_code, country_code, is_default) VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', 'Rumah', 'Aria Wirasasmita', '+62 812-3456-7890', 'Jl. Senopati No. 42, Kebayoran Baru', 'Jakarta Selatan', 'DKI Jakarta', '12190', 'ID', true),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000002', 'Rumah', 'Dimas Prasetyo', '+62 811-9988-7766', 'Jl. Dago Asri No. 18, Coblong', 'Bandung', 'Jawa Barat', '40135', 'ID', true),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000003', 'Kantor', 'Nadia Sastrowardoyo', '+62 813-2233-4455', 'Jl. Raya Darmo Permai III No. 8, Dukuh Pakis', 'Surabaya', 'Jawa Timur', '60226', 'ID', true),
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000004', 'Villa', 'Reza Rahardian', '+62 817-4455-6677', 'Jl. Pantai Batu Bolong No. 55, Canggu, Kuta Utara, Badung', 'Denpasar', 'Bali', '80351', 'ID', true),
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000005', 'Rumah', 'Clarissa Tanoe', '+62 819-0011-2233', 'Jl. Teuku Umar No. 12, Menteng', 'Jakarta Pusat', 'DKI Jakarta', '10350', 'ID', true);

-- ============================================================
-- CATEGORIES
-- ============================================================

INSERT INTO categories (id, slug, name, sort_order) VALUES
  ('00000000-0000-0000-0003-000000000001', 'outerwear', 'Outerwear', 1),
  ('00000000-0000-0000-0003-000000000002', 'tops', 'Tops', 2),
  ('00000000-0000-0000-0003-000000000003', 'bottoms', 'Bottoms', 3),
  ('00000000-0000-0000-0003-000000000004', 'accessories', 'Accessories', 4);

-- ============================================================
-- COLLECTIONS
-- ============================================================

INSERT INTO collections (id, code, slug, name, status, sort_order) VALUES
  ('00000000-0000-0000-0004-000000000001', 'FORM', 'form', 'FORM', 'published', 1),
  ('00000000-0000-0000-0004-000000000002', 'MOTION', 'motion', 'MOTION', 'published', 2),
  ('00000000-0000-0000-0004-000000000003', 'IDENTITY', 'identity', 'IDENTITY', 'published', 3);

INSERT INTO collection_translations (collection_id, language, name, description) VALUES
  ('00000000-0000-0000-0004-000000000001', 'id', 'FORM', 'Koleksi yang mengeksplorasi struktur dan proporsi arsitektural dalam fashion.'),
  ('00000000-0000-0000-0004-000000000001', 'en', 'FORM', 'A collection exploring architectural structure and proportion in fashion.'),
  ('00000000-0000-0000-0004-000000000002', 'id', 'MOTION', 'Koleksi yang merayakan gerakan, aliran, dan kebebasan berekspresi.'),
  ('00000000-0000-0000-0004-000000000002', 'en', 'MOTION', 'A collection celebrating movement, flow, and freedom of expression.'),
  ('00000000-0000-0000-0004-000000000003', 'id', 'IDENTITY', 'Koleksi yang mendefinisikan identitas personal melalui estetika brutalis.'),
  ('00000000-0000-0000-0004-000000000003', 'en', 'IDENTITY', 'A collection defining personal identity through brutalist aesthetics.');

-- ============================================================
-- PRODUCTS (6 products matching admin mockData.ts)
-- ============================================================

INSERT INTO products (id, sku_root, slug, category_id, collection_id, base_price_idr, status, featured, is_new_drop, primary_image_url, created_at) VALUES
  ('00000000-0000-0000-0005-000000000001', 'NOV-FRM-01', 'oversized-form-jacket', '00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0004-000000000001', 899000, 'active', true, true, 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop', '2026-08-01T10:00:00Z'),
  ('00000000-0000-0000-0005-000000000002', 'NOV-FRM-02', 'sculpted-tailored-trouser', '00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0004-000000000001', 649000, 'active', true, true, 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=800&auto=format&fit=crop', '2026-08-05T11:30:00Z'),
  ('00000000-0000-0000-0005-000000000003', 'NOV-MOT-03', 'fluid-motion-kimono-shirt', '00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0004-000000000002', 589000, 'active', true, false, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop', '2026-08-10T09:15:00Z'),
  ('00000000-0000-0000-0005-000000000004', 'NOV-IDN-04', 'identity-raw-trench-coat', '00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0004-000000000003', 1199000, 'active', true, true, 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop', '2026-08-12T14:20:00Z'),
  ('00000000-0000-0000-0005-000000000005', 'NOV-IDN-05', 'minimal-boxy-hoodie', '00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0004-000000000003', 499000, 'active', false, false, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop', '2026-08-15T16:00:00Z'),
  ('00000000-0000-0000-0005-000000000006', 'NOV-MOT-06', 'atelier-modular-tote', '00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0004-000000000002', 349000, 'active', false, false, 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop', '2026-08-18T12:00:00Z');

-- ============================================================
-- PRODUCT TRANSLATIONS (ID + EN for each product)
-- ============================================================

INSERT INTO product_translations (product_id, language, name, short_description, description, material_description, provenance_text) VALUES
  -- Oversized Form Jacket
  ('00000000-0000-0000-0005-000000000001', 'en', 'OVERSIZED FORM JACKET', 'Architectural boxy silhouette in structured double-face technical wool.', 'The cornerstone of our FORM series. Engineered with dropped shoulders, an asymmetric concealed storm flap, and a crisp, heavyweight drape.', '70% Italian Recycled Wool, 30% Tech Polyamide', 'Bandung Atelier'),
  ('00000000-0000-0000-0005-000000000001', 'id', 'OVERSIZED FORM JACKET', 'Siluet boxy arsitektural dalam wol teknis double-face terstruktur.', 'Fondasi dari seri FORM kami. Dirancang dengan bahu jatuh, storm flap asimetris tersembunyi, dan drape berbobot tegas.', '70% Wol Daur Ulang Italia, 30% Poliamida Teknis', 'Atelier Bandung'),

  -- Sculpted Tailored Trouser
  ('00000000-0000-0000-0005-000000000002', 'en', 'SCULPTED TAILORED TROUSER', 'Deep front pleats transitioning into a fluid, wide-leg profile.', 'Precision-tailored trousers balancing bespoke proportion with brutalist lines.', '100% High-Density Tencel Twill', 'Bandung Atelier'),
  ('00000000-0000-0000-0005-000000000002', 'id', 'SCULPTED TAILORED TROUSER', 'Lipit depan dalam yang bertransisi menjadi profil kaki lebar yang mengalir.', 'Celana dengan presisi tailoring yang menyeimbangkan proporsi bespoke dengan garis brutalis.', '100% Tencel Twill Densitas Tinggi', 'Atelier Bandung'),

  -- Fluid Motion Kimono Shirt
  ('00000000-0000-0000-0005-000000000003', 'en', 'FLUID MOTION KIMONO SHIRT', 'Dynamic cross-over closure designed for unrestricted flow.', 'Constructed from lightweight sand-washed cupro that catches wind with natural grace.', '100% Sandwashed Eco-Cupro', 'Jakarta Studio'),
  ('00000000-0000-0000-0005-000000000003', 'id', 'FLUID MOTION KIMONO SHIRT', 'Penutupan cross-over dinamis yang dirancang untuk aliran tanpa batas.', 'Dibuat dari cupro cuci pasir ringan yang menangkap angin dengan keanggunan alami.', '100% Eco-Cupro Cuci Pasir', 'Studio Jakarta'),

  -- Identity Raw Trench Coat
  ('00000000-0000-0000-0005-000000000004', 'en', 'IDENTITY RAW TRENCH COAT', 'Unlined storm-proof cotton canvas with raw cut-edge finishing.', 'An unapologetic statement piece with exaggerated collar and magnetic belt fastening.', 'Japanese Waterproof Gabardine Cotton', 'Bandung Atelier // Numbered Edition'),
  ('00000000-0000-0000-0005-000000000004', 'id', 'IDENTITY RAW TRENCH COAT', 'Kanvas katun anti-badai tanpa lapisan dengan finishing tepi potong mentah.', 'Sebuah statement piece tanpa kompromi dengan kerah berlebih dan pengencang sabuk magnetik.', 'Katun Gabardine Tahan Air Jepang', 'Atelier Bandung // Edisi Bernomor'),

  -- Minimal Boxy Hoodie
  ('00000000-0000-0000-0005-000000000005', 'en', 'MINIMAL BOXY HOODIE', 'Heavyweight 500 GSM organic French terry with zero external branding.', 'Clean architectural geometry in heavyweight pure luxury cotton.', '100% GOTS Organic Cotton (500 GSM)', 'Bandung Atelier'),
  ('00000000-0000-0000-0005-000000000005', 'id', 'MINIMAL BOXY HOODIE', 'French terry organik berat 500 GSM tanpa branding eksternal.', 'Geometri arsitektural bersih dalam katun mewah murni berbobot berat.', '100% Katun Organik GOTS (500 GSM)', 'Atelier Bandung'),

  -- Atelier Modular Tote
  ('00000000-0000-0000-0005-000000000006', 'en', 'ATELIER MODULAR TOTE', 'High-durability brutalist accessory with ballistic nylon reinforcement.', 'Engineered for daily urban utility with padded internal laptop sleeve.', '24oz Industrial Cotton Canvas & Matte Black Hardware', 'Jakarta Studio'),
  ('00000000-0000-0000-0005-000000000006', 'id', 'ATELIER MODULAR TOTE', 'Aksesori brutalis berdaya tahan tinggi dengan penguatan nilon balistik.', 'Dirancang untuk utilitas urban harian dengan sleeve laptop internal berlapis.', 'Kanvas Katun Industri 24oz & Hardware Hitam Matte', 'Studio Jakarta');

-- ============================================================
-- PRODUCT VARIANTS (matching admin mock SKUs)
-- ============================================================

INSERT INTO product_variants (id, product_id, sku, color_name, color_code, size, status) VALUES
  -- Oversized Form Jacket (4 variants)
  ('00000000-0000-0000-0006-000000000001', '00000000-0000-0000-0005-000000000001', 'NOV-FRM-01-BLK-S', 'Obsidian Black', '#0A0A0A', 'S', 'active'),
  ('00000000-0000-0000-0006-000000000002', '00000000-0000-0000-0005-000000000001', 'NOV-FRM-01-BLK-M', 'Obsidian Black', '#0A0A0A', 'M', 'active'),
  ('00000000-0000-0000-0006-000000000003', '00000000-0000-0000-0005-000000000001', 'NOV-FRM-01-BLK-L', 'Obsidian Black', '#0A0A0A', 'L', 'active'),
  ('00000000-0000-0000-0006-000000000004', '00000000-0000-0000-0005-000000000001', 'NOV-FRM-01-BLK-XL', 'Obsidian Black', '#0A0A0A', 'XL', 'active'),
  -- Sculpted Tailored Trouser (4 variants)
  ('00000000-0000-0000-0006-000000000005', '00000000-0000-0000-0005-000000000002', 'NOV-FRM-02-BLK-28', 'Obsidian Black', '#0A0A0A', '28', 'active'),
  ('00000000-0000-0000-0006-000000000006', '00000000-0000-0000-0005-000000000002', 'NOV-FRM-02-BLK-30', 'Obsidian Black', '#0A0A0A', '30', 'active'),
  ('00000000-0000-0000-0006-000000000007', '00000000-0000-0000-0005-000000000002', 'NOV-FRM-02-BLK-32', 'Obsidian Black', '#0A0A0A', '32', 'active'),
  ('00000000-0000-0000-0006-000000000008', '00000000-0000-0000-0005-000000000002', 'NOV-FRM-02-BLK-34', 'Obsidian Black', '#0A0A0A', '34', 'active'),
  -- Fluid Motion Kimono Shirt (3 variants)
  ('00000000-0000-0000-0006-000000000009', '00000000-0000-0000-0005-000000000003', 'NOV-MOT-03-BNE-S', 'Bone Off-White', '#F5F3EF', 'S', 'active'),
  ('00000000-0000-0000-0006-000000000010', '00000000-0000-0000-0005-000000000003', 'NOV-MOT-03-BNE-M', 'Bone Off-White', '#F5F3EF', 'M', 'active'),
  ('00000000-0000-0000-0006-000000000011', '00000000-0000-0000-0005-000000000003', 'NOV-MOT-03-BNE-L', 'Bone Off-White', '#F5F3EF', 'L', 'active'),
  -- Identity Raw Trench Coat (2 variants)
  ('00000000-0000-0000-0006-000000000012', '00000000-0000-0000-0005-000000000004', 'NOV-IDN-04-BLK-M', 'Obsidian Black', '#0A0A0A', 'M', 'active'),
  ('00000000-0000-0000-0006-000000000013', '00000000-0000-0000-0005-000000000004', 'NOV-IDN-04-BLK-L', 'Obsidian Black', '#0A0A0A', 'L', 'active'),
  -- Minimal Boxy Hoodie (4 variants)
  ('00000000-0000-0000-0006-000000000014', '00000000-0000-0000-0005-000000000005', 'NOV-IDN-05-BLK-S', 'Obsidian Black', '#0A0A0A', 'S', 'active'),
  ('00000000-0000-0000-0006-000000000015', '00000000-0000-0000-0005-000000000005', 'NOV-IDN-05-BLK-M', 'Obsidian Black', '#0A0A0A', 'M', 'active'),
  ('00000000-0000-0000-0006-000000000016', '00000000-0000-0000-0005-000000000005', 'NOV-IDN-05-BLK-L', 'Obsidian Black', '#0A0A0A', 'L', 'active'),
  ('00000000-0000-0000-0006-000000000017', '00000000-0000-0000-0005-000000000005', 'NOV-IDN-05-BLK-XL', 'Obsidian Black', '#0A0A0A', 'XL', 'active'),
  -- Atelier Modular Tote (1 variant)
  ('00000000-0000-0000-0006-000000000018', '00000000-0000-0000-0005-000000000006', 'NOV-MOT-06-BLK-OS', 'Obsidian Black', '#0A0A0A', 'ONE SIZE', 'active');

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES
  ('00000000-0000-0000-0007-000000000001', '00000000-0000-0000-0005-000000000001', 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop', 'Oversized Form Jacket — Front', 0, true),
  ('00000000-0000-0000-0007-000000000002', '00000000-0000-0000-0005-000000000001', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop', 'Oversized Form Jacket — Back', 1, false),
  ('00000000-0000-0000-0007-000000000003', '00000000-0000-0000-0005-000000000002', 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=800&auto=format&fit=crop', 'Sculpted Tailored Trouser', 0, true),
  ('00000000-0000-0000-0007-000000000004', '00000000-0000-0000-0005-000000000003', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop', 'Fluid Motion Kimono Shirt', 0, true),
  ('00000000-0000-0000-0007-000000000005', '00000000-0000-0000-0005-000000000004', 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop', 'Identity Raw Trench Coat', 0, true),
  ('00000000-0000-0000-0007-000000000006', '00000000-0000-0000-0005-000000000005', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop', 'Minimal Boxy Hoodie', 0, true),
  ('00000000-0000-0000-0007-000000000007', '00000000-0000-0000-0005-000000000006', 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop', 'Atelier Modular Tote', 0, true);

-- ============================================================
-- PRODUCT TAGS
-- ============================================================

INSERT INTO product_tags (id, name) VALUES
  ('00000000-0000-0000-0008-000000000001', 'minimal'),
  ('00000000-0000-0000-0008-000000000002', 'oversized'),
  ('00000000-0000-0000-0008-000000000003', 'structured'),
  ('00000000-0000-0000-0008-000000000004', 'monochrome'),
  ('00000000-0000-0000-0008-000000000005', 'outerwear'),
  ('00000000-0000-0000-0008-000000000006', 'classic'),
  ('00000000-0000-0000-0008-000000000007', 'bottoms'),
  ('00000000-0000-0000-0008-000000000008', 'relaxed'),
  ('00000000-0000-0000-0008-000000000009', 'flow'),
  ('00000000-0000-0000-0008-000000000010', 'avant-garde'),
  ('00000000-0000-0000-0008-000000000011', 'tops'),
  ('00000000-0000-0000-0008-000000000012', 'trench'),
  ('00000000-0000-0000-0008-000000000013', 'waterproof'),
  ('00000000-0000-0000-0008-000000000014', 'street'),
  ('00000000-0000-0000-0008-000000000015', 'heavyweight'),
  ('00000000-0000-0000-0008-000000000016', 'accessories'),
  ('00000000-0000-0000-0008-000000000017', 'utility'),
  ('00000000-0000-0000-0008-000000000018', 'tote');

INSERT INTO product_tag_map (product_id, tag_id) VALUES
  -- Oversized Form Jacket: minimal, oversized, structured, monochrome, outerwear
  ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0008-000000000001'),
  ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0008-000000000002'),
  ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0008-000000000003'),
  ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0008-000000000004'),
  ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0008-000000000005'),
  -- Sculpted Tailored Trouser: minimal, structured, classic, bottoms
  ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0008-000000000001'),
  ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0008-000000000003'),
  ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0008-000000000006'),
  ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0008-000000000007'),
  -- Fluid Motion Kimono Shirt: relaxed, flow, avant-garde, tops
  ('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0008-000000000008'),
  ('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0008-000000000009'),
  ('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0008-000000000010'),
  ('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0008-000000000011'),
  -- Identity Raw Trench Coat: avant-garde, trench, waterproof, outerwear
  ('00000000-0000-0000-0005-000000000004', '00000000-0000-0000-0008-000000000010'),
  ('00000000-0000-0000-0005-000000000004', '00000000-0000-0000-0008-000000000012'),
  ('00000000-0000-0000-0005-000000000004', '00000000-0000-0000-0008-000000000013'),
  ('00000000-0000-0000-0005-000000000004', '00000000-0000-0000-0008-000000000005'),
  -- Minimal Boxy Hoodie: street, minimal, heavyweight, tops
  ('00000000-0000-0000-0005-000000000005', '00000000-0000-0000-0008-000000000014'),
  ('00000000-0000-0000-0005-000000000005', '00000000-0000-0000-0008-000000000001'),
  ('00000000-0000-0000-0005-000000000005', '00000000-0000-0000-0008-000000000015'),
  ('00000000-0000-0000-0005-000000000005', '00000000-0000-0000-0008-000000000011'),
  -- Atelier Modular Tote: accessories, utility, tote
  ('00000000-0000-0000-0005-000000000006', '00000000-0000-0000-0008-000000000016'),
  ('00000000-0000-0000-0005-000000000006', '00000000-0000-0000-0008-000000000017'),
  ('00000000-0000-0000-0005-000000000006', '00000000-0000-0000-0008-000000000018');

-- ============================================================
-- INVENTORY (matching mock data stock levels)
-- ============================================================

INSERT INTO inventory (variant_id, quantity_on_hand, reserved_quantity, low_stock_threshold) VALUES
  ('00000000-0000-0000-0006-000000000001', 4, 1, 3),   -- Form Jacket S
  ('00000000-0000-0000-0006-000000000002', 8, 2, 3),   -- Form Jacket M
  ('00000000-0000-0000-0006-000000000003', 2, 1, 3),   -- Form Jacket L
  ('00000000-0000-0000-0006-000000000004', 10, 0, 3),  -- Form Jacket XL
  ('00000000-0000-0000-0006-000000000005', 2, 0, 3),   -- Trouser 28
  ('00000000-0000-0000-0006-000000000006', 6, 1, 3),   -- Trouser 30
  ('00000000-0000-0000-0006-000000000007', 7, 0, 3),   -- Trouser 32
  ('00000000-0000-0000-0006-000000000008', 3, 0, 3),   -- Trouser 34
  ('00000000-0000-0000-0006-000000000009', 3, 0, 3),   -- Kimono S
  ('00000000-0000-0000-0006-000000000010', 8, 0, 3),  -- Kimono M
  ('00000000-0000-0000-0006-000000000011', 4, 0, 3),   -- Kimono L
  ('00000000-0000-0000-0006-000000000012', 5, 0, 2),   -- Trench M
  ('00000000-0000-0000-0006-000000000013', 3, 1, 2),   -- Trench L (low stock)
  ('00000000-0000-0000-0006-000000000014', 4, 0, 3),   -- Hoodie S
  ('00000000-0000-0000-0006-000000000015', 9, 0, 3),   -- Hoodie M
  ('00000000-0000-0000-0006-000000000016', 7, 0, 3),   -- Hoodie L
  ('00000000-0000-0000-0006-000000000017', 2, 0, 3),   -- Hoodie XL
  ('00000000-0000-0000-0006-000000000018', 12, 0, 4);  -- Tote OS

-- ============================================================
-- ORDERS (5 orders matching admin mockData.ts)
-- ============================================================

-- Order 1: Aria — NOV-2026-0108 — PAID
INSERT INTO orders (id, order_number, user_id, customer_email, status, payment_status, fulfillment_status, subtotal_idr, shipping_idr, total_idr, shipping_address_snapshot, placed_at, created_at) VALUES
  ('00000000-0000-0000-0009-000000000001', 'NOV-2026-0108', '00000000-0000-0000-0001-000000000001', 'aria.wirasasmita@example.com', 'paid', 'paid', 'unfulfilled',
   1548000, 0, 1548000,
   '{"name":"Aria Wirasasmita","phone":"+62 812-3456-7890","address":"Jl. Senopati No. 42, Kebayoran Baru","city":"Jakarta Selatan","province":"DKI Jakarta","postal_code":"12190","country":"ID"}',
   '2026-08-29T08:45:00Z', '2026-08-29T08:45:00Z');

INSERT INTO order_items (order_id, product_id, variant_id, product_name_snapshot, sku_snapshot, color_snapshot, size_snapshot, unit_price_idr, quantity, line_total_idr) VALUES
  ('00000000-0000-0000-0009-000000000001', '00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0006-000000000003', 'OVERSIZED FORM JACKET', 'NOV-FRM-01-BLK-L', 'Obsidian Black', 'L', 899000, 1, 899000),
  ('00000000-0000-0000-0009-000000000001', '00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0006-000000000007', 'SCULPTED TAILORED TROUSER', 'NOV-FRM-02-BLK-32', 'Obsidian Black', '32', 649000, 1, 649000);

-- Order 2: Dimas — NOV-2026-0107 — PROCESSING
INSERT INTO orders (id, order_number, user_id, customer_email, status, payment_status, fulfillment_status, subtotal_idr, shipping_idr, total_idr, shipping_address_snapshot, placed_at, created_at) VALUES
  ('00000000-0000-0000-0009-000000000002', 'NOV-2026-0107', '00000000-0000-0000-0001-000000000002', 'dimas.prasetyo@atelier.id', 'processing', 'paid', 'processing',
   1199000, 0, 1199000,
   '{"name":"Dimas Prasetyo","phone":"+62 811-9988-7766","address":"Jl. Dago Asri No. 18, Coblong","city":"Bandung","province":"Jawa Barat","postal_code":"40135","country":"ID"}',
   '2026-08-29T07:20:00Z', '2026-08-29T07:20:00Z');

INSERT INTO order_items (order_id, product_id, variant_id, product_name_snapshot, sku_snapshot, color_snapshot, size_snapshot, unit_price_idr, quantity, line_total_idr) VALUES
  ('00000000-0000-0000-0009-000000000002', '00000000-0000-0000-0005-000000000004', '00000000-0000-0000-0006-000000000012', 'IDENTITY RAW TRENCH COAT', 'NOV-IDN-04-BLK-M', 'Obsidian Black', 'M', 1199000, 1, 1199000);

-- Order 3: Nadia — NOV-2026-0106 — SHIPPED
INSERT INTO orders (id, order_number, user_id, customer_email, status, payment_status, fulfillment_status, subtotal_idr, shipping_idr, total_idr, shipping_address_snapshot, placed_at, created_at) VALUES
  ('00000000-0000-0000-0009-000000000003', 'NOV-2026-0106', '00000000-0000-0000-0001-000000000003', 'nadia.s@studio.co.id', 'shipped', 'paid', 'fulfilled',
   589000, 35000, 624000,
   '{"name":"Nadia Sastrowardoyo","phone":"+62 813-2233-4455","address":"Jl. Raya Darmo Permai III No. 8, Dukuh Pakis","city":"Surabaya","province":"Jawa Timur","postal_code":"60226","country":"ID"}',
   '2026-08-28T16:10:00Z', '2026-08-28T16:10:00Z');

INSERT INTO order_items (order_id, product_id, variant_id, product_name_snapshot, sku_snapshot, color_snapshot, size_snapshot, unit_price_idr, quantity, line_total_idr) VALUES
  ('00000000-0000-0000-0009-000000000003', '00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0006-000000000010', 'FLUID MOTION KIMONO SHIRT', 'NOV-MOT-03-BNE-M', 'Bone Off-White', 'M', 589000, 1, 589000);

-- Order 4: Reza — NOV-2026-0105 — DELIVERED
INSERT INTO orders (id, order_number, user_id, customer_email, status, payment_status, fulfillment_status, subtotal_idr, shipping_idr, total_idr, shipping_address_snapshot, placed_at, created_at) VALUES
  ('00000000-0000-0000-0009-000000000004', 'NOV-2026-0105', '00000000-0000-0000-0001-000000000004', 'reza.rahardian@creative.id', 'delivered', 'paid', 'fulfilled',
   998000, 0, 998000,
   '{"name":"Reza Rahardian","phone":"+62 817-4455-6677","address":"Jl. Pantai Batu Bolong No. 55, Canggu, Kuta Utara, Badung","city":"Denpasar","province":"Bali","postal_code":"80351","country":"ID"}',
   '2026-08-27T11:05:00Z', '2026-08-27T11:05:00Z');

INSERT INTO order_items (order_id, product_id, variant_id, product_name_snapshot, sku_snapshot, color_snapshot, size_snapshot, unit_price_idr, quantity, line_total_idr) VALUES
  ('00000000-0000-0000-0009-000000000004', '00000000-0000-0000-0005-000000000005', '00000000-0000-0000-0006-000000000016', 'MINIMAL BOXY HOODIE', 'NOV-IDN-05-BLK-L', 'Obsidian Black', 'L', 499000, 2, 998000);

-- Order 5: Clarissa — NOV-2026-0104 — PENDING
INSERT INTO orders (id, order_number, user_id, customer_email, status, payment_status, fulfillment_status, subtotal_idr, shipping_idr, total_idr, shipping_address_snapshot, placed_at, created_at) VALUES
  ('00000000-0000-0000-0009-000000000005', 'NOV-2026-0104', '00000000-0000-0000-0001-000000000005', 'clarissa.t@arch.com', 'pending', 'pending', 'unfulfilled',
   349000, 25000, 374000,
   '{"name":"Clarissa Tanoe","phone":"+62 819-0011-2233","address":"Jl. Teuku Umar No. 12, Menteng","city":"Jakarta Pusat","province":"DKI Jakarta","postal_code":"10350","country":"ID"}',
   '2026-08-29T09:00:00Z', '2026-08-29T09:00:00Z');

INSERT INTO order_items (order_id, product_id, variant_id, product_name_snapshot, sku_snapshot, color_snapshot, size_snapshot, unit_price_idr, quantity, line_total_idr) VALUES
  ('00000000-0000-0000-0009-000000000005', '00000000-0000-0000-0005-000000000006', '00000000-0000-0000-0006-000000000018', 'ATELIER MODULAR TOTE', 'NOV-MOT-06-BLK-OS', 'Obsidian Black', 'ONE SIZE', 349000, 1, 349000);

-- ============================================================
-- ORDER STATUS HISTORY
-- ============================================================

INSERT INTO order_status_history (order_id, from_status, to_status, note, changed_by, created_at) VALUES
  ('00000000-0000-0000-0009-000000000001', NULL, 'pending', 'Order placed', NULL, '2026-08-29T08:45:00Z'),
  ('00000000-0000-0000-0009-000000000001', 'pending', 'paid', 'Payment confirmed via VA BCA', '00000000-0000-0000-0000-000000000001', '2026-08-29T08:50:00Z'),
  ('00000000-0000-0000-0009-000000000002', NULL, 'pending', 'Order placed', NULL, '2026-08-29T07:20:00Z'),
  ('00000000-0000-0000-0009-000000000002', 'pending', 'paid', 'Payment confirmed via QRIS', '00000000-0000-0000-0000-000000000001', '2026-08-29T07:25:00Z'),
  ('00000000-0000-0000-0009-000000000002', 'paid', 'processing', 'Processing started', '00000000-0000-0000-0000-000000000001', '2026-08-29T07:30:00Z'),
  ('00000000-0000-0000-0009-000000000003', NULL, 'pending', 'Order placed', NULL, '2026-08-28T16:10:00Z'),
  ('00000000-0000-0000-0009-000000000003', 'pending', 'paid', 'Payment confirmed via Credit Card', NULL, '2026-08-28T16:12:00Z'),
  ('00000000-0000-0000-0009-000000000003', 'paid', 'processing', 'Processing', '00000000-0000-0000-0000-000000000001', '2026-08-28T17:00:00Z'),
  ('00000000-0000-0000-0009-000000000003', 'processing', 'shipped', 'Shipped via SiCepat BEST', '00000000-0000-0000-0000-000000000001', '2026-08-28T20:00:00Z'),
  ('00000000-0000-0000-0009-000000000004', NULL, 'pending', 'Order placed', NULL, '2026-08-27T11:05:00Z'),
  ('00000000-0000-0000-0009-000000000004', 'pending', 'paid', 'Payment confirmed via VA BCA', NULL, '2026-08-27T11:10:00Z'),
  ('00000000-0000-0000-0009-000000000004', 'paid', 'processing', 'Processing', '00000000-0000-0000-0000-000000000001', '2026-08-27T12:00:00Z'),
  ('00000000-0000-0000-0009-000000000004', 'processing', 'shipped', 'Shipped via JNE YES', '00000000-0000-0000-0000-000000000001', '2026-08-27T15:00:00Z'),
  ('00000000-0000-0000-0009-000000000004', 'shipped', 'delivered', 'Delivered', NULL, '2026-08-28T10:00:00Z'),
  ('00000000-0000-0000-0009-000000000005', NULL, 'pending', 'Order placed — awaiting payment', NULL, '2026-08-29T09:00:00Z');

-- ============================================================
-- PAYMENTS
-- ============================================================

INSERT INTO payments (order_id, provider, method, amount_idr, status, paid_at) VALUES
  ('00000000-0000-0000-0009-000000000001', 'midtrans', 'VA_BCA', 1548000, 'paid', '2026-08-29T08:50:00Z'),
  ('00000000-0000-0000-0009-000000000002', 'midtrans', 'QRIS', 1199000, 'paid', '2026-08-29T07:25:00Z'),
  ('00000000-0000-0000-0009-000000000003', 'midtrans', 'CREDIT_CARD', 624000, 'paid', '2026-08-28T16:12:00Z'),
  ('00000000-0000-0000-0009-000000000004', 'midtrans', 'VA_BCA', 998000, 'paid', '2026-08-27T11:10:00Z'),
  ('00000000-0000-0000-0009-000000000005', 'manual', 'MANUAL_TRANSFER', 374000, 'pending', NULL);

-- ============================================================
-- SHIPMENTS
-- ============================================================

INSERT INTO shipments (order_id, courier, service, tracking_number, status, shipped_at, delivered_at) VALUES
  ('00000000-0000-0000-0009-000000000001', 'JNE', 'EXPRESS', 'JNE-EXP-88392019', 'packed', NULL, NULL),
  ('00000000-0000-0000-0009-000000000003', 'SiCepat', 'BEST', 'SICEPAT-BEST-9920193', 'shipped', '2026-08-28T20:00:00Z', NULL),
  ('00000000-0000-0000-0009-000000000004', 'JNE', 'YES', 'JNE-YES-77291038', 'delivered', '2026-08-27T15:00:00Z', '2026-08-28T10:00:00Z');

-- ============================================================
-- JOURNAL ARTICLES (3 articles matching admin)
-- ============================================================

INSERT INTO articles (id, slug, category, cover_image_url, author_user_id, reading_time_minutes, status, featured, published_at, created_at) VALUES
  ('00000000-0000-0000-000a-000000000001', 'anatomy-of-form', 'Design Philosophy', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=800', '00000000-0000-0000-0000-000000000001', 8, 'published', true, '2026-08-15T10:00:00Z', '2026-08-10T10:00:00Z'),
  ('00000000-0000-0000-000a-000000000002', 'motion-in-stillness', 'Behind the Scenes', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800', '00000000-0000-0000-0000-000000000001', 6, 'published', false, '2026-08-20T14:00:00Z', '2026-08-18T10:00:00Z'),
  ('00000000-0000-0000-000a-000000000003', 'raw-material-sourcing', 'Sustainability', 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800', '00000000-0000-0000-0000-000000000001', 5, 'published', false, '2026-08-25T09:00:00Z', '2026-08-22T10:00:00Z');

INSERT INTO article_translations (article_id, language, title, excerpt, content) VALUES
  ('00000000-0000-0000-000a-000000000001', 'en', 'The Anatomy of Form', 'Exploring the architectural principles behind the FORM collection.', 'The FORM collection draws from brutalist architecture and Japanese construction techniques. Each garment is designed to create structure from softness, rigidity from flow. This article traces the journey from concept to final garment.'),
  ('00000000-0000-0000-000a-000000000001', 'id', 'Anatomi dari Form', 'Mengeksplorasi prinsip arsitektural di balik koleksi FORM.', 'Koleksi FORM terinspirasi dari arsitektur brutalis dan teknik konstruksi Jepang. Setiap garmen dirancang untuk menciptakan struktur dari kelembutan, rigiditas dari aliran. Artikel ini menelusuri perjalanan dari konsep hingga garmen final.'),
  ('00000000-0000-0000-000a-000000000002', 'en', 'Motion in Stillness', 'How we captured movement in static fabric for the MOTION series.', 'Behind the MOTION collection lies a philosophy of frozen kinetic energy. Our team spent weeks studying wind patterns and dance movements to engineer fabrics that appear to be in constant motion even when perfectly still.'),
  ('00000000-0000-0000-000a-000000000002', 'id', 'Gerak dalam Keheningan', 'Bagaimana kami menangkap gerakan dalam kain statis untuk seri MOTION.', 'Di balik koleksi MOTION terdapat filosofi energi kinetik yang membeku. Tim kami menghabiskan berminggu-minggu mempelajari pola angin dan gerakan tari untuk merekayasa kain yang tampak terus bergerak bahkan saat diam sempurna.'),
  ('00000000-0000-0000-000a-000000000003', 'en', 'Raw Material Sourcing', 'Tracing our supply chain from fiber to finished garment.', 'Every NOVAÉ garment begins with a conscious material choice. From Italian recycled wool to Japanese waterproof gabardine, we source materials that align with our commitment to quality craftsmanship and environmental responsibility.'),
  ('00000000-0000-0000-000a-000000000003', 'id', 'Sumber Bahan Baku', 'Menelusuri rantai pasokan kami dari serat hingga garmen jadi.', 'Setiap garmen NOVAÉ dimulai dengan pilihan material yang sadar. Dari wol daur ulang Italia hingga gabardine tahan air Jepang, kami mencari material yang sejalan dengan komitmen kami terhadap keahlian berkualitas dan tanggung jawab lingkungan.');

-- ============================================================
-- WISHLISTS (create empty wishlists for customers)
-- ============================================================

INSERT INTO wishlists (user_id) VALUES
  ('00000000-0000-0000-0001-000000000001'),
  ('00000000-0000-0000-0001-000000000002'),
  ('00000000-0000-0000-0001-000000000003'),
  ('00000000-0000-0000-0001-000000000004'),
  ('00000000-0000-0000-0001-000000000005');

COMMIT;
