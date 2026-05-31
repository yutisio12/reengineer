import type { LoginPayload, LoginResponse, User } from "../types"
import { apiClient, createMockResponse, isDevMode } from "./client"
import { mockUsers } from "./mock"

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  if (isDevMode()) {
    const user =
      mockUsers.find((u) => u.email === payload.email) || mockUsers[0]
    return createMockResponse({
      token: "dev-mock-token-12345",
      user,
    })
  }

  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function getMe(): Promise<User> {
  if (isDevMode()) {
    return createMockResponse(mockUsers[0])
  }

  return apiClient<User>("/auth/me")
}
