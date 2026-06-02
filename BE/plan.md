# Engineering Activity Tracker — Backend Plan

## Tech Stack

- **Runtime**: Node.js 20+ (LTS)
- **Framework**: NestJS 10+ (Express platform)
- **ORM**: TypeORM 0.3+ with Data Mapper pattern
- **Database**: PostgreSQL 15+
- **Auth**: JWT (`@nestjs/jwt` + `@nestjs/passport` + `passport-jwt`)
- **Validation**: `class-validator` + `class-transformer`
- **File Upload**: `multer` (via NestJS built-in `FileInterceptor`)
- **Password Hashing**: `bcrypt`
- **API Base Path**: `/engineering/api`

---

## Database Schema: 12 Entities

### 1. `master_users`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK, seed: u1..u4 |
| name | VARCHAR(100) | |
| email | VARCHAR(100) | unique |
| password | VARCHAR(255) | bcrypt hash |
| role | ENUM('admin','drafter','checker','engineer') | |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMP | default NOW |
| updated_at | TIMESTAMP | default NOW |

### 2. `master_companies`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK, seed: c1, c2 |
| name | VARCHAR(100) | |
| code | VARCHAR(50) | unique |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMP | |

### 3. `master_projects`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK, seed: p1, p2 |
| name | VARCHAR(100) | |
| code | VARCHAR(50) | unique |
| company_id | UUID | FK → master_companies |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMP | |

### 4. `master_modules`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK, seed: m1..m4 |
| name | VARCHAR(100) | |
| code | VARCHAR(50) | |
| project_id | UUID | FK → master_projects |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMP | |

### 5. `master_drawing_types`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK, seed: dt1..dt3 |
| name | VARCHAR(100) | |
| code | VARCHAR(50) | unique |

### 6. `master_disciplines`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK, seed: dsc1..dsc3 |
| name | VARCHAR(100) | |
| code | VARCHAR(50) | unique |

### 7. `drawings`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK, seed: d1..d6 |
| document_no | VARCHAR(100) | unique |
| description | TEXT | nullable |
| status | VARCHAR(30) | lihat status machine |
| company_id | UUID | FK → master_companies |
| project_id | UUID | FK → master_projects |
| module_id | UUID | FK → master_modules |
| discipline_id | UUID | FK → master_disciplines |
| drawing_type_id | UUID | FK → master_drawing_types |
| created_by | UUID | FK → master_users |
| assigned_drafter | UUID | FK → master_users |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 8. `drawing_activities`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| drawing_id | UUID | FK → drawings |
| user_id | UUID | FK → master_users |
| action | VARCHAR(30) | start/stop/submit/return/approve |
| stage | VARCHAR(30) | drafter/checker/engineer |
| return_reason | TEXT | nullable, only on return action |
| action_time | TIMESTAMP | default NOW |

### 9. `drawing_revisions`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| drawing_id | UUID | FK → drawings |
| revision_no | VARCHAR(20) | |
| description | TEXT | |
| created_by | UUID | FK → master_users |
| created_at | TIMESTAMP | |

### 10. `revision_files`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| revision_id | UUID | FK → drawing_revisions |
| file_name | VARCHAR(255) | original name |
| file_path | VARCHAR(500) | path on disk |
| file_type | VARCHAR(100) | MIME type |
| file_size | INTEGER | bytes |
| uploaded_at | TIMESTAMP | |

### 11. `transmit_logs`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| transmitted_by | UUID | FK → master_users |
| notes | TEXT | nullable |
| transmitted_at | TIMESTAMP | |

### 12. `transmit_drawings`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| transmit_log_id | UUID | FK → transmit_logs |
| drawing_id | UUID | FK → drawings |

---

## Drawing Status Machine

```
assigned
  → start(drafter) → in_progress_drafter

in_progress_drafter
  → stop             → in_progress_drafter (no change, record activity)
  → submit(checker)  → in_progress_checker

in_progress_checker
  → stop             → in_progress_checker (no change)
  → submit(engineer) → in_progress_engineer
  → return(drafter)  → in_progress_drafter

in_progress_engineer
  → stop             → in_progress_engineer (no change)
  → approve          → fully_approved
  → return(checker)  → in_progress_checker

fully_approved
  → (via POST /transmit) → transmitted

transmitted
  → (via raise-revision) → in_progress_drafter
```

