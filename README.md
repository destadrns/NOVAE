# NOVAÉ

NOVAÉ is a digital-first contemporary fashion atelier exploring editorial storytelling, immersive interactions, personalization, and commerce.

![NOVAÉ Storefront Hero](docs/screenshots/hero-storefront.png)

---

## Overview

NOVAÉ combines editorial fashion presentation with a structured commerce backend. The application provides a bilingual customer storefront, product personalization tools, multi-variant catalog management, cart persistence, checkout, and backoffice order fulfillment.

```text
Customer Frontend ─┐
                    ├──> NestJS API ──> Prisma ──> PostgreSQL
Admin App ──────────┘
                    └──> Supabase Auth
```

> **Note on Payments**: NOVAÉ uses an integrated payment simulator for development and demonstration purposes. It supports Virtual Account (BCA, Mandiri), QRIS, Credit Card, and Manual Bank Transfer workflows. **No real monetary transactions or banking credentials are processed.**

---

## Preview

### Customer Storefront & Catalog
Cinematic hero showcase featuring brutalist typography, atmospheric soundscapes, inertial smooth scrolling with Lenis, and chapter-based collection discovery (`FORM`, `MOTION`, `IDENTITY`).

![NOVAÉ Storefront](docs/screenshots/storefront.png)

---

### Product Detail & Variant Matrix
Studio photography gallery, dynamic color swatches, size availability selectors, fabric provenance specifications, and real-time inventory state badges.

![NOVAÉ Product Detail](docs/screenshots/product-detail.png)

---

### Style Finder Personalization
Interactive multi-step questionnaire that translates aesthetic preferences and silhouette signals into tailored wardrobe recommendations.

![NOVAÉ Style Finder](docs/screenshots/style-finder.png)

---

### Checkout & Simulated Payment
Multi-step checkout flow with shipping address capture, courier selection, server-authoritative pricing snapshots, and an interactive payment simulator modal.

![NOVAÉ Checkout & Order Summary](docs/screenshots/checkout.png)

---

### Atelier Operations Dashboard
Backoffice dashboard presenting real-time business telemetry, revenue trends, capsule sales distributions, customer counts, and low-stock alerts.

![NOVAÉ Atelier Operations Dashboard](docs/screenshots/admin-dashboard.png)

---

### Inventory Management & SKU Matrix
Warehouse inventory matrix tracking physical vs reserved stock allocation, depletion thresholds, restock actions, and movement audit logs.

![NOVAÉ SKU Matrix & Inventory Operations](docs/screenshots/admin-inventory.png)

---

## Key Product Experiences

- **Editorial Storefront**: Minimalist luxury aesthetic pairing responsive layouts with fluid typography, atmospheric soundscapes, and curated garment presentations.
- **Scroll-Driven Storytelling**: Inertial scrolling and cinematic chapter reveals orchestrated with Lenis, GSAP ScrollTrigger, and Framer Motion.
- **Thematic Collections**: Capsule presentations exploring sculptural forms across `FORM` (Chapter 01), `MOTION` (Chapter 02), and `IDENTITY` (Chapter 03).
- **Style Finder Personalization**: 3-step questionnaire matching aesthetic philosophies with curated garment suggestions.
- **Product & Variant Matrix**: Dynamic color swatches, size selection, localized garment provenance, and real-time inventory availability states.
- **Bilingual Support**: Native Indonesian (`id`) and English (`en`) localization across customer-facing copy, catalog metadata, and backoffice tooling.
- **Customer Authentication**: Identity management powered by Supabase Auth with server-verified role-based access control (`customer` vs `admin`).
- **Persistent Cart & Wishlist**: Client and database basket persistence, polymorphic variant line items, and guest-to-authenticated cart merging.
- **Checkout & Order Placement**: Multi-step checkout with server-authoritative calculations, double-lock inventory reservations, and sequential `NOV-YYYY-XXXX` order number generation.
- **Simulated Payment Gateway**: Interactive sandbox modal supporting Virtual Account, QRIS, Credit Card 3DS, and Bank Transfer with instant Success, Failed, and Cancellation state handling.
- **Atelier Backoffice Portal**: Administrative operations portal for catalog management, variant matrix overrides, warehouse inventory tracking, and customer order fulfillment queues.

---

## Monorepo Architecture

The repository is organized as an npm monorepo separating customer-facing interfaces, backoffice operations, and backend services:

```text
NOVAÉ/
├── frontend/             # Customer storefront (React, Vite, Tailwind CSS)
├── admin/                # Atelier backoffice (React, Vite, Tailwind CSS)
├── backend/              # REST API & database services (NestJS, Prisma, PostgreSQL)
├── docs/                 # Documentation & preview assets
│   └── screenshots/      # Application screenshots
└── docker-compose.yml    # Local PostgreSQL container configuration
```

