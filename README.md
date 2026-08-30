# NOVAÉ

> **Portfolio-grade full-stack digital fashion commerce prototype.**

A digital-first contemporary fashion atelier combining editorial storytelling, immersive interactions, personalization, and a robust transactional commerce foundation.

![NOVAÉ Storefront Hero](docs/screenshots/hero-storefront.png)

---

## Overview

High-end digital fashion often forces a compromise: either template-driven e-commerce grids that lack editorial identity, or experimental showcase sites unable to handle real transactional inventory and multi-variant catalog workflows.

NOVAÉ bridges this gap. Built from the ground up as a portfolio-grade commerce demonstration, it explores an avant-garde digital atelier experience featuring brutalist luxury aesthetics, inertial scroll interactions, bilingual narratives, and a structured multi-tier engineering architecture built on modern web standards.

```text
Customer Frontend ─┐
                    ├──> NestJS API ──> Prisma ──> PostgreSQL
Admin App ──────────┘
                    └──> Supabase Auth
```

---

## Portfolio Positioning

NOVAÉ is intentionally built as a functional portfolio and demonstration commerce environment. It features complete, production-grade architecture across all layers:

- **Real Frontend Applications**: High-fidelity customer storefront and backoffice operations portal built with React, Vite, Tailwind CSS, GSAP, and Framer Motion.
- **Real Backend APIs**: Strongly-typed RESTful service architecture built with NestJS, class-validator DTOs, and global exception envelopes.
- **Real PostgreSQL Persistence**: 15 sequential SQL migrations, normalized relational models, strict foreign keys, CHECK constraints, and automated `updated_at` triggers via Prisma ORM.
- **Real Authentication & RBAC**: Supabase Auth session verification with server-authoritative role evaluation (`customer` vs `admin`).
- **Real Catalog & Inventory Logic**: Full multi-variant formulation, atomic transaction boundaries, optimistic reservation locks, and stock movement audit ledgers.
- **Real Cart, Checkout & Order Lifecycle**: Persistent customer baskets, server-side price calculation snapshots, and sequential order generation (`NOV-YYYY-XXXX`).
- **Simulated Payment Workflow**: Interactive in-browser payment simulator covering Virtual Accounts (BCA, Mandiri), QRIS, Credit Card, and Manual Transfer. **No real monetary transactions or banking credentials are processed.**

---

## Preview

### Customer Storefront & Catalog
Cinematic hero showcase featuring brutalist luxury typography, atmospheric soundscapes, inertial smooth scrolling with Lenis, and chapter-based collection discovery (`FORM`, `MOTION`, `IDENTITY`).

![NOVAÉ Storefront](docs/screenshots/storefront.png)

---

### Product Experience & Variant Matrix
Studio photography gallery, dynamic color swatches, size availability selectors, fabric provenance specifications, and real-time inventory state badges.

![NOVAÉ Product Detail](docs/screenshots/product-detail.png)

---

### Style Finder Personalization
Interactive multi-step questionnaire that translates aesthetic preferences and silhouette signals into tailored wardrobe recommendations.

![NOVAÉ Style Finder](docs/screenshots/style-finder.png)

---

### Customer Checkout & Simulated Payment
Multi-step checkout flow with shipping address capture, courier selection, server-authoritative pricing snapshots, and an interactive payment simulator modal.

![NOVAÉ Checkout & Order Summary](docs/screenshots/checkout.png)

---

### Atelier Operations Dashboard
Executive backoffice overview presenting real-time business telemetry, gross revenue trends, capsule sales distributions, customer counts, and low-stock alerts.

![NOVAÉ Atelier Operations Dashboard](docs/screenshots/admin-dashboard.png)

---

### Inventory Management & SKU Matrix
Real-time warehouse inventory matrix with physical vs reserved stock allocation, depletion thresholds, quick restock actions, and movement audit logs.

![NOVAÉ SKU Matrix & Inventory Operations](docs/screenshots/admin-inventory.png)

---

## Key Product Experiences

- **Editorial Storefront**: Avant-garde luxury aesthetic pairing responsive layouts with fluid typography, atmospheric soundscapes, and curated garment presentations.
- **Scroll-Driven Storytelling**: Inertial scrolling and cinematic chapter reveals orchestrated with Lenis, GSAP ScrollTrigger, and Framer Motion.
- **Thematic Collections**: Curated capsule presentations exploring sculptural forms across `FORM` (Chapter 01), `MOTION` (Chapter 02), and `IDENTITY` (Chapter 03).
- **Style Finder Personalization**: Interactive 3-step questionnaire matching aesthetic philosophies with curated garment suggestions.
- **Product & Variant Matrix**: Dynamic color swatches, size selection, localized garment provenance, and real-time inventory availability states.
- **Bilingual Narrative**: Native Indonesian (`id`) and English (`en`) localization across all customer-facing copy, catalog metadata, and backoffice tooling.
- **Customer Authentication**: Unified identity management powered by Supabase Auth with server-verified role-based access control.
- **Persistent Cart & Wishlist**: Resilient basket persistence, polymorphic variant line items, guest-to-auth cart migration, and client-side state synchronization.
- **Transactional Checkout & Order Placement**: Multi-step checkout with server-authoritative calculations, double-lock inventory reservations, and sequential `NOV-YYYY-XXXX` code generation.
- **Simulated Payment Gateway**: Interactive sandbox modal supporting Virtual Account, QRIS, Credit Card 3DS, and Bank Transfer with instant Success, Failed, and Cancellation state handling.
- **Atelier Backoffice Portal**: Operations dashboard for catalog formulation, variant matrix management, warehouse inventory tracking, and customer order fulfillment queues.

