import { useState, useMemo, useCallback, useEffect } from "react"
import { enrichDrawings } from "../api/mock"
import { mockCompanies, mockProjects, mockModules } from "../api/mock"
import { useRevisions, useRaiseRevision } from "../hooks/use-api"
import { showConfirm, showToast } from "../lib/swal"
import { formatDate } from "../lib/utils"
import * as XLSX from "xlsx"
import {
  Eye,
  RotateCcw,
  Download,
  FileSpreadsheet,
  X,
} from "lucide-react"
import { cn } from "../lib/utils"
import { STATUS_COLOR } from "../lib/constants"

type Drawing = ReturnType<typeof enrichDrawings>[number]

export default function ProductionPage() {
  const [companyFilter, setCompanyFilter] = useState("")
  const [projectFilter, setProjectFilter] = useState("")
  const [moduleFilter, setModuleFilter] = useState("")
  const [search, setSearch] = useState("")

  const [detailDrawing, setDetailDrawing] = useState<Drawing | null>(null)
  const [reviseDrawing, setReviseDrawing] = useState<Drawing | null>(null)

  const drawings = useMemo(() => {
    return enrichDrawings().filter((d) => d.status === "transmitted")
  }, [])

  const companies = useMemo(() => mockCompanies.filter((c) => c.is_active), [])
  const projects = useMemo(
    () => (companyFilter ? mockProjects.filter((p) => p.company_id === companyFilter && p.is_active) : []),
    [companyFilter],
  )
  const filteredModules = useMemo(
    () => (projectFilter ? mockModules.filter((m) => m.project_id === projectFilter && m.is_active) : []),
    [projectFilter],
  )

  useEffect(() => { setProjectFilter(""); setModuleFilter("") }, [companyFilter])
  useEffect(() => { setModuleFilter("") }, [projectFilter])

  const filteredDrawings = useMemo(() => {
    let d = drawings
    if (companyFilter) d = d.filter((dw) => dw.company_id === companyFilter)
    if (projectFilter) d = d.filter((dw) => dw.project_id === projectFilter)
    if (moduleFilter) d = d.filter((dw) => dw.module_id === moduleFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      d = d.filter((dw) => dw.document_no.toLowerCase().includes(q) || (dw.description || "").toLowerCase().includes(q))
    }
    return d
  }, [drawings, companyFilter, projectFilter, moduleFilter, search])

  const handleExport = useCallback(() => {
    const data = filteredDrawings.map((d, i) => ({
      No: i + 1,
      "Document No": d.document_no,
      Company: d.company?.name || "-",
      Project: d.project?.name || "-",
      Module: d.module?.name || "-",
      Discipline: d.discipline?.name || "-",
      "Drawing Type": d.drawing_type?.name || "-",
      Description: d.description || "",
      "Created At": formatDate(d.created_at),
      "Updated At": formatDate(d.updated_at),
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, "Production")
    XLSX.writeFile(wb, `production-list-${new Date().toISOString().slice(0, 10)}.xlsx`)
    showToast("success", "Excel exported successfully")
  }, [filteredDrawings])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-mono font-black uppercase" style={{ color: "var(--color-text-primary)" }}>
            Production List
          </h1>
          <p className="font-mono text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {filteredDrawings.length} drawing{filteredDrawings.length !== 1 ? "s" : ""} transmitted
          </p>
        </div>
        <button
          onClick={handleExport}
          className="border-4 border-black px-5 py-3 font-mono font-bold text-xs uppercase flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          <FileSpreadsheet size={16} />
          Export Excel
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Cari document no atau deskripsi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-4 border-black px-4 py-3 font-mono text-sm flex-1 min-w-[200px] focus:outline-none focus:bg-yellow-50"
          style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}
        />
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none focus:bg-yellow-50"
          style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}
        >
          <option value="">Semua Company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          disabled={!companyFilter}
          className="border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none focus:bg-yellow-50 disabled:opacity-40"
          style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}
        >
          <option value="">Semua Project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          disabled={!projectFilter}
          className="border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none focus:bg-yellow-50 disabled:opacity-40"
          style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}
        >
          <option value="">Semua Module</option>
          {filteredModules.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="border-4 border-black overflow-x-auto" style={{ background: "var(--color-surface)" }}>
        <table className="w-full font-mono text-xs">
          <thead>
            <tr className="bg-black text-white">
              <Th>#</Th>
              <Th>Document No</Th>
              <Th>Company</Th>
              <Th>Project</Th>
              <Th>Module</Th>
              <Th>Discipline</Th>
              <Th>Status</Th>
              <Th>Transmitted</Th>
              <Th className="text-center">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredDrawings.length === 0 && (
              <tr>
                <td colSpan={9} className="py-12 text-center font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Tidak ada drawing di production
                </td>
              </tr>
            )}
            {filteredDrawings.map((d, i) => (
              <tr
                key={d.id}
                className={cn(
                  "border-b-4 border-black hover:bg-yellow-50 transition-colors",
                  i % 2 === 0 ? "bg-white" : "bg-gray-100",
                )}
              >
                <td className="px-4 py-4 text-center font-bold">{i + 1}</td>
                <td className="px-4 py-4 font-bold">{d.document_no}</td>
                <td className="px-4 py-4">{d.company?.name || "-"}</td>
                <td className="px-4 py-4">{d.project?.name || "-"}</td>
                <td className="px-4 py-4">{d.module?.name || "-"}</td>
                <td className="px-4 py-4">{d.discipline?.name || "-"}</td>
                <td className="px-4 py-4">
                  <span className={cn("inline-block px-3 py-1 border-2 border-black font-bold text-xs uppercase", STATUS_COLOR[d.status])}>
                    {d.status === "transmitted" ? "Transmitted" : d.status}
                  </span>
                </td>
                <td className="px-4 py-4">{formatDate(d.updated_at)}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => setDetailDrawing(d)}
                      className="border-2 border-black p-2 bg-black text-white hover:bg-white hover:text-black transition-colors"
                      title="Detail"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => setReviseDrawing(d)}
                      className="border-2 border-black p-2 bg-black text-white hover:bg-white hover:text-black transition-colors"
                      title="Raise Revision"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detailDrawing && (
        <DetailModal
          drawing={detailDrawing}
          onClose={() => setDetailDrawing(null)}
        />
      )}

      {reviseDrawing && (
        <RevisionModal
          drawing={reviseDrawing}
          onClose={() => setReviseDrawing(null)}
          onSuccess={() => setReviseDrawing(null)}
        />
      )}
    </div>
  )
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-4 text-left font-bold uppercase tracking-wider border-r border-white/20 ${className}`}>
      {children}
    </th>
  )
}

function DetailModal({ drawing, onClose }: { drawing: Drawing; onClose: () => void }) {
  const { data: revisions } = useRevisions(drawing.id)

  const latestRev = useMemo(() => {
    if (!revisions || revisions.length === 0) return "-"
    return revisions[revisions.length - 1].revision_no
  }, [revisions])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl border-4 border-black bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-4 border-black px-6 py-4 bg-gray-50">
          <h2 className="font-mono font-bold text-sm uppercase">Drawing Detail</h2>
          <button onClick={onClose} className="border-2 border-black p-1.5 hover:text-red-600 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <Field label="Document No" value={drawing.document_no} />
            <Field label="Rev" value={latestRev} />
            <Field label="Company" value={drawing.company?.name || "-"} />
            <Field label="Project" value={drawing.project?.name || "-"} />
            <Field label="Module" value={drawing.module?.name || "-"} />
            <Field label="Discipline" value={drawing.discipline?.name || "-"} />
            <Field label="Drawing Type" value={drawing.drawing_type?.name || "-"} />
            <Field label="Status" value="Transmitted" />
            <Field label="Description" value={drawing.description || "-"} className="col-span-2" />
            <Field label="Created" value={formatDate(drawing.created_at)} />
            <Field label="Updated" value={formatDate(drawing.updated_at)} />
          </div>

          <div>
            <h3 className="font-mono font-bold text-xs uppercase mb-3 border-b-2 border-black pb-2">
              Revision History
            </h3>
            {(!revisions || revisions.length === 0) && (
              <p className="font-mono text-xs py-4 text-center" style={{ color: "var(--color-text-secondary)" }}>
                No revisions
              </p>
            )}
            {revisions && revisions.length > 0 && (
              <div className="space-y-3">
                {[...revisions].reverse().map((rev) => (
                  <div key={rev.id} className="border-2 border-black p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-black text-white px-2 py-0.5">
                          Rev {rev.revision_no}
                        </span>
                        <span className="font-mono text-[10px]" style={{ color: "var(--color-text-secondary)" }}>
                          {rev.creator?.name || "-"} &middot; {formatDate(rev.created_at)}
                        </span>
                      </div>
                    </div>
                    {rev.description && (
                      <p className="font-mono text-[10px] mb-3">{rev.description}</p>
                    )}
                    {rev.files && rev.files.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {rev.files.map((f) => (
                          <a
                            key={f.id}
                            href={`/engineering/api/revisions/files/${f.id}/download`}
                            className="inline-flex items-center gap-1.5 border-2 border-black px-3 py-2 font-mono text-[10px] font-bold uppercase bg-white text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Download size={12} />
                            {f.file_name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="font-mono text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-text-secondary)" }}>
        {label}
      </p>
      <p className="font-mono text-xs font-bold" style={{ color: "var(--color-text-primary)" }}>
        {value}
      </p>
    </div>
  )
}

function RevisionModal({ drawing, onClose, onSuccess }: { drawing: Drawing; onClose: () => void; onSuccess: () => void }) {
  const [revNo, setRevNo] = useState("")
  const [reason, setReason] = useState("")
  const raiseRevision = useRaiseRevision(drawing.id)

  const { data: revisions } = useRevisions(drawing.id)
  const latestRev = useMemo(() => {
    if (!revisions || revisions.length === 0) return null
    return revisions[revisions.length - 1].revision_no
  }, [revisions])
  const nextRevHint = useMemo(() => {
    if (!latestRev) return "A"
    const code = latestRev.charCodeAt(0)
    return String.fromCharCode(code + 1)
  }, [latestRev])

  const handleSubmit = async () => {
    if (!revNo.trim()) { showToast("error", "Revision no is required"); return }
    if (!reason.trim()) { showToast("error", "Reason is required"); return }

    const confirmed = await showConfirm(
      "Raise Revision?",
      `Drawing ${drawing.document_no} akan naik ke Rev ${revNo} dan kembali ke In Progress.`,
    )
    if (!confirmed) return

    raiseRevision.mutate(
      { revision_no: revNo.trim(), description: reason.trim() },
      {
        onSuccess: () => {
          showToast("success", `Revision ${revNo} raised — drawing kembali ke In Progress`)
          onSuccess()
        },
        onError: () => { showToast("error", "Gagal menaikkan revision") },
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md border-4 border-black bg-white">
        <div className="flex items-center justify-between border-b-4 border-black px-6 py-4 bg-gray-50">
          <h2 className="font-mono font-bold text-sm uppercase">Raise Revision</h2>
          <button onClick={onClose} className="border-2 border-black p-1.5 hover:text-red-600 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase mb-1" style={{ color: "var(--color-text-secondary)" }}>
              Drawing
            </p>
            <p className="font-mono text-xs font-bold" style={{ color: "var(--color-text-primary)" }}>
              {drawing.document_no} — {drawing.description || "-"}
            </p>
          </div>

          <div>
            <label className="font-mono text-[10px] font-bold uppercase mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
              New Revision No {latestRev ? `(sekarang Rev ${latestRev}, rekomendasi ${nextRevHint})` : ""}
            </label>
            <input
              type="text"
              value={revNo}
              onChange={(e) => setRevNo(e.target.value)}
              placeholder={nextRevHint}
              className="w-full border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none focus:bg-yellow-50"
              style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}
            />
          </div>

          <div>
            <label className="font-mono text-[10px] font-bold uppercase mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
              Reason for Revision
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Jelaskan alasan revisi..."
              className="w-full border-4 border-black px-4 py-3 font-mono text-sm resize-none focus:outline-none focus:bg-yellow-50"
              style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={raiseRevision.isPending}
              className="flex-1 border-4 border-black py-3 font-mono font-bold text-xs uppercase bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {raiseRevision.isPending ? "Processing..." : "Submit Revision"}
            </button>
            <button
              onClick={onClose}
              className="border-4 border-black py-3 px-6 font-mono font-bold text-xs uppercase bg-white text-black hover:bg-black hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
