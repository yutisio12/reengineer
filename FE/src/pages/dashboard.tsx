import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import {
  useDrawings, useProjects, useModules,
  useDisciplines, useUsers,
} from "../hooks/use-api"

const STATUS_GROUP: Record<string, { label: string; color: string }> = {
  draft: { label: "Assigned / Draft", color: "#666" },
  onProgress: { label: "In Progress", color: "#111" },
  ifr: { label: "IFR / Review", color: "#E61919" },
  ifc: { label: "IFC / Complete", color: "#111" },
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
      baru.push(drawings.filter((dw) => { const t = new Date(dw.created_at).getTime(); return t >= start && t < end }).length)
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
      return { ...eng, assigned, done, pct, initial }
    })
  }, [drawings, users])

  const firstProject = projects?.[0]
  const firstModule = modules?.find((m) => m.project_id === firstProject?.id)

  const donutRef = useDonutChart(statusDistribution)
  const barRef = useStackedBarChart(progressPerDiscipline)
  const lineRef = useLineChart(trendData)

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="macro-title text-[clamp(2rem,6vw,4rem)] text-black">
            Dashboard
          </h1>
          <p className="micro text-xs mt-1 text-gray-500">
            {firstProject?.name ?? "-"} / {firstModule?.name ?? "-"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none"
            style={{ background: "#EAE8E3", color: "#111" }}
          >
            <option value="">[ ALL DISCIPLINES ]</option>
            {(disciplines ?? []).map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none"
            style={{ background: "#EAE8E3", color: "#111" }}
          >
            <option value="all">[ ALL TIME ]</option>
            <option value="month">[ THIS MONTH ]</option>
            <option value="3months">[ 3 MONTHS ]</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon="ti-files"
          label="[ TOTAL DRAWINGS ]"
          value={metrics.total}
          sub={metrics.addedThisMonth > 0 ? `+${metrics.addedThisMonth} this month` : ""}
          color="#111"
        />
        <MetricCard
          icon="ti-circle-check"
          label="[ COMPLETED (IFC) ]"
          value={metrics.ifc}
          sub={`${metrics.overallPct}% of total`}
          color="#111"
        />
        <MetricCard
          icon="ti-clock"
          label="[ IN PROGRESS ]"
          value={metrics.onProgress + metrics.ifrCount}
          sub={`${metrics.onProgress} drafter, ${metrics.ifrCount} review`}
          color="#E61919"
        />
        <MetricCard
          icon="ti-list"
          label="[ ASSIGNED / DRAFT ]"
          value={metrics.draft}
          sub="Awaiting work"
          color="#666"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribusi Status">
          <StatusLegend items={statusDistribution} />
          <div className="relative" style={{ height: 240 }}>
            <canvas ref={donutRef} />
          </div>
        </ChartCard>

        <ChartCard title="Progress per Discipline">
          <div className="flex items-center gap-4 mb-3">
            <span className="flex items-center gap-1.5 micro text-[10px] font-bold text-gray-500">
              <span className="inline-block w-3 h-3 border border-black" style={{ background: "#111" }} />Complete
            </span>
            <span className="flex items-center gap-1.5 micro text-[10px] font-bold text-gray-500">
              <span className="inline-block w-3 h-3 border border-black" style={{ background: "#999" }} />Remaining
            </span>
          </div>
          <div style={{ height: 240 }}>
            <canvas ref={barRef} />
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Drawing Trend">
          <div className="flex items-center gap-4 mb-3">
            <span className="flex items-center gap-1.5 micro text-[10px] font-bold text-gray-500">
              <span className="inline-block w-5 h-0.5" style={{ background: "#111" }} />New
            </span>
            <span className="flex items-center gap-1.5 micro text-[10px] font-bold text-gray-500">
              <span className="inline-block w-5 h-0.5 border-t-2 border-dashed" style={{ borderColor: "#E61919" }} />Complete
            </span>
          </div>
          <div style={{ height: 200 }}>
            <canvas ref={lineRef} />
          </div>
        </ChartCard>

        <ChartCard title="Engineer Workload">
          <div className="space-y-4">
            {engineerWorkload.map((eng) => (
              <div key={eng.id} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 border-2 border-black flex items-center justify-center shrink-0"
                  style={{ background: "#111" }}
                >
                  <span className="text-white font-mono font-bold text-[10px]">{eng.initial}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="micro text-xs font-bold truncate text-black">
                      {eng.name}
                    </span>
                    <span className="micro text-[10px] font-bold text-gray-500">
                      {eng.done}/{eng.assigned}
                    </span>
                  </div>
                  <div className="h-2 border-2 border-black w-full" style={{ background: "#D4D4D0" }}>
                    <div
                      className="h-full transition-all"
                      style={{ width: `${eng.pct}%`, background: eng.pct >= 100 ? "#111" : "#E61919" }}
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
    <div className="border-4 border-black p-5" style={{ background: "#EAE8E3" }}>
      <div className="flex items-center gap-2 mb-3">
        <i className={`ti ${icon} text-lg`} style={{ color }} />
        <span className="micro text-[10px] font-bold text-gray-500">
          {label}
        </span>
      </div>
      <p className="font-mono font-black text-3xl mb-1" style={{ color }}>
        {value}
      </p>
      {sub && (
        <p className="micro text-[10px] font-bold text-gray-500">
          {sub}
        </p>
      )}
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-4 border-black p-5" style={{ background: "#EAE8E3" }}>
      <h3 className="micro text-xs font-bold mb-4 text-black">
        [ {title} ]
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
          <span className="micro text-[10px] font-bold text-gray-500">
            {item.label}
          </span>
          <span className="micro text-[10px] font-bold text-black">
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
          { label: "Complete", data: data.selesai, backgroundColor: "#111", borderRadius: 0, borderSkipped: true },
          { label: "Remaining", data: data.sisa, backgroundColor: "#999", borderRadius: 0, borderSkipped: true },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { font: { family: "JetBrains Mono, ui-monospace, monospace", size: 10 } } },
          y: { stacked: true, beginAtZero: true, grid: { color: "#D4D4D0" }, ticks: { font: { family: "JetBrains Mono, ui-monospace, monospace", size: 10 }, stepSize: 1 } },
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
            label: "New",
            data: data.baru,
            borderColor: "#111",
            backgroundColor: "transparent",
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: "#111",
            pointBorderColor: "#111",
          },
          {
            label: "Complete",
            data: data.selesai,
            borderColor: "#E61919",
            backgroundColor: "transparent",
            borderWidth: 2,
            borderDash: [6, 3],
            fill: false,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: "#E61919",
            pointBorderColor: "#E61919",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: "JetBrains Mono, ui-monospace, monospace", size: 10 } } },
          y: { beginAtZero: true, grid: { color: "#D4D4D0" }, ticks: { font: { family: "JetBrains Mono, ui-monospace, monospace", size: 10 }, stepSize: 1 } },
        },
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
      },
    })

    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [data])

  return ref
}