---

## Seed Data (Fixed UUIDs matching FE mock)

### Users
| id | name | email | role | password (plain) |
|---|---|---|---|---|
| u1 | Admin User | admin@example.com | admin | admin123 |
| u2 | Drafter User | drafter@example.com | drafter | drafter123 |
| u3 | Checker User | checker@example.com | checker | checker123 |
| u4 | Engineer User | engineer@example.com | engineer | engineer123 |

### Companies
| id | name | code |
|---|---|---|
| c1 | PT Konstruksi Sejahtera | KNS |
| c2 | PT Baja Utama | BU |

### Projects
| id | name | code | company_id |
|---|---|---|---|
| p1 | Pembangunan Gedung A | GA | c1 |
| p2 | Jembatan B | JB | c2 |

### Modules
| id | name | code | project_id |
|---|---|---|---|
| m1 | Struktur Bawah | SB | p1 |
| m2 | Struktur Atas | SA | p1 |
| m3 | Pondasi | PD | p2 |
| m4 | Lantai | LT | p2 |

### Drawing Types
| id | name | code |
|---|---|---|
| dt1 | Shop Drawing | SD |
| dt2 | As Built Drawing | ABD |
| dt3 | Method Statement | MS |

### Disciplines
| id | name | code |
|---|---|---|
| dsc1 | Structural | STR |
| dsc2 | Architectural | ARC |
| dsc3 | Mechanical Electrical | ME |

### Drawings
| id | document_no | status | company_id | project_id | module_id | discipline_id | drawing_type_id | created_by | assigned_drafter |
|---|---|---|---|---|---|---|---|---|---|
| d1 | SD-GA-001 | transmitted | c1 | p1 | m1 | dsc1 | dt1 | u1 | u2 |
| d2 | SD-GA-002 | transmitted | c1 | p1 | m1 | dsc1 | dt1 | u1 | u2 |
| d3 | SD-GA-003 | fully_approved | c1 | p1 | m2 | dsc1 | dt1 | u1 | u2 |
| d4 | SD-GA-004 | in_progress_checker | c1 | p1 | m2 | dsc2 | dt2 | u1 | u2 |
| d5 | SD-GA-005 | in_progress_drafter | c1 | p1 | m1 | dsc2 | dt2 | u1 | u2 |
| d6 | SD-GA-006 | assigned | c1 | p1 | m1 | dsc3 | dt3 | u1 | u2 |

---

## Endpoint Detail per Feature

### 1. AUTH

```
GET /engineering/api/auth/seed
  → Data dikirim: -
  → Yang berubah: INSERT master_users & master seed data jika tabel kosong
  → Return: { message: "Seed data created" }

POST /engineering/api/auth/login
  → Data dikirim: { email: string, password: string }
  → Yang berubah: none (read-only; token digenerate & direturn)
  → Return: { token: string, user: User } (user tanpa password)

GET /engineering/api/auth/me
  → Data dikirim: - (Authorization: Bearer <token>)
  → Yang berubah: none
  → Return: User (tanpa password)
```

### 2. MASTER DATA — Companies

```
GET /engineering/api/master/companies
  → Data dikirim: -
  → Yang berubah: none
  → Return: Company[] (ORDER BY name ASC)

POST /engineering/api/master/companies
  → Data dikirim: { name: string, code: string }
  → Yang berubah:
    - INSERT master_companies (id = UUID, is_active = true, created_at = NOW)
    - Validasi: code must be unique
  → Return: Company (201 Created)

PATCH /engineering/api/master/companies/:id
  → Data dikirim: { name?: string, code?: string, is_active?: boolean }
  → Yang berubah: UPDATE master_companies SET field yg dikirim
    - Validasi: jika ganti code, cek unique
  → Return: Company
```

### 3. MASTER DATA — Projects

