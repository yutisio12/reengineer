import { Outlet } from "react-router-dom"

export function AuthLayout() {
  return (
    <div className="flex h-full items-center justify-center bg-white">
      <Outlet />
    </div>
  )
}
