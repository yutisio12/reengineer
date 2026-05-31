import type { TransmitLog } from "../types"
import { apiClient, createMockResponse, isDevMode } from "./client"

export async function transmitDrawings(
  drawingIds: string[],
  notes?: string,
): Promise<TransmitLog[]> {
  if (isDevMode()) {
    return createMockResponse(
      drawingIds.map((id) => ({
        id: `tl${Date.now()}-${id}`,
        drawing_id: id,
        transmitted_by: "u1",
        transmitted_at: new Date().toISOString(),
        notes: notes || null,
      })),
    )
  }
  return apiClient<TransmitLog[]>("/transmit", {
    method: "POST",
    body: JSON.stringify({ drawing_ids: drawingIds, notes }),
  })
}