```
GET /engineering/api/master/projects?company_id=
  → Data dikirim: query company_id (optional)
  → Yang berubah: none
  → Return: Project[] (dengan company_name hasil JOIN, ORDER BY name ASC)

POST /engineering/api/master/projects
  → Data dikirim: { name: string, code: string, company_id: string }
  → Yang berubah:
    - INSERT master_projects (id = UUID, is_active = true, created_at = NOW)
    - Validasi: company_id harus ada di master_companies
  → Return: Project (dengan company_name, 201 Created)

PATCH /engineering/api/master/projects/:id
  → Data dikirim: { name?, code?, company_id?, is_active? }
  → Yang berubah: UPDATE master_projects SET field yg dikirim
  → Return: Project (dengan company_name)
```

### 4. MASTER DATA — Modules

```
GET /engineering/api/master/modules?project_id=
  → Data dikirim: query project_id (optional)
  → Yang berubah: none
  → Return: Module[] (dengan project_name hasil JOIN)

POST /engineering/api/master/modules
  → Data dikirim: { name: string, code: string, project_id: string }
  → Yang berubah:
    - INSERT master_modules (id = UUID, is_active = true, created_at = NOW)
    - Validasi: project_id harus ada di master_projects
  → Return: Module (dengan project_name, 201 Created)

PATCH /engineering/api/master/modules/:id
  → Data dikirim: { name?, code?, project_id?, is_active? }
  → Yang berubah: UPDATE master_modules SET field yg dikirim
  → Return: Module (dengan project_name)
```

### 5. MASTER DATA — Drawing Types

```
GET /engineering/api/master/drawing-types
  → Data dikirim: -
  → Yang berubah: none
  → Return: DrawingType[] (ORDER BY name ASC)

POST /engineering/api/master/drawing-types
  → Data dikirim: { name: string, code: string }
  → Yang berubah: INSERT master_drawing_types
  → Return: DrawingType (201 Created)

PATCH /engineering/api/master/drawing-types/:id
  → Data dikirim: { name?, code? }
  → Yang berubah: UPDATE master_drawing_types SET field yg dikirim
  → Return: DrawingType
```

### 6. MASTER DATA — Disciplines

```
GET /engineering/api/master/disciplines
  → Data dikirim: -
  → Yang berubah: none
  → Return: Discipline[] (ORDER BY name ASC)

POST /engineering/api/master/disciplines
  → Data dikirim: { name: string, code: string }
  → Yang berubah: INSERT master_disciplines
  → Return: Discipline (201 Created)

PATCH /engineering/api/master/disciplines/:id
  → Data dikirim: { name?, code? }
  → Yang berubah: UPDATE master_disciplines SET field yg dikirim
  → Return: Discipline
```

### 7. MASTER DATA — Users

```
GET /engineering/api/master/users?role=
  → Data dikirim: query role (optional: admin|drafter|checker|engineer)
  → Yang berubah: none
  → Return: User[] (tanpa password, ORDER BY name ASC)

POST /engineering/api/master/users
  → Data dikirim: { name: string, email: string, role: UserRole, password?: string }
  → Yang berubah:
    - INSERT master_users (id = UUID, password = bcrypt hash, is_active = true)
    - Jika password tidak dikirim, default = "password123" (hash)
  → Return: User (tanpa password, 201 Created)

PATCH /engineering/api/master/users/:id
  → Data dikirim: { name?, email?, role?, is_active?, password? }
  → Yang berubah: UPDATE master_users SET field yg dikirim
    - Jika password dikirim, hash dulu pakai bcrypt
  → Return: User (tanpa password)
```

### 8. DRAWING — CRUD

```
GET /engineering/api/drawings?company_id&project_id&discipline_id&drawing_type_id&module_id&status&search&page=1&per_page=20
  → Data dikirim: query params (semua optional)
  → Yang berubah: none
  → Return: {
      data: Drawing[] (semua relasi populate: company, project, module, discipline, drawing_type, created_by, assigned_drafter),
      meta: { total, page, per_page, total_pages }
    }

GET /engineering/api/drawings/:id
  → Data dikirim: path param :id
  → Yang berubah: none
  → Return: Drawing (semua relasi populate)

POST /engineering/api/drawings
  → Data dikirim: {
      company_id: string,
      project_id: string,
      discipline_id: string,
      drawing_type_id: string,
      module_id: string,
      document_no: string,
      assigned_drafter: string,
      description?: string
    }
  → Yang berubah:
    - INSERT drawings (id = UUID)
    - created_by = current user (dari JWT)
    - status = 'assigned'
    - created_at = NOW, updated_at = NOW
    - Validasi: document_no harus unique
  → Return: Drawing (semua relasi populate, 201 Created)

PATCH /engineering/api/drawings/:id
  → Data dikirim: {
      company_id?: string, project_id?: string, discipline_id?: string,
      drawing_type_id?: string, module_id?: string, document_no?: string,
      assigned_drafter?: string, description?: string, status?: string
    }
  → Yang berubah: UPDATE drawings SET field yg dikirim, updated_at = NOW
  → Return: Drawing (semua relasi populate)
```

