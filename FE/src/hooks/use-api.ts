import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchDrawings,
  fetchDrawing,
  createDrawing,
  fetchTransmittableDrawings,
  type DrawingFilters,
  type CreateDrawingPayload,
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
  fetchDisciplines,
  fetchUsers,
} from "../api/master-data"
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
    enabled: !!companyId,
  })
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
