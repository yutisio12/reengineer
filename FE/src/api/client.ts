const BASE_URL = "/engineering/api"

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`API Error: ${status}`)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

function getToken(): string | null {
  return localStorage.getItem("token")
}

export function clearToken(): void {
  localStorage.removeItem("token")
}

export function setToken(token: string): void {
  localStorage.setItem("token", token)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function isDevMode(): boolean {
  return import.meta.env.VITE_DEV_MODE === "true"
}

export function createMockResponse<T>(data: T, delay = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay))
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, ...fetchOptions } = options
  const token = getToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  let url = `${BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value))
      }
    }
    const qs = searchParams.toString()
    if (qs) url += `?${qs}`
  }

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  if (res.status === 401) {
    clearToken()
    window.location.href = "/login"
    throw new ApiError(401, "Unauthorized")
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, body)
  }

  if (res.status === 204) return undefined as T

  return res.json()
}
