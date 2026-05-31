import { Outlet, Link, useLocation, Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../providers/auth-provider"
import {
  LogOut,
  FileText,
  Plus,
  Send,
  Building2,
  FolderKanban,
  Wrench,
  Users,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react"
import { cn } from "../lib/utils"

type ModuleId = "drawing" | "production" | "master"

interface Module {
  id: ModuleId
  label: string
  path: string
}

interface SidebarItem {
  to: string
  label: string
  icon: typeof FileText
}

const modules: Module[] = [
  { id: "drawing", label: "Drawing Activity", path: "/drawings" },
  { id: "production", label: "Production", path: "/production" },
  { id: "master", label: "Master Data", path: "/master/companies" },
]

const drawingSidebar: SidebarItem[] = [
  { to: "/drawings", label: "List Drawing", icon: FileText },
  { to: "/drawings/create", label: "Create Drawing", icon: Plus },
  { to: "/transmit", label: "Transmit", icon: Send },
]

const productionSidebar: SidebarItem[] = [
  { to: "/production", label: "Production List", icon: LayoutDashboard },
]

const masterSidebar: SidebarItem[] = [
  { to: "/master/companies", label: "Companies", icon: Building2 },
  { to: "/master/projects", label: "Projects", icon: FolderKanban },
  { to: "/master/disciplines", label: "Disciplines", icon: Wrench },
  { to: "/master/users", label: "Users", icon: Users },
]

function getActiveModule(pathname: string): { module: ModuleId; sidebar: SidebarItem[] } {
  if (pathname.startsWith("/master")) return { module: "master", sidebar: masterSidebar }
  if (pathname.startsWith("/production")) return { module: "production", sidebar: productionSidebar }
  return { module: "drawing", sidebar: drawingSidebar }
}

export function AppLayout() {
  const { user, logout, isLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { module: activeModule, sidebar } = getActiveModule(location.pathname)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="border-4 border-black px-8 py-4 text-xl font-bold font-mono">
          LOADING...
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <div className="h-full bg-white flex flex-col">
      <header className="bg-green-600 border-b-4 border-black shrink-0">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/drawings" className="flex items-center gap-3 py-3">
              <div className="w-9 h-9 bg-black border-2 border-white flex items-center justify-center shrink-0">
                <span className="text-white font-mono font-bold text-[10px]">EA</span>
              </div>
              <span className="text-white font-mono font-bold text-xs uppercase leading-tight hidden md:block">
                Engineer
                <br />
                Activity Tracker
              </span>
            </Link>

            <nav className="flex items-center gap-0.5">
              {modules.map((mod) => {
                const isActive = activeModule === mod.id
                return (
                  <button
                    key={mod.id}
                    onClick={() => navigate(mod.path)}
                    className={cn(
                      "px-4 py-4 font-mono font-bold text-xs uppercase border-l-2 border-white/20 transition-all",
                      isActive
                        ? "bg-black text-white"
                        : "text-white hover:bg-green-700",
                    )}
                  >
                    {mod.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-white font-mono text-xs font-bold">{user.name}</div>
              <div className="text-yellow-300 font-mono text-[10px] font-bold uppercase">{user.role}</div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 text-white font-mono text-xs font-bold uppercase border-2 border-white/50 hover:bg-black hover:border-black transition-all"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-56 shrink-0 bg-gray-50 border-r-4 border-black flex flex-col overflow-y-auto">
          <div className="border-b-4 border-black px-5 py-4 shrink-0">
            <h2 className="font-mono font-bold text-xs uppercase text-gray-500 tracking-wider">
              {modules.find((m) => m.id === activeModule)?.label}
            </h2>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {sidebar.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 font-mono font-bold text-xs uppercase border-2 transition-all",
                    isActive
                      ? "bg-green-600 text-white border-green-600"
                      : "text-gray-700 border-transparent hover:border-gray-300 hover:bg-gray-100",
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                  {isActive && <ChevronRight size={14} className="ml-auto" />}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