### 9. DRAWING — Activities

```
GET /engineering/api/drawings/:id/activities
  → Data dikirim: path param :id
  → Yang berubah: none
  → Return: DrawingActivity[] (dengan user.name populate, ORDER BY action_time ASC)

POST /engineering/api/drawings/:id/actions
  → Data dikirim: { action: string, stage: string, return_reason?: string }
    action ∈ { start, stop, submit, return, approve }
    stage ∈ { drafter, checker, engineer }
  → Yang berubah:
    1. UPDATE drawings.status → next status (lihat status machine di atas)
    2. UPDATE drawings.updated_at = NOW
    3. INSERT drawing_activities (id = UUID, user_id = current user, action_time = NOW)
    4. Jika return_reason dikirim, simpan di activity
    - Validasi: transisi status harus valid (return 400 jika invalid)
  → Return: DrawingActivity (201 Created)
```

### 10. DRAWING — Revisions & Files

```
GET /engineering/api/drawings/:id/revisions
  → Data dikirim: path param :id
  → Yang berubah: none
  → Return: DrawingRevision[] (masing-masing dgn files[] & creator, ORDER BY created_at ASC)

POST /engineering/api/drawings/:id/revisions
  → Data dikirim: { revision_no: string, description: string }
  → Yang berubah:
    - INSERT drawing_revisions (id = UUID, created_by = current user, created_at = NOW)
    - Tidak ubah status drawing (revision created, tapi belum di-raise)
  → Return: DrawingRevision (dengan files[] = [], 201 Created)

POST /engineering/api/revisions/:revisionId/files
  → Data dikirim: FormData (multipart) dgn field "file"
  → Yang berubah:
    - Simpan file ke disk: uploads/revisions/<revisionId>/<uuid>-<originalName>
    - INSERT revision_files (id = UUID, uploaded_at = NOW)
    - Validasi: file size max 20MB
  → Return: RevisionFile (201 Created)

GET /engineering/api/revisions/files/:fileId/download
  → Data dikirim: path param :fileId
  → Yang berubah: none
  → Return: Binary file stream
    - Content-Type: dari file_type
    - Content-Disposition: attachment; filename="<file_name>"
```

### 11. TRANSMIT

```
GET /engineering/api/drawings/transmittable
  → Data dikirim: -
  → Yang berubah: none
  → Return: Drawing[] (filter WHERE status = 'fully_approved', semua relasi populate)

POST /engineering/api/transmit
  → Data dikirim: { drawing_ids: string[], notes?: string }
  → Yang berubah:
    PER drawing_id:
    1. UPDATE drawings.status = 'transmitted'
    2. UPDATE drawings.updated_at = NOW
    - INSERT transmit_log (id = UUID, transmitted_by = current user, transmitted_at = NOW)
    - INSERT transmit_drawings (transmit_log_id, drawing_id) untuk setiap drawing
    - Validasi: semua drawing_id harus status = 'fully_approved'
  → Return: {
      transmit_log: TransmitLog (dengan transmitted_by user populate),
      drawings: Drawing[]
    } (201 Created)
```

### 12. PRODUCTION

```
GET /engineering/api/production/drawings?company_id&project_id&module_id&search
  → Data dikirim: query params (semua optional)
  → Yang berubah: none
  → Return: Drawing[] (filter WHERE status = 'transmitted', semua relasi populate termasuk latest revision)

POST /engineering/api/production/drawings/:id/raise-revision
  → Data dikirim: { revision_no: string, description: string }
  → Yang berubah:
    1. INSERT drawing_revisions (id = UUID, created_by = current user, created_at = NOW)
    2. UPDATE drawings.status = 'in_progress_drafter'
    3. UPDATE drawings.updated_at = NOW
    4. INSERT drawing_activities (
        id = UUID, action = 'start', stage = 'drafter',
        user_id = current user, action_time = NOW
      )
  → Return: Drawing (semua relasi populate)
```

