# NOVAÉ

A digital-first contemporary fashion atelier combining editorial storytelling, immersive interactions, personalization, and commerce.

---

## Overview

High-end digital fashion often forces a compromise: either template-driven e-commerce grids that lack editorial identity, or experimental showcase sites unable to handle real transactional inventory and multi-variant catalog workflows.

NOVAÉ bridges this gap. It explores an avant-garde digital atelier experience featuring brutalist luxury aesthetics, inertial scroll interactions, bilingual narratives, and a structured multi-tier engineering architecture built on modern web standards.

```text
Customer Frontend ─┐
                    ├──> NestJS API ──> Prisma ──> PostgreSQL
Admin App ──────────┘
                    └──> Supabase Auth
```

---

## Preview

NOVAÉ is visually anchored by a refined brutalist design system using obsidian (`#0B0C0E`), bone white (`#F3F2EE`), and electric lime (`#E2F163`) accents:

- **Customer Storefront (`/`)**: Cinematic hero showcase with inertial smooth scrolling, collection discovery chapters, audio atmosphere, and interactive garment grids.
- **Product Experience (`/products/:slug`)**: Multi-angle studio gallery, dynamic color swatches, size availability matrix, and fabric provenance accordions.
- **Style Finder (`/style-finder`)**: Interactive multi-step questionnaire translating aesthetic preferences into wardrobe recommendations.
- **Atelier Backoffice (`admin/`)**: Operational dashboard with live catalog search, multi-faceted filtering, variant matrix management, and product formulation modals.

---

## Key Product Experiences

- **Editorial Storefront**: Minimalist luxury aesthetics pairing responsive layouts with fluid typography, atmospheric soundscapes, and curated garment displays.
- **Scroll-Driven Storytelling**: Inertial scrolling and cinematic reveals orchestrated with Lenis, GSAP ScrollTrigger, and Framer Motion.
- **Thematic Collections**: Chapter-based garment presentations exploring sculptural forms across `FORM` (Chapter 01), `MOTION` (Chapter 02), and `IDENTITY` (Chapter 03).
- **Style Finder Personalization**: Interactive multi-step questionnaire that matches individual aesthetic preferences with tailored silhouette recommendations.
- **Product & Variant Matrix**: Dynamic color swatches, size selection, localized garment provenance, and real-time inventory availability states.
- **Bilingual Experience**: Native Indonesian (`id`) and English (`en`) support across customer-facing copy, product details, and backoffice tooling.
- **Role-Based Authentication**: Unified session management powered by Supabase Auth with server-enforced role verification (`customer` vs `admin`).
- **Atelier Backoffice Portal**: Dedicated administrative portal for live catalog inspection, multi-tab product formulation, variant pricing overrides, and non-destructive archiving.

---

## Monorepo Architecture

The repository is structured as an npm monorepo separating customer interactions, operations, and backend services:

```text
NOVAÉ/
├── frontend/             # Customer storefront (React, Vite, Tailwind CSS)
├── admin/                # Atelier backoffice (React, Vite, Tailwind CSS)
├── backend/              # REST API & database services (NestJS, Prisma, PostgreSQL)
└── docker-compose.yml    # Local PostgreSQL container configuration
```

---

## Technology Stack

- **Frontend & Admin**: React, Vite, TypeScript, Tailwind CSS
- **Motion & Interactions**: GSAP, ScrollTrigger, Framer Motion, Lenis
- **State Management**: Zustand
- **Backend API**: NestJS, TypeScript, Express
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Authentication**: Supabase Auth, Passport JWT
- **Testing**: Jest, Supertest, PGlite (in-memory test engine)
- **Infrastructure**: Docker, Docker Compose

---

## Engineering Highlights

