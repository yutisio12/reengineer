import * as bcrypt from 'bcrypt';

export const SEED_USERS = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin' as const,
    is_active: true,
    password: bcrypt.hashSync('admin123', 10),
  },
  {
    id: 'u2',
    name: 'Drafter User',
    email: 'drafter@example.com',
    role: 'drafter' as const,
    is_active: true,
    password: bcrypt.hashSync('drafter123', 10),
  },
  {
    id: 'u3',
    name: 'Checker User',
    email: 'checker@example.com',
    role: 'checker' as const,
    is_active: true,
    password: bcrypt.hashSync('checker123', 10),
  },
  {
    id: 'u4',
    name: 'Engineer User',
    email: 'engineer@example.com',
    role: 'engineer' as const,
    is_active: true,
    password: bcrypt.hashSync('engineer123', 10),
  },
];

export const SEED_COMPANIES = [
  { id: 'c1', name: 'PT Konstruksi Sejahtera', code: 'KNS' },
  { id: 'c2', name: 'PT Baja Utama', code: 'BU' },
];

export const SEED_PROJECTS = [
  { id: 'p1', name: 'Pembangunan Gedung A', code: 'GA', company_id: 'c1' },
  { id: 'p2', name: 'Jembatan B', code: 'JB', company_id: 'c2' },
];

export const SEED_MODULES = [
  { id: 'm1', name: 'Struktur Bawah', code: 'SB', project_id: 'p1' },
  { id: 'm2', name: 'Struktur Atas', code: 'SA', project_id: 'p1' },
  { id: 'm3', name: 'Pondasi', code: 'PD', project_id: 'p2' },
  { id: 'm4', name: 'Lantai', code: 'LT', project_id: 'p2' },
];

export const SEED_DRAWING_TYPES = [
  { id: 'dt1', name: 'Shop Drawing', code: 'SD' },
  { id: 'dt2', name: 'As Built Drawing', code: 'ABD' },
  { id: 'dt3', name: 'Method Statement', code: 'MS' },
];

export const SEED_DISCIPLINES = [
  { id: 'dsc1', name: 'Structural', code: 'STR' },
  { id: 'dsc2', name: 'Architectural', code: 'ARC' },
  { id: 'dsc3', name: 'Mechanical Electrical', code: 'ME' },
];

export const SEED_DRAWINGS = [
  {
    id: 'd1',
    document_no: 'SD-GA-001',
    description: 'Shop Drawing Gedung A - Struktur Bawah 1',
    status: 'transmitted',
    company_id: 'c1',
    project_id: 'p1',
    module_id: 'm1',
    discipline_id: 'dsc1',
    drawing_type_id: 'dt1',
    created_by: 'u1',
    assigned_drafter: 'u2',
  },
  {
    id: 'd2',
    document_no: 'SD-GA-002',
    description: 'Shop Drawing Gedung A - Struktur Bawah 2',
    status: 'transmitted',
    company_id: 'c1',
    project_id: 'p1',
    module_id: 'm1',
    discipline_id: 'dsc1',
    drawing_type_id: 'dt1',
    created_by: 'u1',
    assigned_drafter: 'u2',
  },
  {
    id: 'd3',
    document_no: 'SD-GA-003',
    description: 'Shop Drawing Gedung A - Struktur Atas 1',
    status: 'fully_approved',
    company_id: 'c1',
    project_id: 'p1',
    module_id: 'm2',
    discipline_id: 'dsc1',
    drawing_type_id: 'dt1',
    created_by: 'u1',
    assigned_drafter: 'u2',
  },
  {
    id: 'd4',
    document_no: 'SD-GA-004',
    description: 'As Built Gedung A - Struktur Atas',
    status: 'in_progress_checker',
    company_id: 'c1',
    project_id: 'p1',
    module_id: 'm2',
    discipline_id: 'dsc2',
    drawing_type_id: 'dt2',
    created_by: 'u1',
    assigned_drafter: 'u2',
  },
  {
    id: 'd5',
    document_no: 'SD-GA-005',
    description: 'As Built Gedung A - Struktur Bawah',
    status: 'in_progress_drafter',
    company_id: 'c1',
    project_id: 'p1',
    module_id: 'm1',
    discipline_id: 'dsc2',
    drawing_type_id: 'dt2',
    created_by: 'u1',
    assigned_drafter: 'u2',
  },
  {
    id: 'd6',
    document_no: 'SD-GA-006',
    description: 'Method Statement Gedung A',
    status: 'assigned',
    company_id: 'c1',
    project_id: 'p1',
    module_id: 'm1',
    discipline_id: 'dsc3',
    drawing_type_id: 'dt3',
    created_by: 'u1',
    assigned_drafter: 'u2',
  },
];
