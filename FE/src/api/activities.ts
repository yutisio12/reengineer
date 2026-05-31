import type { DrawingActivity } from "../types"
import { apiClient, createMockResponse, isDevMode } from "./client"
import { mockActivities } from "./mock"

export interface PerformActionPayload {
  action: "start" | "stop" | "submit" | "return" | "approve"
  stage: "drafter" | "checker" | "engineer"
  return_reason?: string
}

export async function fetchActivities(
  drawingId: string,
): Promise<DrawingActivity[]> {
  if (isDevMode()) {
    return createMockResponse(
      mockActivities.filter((a) => a.drawing_id === drawingId),
    )
  }
  return apiClient<DrawingActivity[]>(`/drawings/${drawingId}/activities`)
}

export async function performAction(
  drawingId: string,
  payload: PerformActionPayload,
): Promise<DrawingActivity> {
  if (isDevMode()) {
    const newActivity: DrawingActivity = {
      id: `a${Date.now()}`,
      drawing_id: drawingId,
      user_id: "u1",
      stage: payload.stage,
      action: payload.action,
      return_reason: payload.return_reason,
      action_time: new Date().toISOString(),
    }
    mockActivities.push(newActivity)
    return createMockResponse(newActivity)
  }
  return apiClient<DrawingActivity>(`/drawings/${drawingId}/actions`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
