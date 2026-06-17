import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "../providers/auth-provider"

export function AuthLayout() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="border-4 border-black px-8 py-4 text-xl font-bold font-mono">
          LOADING...
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/drawings" replace />
  }

  return (
    <div className="flex h-full items-center justify-center bg-white">
      <Outlet />
    </div>
  )
}