---

## Total Endpoints: 35

| Feature | Endpoints | Count |
|---|---|---|
| Auth | login, me, seed | 3 |
| Master Companies | list, create, update | 3 |
| Master Projects | list, create, update | 3 |
| Master Modules | list, create, update | 3 |
| Master Drawing Types | list, create, update | 3 |
| Master Disciplines | list, create, update | 3 |
| Master Users | list, create, update | 3 |
| Drawing CRUD | list, detail, create, update | 4 |
| Drawing Activities | list, action | 2 |
| Drawing Revisions & Files | list revisions, create revision, upload file, download file | 4 |
| Transmit | transmittable list, transmit | 2 |
| Production | list, raise revision | 2 |
| **Total** | | **35** |

---

## Folder Structure

```
BE/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── interceptors/
│   │       └── transform.interceptor.ts
│   ├── config/
│   │   └── database.config.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── login-response.dto.ts
│   │   ├── master/
│   │   │   ├── master.module.ts
│   │   │   ├── master.controller.ts
│   │   │   ├── master.service.ts
│   │   │   └── dto/
│   │   │       ├── create-company.dto.ts
│   │   │       ├── update-company.dto.ts
│   │   │       ├── create-project.dto.ts
│   │   │       ├── update-project.dto.ts
│   │   │       ├── create-module.dto.ts
│   │   │       ├── update-module.dto.ts
│   │   │       ├── create-drawing-type.dto.ts
│   │   │       ├── update-drawing-type.dto.ts
│   │   │       ├── create-discipline.dto.ts
│   │   │       ├── update-discipline.dto.ts
│   │   │       ├── create-user.dto.ts
│   │   │       └── update-user.dto.ts
│   │   ├── drawing/
│   │   │   ├── drawing.module.ts
│   │   │   ├── drawing.controller.ts
│   │   │   ├── drawing.service.ts
│   │   │   └── dto/
│   │   │       ├── create-drawing.dto.ts
│   │   │       ├── update-drawing.dto.ts
│   │   │       ├── drawing-action.dto.ts
│   │   │       ├── create-revision.dto.ts
│   │   │       └── query-drawing.dto.ts
│   │   ├── transmit/
│   │   │   ├── transmit.module.ts
│   │   │   ├── transmit.controller.ts
│   │   │   ├── transmit.service.ts
│   │   │   └── dto/
│   │   │       └── transmit.dto.ts
│   │   └── production/
│   │       ├── production.module.ts
│   │       ├── production.controller.ts
│   │       ├── production.service.ts
│   │       └── dto/
│   │           └── raise-revision.dto.ts
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── company.entity.ts
│   │   ├── project.entity.ts
│   │   ├── module.entity.ts
│   │   ├── drawing-type.entity.ts
│   │   ├── discipline.entity.ts
│   │   ├── drawing.entity.ts
│   │   ├── drawing-activity.entity.ts
│   │   ├── drawing-revision.entity.ts
│   │   ├── revision-file.entity.ts
│   │   ├── transmit-log.entity.ts
│   │   └── transmit-drawing.entity.ts
│   └── seed/
│       ├── seed.module.ts
│       ├── seed.service.ts
│       └── seed-data.ts
├── uploads/
│   └── revisions/
├── .env
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── nest-cli.json
```

---

## Implementation Order

1. **Project scaffold**: `nest new` + TypeORM + PostgreSQL config + JWT setup
2. **Entities**: 12 TypeORM entity classes dengan relasi
3. **Seed**: Seed service dengan fixed UUIDs
4. **Auth Module**: login, JWT strategy, guards, /me
5. **Master Module**: CRUD untuk 6 master entities dalam 1 module
6. **Drawing Module**: CRUD + activities + revisions + files
7. **Transmit Module**: transmittable list + transmit
8. **Production Module**: production list + raise revision
9. **File upload**: multer config + download stream
