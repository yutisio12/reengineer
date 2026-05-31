import type { DrawingRevision, RevisionFile } from "../types"
import { apiClient, createMockResponse, isDevMode } from "./client"
import { mockRevisions, mockUsers } from "./mock"

export async function fetchRevisions(
  drawingId: string,
): Promise<DrawingRevision[]> {
  if (isDevMode()) {
    return createMockResponse(
      mockRevisions
        .filter((r) => r.drawing_id === drawingId)
        .map((r) => ({
          ...r,
          creator: r.creator || mockUsers[0],
        })),
    )
  }
  return apiClient<DrawingRevision[]>(`/drawings/${drawingId}/revisions`)
}

export interface CreateRevisionPayload {
  revision_no: string
  description: string
}

export async function createRevision(
  drawingId: string,
  payload: CreateRevisionPayload,
): Promise<DrawingRevision> {
  if (isDevMode()) {
    const rev: DrawingRevision = {
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
    return createMockResponse(rev)
  }
  return apiClient<DrawingRevision>(`/drawings/${drawingId}/revisions`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function uploadFile(
  revisionId: string,
  file: File,
): Promise<RevisionFile> {
  if (isDevMode()) {
    const rf: RevisionFile = {
      id: `f${Date.now()}`,
      revision_id: revisionId,
      file_name: file.name,
      file_path: `/files/${file.name}`,
      file_type: file.type,
      file_size: file.size,
      uploaded_at: new Date().toISOString(),
    }
    return createMockResponse(rf)
  }
  const formData = new FormData()
  formData.append("file", file)
  const token = localStorage.getItem("token")
  const res = await fetch(`/engineering/api/revisions/${revisionId}/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
  if (!res.ok) throw new Error("Upload failed")
  return res.json()
}

export async function getFileDownloadUrl(fileId: string): Promise<string> {
  if (isDevMode()) {
    return createMockResponse(`/files/mock-${fileId}.pdf`)
  }
  const file = await apiClient<{ url: string }>(`/revisions/files/${fileId}`)
  return file.url
}