---

## Technology Stack

### Frontend & Admin
- **Framework**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, Vanilla CSS design tokens
- **Animation & Motion**: GSAP, ScrollTrigger, Framer Motion, Lenis
- **State Management**: Zustand
- **Icons**: Lucide React

### Backend API
- **Framework**: NestJS, TypeScript, Express
- **ORM & Database**: Prisma ORM, PostgreSQL (via Docker or local instance)
- **Validation**: class-validator, class-transformer
- **API Documentation**: OpenAPI / Swagger (`@nestjs/swagger`)

### Authentication & Security
- **Identity Provider**: Supabase Auth
- **Token Verification**: Passport JWT, jsonwebtoken
- **Authorization**: NestJS Guards (`SupabaseAuthGuard`, `RolesGuard`)

### Testing & Quality Assurance
- **Unit & Integration Testing**: Jest, Supertest
- **In-Memory PostgreSQL Engine**: PGlite (for standalone database tests)
- **Database Validation**: 112-assertion migration and constraint verification suite

---

## Engineering Highlights

- **Server-Authoritative RBAC**: Client session claims are never trusted directly. Every administrative endpoint validates identity and role claims (`customer` vs `admin`) directly against PostgreSQL records.
- **Atomic Transaction Boundaries**: Multi-entity mutations—including product creation, order placement, status transitions, and payment settlement—execute within atomic `prisma.$transaction` blocks with automatic rollback on error.
- **Optimistic Inventory Reservation**: Order creation reserves physical stock (`reservedQuantity`) during checkout. If payment fails or an order is cancelled, reserved units are automatically released back to available stock.
- **Concurrency & Idempotency Safeguards**: Prevents double-order placement and concurrent cart conversion with transaction-level status locks.
- **Non-Destructive Archiving**: Products and variants referenced in historical orders cannot be hard-deleted. Soft-delete archiving (`status = archived` / `inactive`) preserves audit integrity and foreign key constraints.
- **Bilingual Schema Design**: Normalized translation tables with composite keys `(entity_id, language)` support multi-language content with automatic Indonesian-to-English fallback resolution.
- **Safe Public Inventory Projections**: Customer-facing APIs only expose availability states (`available`, `isLowStock`, `isOutOfStock`), preventing internal warehouse counts and inventory movements from leaking to public clients.
- **Automated Test Coverage**: 105 unit tests across 11 service suites and 95 end-to-end integration tests across 10 API suites passing with zero errors.

---

## Demo Flow

The end-to-end commerce lifecycle flows through the following stages:

```text
[ Storefront ]
      │
      ▼
Browse Collections (FORM / MOTION / IDENTITY) & Read Journal
      │
      ▼
Product Detail (Select Color & Size)
      │
      ▼
Add to Bag (Persistent Cart Sync)
      │
      ▼
Checkout (Address & Courier Selection)
      │
      ▼
Place Order (Atomic Stock Reservation & NOV-YYYY-XXXX Generation)
      │
      ▼
Simulated Payment (Select VA / QRIS / Card → Trigger SUCCESS / FAILED / CANCEL)
      │
      ▼
Customer Account (Inspect Order History, Detail Modal & Status Stepper)
```

```text
[ Atelier Backoffice ]
      │
      ▼
Admin Login (Role-Verified Portal Access)
      │
      ▼
Operations Dashboard (Inspect Live Revenue, Time Range Filters, Top Products & Style Finder Insights)
      │
      ▼
Inventory Matrix (Monitor Reserved vs Physical Quantities & Quick Restock)
      │
      ▼
Order Management (Review Orders, Payment State & Update Fulfillment Lifecycle)
      │
      ▼
Journal CMS (Create, Edit, Publish, Preview & Archive Bilingual Articles)
```

---

## Current Status