- **Server-Authoritative RBAC**: Client session claims are never trusted directly. Every administrative route verifies user status and roles directly against the PostgreSQL `users` table via `SupabaseAuthGuard` and `RolesGuard`.
- **Atomic Multi-Entity Transactions**: Creating or updating products executes within `prisma.$transaction`, atomically synchronizing base product attributes, bilingual translations, tag maps, gallery images, variants, and initial inventory rows with automatic rollback on error.
- **Non-Destructive Archiving**: Products and variants linked to order history cannot be hard-deleted. The API enforces soft-delete archiving (`status = archived` / `inactive`) to protect historical records and foreign key integrity.
- **Safe Inventory Projections**: Customer-facing APIs only expose availability states (`available`, `isLowStock`, `isOutOfStock`), preventing internal warehouse counts and inventory movements from leaking to public clients.
- **Bilingual Schema Design**: Normalized translation tables with composite primary keys `(entity_id, language)` support clean multilingual localization with automatic Indonesian-to-English fallback handling.
- **Database Integrity & Constraints**: 15 sequential SQL migrations enforce strict foreign keys, CHECK constraints (non-negative stock and base pricing), unique indexes, and automated `updated_at` triggers.

---

## Current Status

### Completed & Functional
- **Database Layer**: Complete PostgreSQL lifecycle with 15 migrations, seed data, and a 112-assertion validation suite.
- **Backend Foundation**: Centralized error envelopes, validation pipes, structured logging, CORS, Swagger docs, and health checks.
- **Authentication & RBAC**: Supabase Auth integration with server-side profile provisioning and role guards.
- **Admin Catalog & Inventory API**: Transactional product CRUD, variant matrix management, stock adjustments, and inventory movement audit logs.
- **Customer Storefront**: Responsive interface, bilingual switcher, Style Finder, product detail pages, and cart drawer UI.
- **Admin Backoffice**: Live API connection, product catalog management, inventory matrix, stock adjustment modals, and movement history audit.
- **Automated Tests**: 49 unit tests and 42 end-to-end integration tests passing with zero errors.

### Upcoming Milestones
- **Phase 2**: Persistent customer cart and transactional order placement flow.
- **Phase 3**: Payment gateway integration (Midtrans / Xendit) and courier logistics API integration.
- **Phase 4**: Customer order status tracking and fulfillment management.
- **Phase 5**: Full Journal editorial CMS and production cloud deployment.

---

## Getting Started

### Prerequisites
- Node.js 20+ (Node.js 24 LTS recommended)
- npm 10+
- Docker & Docker Compose (for local PostgreSQL)

### 1. Installation
Clone the repository and install dependencies from the monorepo root:

```bash
git clone https://github.com/destadrns/NOVAE.git
cd NOVAE
npm install
```

### 2. Environment Configuration
Copy the example environment templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp admin/.env.example admin/.env
```

### 3. Database Setup
Start the PostgreSQL container, run migrations, and apply the initial atelier dataset:

```bash
# Start PostgreSQL container
docker compose up -d

# Run database migrations and seed data
npm --prefix backend run db:migrate
npm --prefix backend run db:seed

# Verify database integrity (112 assertions)
npm --prefix backend run db:validate
```

### 4. Running the Development Servers
Start each service using root npm scripts:

```bash
# Customer Storefront (http://localhost:3000)
npm run dev:frontend

# Backend API Service (http://localhost:3001/api/v1)
npm --prefix backend run start:dev

# Atelier Backoffice (http://localhost:3002)
npm run dev:admin -- --port 3002
```

- **Interactive API Documentation (Swagger)**: `http://localhost:3001/api/v1/docs`
- **Health Check Probe**: `http://localhost:3001/api/v1/health`

---

## Testing & Quality Assurance

```bash
# Run backend unit tests (49 tests)
npm --prefix backend run test

# Run backend end-to-end tests (42 tests)
npm --prefix backend run test:e2e

# Run database validation suite (112 assertions)
npm --prefix backend run db:validate

# Production builds
npm --prefix backend run build
npm run build:frontend
npm run build:admin
```

---

## Documentation

For in-depth specifications and architectural references, see:

- [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) — Consolidated technical architecture, API overview, and test verification report.
- [NOVAE_PRD_v1.2.md](NOVAE_PRD_v1.2.md) — Product requirements document, design principles, and user journeys.
- [NOVAE_DATABASE_SCHEMA.md](NOVAE_DATABASE_SCHEMA.md) — Complete PostgreSQL schema, table models, constraints, and migration rules.
- [NOVAE_BACKEND_SPEC.md](NOVAE_BACKEND_SPEC.md) — Backend architecture, authentication contracts, and endpoint specifications.

---

## License

Private and proprietary atelier source code. © 2026 NOVAÉ Atelier. All rights reserved.
