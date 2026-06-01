import type { Drawing, PaginatedResponse, UpdateDrawingPayload } from "../types"
import { apiClient, createMockResponse, isDevMode } from "./client"
import { enrichDrawings, mockDrawings, mockDrawingTypes, mockPaginatedDrawings, mockRevisions, mockActivities, mockUsers } from "./mock"

export interface DrawingFilters {
  company_id?: string
  project_id?: string
  discipline_id?: string
  drawing_type_id?: string
  module_id?: string
  status?: string
  page?: number
  per_page?: number
  sort?: string
  order?: string
}

export async function fetchDrawings(
  filters: DrawingFilters = {},
): Promise<PaginatedResponse<Drawing>> {
  if (isDevMode()) {
    let data = enrichDrawings()
    if (filters.company_id) data = data.filter((d) => d.company_id === filters.company_id)
    if (filters.project_id) data = data.filter((d) => d.project_id === filters.project_id)
    if (filters.discipline_id) data = data.filter((d) => d.discipline_id === filters.discipline_id)
    if (filters.drawing_type_id) data = data.filter((d) => d.drawing_type_id === filters.drawing_type_id)
    if (filters.module_id) data = data.filter((d) => d.module_id === filters.module_id)
    if (filters.status) data = data.filter((d) => d.status === filters.status)
    const page = filters.page || 1
    const perPage = filters.per_page || 10
    const total = data.length
    const totalPages = Math.ceil(total / perPage)
    const start = (page - 1) * perPage
    return createMockResponse({
      data: data.slice(start, start + perPage),
      total,
      page,
      per_page: perPage,
      total_pages: totalPages,
    })
  }
  return apiClient<PaginatedResponse<Drawing>>("/drawings", {
    params: { ...filters },
  })
}

export async function fetchDrawing(id: string): Promise<Drawing> {
  if (isDevMode()) {
    const drawing = enrichDrawings().find((d) => d.id === id)
    if (!drawing) throw new Error("Drawing not found")
    return createMockResponse(drawing)
  }
  return apiClient<Drawing>(`/drawings/${id}`)
}

export interface CreateDrawingPayload {
  company_id: string
  project_id: string
  discipline_id: string
  drawing_type_id: string
  module_id: string
  document_no: string
  assigned_drafter: string
  description?: string
}

export async function createDrawing(
  payload: CreateDrawingPayload,
): Promise<Drawing> {
  if (isDevMode()) {
    return createMockResponse({
      id: `dr${Date.now()}`,
      ...payload,
      created_by: "u1",
      status: "assigned",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      drawing_type: mockDrawingTypes.find((dt) => dt.id === payload.drawing_type_id),
    })
  }
  return apiClient<Drawing>("/drawings", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateDrawing(
  id: string,
  data: UpdateDrawingPayload,
): Promise<Drawing> {
  if (isDevMode()) {
    const idx = mockDrawings.findIndex((d) => d.id === id)
    if (idx === -1) throw new Error("Drawing not found")
    mockDrawings[idx] = {
      ...mockDrawings[idx],
      ...data,
      updated_at: new Date().toISOString(),
    }
    const all = enrichDrawings()
    return createMockResponse(all.find((d) => d.id === id)!)
  }
  return apiClient<Drawing>(`/drawings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function fetchTransmittableDrawings(): Promise<Drawing[]> {
  if (isDevMode()) {
    const data = enrichDrawings().filter((d) => d.status === "fully_approved")
    return createMockResponse(data)
  }
  return apiClient<Drawing[]>("/drawings/transmittable")
}

export interface ProductionFilters {
  company_id?: string
  project_id?: string
  module_id?: string
}

export async function fetchProductionDrawings(
  filters: ProductionFilters = {},
): Promise<Drawing[]> {
  if (isDevMode()) {
    let data = enrichDrawings().filter((d) => d.status === "transmitted")
    if (filters.company_id) data = data.filter((d) => d.company_id === filters.company_id)
    if (filters.project_id) data = data.filter((d) => d.project_id === filters.project_id)
    if (filters.module_id) data = data.filter((d) => d.module_id === filters.module_id)
    return createMockResponse(data)
  }
  return apiClient<Drawing[]>("/production/drawings", {
    params: { ...filters },
  })
}

export interface RaiseRevisionPayload {
  revision_no: string
  description: string
}

export async function raiseRevision(
  drawingId: string,
  payload: RaiseRevisionPayload,
): Promise<Drawing> {
  if (isDevMode()) {
    const idx = mockDrawings.findIndex((d) => d.id === drawingId)
    if (idx === -1) throw new Error("Drawing not found")

    mockDrawings[idx] = {
      ...mockDrawings[idx],
      status: "in_progress_drafter",
      updated_at: new Date().toISOString(),
    }

    const rev = {
      id: `r${Date.now()}`,
      drawing_id: drawingId,
      revision_no: payload.revision_no,
      description: payload.description,
      created_by: "u1",
      created_at: new Date().toISOString(),
      files: [],
      creator: mockUsers[0],
    }
    mockRevisions.push(rev)

    const act = {
      id: `a${Date.now()}`,
      drawing_id: drawingId,
      user_id: "u1",
      stage: "drafter" as const,
      action: "start" as const,
      action_time: new Date().toISOString(),
    }
    mockActivities.push(act)

    const all = enrichDrawings()
    return createMockResponse(all.find((d) => d.id === drawingId)!)
  }
  return apiClient<Drawing>(`/production/drawings/${drawingId}/raise-revision`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
