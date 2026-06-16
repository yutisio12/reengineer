import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../providers/auth-provider"
import { isDevMode } from "../api/client"

function GridSVG() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  )
}

function RulerSVG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.15">
      <rect x="0.5" y="0.5" width="199" height="39" rx="2" stroke="currentColor" strokeWidth="1" />
      {Array.from({ length: 20 }).map((_, i) => (
        <line key={i} x1={i * 10 + 10} y1="0" x2={i * 10 + 10} y2={i % 5 === 0 ? 20 : 10} stroke="currentColor" strokeWidth="1" />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <text key={i} x={i * 40 + 8} y="32" fontSize="8" fill="currentColor" fontFamily="monospace">
          {i * 4}
        </text>
      ))}
    </svg>
  )
}

function GearSVG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.08">
      <path d="M50 5 L55 15 L65 12 L62 22 L72 25 L66 33 L76 38 L68 44 L75 52 L65 53 L62 63 L55 58 L50 68 L45 58 L38 63 L35 53 L25 52 L32 44 L24 38 L34 33 L28 25 L38 22 L35 12 L45 15 L50 5Z" fill="currentColor" />
      <circle cx="50" cy="40" r="15" fill="white" />
    </svg>
  )
}

function BlueprintLinesSVG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.06">
      <path d="M20 100 L80 40 L140 100 L200 40 L260 100" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M30 120 L90 60 L150 120 L210 60 L270 120" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" fill="none" />
      <circle cx="80" cy="100" r="25" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="200" cy="100" r="25" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" fill="none" />
      <rect x="40" y="140" width="100" height="30" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="160" y="140" width="100" height="30" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" fill="none" />
      <line x1="50" y1="170" x2="50" y2="190" stroke="currentColor" strokeWidth="1" />
      <line x1="80" y1="170" x2="80" y2="190" stroke="currentColor" strokeWidth="1" />
      <text x="55" y="185" fontSize="8" fill="currentColor" fontFamily="monospace">C</text>
      <text x="85" y="185" fontSize="8" fill="currentColor" fontFamily="monospace">B</text>
      <line x1="40" y1="30" x2="100" y2="30" stroke="currentColor" strokeWidth="1" />
      <text x="42" y="28" fontSize="8" fill="currentColor" fontFamily="monospace">50mm</text>
      <path d="M100 30 L100 35" stroke="currentColor" strokeWidth="1" />
      <path d="M40 30 L40 35" stroke="currentColor" strokeWidth="1" />
      <circle cx="260" cy="60" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M260 60 L260 68 L265 68" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function CrosshairSVG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.08">
      <line x1="30" y1="0" x2="30" y2="60" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="0" y1="30" x2="60" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="30" cy="30" r="15" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="30" cy="30" r="5" stroke="currentColor" strokeWidth="1" fill="none" />
      <line x1="30" y1="5" x2="30" y2="15" stroke="currentColor" strokeWidth="2" />
      <line x1="30" y1="45" x2="30" y2="55" stroke="currentColor" strokeWidth="2" />
      <line x1="5" y1="30" x2="15" y2="30" stroke="currentColor" strokeWidth="2" />
      <line x1="45" y1="30" x2="55" y2="30" stroke="currentColor" strokeWidth="2" />
      <text x="8" y="58" fontSize="7" fill="currentColor" fontFamily="monospace">N</text>
      <text x="8" y="20" fontSize="7" fill="currentColor" fontFamily="monospace">0°</text>
    </svg>
  )
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("admin@example.com")
  const [password, setPassword] = useState("admin123")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)
      navigate("/drawings", { replace: true })
    } catch {
      setError("Login failed. Check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = async () => {
    setLoading(true)
    try {
      await login("admin@example.com", "admin123")
      navigate("/drawings", { replace: true })
    } catch {
      setError("Guest login failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full h-full bg-white overflow-hidden flex">
      <GridSVG />

      <div className="flex-1 flex flex-col justify-center px-12 lg:px-24 xl:px-32 relative z-10">
        <div className="max-w-md">
          <div className="mb-2 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 border-2 border-black flex items-center justify-center">
              <span className="text-white font-mono font-bold text-xs">EA</span>
            </div>
            <span className="font-mono text-xs font-bold uppercase text-gray-400 tracking-widest">
              v1.0 — Engineering Module
            </span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-mono font-extrabold uppercase leading-[0.9] mb-2 text-black">
            Engineer
            <br />
            Activity
            <br />
            Tracker
          </h1>
          <div className="w-24 h-2 bg-yellow-500 mb-8" />

          <p className="font-mono text-sm text-gray-500 mb-10 max-w-sm leading-relaxed">
            Track, review, and approve engineering drawings from draft to production.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 max-w-sm">
            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-2 text-gray-600">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50 focus:border-green-600 transition-all"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-2 text-gray-600">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50 focus:border-green-600 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="border-4 border-red-600 bg-red-100 px-4 py-3 font-mono text-sm font-bold text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white font-mono font-bold text-sm uppercase px-6 py-4 border-4 border-black hover:bg-green-700 active:bg-green-800 disabled:opacity-50 transition-all"
            >
              {loading ? "AUTHENTICATING..." : "LOGIN →"}
            </button>

            {isDevMode() && (
              <div className="pt-2">
                <div className="border-t-4 border-gray-200 pt-4">
                  <p className="font-mono text-xs text-gray-400 uppercase mb-2 tracking-wider">
                    Development Mode
                  </p>
                  <button
                    type="button"
                    onClick={handleGuest}
                    disabled={loading}
                    className="w-full bg-yellow-500 text-black font-mono font-bold text-sm uppercase px-6 py-3 border-4 border-black hover:bg-yellow-400 disabled:opacity-50 transition-all"
                  >
                    ⚡ Guest Access
                  </button>
                  <p className="font-mono text-[10px] text-gray-400 mt-2">
                    Pre-filled credentials available. Click Guest for instant access.
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-green-600 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <GridSVG />
        </div>

        <div className="relative z-10 text-center px-12">
          <GearSVG className="w-48 h-48 mx-auto mb-8 text-white" />
          <RulerSVG className="w-80 mx-auto mb-6 text-white" />
          <BlueprintLinesSVG className="w-80 mx-auto mb-6 text-white" />
          <CrosshairSVG className="w-32 h-32 mx-auto text-white" />

          <div className="mt-10 space-y-2">
            <div className="font-mono text-white/80 text-sm border-t-2 border-b-2 border-white/20 py-4 inline-block px-8">
              <div className="font-bold text-white text-base mb-1">DRAWING ACTIVITY MODULE</div>
              <div className="text-xs">Drafter → Checker → Engineer → Production</div>
            </div>
          </div>

          <div className="mt-8 font-mono text-xs text-white/40 space-y-1">
            <div className="flex items-center justify-center gap-6">
              <span>── ✦ ──</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
