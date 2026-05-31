import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  useDrawings,
  useCompanies,
  useProjects,
  useDrawingTypes,
  useDisciplines,
} from "../hooks/use-api"
import type { DrawingFilters } from "../api/drawings"
import { STATUS_LABEL, STATUS_COLOR } from "../lib/constants"
import { cn, formatDate } from "../lib/utils"
import { Search, ArrowRight } from "lucide-react"

export default function DrawingListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<DrawingFilters>({
    page: 1,
    per_page: 10,
  })

  const { data: companies } = useCompanies()
  const { data: projects } = useProjects(filters.company_id)
  const { data: drawingTypes } = useDrawingTypes()
  const { data: disciplines } = useDisciplines()
  const { data, isLoading } = useDrawings(filters)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-mono font-bold uppercase">List Drawing</h2>
        <Link
          to="/drawings/create"
          className="bg-green-600 text-white font-mono font-bold text-sm uppercase px-6 py-3 border-4 border-black hover:bg-green-700 transition-all"
        >
          + Create
        </Link>
      </div>

      <div className="border-4 border-black bg-white p-6">
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
            className="border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50 min-w-[180px]"
          >
            <option value="">All Companies</option>
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
            className="border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50 min-w-[180px]"
          >
            <option value="">All Projects</option>
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
            className="border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50 min-w-[180px]"
          >
            <option value="">All Disciplines</option>
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
            className="border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50 min-w-[150px]"
          >
            <option value="">All Types</option>
            {drawingTypes?.map((dt) => (
              <option key={dt.id} value={dt.id}>
                {dt.code}
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
            className="border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50 min-w-[150px]"
          >
            <option value="">All Status</option>
            {Object.entries(STATUS_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-4 border-black overflow-x-auto bg-white">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="bg-black text-white uppercase text-xs">
              <th className="text-left px-4 py-3 border-r-4 border-white/20">
                Company
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">
                Project
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">
                Discipline
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">
                Type
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">
                Module
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">
                Document No
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">
                Created By
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">
                Created Date
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">
                Status
              </th>
              <th className="text-left px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center font-bold">
                  LOADING...
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center font-bold">
                  NO DATA FOUND
                </td>
              </tr>
            ) : (
              data?.data.map((drawing, i) => (
                <tr
                  key={drawing.id}
                  className={cn(
                    "border-b-4 border-black transition-all hover:bg-yellow-50",
                    i % 2 === 0 ? "bg-white" : "bg-gray-100",
                  )}
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
                  <td className="px-4 py-3">{drawing.module_name}</td>
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
          <div className="flex items-center justify-between border-t-4 border-black px-4 py-4 bg-white">
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
