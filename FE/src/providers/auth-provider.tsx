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
import { setToken, clearToken, isAuthenticated } from "../api/client"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated()) {
      getMe()
        .then(setUser)
        .catch(() => clearToken())
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginApi({ email, password })
      setToken(res.token)
      setUser(res.user)
    },
    [],
  )

  const logout = useCallback(() => {
    clearToken()
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
