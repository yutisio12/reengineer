import { useEffect, useRef, useState, useMemo } from "react"
import {
  useDrawings, useProjects, useModules,
  useDisciplines, useUsers,
} from "../hooks/use-api"

const STATUS_GROUP: Record<string, { label: string; color: string }> = {
  draft: { label: "Assigned / Draft", color: "#EAB308" },
  onProgress: { label: "In Progress", color: "#3B82F6" },
  ifr: { label: "IFR / Review", color: "#F97316" },
  ifc: { label: "IFC / Complete", color: "#22C55E" },
}

function getGroup(status: string): string {
  if (status === "fully_approved" || status === "transmitted") return "ifc"
  if (status === "in_progress_drafter") return "onProgress"
  if (status === "in_progress_checker" || status === "in_progress_engineer") return "ifr"
  return "draft"
}

export default function DashboardPage() {
  const [disciplineFilter, setDisciplineFilter] = useState("")
  const [periodFilter, setPeriodFilter] = useState("all")

  const { data: paginated } = useDrawings({ per_page: 1000, page: 1 })
  const { data: users } = useUsers()
  const { data: disciplines } = useDisciplines()
  const { data: projects } = useProjects()
  const { data: modules } = useModules()

  const drawings = useMemo(() => paginated?.data ?? [], [paginated])

  const filteredDrawings = useMemo(() => {
    let d = drawings
    if (disciplineFilter) d = d.filter((dw) => dw.discipline_id === disciplineFilter)
    if (periodFilter === "month") {
      const start = new Date()
      start.setDate(1); start.setHours(0,0,0,0)
      d = d.filter((dw) => new Date(dw.created_at).getTime() >= start.getTime())
    } else if (periodFilter === "3months") {
      const start = new Date()
      start.setMonth(start.getMonth() - 3); start.setDate(1); start.setHours(0,0,0,0)
      d = d.filter((dw) => new Date(dw.created_at).getTime() >= start.getTime())
    }
    return d
  }, [drawings, disciplineFilter, periodFilter])

  const metrics = useMemo(() => {
    const total = filteredDrawings.length
    const ifc = filteredDrawings.filter((d) => getGroup(d.status) === "ifc").length
    const onProgress = filteredDrawings.filter((d) => getGroup(d.status) === "onProgress").length
    const ifrCount = filteredDrawings.filter((d) => getGroup(d.status) === "ifr").length
    const draft = filteredDrawings.filter((d) => getGroup(d.status) === "draft").length

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const addedThisMonth = filteredDrawings.filter((d) => new Date(d.created_at).getTime() >= monthStart).length

    const overallPct = total > 0 ? Math.round((ifc / total) * 100) : 0

    return { total, ifc, onProgress, ifrCount, draft, addedThisMonth, overallPct }
  }, [filteredDrawings])

  const statusDistribution = useMemo(() => {
    return [
      { ...STATUS_GROUP.draft, count: metrics.draft, pct: metrics.total > 0 ? Math.round((metrics.draft / metrics.total) * 100) : 0 },
      { ...STATUS_GROUP.onProgress, count: metrics.onProgress, pct: metrics.total > 0 ? Math.round((metrics.onProgress / metrics.total) * 100) : 0 },
      { ...STATUS_GROUP.ifr, count: metrics.ifrCount, pct: metrics.total > 0 ? Math.round((metrics.ifrCount / metrics.total) * 100) : 0 },
      { ...STATUS_GROUP.ifc, count: metrics.ifc, pct: metrics.total > 0 ? Math.round((metrics.ifc / metrics.total) * 100) : 0 },
    ]
  }, [metrics])

  const progressPerDiscipline = useMemo(() => {
    const discList = disciplines ?? []
    const labels: string[] = []
    const selesai: number[] = []
    const sisa: number[] = []

    for (const disc of discList) {
      const total = filteredDrawings.filter((d) => d.discipline_id === disc.id).length
      if (total === 0) continue
      const done = filteredDrawings.filter((d) => d.discipline_id === disc.id && getGroup(d.status) === "ifc").length
      labels.push(disc.name)
      selesai.push(done)
      sisa.push(total - done)
    }

    return { labels, selesai, sisa }
  }, [filteredDrawings, disciplines])

  const trendData = useMemo(() => {
    const months: string[] = []
    const baru: number[] = []
    const selesai: number[] = []

    for (let i = 4; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      months.push(d.toLocaleDateString("id", { month: "short" }))
      const start = new Date(d.getFullYear(), d.getMonth(), 1).getTime()
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime()

      baru.push(drawings.filter((dw) => {
        const t = new Date(dw.created_at).getTime()
        return t >= start && t < end
      }).length)

      selesai.push(drawings.filter((dw) => {
        if (dw.status !== "fully_approved" && dw.status !== "transmitted") return false
        const t = new Date(dw.updated_at).getTime()
        return t >= start && t < end
      }).length)
    }

    return { months, baru, selesai }
  }, [drawings])

  const engineerWorkload = useMemo(() => {
    const engineers = (users ?? [])
      .filter((u) => u.role === "drafter" || u.role === "checker" || u.role === "engineer")
      .slice(0, 5)
    return engineers.map((eng) => {
      const assigned = drawings.filter((d) => d.assigned_drafter === eng.id).length
      const done = drawings.filter((d) => d.assigned_drafter === eng.id && (d.status === "fully_approved" || d.status === "transmitted")).length
      const pct = assigned > 0 ? Math.round((done / assigned) * 100) : 0
      const initial = eng.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
      const colorMap: Record<string, string> = {
        drafter: "#3B82F6",
        checker: "#F97316",
        engineer: "#22C55E",
      }
      return { ...eng, assigned, done, pct, initial, barColor: colorMap[eng.role] || "#3B82F6" }
    })
  }, [drawings, users])

  const firstProject = projects?.[0]
  const firstModule = modules?.find((m) => m.project_id === firstProject?.id)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-mono font-black uppercase" style={{ color: "var(--color-text-primary)" }}>
            Dashboard
          </h1>
          <p className="font-mono text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {firstProject?.name ?? "-"} / {firstModule?.name ?? "-"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50"
            style={{ color: "var(--color-text-primary)", background: "var(--color-surface)" }}
          >
            <option value="">Semua Disiplin</option>
            {(disciplines ?? []).map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50"
            style={{ color: "var(--color-text-primary)", background: "var(--color-surface)" }}
          >
            <option value="all">All Time</option>
            <option value="month">Bulan Ini</option>
            <option value="3months">3 Bulan</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          icon="ti-files"
          label="Total Drawing"
          value={metrics.total}
          sub={metrics.addedThisMonth > 0 ? `+${metrics.addedThisMonth} bulan ini` : ""}
          color="#000"
        />
        <MetricCard
          icon="ti-circle-check"
          label="Selesai (IFC)"
          value={metrics.ifc}
          sub={`${metrics.overallPct}% dari total`}
          color="#22C55E"
        />
        <MetricCard
          icon="ti-clock"
          label="In Progress"
          value={metrics.onProgress + metrics.ifrCount}
          sub={`${metrics.onProgress} drafter, ${metrics.ifrCount} review`}
          color="#3B82F6"
        />
        <MetricCard
          icon="ti-list"
          label="Assigned / Draft"
          value={metrics.draft}
          sub="Menunggu pengerjaan"
          color="#EAB308"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Distribusi Status">
          <StatusLegend items={statusDistribution} />
          <div className="relative" style={{ height: 240 }}>
            <canvas ref={useDonutChart(statusDistribution)} />
          </div>
        </ChartCard>

        <ChartCard title="Progres per Disiplin">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3" style={{ background: "#22C55E" }} />
              <span className="font-mono text-[10px] font-bold uppercase" style={{ color: "var(--color-text-secondary)" }}>Selesai</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3" style={{ background: "#86EFAC" }} />
              <span className="font-mono text-[10px] font-bold uppercase" style={{ color: "var(--color-text-secondary)" }}>Sisa</span>
            </div>
          </div>
          <div style={{ height: 240 }}>
            <canvas ref={useStackedBarChart(progressPerDiscipline)} />
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Tren Drawing per Bulan">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-5 h-0.5" style={{ background: "#3B82F6" }} />
              <span className="font-mono text-[10px] font-bold uppercase" style={{ color: "var(--color-text-secondary)" }}>Baru</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-5 h-0.5 border-t-2 border-dashed" style={{ borderColor: "#22C55E" }} />
              <span className="font-mono text-[10px] font-bold uppercase" style={{ color: "var(--color-text-secondary)" }}>Selesai</span>
            </div>
          </div>
          <div style={{ height: 200 }}>
            <canvas ref={useLineChart(trendData)} />
          </div>
        </ChartCard>

        <ChartCard title="Beban Kerja per Engineer">
          <div className="space-y-4">
            {engineerWorkload.map((eng) => (
              <div key={eng.id} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 border-2 border-black flex items-center justify-center shrink-0"
                  style={{ background: eng.barColor }}
                >
                  <span className="text-white font-mono font-bold text-[10px]">{eng.initial}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold uppercase truncate" style={{ color: "var(--color-text-primary)" }}>
                      {eng.name}
                    </span>
                    <span className="font-mono text-[10px] font-bold" style={{ color: "var(--color-text-secondary)" }}>
                      {eng.done}/{eng.assigned}
                    </span>
                  </div>
                  <div className="h-2 border-2 border-black w-full" style={{ background: "#f0f0f0" }}>
                    <div
                      className="h-full transition-all"
                      style={{ width: `${eng.pct}%`, background: eng.pct >= 100 ? "#22C55E" : eng.pct > 60 ? "#3B82F6" : "#F97316" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: string
  label: string
  value: string | number
  sub: string
  color: string
}) {
  return (
    <div className="border-4 border-black p-5" style={{ background: "var(--color-surface)" }}>
      <div className="flex items-center gap-2 mb-3">
        <i className={`${icon} text-lg`} style={{ color }} />
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
          {label}
        </span>
      </div>
      <p className="font-mono font-black text-3xl mb-1" style={{ color }}>
        {value}
      </p>
      {sub && (
        <p className="font-mono text-[10px] font-bold" style={{ color: "var(--color-text-secondary)" }}>
          {sub}
        </p>
      )}
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-4 border-black p-5" style={{ background: "var(--color-surface)" }}>
      <h3 className="font-mono font-bold text-xs uppercase mb-4" style={{ color: "var(--color-text-primary)" }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function StatusLegend({ items }: { items: Array<{ label: string; count: number; color: string; pct: number }> }) {
  return (
    <div className="flex flex-wrap gap-4 mb-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 border border-black" style={{ background: item.color }} />
          <span className="font-mono text-[10px] font-bold uppercase" style={{ color: "var(--color-text-secondary)" }}>
            {item.label}
          </span>
          <span className="font-mono text-[10px] font-bold" style={{ color: "var(--color-text-primary)" }}>
            {item.count}
          </span>
        </div>
      ))}
    </div>
  )
}

function useDonutChart(data: Array<{ label: string; count: number; color: string }>) {
  const ref = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<ChartInstance | null>(null)

  useEffect(() => {
    if (!ref.current) return
    if (chartRef.current) chartRef.current.destroy()

    const ctx = ref.current.getContext("2d")
    if (!ctx) return

    chartRef.current = new window.Chart(ctx, {
      type: "doughnut",
      data: {
        labels: data.map((d) => d.label),
        datasets: [{
          data: data.map((d) => d.count),
          backgroundColor: data.map((d) => d.color),
          borderWidth: 0,
          spacing: 0,
          borderRadius: 0,
          borderSkipped: true,
          cutout: "62%",
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
      },
    })

    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [data])

  return ref
}

function useStackedBarChart(data: { labels: string[]; selesai: number[]; sisa: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<ChartInstance | null>(null)

  useEffect(() => {
    if (!ref.current) return
    if (chartRef.current) chartRef.current.destroy()

    const ctx = ref.current.getContext("2d")
    if (!ctx) return

    chartRef.current = new window.Chart(ctx, {
      type: "bar",
      data: {
        labels: data.labels,
        datasets: [
          { label: "Selesai", data: data.selesai, backgroundColor: "#22C55E", borderRadius: 0, borderSkipped: true },
          { label: "Sisa", data: data.sisa, backgroundColor: "#86EFAC", borderRadius: 0, borderSkipped: true },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { font: { family: "ui-monospace, Consolas, monospace", size: 10 } } },
          y: { stacked: true, beginAtZero: true, grid: { color: "#ddd" }, ticks: { font: { family: "ui-monospace, Consolas, monospace", size: 10 }, stepSize: 1 } },
        },
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
      },
    })

    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [data])

  return ref
}

function useLineChart(data: { months: string[]; baru: number[]; selesai: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<ChartInstance | null>(null)

  useEffect(() => {
    if (!ref.current) return
    if (chartRef.current) chartRef.current.destroy()

    const ctx = ref.current.getContext("2d")
    if (!ctx) return

    chartRef.current = new window.Chart(ctx, {
      type: "line",
      data: {
        labels: data.months,
        datasets: [
          {
            label: "Baru",
            data: data.baru,
            borderColor: "#3B82F6",
            backgroundColor: "transparent",
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: "#3B82F6",
            pointBorderColor: "#3B82F6",
          },
          {
            label: "Selesai",
            data: data.selesai,
            borderColor: "#22C55E",
            backgroundColor: "transparent",
            borderWidth: 2,
            borderDash: [6, 3],
            fill: false,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: "#22C55E",
            pointBorderColor: "#22C55E",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: "ui-monospace, Consolas, monospace", size: 10 } } },
          y: { beginAtZero: true, grid: { color: "#ddd" }, ticks: { font: { family: "ui-monospace, Consolas, monospace", size: 10 }, stepSize: 1 } },
        },
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
      },
    })

    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [data])

  return ref
}
