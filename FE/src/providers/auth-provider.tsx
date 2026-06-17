import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import type { User } from "../types"
import { login as loginApi, getMe } from "../api/auth"
import { setToken, clearToken, isAuthenticated, ApiError } from "../api/client"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user")
      return stored ? (JSON.parse(stored) as User) : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(!user && isAuthenticated())

  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null)
    }
    window.addEventListener("auth:logout", handleForceLogout)
    return () => window.removeEventListener("auth:logout", handleForceLogout)
  }, [])

  useEffect(() => {
    if (!isAuthenticated()) {
      setIsLoading(false)
      return
    }
    if (user) {
      setIsLoading(false)
      return
    }
    getMe()
      .then((u) => {
        setUser(u)
        localStorage.setItem("user", JSON.stringify(u))
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearToken()
          localStorage.removeItem("user")
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginApi({ email, password })
      console.log(`[auth] login response token:`, res.token ? `${res.token.substring(0, 20)}...` : 'UNDEFINED')
      setToken(res.token)
      localStorage.setItem("user", JSON.stringify(res.user))
      setUser(res.user)
      try {
        const profile = await getMe()
        console.log(`[auth] getMe succeeded`, profile)
        localStorage.setItem("user", JSON.stringify(profile))
        setUser(profile)
      } catch {
        console.log(`[auth] getMe failed - isAuthenticated:`, isAuthenticated())
        if (isAuthenticated()) {
          clearToken()
          localStorage.removeItem("user")
          setUser(null)
        }
        throw new Error("Token verification failed")
      }
    },
    [],
  )

  const logout = useCallback(() => {
    clearToken()
    localStorage.removeItem("user")
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
