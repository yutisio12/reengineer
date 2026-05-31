import type { DrawingStatus, Stage, Action, UserRole } from "../lib/constants"

export interface Company {
  id: string
  name: string
  code: string
  is_active: boolean
  created_at: string
}

export interface Project {
  id: string
  company_id: string
  name: string
  code: string
  is_active: boolean
  created_at: string
  company_name?: string
}

export interface DrawingType {
  id: string
  name: string
  code: string
}

export interface Module {
  id: string
  project_id: string
  name: string
  code: string
  is_active: boolean
  created_at: string
  project_name?: string
}

export interface Discipline {
  id: string
  name: string
  code: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface Drawing {
  id: string
  company_id: string
  project_id: string
  discipline_id: string
  drawing_type_id: string
  module_id: string
  document_no: string
  created_by: string
  assigned_drafter: string
  status: DrawingStatus
  description?: string
  created_at: string
  updated_at: string
  company?: Company
  project?: Project
  discipline?: Discipline
  drawing_type?: DrawingType
  module?: Module
  creator?: User
  drafter?: User
}

export interface DrawingActivity {
  id: string
  drawing_id: string
  user_id: string
  stage: Stage
  action: Action
  return_reason?: string
  action_time: string
  user?: User
}

export interface DrawingRevision {
  id: string
  drawing_id: string
  revision_no: string
  description: string
  created_by: string
  created_at: string
  files?: RevisionFile[]
  creator?: User
}

export interface RevisionFile {
  id: string
  revision_id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  uploaded_at: string
}

export interface TransmitLog {
  id: string
  drawing_id: string
  transmitted_by: string
  transmitted_at: string
  notes?: string
}

export interface Production {
  id: string
  drawing_id: string
  transmit_log_id: string
  status: string
  received_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export type UpdateCompanyPayload = Partial<Pick<Company, "name" | "code" | "is_active">>
export type UpdateModulePayload = Partial<Pick<Module, "name" | "code" | "project_id" | "is_active">>
export type UpdateProjectPayload = Partial<Pick<Project, "name" | "code" | "company_id" | "is_active">>
export type UpdateDrawingTypePayload = Partial<Pick<DrawingType, "name" | "code">>
export type UpdateDisciplinePayload = Partial<Pick<Discipline, "name" | "code">>
export type UpdateUserPayload = Partial<Pick<User, "name" | "email" | "role" | "is_active">>
export type UpdateDrawingPayload = Partial<Pick<Drawing, "company_id" | "project_id" | "discipline_id" | "drawing_type_id" | "module_id" | "document_no" | "assigned_drafter" | "description">>
