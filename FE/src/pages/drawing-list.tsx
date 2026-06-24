import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  useDrawings,
  useCompanies,
  useProjects,
  useModules,
  useDrawingTypes,
  useDisciplines,
} from "../hooks/use-api"
import type { DrawingFilters } from "../api/drawings"
import { STATUS_LABEL, STATUS_COLOR } from "../lib/constants"
import { cn, formatDate } from "../lib/utils"
import { ArrowRight } from "lucide-react"

export default function DrawingListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<DrawingFilters>({
    page: 1,
    per_page: 10,
  })

  const { data: companies } = useCompanies()
  const { data: projects } = useProjects(filters.company_id)
  const { data: drawingTypes } = useDrawingTypes()
  const { data: modules } = useModules(filters.project_id)
  const { data: disciplines } = useDisciplines()
  const { data, isLoading, isError, error } = useDrawings(filters)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-mono font-bold uppercase">List Drawing</h2>
        <Link
          to="/drawings/create"
          className="font-mono font-bold text-sm uppercase px-6 py-3 border-4 border-black transition-all"
          style={{ background: "#E61919", color: "#fff" }}
        >
          + Create
        </Link>
      </div>

      <div className="border-4 border-black p-6" style={{ background: "#EAE8E3" }}>
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.company_id || ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                company_id: e.target.value || undefined,
                project_id: undefined,
                page: 1,
              }))
            }
            className="border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none min-w-[180px]"
            style={{ background: "#F4F4F0", color: "#111" }}
          >
            <option value="">[ ALL COMPANIES ]</option>
            {companies?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filters.project_id || ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                project_id: e.target.value || undefined,
                page: 1,
              }))
            }
            className="border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none min-w-[180px]"
            style={{ background: "#F4F4F0", color: "#111" }}
          >
            <option value="">[ ALL PROJECTS ]</option>
            {projects?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={filters.discipline_id || ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                discipline_id: e.target.value || undefined,
                page: 1,
              }))
            }
            className="border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none min-w-[180px]"
            style={{ background: "#F4F4F0", color: "#111" }}
          >
            <option value="">[ ALL DISCIPLINES ]</option>
            {disciplines?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={filters.drawing_type_id || ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                drawing_type_id: e.target.value || undefined,
                page: 1,
              }))
            }
            className="border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none min-w-[150px]"
            style={{ background: "#F4F4F0", color: "#111" }}
          >
            <option value="">[ ALL TYPES ]</option>
            {drawingTypes?.map((dt) => (
              <option key={dt.id} value={dt.id}>
                {dt.code}
              </option>
            ))}
          </select>

          <select
            value={filters.module_id || ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                module_id: e.target.value || undefined,
                page: 1,
              }))
            }
            className="border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none min-w-[150px]"
            style={{ background: "#F4F4F0", color: "#111" }}
          >
            <option value="">[ ALL MODULES ]</option>
            {modules?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            value={filters.status || ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: e.target.value || undefined,
                page: 1,
              }))
            }
            className="border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none min-w-[150px]"
            style={{ background: "#F4F4F0", color: "#111" }}
          >
            <option value="">[ ALL STATUS ]</option>
            {Object.entries(STATUS_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-4 border-black overflow-x-auto" style={{ background: "#EAE8E3" }}>
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="text-white uppercase text-xs" style={{ background: "#111" }}>
              <th className="text-left px-4 py-3 border-r-4 border-white/20 micro text-[10px] font-bold">
                Company
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20 micro text-[10px] font-bold">
                Project
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20 micro text-[10px] font-bold">
                Discipline
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20 micro text-[10px] font-bold">
                Type
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20 micro text-[10px] font-bold">
                Module
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20 micro text-[10px] font-bold">
                Document No
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20 micro text-[10px] font-bold">
                Created By
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20 micro text-[10px] font-bold">
                Created Date
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20 micro text-[10px] font-bold">
                Status
              </th>
              <th className="text-left px-4 py-3 micro text-[10px] font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center font-bold">
                  [ LOADING... ]
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center">
                  <span className="font-bold text-sm" style={{ color: "#E61919" }}>
                    [ ERROR: {error instanceof Error ? error.message : "API request failed"} ]
                  </span>
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center font-bold">
                  [ NO DATA ]
                </td>
              </tr>
            ) : (
              data?.data.map((drawing, i) => (
                <tr
                  key={drawing.id}
                  className="border-b-4 border-black"
                  style={{ background: i % 2 === 0 ? "#EAE8E3" : "#E0DDD8" }}
                >
                  <td className="px-4 py-3 font-bold">
                    {drawing.company?.name || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {drawing.project?.name || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {drawing.discipline?.name || "-"}
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {drawing.drawing_type?.code || "-"}
                  </td>
                  <td className="px-4 py-3">{drawing.module?.name || "-"}</td>
                  <td className="px-4 py-3 font-bold">{drawing.document_no}</td>
                  <td className="px-4 py-3">
                    {drawing.creator?.name || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(drawing.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-block px-3 py-1 border-2 border-black font-bold text-xs uppercase",
                        STATUS_COLOR[drawing.status],
                      )}
                    >
                      {STATUS_LABEL[drawing.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/drawings/${drawing.id}`)}
                      className="flex items-center gap-1 bg-black text-white font-mono font-bold text-xs uppercase px-4 py-2 border-2 border-black hover:bg-white hover:text-black transition-all"
                    >
                      Detail
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data && (
          <div className="flex items-center justify-between border-t-4 border-black px-4 py-4" style={{ background: "#EAE8E3" }}>
            <span className="font-mono text-xs font-bold">
              Page {data.page} of {data.total_pages} ({data.total} total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={data.page <= 1}
                onClick={() =>
                  setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))
                }
                className="border-4 border-black px-4 py-2 font-mono text-xs font-bold hover:bg-black hover:text-white disabled:opacity-30 transition-all"
              >
                PREV
              </button>
              <button
                disabled={data.page >= data.total_pages}
                onClick={() =>
                  setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))
                }
                className="border-4 border-black px-4 py-2 font-mono text-xs font-bold hover:bg-black hover:text-white disabled:opacity-30 transition-all"
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
