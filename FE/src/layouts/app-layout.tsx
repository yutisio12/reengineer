import { useState } from "react"
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
  ChevronDown,
  LayoutDashboard,
  BarChart3,
} from "lucide-react"
import { cn } from "../lib/utils"

type ModuleId = "dashboard" | "drawing" | "production" | "master"

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

interface SidebarGroup {
  label: string
  icon?: typeof FileText
  items: SidebarItem[]
}

const modules: Module[] = [
  { id: "dashboard", label: "Dashboard", path: "/" },
  { id: "drawing", label: "Drawing Activity", path: "/drawings" },
  { id: "production", label: "Production", path: "/production" },
  { id: "master", label: "Master Data", path: "/master/companies" },
]

const dashboardSidebar: SidebarGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: BarChart3 },
    ],
  },
]

const drawingSidebar: SidebarGroup[] = [
  {
    label: "Drawing",
    items: [
      { to: "/drawings", label: "List Drawing", icon: FileText },
      { to: "/drawings/create", label: "Create Drawing", icon: Plus },
    ],
  },
  {
    label: "Transmit",
    items: [
      { to: "/transmit", label: "Transmit Drawing", icon: Send },
    ],
  },
]

const productionSidebar: SidebarGroup[] = [
  {
    label: "Production",
    items: [
      { to: "/production", label: "Production List", icon: LayoutDashboard },
    ],
  },
]

const masterSidebar: SidebarGroup[] = [
  {
    label: "Organization",
    icon: Building2,
    items: [
      { to: "/master/companies", label: "Companies", icon: Building2 },
      { to: "/master/projects", label: "Projects", icon: FolderKanban },
    ],
  },
  {
    label: "Reference",
    icon: Wrench,
    items: [
      { to: "/master/modules", label: "Modules", icon: LayoutDashboard },
      { to: "/master/drawing-types", label: "Drawing Types", icon: FileText },
      { to: "/master/disciplines", label: "Disciplines", icon: Wrench },
    ],
  },
  {
    label: "Access",
    icon: Users,
    items: [
      { to: "/master/users", label: "Users", icon: Users },
    ],
  },
]

function getActiveModule(pathname: string): { module: ModuleId; groups: SidebarGroup[] } {
  if (pathname === "/") return { module: "dashboard", groups: dashboardSidebar }
  if (pathname.startsWith("/master")) return { module: "master", groups: masterSidebar }
  if (pathname.startsWith("/production")) return { module: "production", groups: productionSidebar }
  return { module: "drawing", groups: drawingSidebar }
}

export function AppLayout() {
  const { user, logout, isLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { module: activeModule, groups } = getActiveModule(location.pathname)

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const g of groups) {
      initial[g.label] = g.items.some((item) => item.to === location.pathname)
    }
    return initial
  })

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const isGroupExpanded = (g: SidebarGroup): boolean => {
    if (g.label in expandedGroups) return expandedGroups[g.label]
    return g.items.some((item) => item.to === location.pathname)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
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

          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
            {groups.map((group) => {
              const expanded = isGroupExpanded(group)
              return (
                <div key={group.label}>
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center gap-3 px-4 py-3 font-mono font-bold text-xs uppercase border-2 border-transparent hover:border-gray-300 hover:bg-gray-100 transition-all text-gray-500"
                  >
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    {group.label}
                  </button>

                  {expanded && (
                    <div className="ml-2 mt-0.5 space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.to
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 font-mono font-bold text-xs uppercase border-2 transition-all",
                              isActive
                                ? "bg-green-600 text-white border-green-600"
                                : "text-gray-700 border-transparent hover:border-gray-300 hover:bg-gray-100",
                            )}
                          >
                            <Icon size={15} />
                            {item.label}
                            {isActive && <ChevronRight size={13} className="ml-auto" />}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
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