---

## Monorepo Architecture

The repository is organized as an npm monorepo separating customer-facing interfaces, backoffice operations, and backend services:

```text
NOVAÉ/
├── frontend/             # Customer storefront (React, Vite, Tailwind CSS)
├── admin/                # Atelier backoffice (React, Vite, Tailwind CSS)
├── backend/              # REST API & database services (NestJS, Prisma, PostgreSQL)
├── docs/                 # Public documentation & preview assets
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
- **In-Memory PostgreSQL Engine**: PGlite (for deterministic standalone database tests)
- **Database Validation**: Custom 112-assertion E2E migration and constraint verification suite

---

## Engineering Highlights

- **Server-Authoritative RBAC**: Client session claims are never trusted directly. Every administrative endpoint validates identity and role claims (`customer` vs `admin`) directly against PostgreSQL records.
- **Atomic Transaction Boundaries**: Multi-entity mutations—including product formulation, order placement, status transitions, and payment settlement—execute within atomic `prisma.$transaction` blocks with automatic rollback on error.
- **Optimistic Inventory Reservation**: Order creation reserves physical stock (`reservedQuantity`) during checkout. If payment fails or an order is cancelled, reserved units are automatically released back to available stock.
- **Concurrency & Idempotency Safeguards**: Prevents double-order placement and concurrent cart conversion with transaction-level status locks.
- **Non-Destructive Archiving**: Products and variants referenced in historical orders cannot be hard-deleted. Soft-delete archiving (`status = archived` / `inactive`) preserves audit integrity and foreign key constraints.
- **Bilingual Schema Design**: Normalized translation tables with composite keys `(entity_id, language)` support multi-language content with automatic Indonesian-to-English fallback resolution.
- **Safe Public Inventory Projections**: Customer-facing APIs only expose availability states (`available`, `isLowStock`, `isOutOfStock`), preventing internal warehouse counts and inventory movements from leaking to public clients.
- **Comprehensive Test Coverage**: 92 unit tests across 9 service suites and 77 end-to-end integration tests across 8 API suites passing with zero errors.

---

## Demo Flow

Experience the complete end-to-end commerce lifecycle:

```text
[ Storefront ]
      │
      ▼
Browse Collections (FORM / MOTION / IDENTITY)
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
Customer Account (Inspect Order History & Payment Settlement)
```

```text
[ Atelier Backoffice ]
      │
      ▼
Admin Login (Role-Verified Portal Access)
      │
      ▼
Operations Dashboard (Inspect Revenue & Low-Stock Alerts)
      │
      ▼
Inventory Matrix (Monitor Reserved vs Physical Quantities)
      │
      ▼
Order Management (Review Customer Orders, Payment State & Update Fulfillment)
```

---

## Current Status

### Completed & Functional
- **Database Architecture**: PostgreSQL schema with 15 SQL migrations, deterministic seed data, and a 112-assertion validation suite.
- **Backend API Foundation**: Centralized error envelopes, validation pipes, structured logging, CORS, Swagger documentation, and health check probes.
- **Authentication & RBAC**: Supabase Auth integration, server-side profile provisioning, and role guards.
- **Admin Catalog & Inventory API**: Transactional product CRUD, variant matrix management, stock adjustments, and inventory movement audit ledgers.
- **Commerce Subsystem (Cart & Wishlist)**: Persistent customer cart, polymorphic variant addition, guest-to-auth cart merge, and live wishlist synchronization.
- **Customer Checkout & Order Placement**: Multi-step checkout (`/checkout`), shipping address form, courier selection, server-authoritative calculations, and atomic order creation.
- **Admin Order Management**: Protected `/api/v1/admin/orders` endpoints, status filtering, search, order detail drawer, status timeline, inventory reservation context, and controlled state transitions (`pending → paid → processing → shipped → delivered`).
- **Simulated Payment Workflow**: End-to-end simulated payment flow (`POST /api/v1/orders/:id/simulate-payment`) supporting Virtual Accounts (BCA, Mandiri), QRIS, Credit Card, and Manual Transfer. Full state machine sync between `Payment.status` and `Order.paymentStatus`, interactive sandbox simulator modal on checkout & account pages, and automatic inventory release on cancellation.
- **Customer Storefront**: Responsive interface, bilingual switcher, Style Finder, product detail pages, cart drawer, live customer order history, and payment simulator triggers.
- **Admin Backoffice**: Live API connection, product catalog management, inventory matrix, stock adjustment modals, and order management dashboard with payment settlement badges and timestamps.
- **Automated Verification**: 92 unit tests (9 suites) and 77 end-to-end integration tests (8 suites) passing with zero errors.

### Upcoming Milestones
- Customer order experience refinement & printable receipt view.
- Fulfillment workflow refinement & packing slip generator.
- Editorial Journal CMS & rich content publication.
- Advanced atelier business analytics & inventory forecasting.
- Final portfolio optimization and performance tuning.

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
# Run all backend unit test suites (92 tests)
npm --prefix backend run test

# Run all backend end-to-end integration test suites (77 tests)
npm --prefix backend run test:e2e
```

---

## License

This project is open source and available under the [ISC License](LICENSE).
