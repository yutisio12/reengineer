import type {
  Company,
  Project,
  DrawingType,
  Discipline,
  User,
  UpdateCompanyPayload,
  UpdateProjectPayload,
  UpdateDisciplinePayload,
  UpdateDrawingTypePayload,
  UpdateUserPayload,
} from "../types"
import { apiClient, createMockResponse, isDevMode } from "./client"
import { mockCompanies, mockProjects, mockDrawingTypes, mockDisciplines, mockUsers, mockRevisions } from "./mock"

export async function fetchCompanies(): Promise<Company[]> {
  if (isDevMode()) return createMockResponse(mockCompanies)
  return apiClient<Company[]>("/master/companies")
}

export async function updateCompany(
  id: string,
  data: UpdateCompanyPayload,
): Promise<Company> {
  if (isDevMode()) {
    const idx = mockCompanies.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error("Company not found")
    mockCompanies[idx] = { ...mockCompanies[idx], ...data }
    return createMockResponse(mockCompanies[idx])
  }
  return apiClient<Company>(`/master/companies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function fetchProjects(companyId?: string): Promise<Project[]> {
  if (isDevMode()) {
    const filtered = companyId
      ? mockProjects.filter((p) => p.company_id === companyId)
      : mockProjects
    return createMockResponse(
      filtered.map((p) => ({
        ...p,
        company_name: mockCompanies.find((c) => c.id === p.company_id)?.name,
      })),
    )
  }
  return apiClient<Project[]>("/master/projects", {
    params: { company_id: companyId },
  })
}

export async function updateProject(
  id: string,
  data: UpdateProjectPayload,
): Promise<Project> {
  if (isDevMode()) {
    const idx = mockProjects.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error("Project not found")
    mockProjects[idx] = { ...mockProjects[idx], ...data }
    return createMockResponse({
      ...mockProjects[idx],
      company_name: mockCompanies.find((c) => c.id === mockProjects[idx].company_id)?.name,
    })
  }
  return apiClient<Project>(`/master/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function fetchDisciplines(): Promise<Discipline[]> {
  if (isDevMode()) return createMockResponse(mockDisciplines)
  return apiClient<Discipline[]>("/master/disciplines")
}

export async function updateDiscipline(
  id: string,
  data: UpdateDisciplinePayload,
): Promise<Discipline> {
  if (isDevMode()) {
    const idx = mockDisciplines.findIndex((d) => d.id === id)
    if (idx === -1) throw new Error("Discipline not found")
    mockDisciplines[idx] = { ...mockDisciplines[idx], ...data }
    return createMockResponse(mockDisciplines[idx])
  }
  return apiClient<Discipline>(`/master/disciplines/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
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

export async function updateUser(
  id: string,
  data: UpdateUserPayload,
): Promise<User> {
  if (isDevMode()) {
    const idx = mockUsers.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error("User not found")
    mockUsers[idx] = { ...mockUsers[idx], ...data }
    return createMockResponse(mockUsers[idx])
  }
  return apiClient<User>(`/master/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function createCompany(
  data: { name: string; code: string },
): Promise<Company> {
  if (isDevMode()) {
    const item: Company = {
      id: `c${Date.now()}`,
      name: data.name,
      code: data.code,
      is_active: true,
      created_at: new Date().toISOString(),
    }
    mockCompanies.push(item)
    return createMockResponse(item)
  }
  return apiClient<Company>("/master/companies", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function createProject(
  data: { name: string; code: string; company_id: string },
): Promise<Project> {
  if (isDevMode()) {
    const item: Project = {
      id: `p${Date.now()}`,
      name: data.name,
      code: data.code,
      company_id: data.company_id,
      is_active: true,
      created_at: new Date().toISOString(),
    }
    mockProjects.push(item)
    return createMockResponse({
      ...item,
      company_name: mockCompanies.find((c) => c.id === item.company_id)?.name,
    })
  }
  return apiClient<Project>("/master/projects", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function createDiscipline(
  data: { name: string; code: string },
): Promise<Discipline> {
  if (isDevMode()) {
    const item: Discipline = {
      id: `d${Date.now()}`,
      name: data.name,
      code: data.code,
    }
    mockDisciplines.push(item)
    return createMockResponse(item)
  }
  return apiClient<Discipline>("/master/disciplines", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function fetchDrawingTypes(): Promise<DrawingType[]> {
  if (isDevMode()) return createMockResponse(mockDrawingTypes)
  return apiClient<DrawingType[]>("/master/drawing-types")
}

export async function updateDrawingType(
  id: string,
  data: UpdateDrawingTypePayload,
): Promise<DrawingType> {
  if (isDevMode()) {
    const idx = mockDrawingTypes.findIndex((d) => d.id === id)
    if (idx === -1) throw new Error("Drawing type not found")
    mockDrawingTypes[idx] = { ...mockDrawingTypes[idx], ...data }
    return createMockResponse(mockDrawingTypes[idx])
  }
  return apiClient<DrawingType>(`/master/drawing-types/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function createDrawingType(
  data: { name: string; code: string },
): Promise<DrawingType> {
  if (isDevMode()) {
    const item: DrawingType = {
      id: `dt${Date.now()}`,
      name: data.name,
      code: data.code,
    }
    mockDrawingTypes.push(item)
    return createMockResponse(item)
  }
  return apiClient<DrawingType>("/master/drawing-types", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function createUser(
  data: { name: string; email: string; role: User["role"] },
): Promise<User> {
  if (isDevMode()) {
    const item: User = {
      id: `u${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      is_active: true,
      created_at: new Date().toISOString(),
    }
    mockUsers.push(item)
    return createMockResponse(item)
  }
  return apiClient<User>("/master/users", {
    method: "POST",
    body: JSON.stringify(data),
  })
}
