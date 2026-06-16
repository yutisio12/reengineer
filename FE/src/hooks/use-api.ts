import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchDrawings,
  fetchDrawing,
  createDrawing,
  updateDrawing,
  fetchTransmittableDrawings,
  fetchProductionDrawings,
  raiseRevision,
  type DrawingFilters,
  type CreateDrawingPayload,
  type ProductionFilters,
  type RaiseRevisionPayload,
} from "../api/drawings"
import {
  fetchActivities,
  performAction,
  type PerformActionPayload,
} from "../api/activities"
import {
  fetchRevisions,
  createRevision,
  type CreateRevisionPayload,
} from "../api/revisions"
import { transmitDrawings } from "../api/transmit"
import {
  fetchCompanies,
  fetchProjects,
  fetchModules,
  fetchDrawingTypes,
  fetchDisciplines,
  fetchUsers,
  updateCompany,
  updateProject,
  updateModule,
  updateDrawingType,
  updateDiscipline,
  updateUser,
  createCompany,
  createProject,
  createModule,
  createDrawingType,
  createDiscipline,
  createUser,
} from "../api/master-data"
import type {
  UpdateCompanyPayload,
  UpdateProjectPayload,
  UpdateModulePayload,
  UpdateDrawingTypePayload,
  UpdateDisciplinePayload,
  UpdateUserPayload,
  UpdateDrawingPayload,
} from "../types"
import type { UserRole } from "../lib/constants"
import { getMe } from "../api/auth"

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: getMe })
}

export function useCompanies() {
  return useQuery({ queryKey: ["companies"], queryFn: fetchCompanies })
}

export function useProjects(companyId?: string) {
  return useQuery({
    queryKey: ["projects", companyId],
    queryFn: () => fetchProjects(companyId),
  })
}

export function useModules(projectId?: string) {
  return useQuery({
    queryKey: ["modules", projectId],
    queryFn: () => fetchModules(projectId),
  })
}

export function useDrawingTypes() {
  return useQuery({ queryKey: ["drawing-types"], queryFn: fetchDrawingTypes })
}

export function useDisciplines() {
  return useQuery({ queryKey: ["disciplines"], queryFn: fetchDisciplines })
}

export function useUsers(role?: string) {
  return useQuery({
    queryKey: ["users", role],
    queryFn: () => fetchUsers(role),
  })
}

export function useUpdateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyPayload }) =>
      updateCompany(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies"] })
    },
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectPayload }) =>
      updateProject(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

export function useUpdateModule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateModulePayload }) =>
      updateModule(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["modules"] })
    },
  })
}

export function useUpdateDrawingType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDrawingTypePayload }) =>
      updateDrawingType(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drawing-types"] })
    },
  })
}

export function useUpdateDiscipline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDisciplinePayload }) =>
      updateDiscipline(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["disciplines"] })
    },
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useCreateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; code: string }) => createCompany(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; code: string; company_id: string }) => createProject(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  })
}

export function useCreateModule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; code: string; project_id: string }) => createModule(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["modules"] }),
  })
}

export function useCreateDrawingType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; code: string }) => createDrawingType(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drawing-types"] }),
  })
}

export function useCreateDiscipline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; code: string }) => createDiscipline(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["disciplines"] }),
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; email: string; role: UserRole }) => createUser(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  })
}

export function useUpdateDrawing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDrawingPayload }) =>
      updateDrawing(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["drawing", variables.id] })
      qc.invalidateQueries({ queryKey: ["drawings"] })
    },
  })
}

export function useDrawings(filters: DrawingFilters) {
  return useQuery({
    queryKey: ["drawings", filters],
    queryFn: () => fetchDrawings(filters),
  })
}

export function useDrawing(id: string) {
  return useQuery({
    queryKey: ["drawing", id],
    queryFn: () => fetchDrawing(id),
    enabled: !!id,
  })
}

export function useCreateDrawing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateDrawingPayload) => createDrawing(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drawings"] })
    },
  })
}

export function useActivities(drawingId: string) {
  return useQuery({
    queryKey: ["activities", drawingId],
    queryFn: () => fetchActivities(drawingId),
    enabled: !!drawingId,
  })
}

export function usePerformAction(drawingId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PerformActionPayload) =>
      performAction(drawingId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activities", drawingId] })
      qc.invalidateQueries({ queryKey: ["drawing", drawingId] })
      qc.invalidateQueries({ queryKey: ["drawings"] })
    },
  })
}

export function useRevisions(drawingId: string) {
  return useQuery({
    queryKey: ["revisions", drawingId],
    queryFn: () => fetchRevisions(drawingId),
    enabled: !!drawingId,
  })
}

export function useCreateRevision(drawingId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRevisionPayload) =>
      createRevision(drawingId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["revisions", drawingId] })
    },
  })
}

export function useTransmittableDrawings() {
  return useQuery({
    queryKey: ["drawings", "transmittable"],
    queryFn: fetchTransmittableDrawings,
  })
}

export function useTransmit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { drawing_ids: string[]; notes?: string }) =>
      transmitDrawings(payload.drawing_ids, payload.notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drawings"] })
      qc.invalidateQueries({ queryKey: ["drawings", "transmittable"] })
    },
  })
}

export function useProductionDrawings(filters: ProductionFilters) {
  return useQuery({
    queryKey: ["production", "drawings", filters],
    queryFn: () => fetchProductionDrawings(filters),
  })
}

export function useRaiseRevision(drawingId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: RaiseRevisionPayload) =>
      raiseRevision(drawingId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["production", "drawings"] })
      qc.invalidateQueries({ queryKey: ["drawing", drawingId] })
      qc.invalidateQueries({ queryKey: ["drawings"] })
      qc.invalidateQueries({ queryKey: ["revisions", drawingId] })
      qc.invalidateQueries({ queryKey: ["activities", drawingId] })
    },
  })
}