### Implemented & Functional
- **Database Architecture**: PostgreSQL schema with 15 SQL migrations, deterministic seed data, and a 112-assertion validation suite.
- **Backend REST API**: Centralized error envelopes, validation pipes, structured logging, CORS, Swagger documentation, and health check probes.
- **Authentication & RBAC**: Supabase Auth integration, server-side profile provisioning, and role guards (`SupabaseAuthGuard`, `RolesGuard`).
- **Admin Catalog & Inventory API**: Transactional product CRUD, variant matrix management, stock adjustments, and inventory movement audit ledgers.
- **Commerce Subsystem (Cart & Wishlist)**: Persistent customer cart, polymorphic variant addition, guest-to-auth cart merge, and live wishlist synchronization.
- **Customer Checkout & Order Placement**: Multi-step checkout (`/checkout`), shipping address form, courier selection, server-authoritative calculations, and atomic order creation.
- **Admin Order Management**: Protected `/api/v1/admin/orders` endpoints, status filtering, search, order detail drawer, status timeline, inventory reservation context, and controlled state transitions (`pending → paid → processing → shipped → delivered`).
- **Customer Order Experience & Fulfillment**: Customer order detail view with 5-stage progress timeline, tracking number, item pricing snapshots, bilingual ID/EN, and fulfillment workflow controls.
- **Simulated Payment Workflow**: End-to-end simulated payment flow (`POST /api/v1/orders/:id/simulate-payment`) supporting Virtual Accounts (BCA, Mandiri), QRIS, Credit Card, and Manual Transfer. Full state machine sync between `Payment.status` and `Order.paymentStatus`, interactive sandbox simulator modal on checkout & account pages, and automatic inventory release on cancellation.
- **Journal CMS & Editorial Publication**: Bilingual article publishing platform (`/api/v1/articles` public + `/api/v1/admin/articles` CMS), supporting draft/published/archived lifecycles, slug routing, reading time estimates, categories, author metadata, and drawer preview.
- **Analytics & Business Insights**: Live operational analytics (`/api/v1/admin/analytics/overview`), time-range filtering (`7D`, `30D`, `90D`, `ALL`), gross revenue trends, capsule volume distribution, top-selling products leaderboard, customer activity metrics, Style Finder telemetry, and low-stock quick restock actions.
- **Customer Storefront**: Responsive interface, bilingual switcher, Style Finder, product detail pages, cart drawer, live customer order history, and payment simulator triggers.
- **Admin Backoffice**: Live API connection, product catalog management, inventory matrix, stock adjustment modals, order fulfillment dashboard, journal CMS, and operational telemetry.
- **Automated Verification**: 105 unit tests (11 suites) and 95 end-to-end integration tests (10 suites) passing with zero errors.

### Upcoming Development
- Printable order invoices & packing slip PDF generator.
- Streaming CSV export for financial and inventory reports.
- Rich-text markdown / WYSIWYG editor for Journal CMS.
- Predictive machine-learning replenishment forecasting.

---

## Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **Docker & Docker Compose** (for PostgreSQL database) or a local PostgreSQL instance (`v15+`)

---

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/novae.git
cd novae

# Install monorepo dependencies across frontend, admin, and backend
npm install
```

---

### 2. Configure Environment Variables

Create `.env` files in each project directory:

#### Backend (`backend/.env`)
```ini
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1
DATABASE_URL="postgresql://novae:novae_secret@localhost:5432/novae_dev"

# Supabase Auth Configuration
SUPABASE_URL="https://your-supabase-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
SUPABASE_JWT_SECRET="your-supabase-jwt-secret-min-32-chars"
```

#### Customer Frontend (`frontend/.env`)
```ini
VITE_API_URL="http://localhost:3001/api/v1"
VITE_SUPABASE_URL="https://your-supabase-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

#### Admin App (`admin/.env`)
```ini
VITE_API_URL="http://localhost:3001/api/v1"
VITE_SUPABASE_URL="https://your-supabase-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

---

### 3. Start PostgreSQL Database

```bash
# Start local PostgreSQL container via Docker Compose
docker compose up -d
```

---

### 4. Run Migrations, Seed & Validate Database

```bash
# Apply migrations and seed initial catalog data
npm --prefix backend run db:setup

# Run the 112-assertion database validation suite
npm --prefix backend run db:validate
```

---

### 5. Start Development Servers

Run the applications concurrently or individually:

```bash
# Terminal 1 — Backend REST API (http://localhost:3001)
npm --prefix backend run dev

# Terminal 2 — Customer Storefront (http://localhost:3000)
npm --prefix frontend run dev

# Terminal 3 — Atelier Admin Portal (http://localhost:3002)
npm --prefix admin run dev
```

| Service | URL | Description |
| :--- | :--- | :--- |
| **Customer Storefront** | `http://localhost:3000` | Public fashion storefront & checkout |
| **Backend REST API** | `http://localhost:3001/api/v1` | Core commerce API endpoints |
| **Atelier Admin Portal** | `http://localhost:3002` | Backoffice operations & catalog management |
| **Swagger OpenAPI Docs** | `http://localhost:3001/api/v1/docs` | Interactive API documentation |
| **Health Telemetry Probe** | `http://localhost:3001/api/v1/health` | System health & database probe |

---

### 6. Run Automated Test Suites

```bash
# Run all backend unit test suites (105 tests)
npm --prefix backend run test

# Run all backend end-to-end integration test suites (95 tests)
npm --prefix backend run test:e2e
```

---

## License

This project is open source and available under the [ISC License](LICENSE).
