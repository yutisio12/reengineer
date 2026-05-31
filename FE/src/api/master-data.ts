import type { Company, Project, Discipline, User } from "../types"
import { apiClient, createMockResponse, isDevMode } from "./client"
import { mockCompanies, mockProjects, mockDisciplines, mockUsers } from "./mock"

export async function fetchCompanies(): Promise<Company[]> {
  if (isDevMode()) return createMockResponse(mockCompanies)
  return apiClient<Company[]>("/master/companies")
}

export async function fetchProjects(companyId?: string): Promise<Project[]> {
  if (isDevMode()) {
    const filtered = companyId
      ? mockProjects.filter((p) => p.company_id === companyId)
      : mockProjects
    return createMockResponse(filtered)
  }
  return apiClient<Project[]>("/master/projects", {
    params: { company_id: companyId },
  })
}

export async function fetchDisciplines(): Promise<Discipline[]> {
  if (isDevMode()) return createMockResponse(mockDisciplines)
  return apiClient<Discipline[]>("/master/disciplines")
}

export async function fetchUsers(role?: string): Promise<User[]> {
  if (isDevMode()) {
    const filtered = role
      ? mockUsers.filter((u) => u.role === role)
      : mockUsers
    return createMockResponse(filtered)
  }
  return apiClient<User[]>("/master/users", {
    params: { role },
  })
}
