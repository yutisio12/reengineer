[////////////////////////////////////////////////////////////////////////////////////]
[                                                                                    ]
[   ENGINEERING DRAWING TRACKER — REV 1.0                                           ]
[   NESTJS + REACT · POSTGRESQL · JWT AUTH                                         ]
[                                                                                    ]
[////////////////////////////////////////////////////////////////////////////////////]

  ![Node](https://img.shields.io/badge/Node-20%2B-111?style=flat&logo=node.js&labelColor=EAE8E3&color=050505&logoColor=050505)
  ![NestJS](https://img.shields.io/badge/NestJS-11-111?style=flat&logo=nestjs&labelColor=EAE8E3&color=050505&logoColor=050505)
  ![React](https://img.shields.io/badge/React-19-111?style=flat&logo=react&labelColor=EAE8E3&color=050505&logoColor=050505)
  ![TypeScript](https://img.shields.io/badge/TS-5.7%20BE%20%7C%206.0%20FE-111?style=flat&logo=typescript&labelColor=EAE8E3&color=050505&logoColor=050505)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-111?style=flat&logo=postgresql&labelColor=EAE8E3&color=050505&logoColor=050505)
  ![Vite](https://img.shields.io/badge/Vite-8-111?style=flat&logo=vite&labelColor=EAE8E3&color=050505&logoColor=050505)
  ![Tailwind](https://img.shields.io/badge/Tailwind-4-111?style=flat&logo=tailwindcss&labelColor=EAE8E3&color=050505&logoColor=050505)
  ![TypeORM](https://img.shields.io/badge/TypeORM-1.x-111?style=flat&logo=typeorm&labelColor=EAE8E3&color=050505&logoColor=050505)
  ![JWT](https://img.shields.io/badge/JWT-auth-111?style=flat&logo=jsonwebtokens&labelColor=EAE8E3&color=050505&logoColor=050505)
  ![Docker](https://img.shields.io/badge/Docker-ready-111?style=flat&logo=docker&labelColor=EAE8E3&color=050505&logoColor=050505)
  ![npm](https://img.shields.io/badge/npm-10%2B-111?style=flat&logo=npm&labelColor=EAE8E3&color=050505&logoColor=050505)
  ![License](https://img.shields.io/badge/License-UNLICENSED-111?style=flat&labelColor=EAE8E3&color=E61919)

>>> OVERVIEW

  Engineering Drawing Activity Tracker is a full-stack workflow management
  system engineered for engineering/construction document control. It governs
  the lifecycle of technical drawings from assignment through drafting,
  checking, engineering approval, and transmittal to production.

  >>> SYSTEM ARCHITECTURE

  ┌────────────────────────────────────────────────────────────────────────────┐
  │  CLIENT LAYER         │  SERVER LAYER           │  DATA LAYER             │
  │───────────────────────│─────────────────────────│─────────────────────────│
  │  React 19             │  NestJS 11              │  PostgreSQL 15+         │
  │  TypeScript 6         │  TypeScript 5.7         │  TypeORM 1.x            │
  │  Vite 8               │  Passport JWT           │  UUID Primary Keys      │
  │  TanStack Query 5     │  class-validator        │  synchronize: true      │
  │  TanStack Table 8     │  Multer (file upload)   │  Raw SQL migration      │
  │  Tailwind CSS 4       │  Swagger / Scalar UI    │                         │
  │  Chart.js 4.4         │                         │                         │
  │  React Router 7       │                         │                         │
  └────────────────────────────────────────────────────────────────────────────┘


>>> TECHNOLOGY STACK

  BADGES / VERSIONS — see top of file for shields.io status

  [ BACKEND ] ................. BE/

    RUNTIME .......... Node.js 20+ (LTS) · npm 10+
    FRAMEWORK ........ NestJS ^11.0.1 — Express Platform
    LANGUAGE ......... TypeScript ^5.7.3
    ORM .............. TypeORM ^1.0.0 — Data Mapper pattern
    DATABASE ......... PostgreSQL 15+ · driver: pg ^8.21.0
    AUTH ............. JWT (passport-jwt ^4.0.1 + bcrypt ^6.0.0)
    VALIDATION ....... class-validator ^0.15.1 + class-transformer ^0.5.1
    API DOCS ......... @nestjs/swagger ^11.4.4 + Scalar UI ^1.0.31
    FILE UPLOAD ...... Multer via NestJS FileInterceptor — max 20 MB
    TEST ............. Jest ^30.0.0 + Supertest ^7.0.0

  [ FRONTEND ] ................ FE/

    UI LIBRARY ....... React ^19.2.6 + React DOM ^19.2.6
    BUILD TOOL ....... Vite ^8.0.12
    STYLING .......... Tailwind CSS ^4.3.0 (@tailwindcss/vite ^4.3.0)
    LANGUAGE ......... TypeScript ~6.0.2
    STATE ............ TanStack React Query ^5.100.14 + Context (auth)
    TABLE ............ TanStack React Table ^8.21.3
    ROUTING .......... React Router DOM ^7.16.0
    CHARTS ........... Chart.js 4.4 (CDN)
    NOTIFICATIONS .... SweetAlert2 ^11.26.25
    ICONS ............ Lucide React ^1.17.0 + Tabler Icons (CDN)
    EXPORT ........... xlsx ^0.18.5 (Excel)
    DATE ............. date-fns ^4.4.0
    UTILITY .......... clsx ^2.1.1 + tailwind-merge ^3.6.0 + class-variance-authority ^0.7.1
    TEST ............. ESLint ^10.3.0 + typescript-eslint ^8.59.2

  [ ORCHESTRATION ] ........... ./

    MONOREPO ......... concurrently ^9.1.0 — runs BE + FE in parallel


>>> DATABASE — POSTGRESQL

  Configuration: BE/src/config/database.config.ts

  ┌──────────────────────┬────────────────────────────────────┐
  │  VARIABLE            │  DEFAULT VALUE                     │
  │──────────────────────┼────────────────────────────────────│
  │  DB_HOST             │  localhost                         │
  │  DB_PORT             │  5432                              │
  │  DB_USERNAME         │  <your-db-username>                │
  │  DB_PASSWORD         │  <your-db-password>                │
  │  DB_DATABASE         │  engineering_tracker               │
  └──────────────────────┴────────────────────────────────────┘

  TABLES [12]:

    master_users           │  master_companies        │  master_projects
    master_modules         │  master_drawing_types    │  master_disciplines
    drawings               │  drawing_activities      │  drawing_revisions
    revision_files         │  transmit_logs           │  transmit_drawings

  Full schema: BE/migrations/001_init.sql


>>> API DOCUMENTATION

  [ INTERACTIVE DOCS ]

    http://localhost:3000/api/docs

    Powered by @scalar/nestjs-api-reference — try endpoints directly
    from the browser. All endpoints prefixed with /engineering/api.
    Protected routes require Bearer JWT token.

  [ ENDPOINT MAP — 35 ENDPOINTS ]

    AUTH ──────────────────────────────────────────────────────────────────

      POST  /engineering/api/auth/login          Login · returns JWT
      GET   /engineering/api/auth/me             Current user profile
      GET   /engineering/api/auth/seed           Seed database

    MASTER DATA ───────────────────────────────────────────────────────────

      CRUD  /engineering/api/master/companies    Companies
      CRUD  /engineering/api/master/projects     Projects (filter: ?company_id)
      CRUD  /engineering/api/master/modules      Modules (filter: ?project_id)
      CRUD  /engineering/api/master/drawing-types Drawing types
      CRUD  /engineering/api/master/disciplines  Disciplines
      CRUD  /engineering/api/master/users        Users (filter: ?role)

    DRAWINGS ──────────────────────────────────────────────────────────────

      GET   /engineering/api/drawings            Paginated list (7+ filters)
      GET   /engineering/api/drawings/:id        Detail with relations
      POST  /engineering/api/drawings            Create drawing
      PATCH /engineering/api/drawings/:id        Update drawing

    ACTIVITIES ────────────────────────────────────────────────────────────

      GET   /engineering/api/drawings/:id/activities   Activity log
      POST  /engineering/api/drawings/:id/actions      Perform action

    REVISIONS & FILES ─────────────────────────────────────────────────────

      GET   /engineering/api/drawings/:id/revisions           List revisions
      POST  /engineering/api/drawings/:id/revisions           Create revision
      POST  /engineering/api/revisions/:revId/files           Upload file
      GET   /engineering/api/revisions/files/:fileId/download  Download file

    TRANSMIT ──────────────────────────────────────────────────────────────

      GET   /engineering/api/drawings/transmittable  List approvable drawings
      POST  /engineering/api/transmit                Transmit to production

    PRODUCTION ────────────────────────────────────────────────────────────

      GET   /engineering/api/production/drawings               List transmitted
      POST  /engineering/api/production/drawings/:id/raise-revision  Revise


>>> DRAWING LIFECYCLE — STATUS MACHINE

    [ ASSIGNED ]
         │
         ▼
    [ IN PROGRESS — DRAFTER ]
         │
         ▼
    [ IN PROGRESS — CHECKER ] ←── [ RETURNED ]
         │                              ▲
         ▼                              │
    [ IN PROGRESS — ENGINEER ] ─────────┘
         │
         ▼
    [ FULLY APPROVED ]
         │
         ▼
    [ TRANSMITTED ] ──→ [ RAISE REVISION ] ──→ [ ASSIGNED ]


>>> TEST ACCOUNTS

    ╔════════════╤══════════════════════╤══════════════╗
    ║  ROLE      │  EMAIL               │  PASSWORD    ║
    ╠════════════╪══════════════════════╪══════════════╣
    ║  Admin     │  admin@example.com   │  admin123    ║
    ║  Drafter   │  drafter@example.com │  drafter123  ║
    ║  Checker   │  checker@example.com │  checker123  ║
    ║  Engineer  │  engineer@example.com│  engineer123 ║
    ╚════════════╧══════════════════════╧══════════════╝


>>> INSTALLATION

  PREREQUISITES:

    [1] Node.js 20+ (LTS) — verify: node -v
    [2] npm 10+             — verify: npm -v
    [3] PostgreSQL 15+ running — verify: psql -V
    [4] Database 'engineering_tracker' must exist:
        > psql -U <your-user> -c "CREATE DATABASE engineering_tracker;"

  PROCEDURE:

    > git clone <repository-url>
    > cd engineering

    > npm install                          # installs concurrently (root)
    > cd BE && npm install && cd ..        # installs backend dependencies
    > cd FE && npm install && cd ..        # installs frontend dependencies

    # configure database connection
    > copy BE/.env.sample BE/.env
    > notepad BE/.env                      # adjust DB credentials

    # run both servers
    > npm run dev

  ┌──────────────────────────────────────────────────────────────────────────┐
  │  BACKEND ......... http://localhost:3000     (hot-reload via nest start) │
  │  FRONTEND ........ http://localhost:5173     (HMR via Vite)              │
  │  API DOCS ........ http://localhost:3000/api/docs                        │
  └──────────────────────────────────────────────────────────────────────────┘


>>> RUNNING INDIVIDUALLY

  BACKEND (BE/):

    npm run start:dev      Development with watch
    npm run start          Without watch
    npm run build          Compile to dist/
    npm run start:prod     Production mode
    npm run test           Unit tests (Jest)
    npm run test:e2e       E2E tests (Supertest)

  FRONTEND (FE/):

    npm run dev            Vite dev server
    npm run build          TypeScript check + production build
    npm run preview        Preview production build

  DEV MODE:

    Set VITE_DEV_MODE=true in FE/.env to use mock data
    instead of the real API — no backend required.


>>> ENVIRONMENT VARIABLES

  [ BE/.env ]

    VARIABLE         │  DEV DEFAULT                  │  PROD EXAMPLE
    ─────────────────┼──────────────────────────────┼────────────────────────────
    PORT             │  3000                        │  3000
    DB_HOST          │  localhost                   │  prod-db.example.com
    DB_PORT          │  5432                        │  5432
    DB_USERNAME      │  <your-db-username>          │  <prod-db-user>
    DB_PASSWORD      │  <your-db-password>          │  <prod-db-password>
    DB_DATABASE      │  engineering_tracker         │  engineering_tracker
    JWT_SECRET       │  <your-jwt-secret>           │  <change-me-to-random>
    JWT_EXPIRES_IN   │  24h                         │  24h

  [ FE/.env ]

    VITE_DEV_MODE    │  false                 │  false


>>> PROJECT STRUCTURE

  engineering/
  ├── BE/                        # Backend — NestJS monolith
  │   ├── src/
  │   │   ├── main.ts            # Bootstrap · CORS · Swagger · Seed
  │   │   ├── app.module.ts      # Root module
  │   │   ├── config/            # Database configuration
  │   │   ├── common/            # Guards · Filters · Decorators · Interceptors
  │   │   ├── entities/          # 12 TypeORM entity classes
  │   │   ├── modules/           # auth · master · drawing · transmit · production
  │   │   └── seed/              # Auto-seed on startup (4 users · 2 companies · ...)
  │   ├── migrations/001_init.sql
  │   ├── test/                  # E2E tests
  │   └── .env.development / .env.production / .env.sample
  │
  ├── FE/                        # Frontend — React + Vite
  │   ├── src/
  │   │   ├── main.tsx           # Entry point
  │   │   ├── App.tsx            # Router wrapper
  │   │   ├── layouts/           # Auth layout · App layout (neo-brutalist)
  │   │   ├── pages/             # 13 pages (dashboard · drawings · master data · ...)
  │   │   ├── api/               # HTTP client · mock data · API functions
  │   │   ├── hooks/             # React Query hooks
  │   │   ├── providers/         # Auth context provider
  │   │   ├── types/             # TypeScript interfaces
  │   │   └── lib/               # Constants · utilities · Swal helpers
  │   └── .env
  │
  ├── package.json               # Root orchestrator (concurrently)
  └── README.md                  # ⟵ YOU ARE HERE


>>> ROLE MATRIX

    ┌────────────┬────────────────────────────────────────────────────────┐
    │  ADMIN     │  Full CRUD master data · manage users                  │
    │  DRAFTER   │  Create drawings · start/stop work · submit to checker │
    │  CHECKER   │  Review drawings · approve/return to drafter           │
    │  ENGINEER  │  Final approval · return to checker                    │
    └────────────┴────────────────────────────────────────────────────────┘


[////////////////////////////////////////////////////////////////////////////////////]
[                                                                                    ]
[   ENGINEERING DRAWING TRACKER — REV 1.0                                           ]
[   (c) 2026 · ALL RIGHTS RESERVED                                                   ]
[                                                                                    ]
[////////////////////////////////////////////////////////////////////////////////////]
