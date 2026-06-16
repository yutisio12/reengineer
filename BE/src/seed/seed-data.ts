import * as bcrypt from 'bcrypt';

export const SEED_USERS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin' as const,
    is_active: true,
    password: bcrypt.hashSync('admin123', 10),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Drafter User',
    email: 'drafter@example.com',
    role: 'drafter' as const,
    is_active: true,
    password: bcrypt.hashSync('drafter123', 10),
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Checker User',
    email: 'checker@example.com',
    role: 'checker' as const,
    is_active: true,
    password: bcrypt.hashSync('checker123', 10),
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Engineer User',
    email: 'engineer@example.com',
    role: 'engineer' as const,
    is_active: true,
    password: bcrypt.hashSync('engineer123', 10),
  },
];

export const SEED_COMPANIES = [
  { id: '00000000-0000-0000-0000-000000000010', name: 'PT Konstruksi Sejahtera', code: 'KNS' },
  { id: '00000000-0000-0000-0000-000000000011', name: 'PT Baja Utama', code: 'BU' },
];

export const SEED_PROJECTS = [
  { id: '00000000-0000-0000-0000-000000000020', name: 'Pembangunan Gedung A', code: 'GA', company_id: '00000000-0000-0000-0000-000000000010' },
  { id: '00000000-0000-0000-0000-000000000021', name: 'Jembatan B', code: 'JB', company_id: '00000000-0000-0000-0000-000000000011' },
];

export const SEED_MODULES = [
  { id: '00000000-0000-0000-0000-000000000030', name: 'Struktur Bawah', code: 'SB', project_id: '00000000-0000-0000-0000-000000000020' },
  { id: '00000000-0000-0000-0000-000000000031', name: 'Struktur Atas', code: 'SA', project_id: '00000000-0000-0000-0000-000000000020' },
  { id: '00000000-0000-0000-0000-000000000032', name: 'Pondasi', code: 'PD', project_id: '00000000-0000-0000-0000-000000000021' },
  { id: '00000000-0000-0000-0000-000000000033', name: 'Lantai', code: 'LT', project_id: '00000000-0000-0000-0000-000000000021' },
];

export const SEED_DRAWING_TYPES = [
  { id: '00000000-0000-0000-0000-000000000040', name: 'Shop Drawing', code: 'SD' },
  { id: '00000000-0000-0000-0000-000000000041', name: 'As Built Drawing', code: 'ABD' },
  { id: '00000000-0000-0000-0000-000000000042', name: 'Method Statement', code: 'MS' },
];

export const SEED_DISCIPLINES = [
  { id: '00000000-0000-0000-0000-000000000050', name: 'Structural', code: 'STR' },
  { id: '00000000-0000-0000-0000-000000000051', name: 'Architectural', code: 'ARC' },
  { id: '00000000-0000-0000-0000-000000000052', name: 'Mechanical Electrical', code: 'ME' },
];

export const SEED_DRAWINGS = [
  {
    id: '00000000-0000-0000-0000-000000000060',
    document_no: 'SD-GA-001',
    description: 'Shop Drawing Gedung A - Struktur Bawah 1',
    status: 'transmitted',
    company_id: '00000000-0000-0000-0000-000000000010',
    project_id: '00000000-0000-0000-0000-000000000020',
    module_id: '00000000-0000-0000-0000-000000000030',
    discipline_id: '00000000-0000-0000-0000-000000000050',
    drawing_type_id: '00000000-0000-0000-0000-000000000040',
    created_by: '00000000-0000-0000-0000-000000000001',
    assigned_drafter: '00000000-0000-0000-0000-000000000002',
  },
  {
    id: '00000000-0000-0000-0000-000000000061',
    document_no: 'SD-GA-002',
    description: 'Shop Drawing Gedung A - Struktur Bawah 2',
    status: 'transmitted',
    company_id: '00000000-0000-0000-0000-000000000010',
    project_id: '00000000-0000-0000-0000-000000000020',
    module_id: '00000000-0000-0000-0000-000000000030',
    discipline_id: '00000000-0000-0000-0000-000000000050',
    drawing_type_id: '00000000-0000-0000-0000-000000000040',
    created_by: '00000000-0000-0000-0000-000000000001',
    assigned_drafter: '00000000-0000-0000-0000-000000000002',
  },
  {
    id: '00000000-0000-0000-0000-000000000062',
    document_no: 'SD-GA-003',
    description: 'Shop Drawing Gedung A - Struktur Atas 1',
    status: 'fully_approved',
    company_id: '00000000-0000-0000-0000-000000000010',
    project_id: '00000000-0000-0000-0000-000000000020',
    module_id: '00000000-0000-0000-0000-000000000031',
    discipline_id: '00000000-0000-0000-0000-000000000050',
    drawing_type_id: '00000000-0000-0000-0000-000000000040',
    created_by: '00000000-0000-0000-0000-000000000001',
    assigned_drafter: '00000000-0000-0000-0000-000000000002',
  },
  {
    id: '00000000-0000-0000-0000-000000000063',
    document_no: 'SD-GA-004',
    description: 'As Built Gedung A - Struktur Atas',
    status: 'in_progress_checker',
    company_id: '00000000-0000-0000-0000-000000000010',
    project_id: '00000000-0000-0000-0000-000000000020',
    module_id: '00000000-0000-0000-0000-000000000031',
    discipline_id: '00000000-0000-0000-0000-000000000051',
    drawing_type_id: '00000000-0000-0000-0000-000000000041',
    created_by: '00000000-0000-0000-0000-000000000001',
    assigned_drafter: '00000000-0000-0000-0000-000000000002',
  },
  {
    id: '00000000-0000-0000-0000-000000000064',
    document_no: 'SD-GA-005',
    description: 'As Built Gedung A - Struktur Bawah',
    status: 'in_progress_drafter',
    company_id: '00000000-0000-0000-0000-000000000010',
    project_id: '00000000-0000-0000-0000-000000000020',
    module_id: '00000000-0000-0000-0000-000000000030',
    discipline_id: '00000000-0000-0000-0000-000000000051',
    drawing_type_id: '00000000-0000-0000-0000-000000000041',
    created_by: '00000000-0000-0000-0000-000000000001',
    assigned_drafter: '00000000-0000-0000-0000-000000000002',
  },
  {
    id: '00000000-0000-0000-0000-000000000065',
    document_no: 'SD-GA-006',
    description: 'Method Statement Gedung A',
    status: 'assigned',
    company_id: '00000000-0000-0000-0000-000000000010',
    project_id: '00000000-0000-0000-0000-000000000020',
    module_id: '00000000-0000-0000-0000-000000000030',
    discipline_id: '00000000-0000-0000-0000-000000000052',
    drawing_type_id: '00000000-0000-0000-0000-000000000042',
    created_by: '00000000-0000-0000-0000-000000000001',
    assigned_drafter: '00000000-0000-0000-0000-000000000002',
  },
];
