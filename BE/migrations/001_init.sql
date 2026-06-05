-- ============================================================
-- Engineering Activity Tracker - Database Migration
-- Database: PostgreSQL
-- ============================================================

-- ----------------------------
-- ENUM: User roles
-- ----------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'drafter', 'checker', 'engineer');
  END IF;
END
$$;

-- ----------------------------
-- 1. master_users
-- ----------------------------
CREATE TABLE IF NOT EXISTS master_users (
  id         UUID PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       user_role NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON master_users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON master_users (role);

-- ----------------------------
-- 2. master_companies
-- ----------------------------
CREATE TABLE IF NOT EXISTS master_companies (
  id         UUID PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  code       VARCHAR(50) NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_code ON master_companies (code);

-- ----------------------------
-- 3. master_projects
-- ----------------------------
CREATE TABLE IF NOT EXISTS master_projects (
  id         UUID PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  code       VARCHAR(50) NOT NULL,
  company_id UUID NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_code ON master_projects (code);
CREATE INDEX IF NOT EXISTS idx_projects_company ON master_projects (company_id);

ALTER TABLE master_projects
  ADD CONSTRAINT fk_projects_company
  FOREIGN KEY (company_id) REFERENCES master_companies (id)
  ON DELETE CASCADE;

-- ----------------------------
-- 4. master_modules
-- ----------------------------
CREATE TABLE IF NOT EXISTS master_modules (
  id         UUID PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  code       VARCHAR(50) NOT NULL,
  project_id UUID NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modules_project ON master_modules (project_id);

ALTER TABLE master_modules
  ADD CONSTRAINT fk_modules_project
  FOREIGN KEY (project_id) REFERENCES master_projects (id)
  ON DELETE CASCADE;

-- ----------------------------
-- 5. master_disciplines
-- ----------------------------
CREATE TABLE IF NOT EXISTS master_disciplines (
  id   UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_disciplines_code ON master_disciplines (code);

-- ----------------------------
-- 6. master_drawing_types
-- ----------------------------
CREATE TABLE IF NOT EXISTS master_drawing_types (
  id   UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_drawing_types_code ON master_drawing_types (code);

-- ----------------------------
-- 7. drawings
-- ----------------------------
CREATE TABLE IF NOT EXISTS drawings (
  id               UUID PRIMARY KEY,
  document_no      VARCHAR(100) NOT NULL,
  description      TEXT,
  status           VARCHAR(30) NOT NULL DEFAULT 'assigned',
  company_id       UUID NOT NULL,
  project_id       UUID NOT NULL,
  module_id        UUID NOT NULL,
  discipline_id    UUID NOT NULL,
  drawing_type_id  UUID NOT NULL,
  created_by       UUID NOT NULL,
  assigned_drafter UUID NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_drawings_document_no ON drawings (document_no);
CREATE INDEX IF NOT EXISTS idx_drawings_status ON drawings (status);
CREATE INDEX IF NOT EXISTS idx_drawings_company ON drawings (company_id);
CREATE INDEX IF NOT EXISTS idx_drawings_project ON drawings (project_id);
CREATE INDEX IF NOT EXISTS idx_drawings_module ON drawings (module_id);
CREATE INDEX IF NOT EXISTS idx_drawings_discipline ON drawings (discipline_id);
CREATE INDEX IF NOT EXISTS idx_drawings_drawing_type ON drawings (drawing_type_id);
CREATE INDEX IF NOT EXISTS idx_drawings_created_by ON drawings (created_by);
CREATE INDEX IF NOT EXISTS idx_drawings_drafter ON drawings (assigned_drafter);

ALTER TABLE drawings
  ADD CONSTRAINT fk_drawings_company
  FOREIGN KEY (company_id) REFERENCES master_companies (id);

ALTER TABLE drawings
  ADD CONSTRAINT fk_drawings_project
  FOREIGN KEY (project_id) REFERENCES master_projects (id);

ALTER TABLE drawings
  ADD CONSTRAINT fk_drawings_module
  FOREIGN KEY (module_id) REFERENCES master_modules (id);

ALTER TABLE drawings
  ADD CONSTRAINT fk_drawings_discipline
  FOREIGN KEY (discipline_id) REFERENCES master_disciplines (id);

ALTER TABLE drawings
  ADD CONSTRAINT fk_drawings_drawing_type
  FOREIGN KEY (drawing_type_id) REFERENCES master_drawing_types (id);

ALTER TABLE drawings
  ADD CONSTRAINT fk_drawings_creator
  FOREIGN KEY (created_by) REFERENCES master_users (id);

ALTER TABLE drawings
  ADD CONSTRAINT fk_drawings_drafter
  FOREIGN KEY (assigned_drafter) REFERENCES master_users (id);

-- ----------------------------
-- 8. drawing_activities
-- ----------------------------
CREATE TABLE IF NOT EXISTS drawing_activities (
  id             UUID PRIMARY KEY,
  drawing_id     UUID NOT NULL,
  user_id        UUID NOT NULL,
  action         VARCHAR(30) NOT NULL,
  stage          VARCHAR(30) NOT NULL,
  return_reason  TEXT,
  action_time    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_drawing ON drawing_activities (drawing_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON drawing_activities (user_id);
CREATE INDEX IF NOT EXISTS idx_activities_time ON drawing_activities (action_time);

ALTER TABLE drawing_activities
  ADD CONSTRAINT fk_activities_drawing
  FOREIGN KEY (drawing_id) REFERENCES drawings (id)
  ON DELETE CASCADE;

ALTER TABLE drawing_activities
  ADD CONSTRAINT fk_activities_user
  FOREIGN KEY (user_id) REFERENCES master_users (id);

-- ----------------------------
-- 9. drawing_revisions
-- ----------------------------
CREATE TABLE IF NOT EXISTS drawing_revisions (
  id          UUID PRIMARY KEY,
  drawing_id  UUID NOT NULL,
  revision_no VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  created_by  UUID NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revisions_drawing ON drawing_revisions (drawing_id);
CREATE INDEX IF NOT EXISTS idx_revisions_creator ON drawing_revisions (created_by);

ALTER TABLE drawing_revisions
  ADD CONSTRAINT fk_revisions_drawing
  FOREIGN KEY (drawing_id) REFERENCES drawings (id)
  ON DELETE CASCADE;

ALTER TABLE drawing_revisions
  ADD CONSTRAINT fk_revisions_creator
  FOREIGN KEY (created_by) REFERENCES master_users (id);

-- ----------------------------
-- 10. revision_files
-- ----------------------------
CREATE TABLE IF NOT EXISTS revision_files (
  id          UUID PRIMARY KEY,
  revision_id UUID NOT NULL,
  file_name   VARCHAR(255) NOT NULL,
  file_path   VARCHAR(500) NOT NULL,
  file_type   VARCHAR(100) NOT NULL,
  file_size   INTEGER NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revision_files_revision ON revision_files (revision_id);

ALTER TABLE revision_files
  ADD CONSTRAINT fk_revision_files_revision
  FOREIGN KEY (revision_id) REFERENCES drawing_revisions (id)
  ON DELETE CASCADE;

-- ----------------------------
-- 11. transmit_logs
-- ----------------------------
CREATE TABLE IF NOT EXISTS transmit_logs (
  id              UUID PRIMARY KEY,
  transmitted_by  UUID NOT NULL,
  notes           TEXT,
  transmitted_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transmit_logs_user ON transmit_logs (transmitted_by);

ALTER TABLE transmit_logs
  ADD CONSTRAINT fk_transmit_logs_user
  FOREIGN KEY (transmitted_by) REFERENCES master_users (id);

-- ----------------------------
-- 12. transmit_drawings
-- ----------------------------
CREATE TABLE IF NOT EXISTS transmit_drawings (
  id              UUID PRIMARY KEY,
  transmit_log_id UUID NOT NULL,
  drawing_id      UUID NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transmit_drawings_log ON transmit_drawings (transmit_log_id);
CREATE INDEX IF NOT EXISTS idx_transmit_drawings_drawing ON transmit_drawings (drawing_id);

ALTER TABLE transmit_drawings
  ADD CONSTRAINT fk_transmit_drawings_log
  FOREIGN KEY (transmit_log_id) REFERENCES transmit_logs (id)
  ON DELETE CASCADE;

ALTER TABLE transmit_drawings
  ADD CONSTRAINT fk_transmit_drawings_drawing
  FOREIGN KEY (drawing_id) REFERENCES drawings (id);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin user (password: admin123, bcrypt hash)
INSERT INTO master_users (id, name, email, password, role) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Admin', 'admin@example.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9Rn6bm1FZwOJK3v0pMl0IRLG2y', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Demo seed data
INSERT INTO master_companies (id, name, code) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'PT Rekayasa Engineering', 'REK'),
  ('b1000000-0000-0000-0000-000000000002', 'PT Konstruksi Nusantara', 'KON')
ON CONFLICT (id) DO NOTHING;

INSERT INTO master_projects (id, name, code, company_id) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Jembatan Suramadu Fase 2', 'SRM-02', 'b1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000002', 'Gedung Pusat Inovasi', 'GPI-01', 'b1000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO master_modules (id, name, code, project_id) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Struktur Atas', 'STA', 'c1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000002', 'Struktur Bawah', 'STB', 'c1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000003', 'Arsitektur', 'ARS', 'c1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000004', 'MEP', 'MEP', 'c1000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO master_disciplines (id, name, code) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'Sipil', 'CIV'),
  ('e1000000-0000-0000-0000-000000000002', 'Arsitektur', 'ARC'),
  ('e1000000-0000-0000-0000-000000000003', 'Elektrikal', 'ELE'),
  ('e1000000-0000-0000-0000-000000000004', 'Mekanikal', 'MEC')
ON CONFLICT (id) DO NOTHING;

INSERT INTO master_drawing_types (id, name, code) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'Shop Drawing', 'SD'),
  ('f1000000-0000-0000-0000-000000000002', 'As Built Drawing', 'ABD'),
  ('f1000000-0000-0000-0000-000000000003', 'Detail Drawing', 'DD'),
  ('f1000000-0000-0000-0000-000000000004', 'Layout Drawing', 'LD')
ON CONFLICT (id) DO NOTHING;

INSERT INTO master_users (id, name, email, password, role) VALUES
  ('a0000000-0000-0000-0000-000000000010', 'Budi Drafter', 'budi@example.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9Rn6bm1FZwOJK3v0pMl0IRLG2y', 'drafter'),
  ('a0000000-0000-0000-0000-000000000020', 'Citra Checker', 'citra@example.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9Rn6bm1FZwOJK3v0pMl0IRLG2y', 'checker'),
  ('a0000000-0000-0000-0000-000000000030', 'Doni Engineer', 'doni@example.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9Rn6bm1FZwOJK3v0pMl0IRLG2y', 'engineer')
ON CONFLICT (id) DO NOTHING;
