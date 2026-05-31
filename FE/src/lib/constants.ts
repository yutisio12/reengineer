export const STATUSES = [
  "assigned",
  "in_progress_drafter",
  "in_progress_checker",
  "in_progress_engineer",
  "fully_approved",
  "transmitted",
] as const

export type DrawingStatus = (typeof STATUSES)[number]

export const STATUS_LABEL: Record<DrawingStatus, string> = {
  assigned: "Assigned",
  in_progress_drafter: "In Progress (Drafter)",
  in_progress_checker: "In Progress (Checker)",
  in_progress_engineer: "In Progress (Engineer)",
  fully_approved: "Fully Approved",
  transmitted: "Transmitted",
}

export const STATUS_COLOR: Record<DrawingStatus, string> = {
  assigned: "bg-yellow-500 text-black",
  in_progress_drafter: "bg-green-500 text-white",
  in_progress_checker: "bg-green-500 text-white",
  in_progress_engineer: "bg-green-500 text-white",
  fully_approved: "bg-green-700 text-white",
  transmitted: "bg-blue-600 text-white",
}

export const ROLES = ["admin", "drafter", "checker", "engineer"] as const
export type UserRole = (typeof ROLES)[number]

export const STAGES = ["drafter", "checker", "engineer"] as const
export type Stage = (typeof STAGES)[number]

export const ACTIONS = ["start", "stop", "submit", "return", "approve"] as const
export type Action = (typeof ACTIONS)[number]
