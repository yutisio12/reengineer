import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "../providers/auth-provider"
import { AppLayout } from "../layouts/app-layout"
import { AuthLayout } from "../layouts/auth-layout"
import LoginPage from "../pages/login"
import DrawingListPage from "../pages/drawing-list"
import DrawingCreatePage from "../pages/drawing-create"
import DrawingDetailPage from "../pages/drawing-detail"
import TransmitPage from "../pages/transmit"
import { MasterCompaniesPage } from "../pages/master-companies"
import { MasterProjectsPage } from "../pages/master-projects"
import { MasterDrawingTypesPage } from "../pages/master-drawing-types"
import { MasterDisciplinesPage } from "../pages/master-disciplines"
import { MasterUsersPage } from "../pages/master-users"
import ProductionPage from "../pages/production"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

export function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            <Route element={<AppLayout />}>
              <Route path="/drawings" element={<DrawingListPage />} />
              <Route path="/drawings/create" element={<DrawingCreatePage />} />
              <Route path="/drawings/:id" element={<DrawingDetailPage />} />
              <Route path="/transmit" element={<TransmitPage />} />

              <Route path="/production" element={<ProductionPage />} />

              <Route path="/master/companies" element={<MasterCompaniesPage />} />
              <Route path="/master/projects" element={<MasterProjectsPage />} />
              <Route path="/master/drawing-types" element={<MasterDrawingTypesPage />} />
              <Route path="/master/disciplines" element={<MasterDisciplinesPage />} />
              <Route path="/master/users" element={<MasterUsersPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/drawings" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
