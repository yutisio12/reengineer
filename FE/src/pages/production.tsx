import { useState, useMemo, useCallback, useEffect } from "react"
import {
  useProductionDrawings, useCompanies, useProjects, useModules,
  useRevisions, useRaiseRevision,
} from "../hooks/use-api"
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
import type { Drawing } from "../types"

export default function ProductionPage() {
  const [companyFilter, setCompanyFilter] = useState("")
  const [projectFilter, setProjectFilter] = useState("")
  const [moduleFilter, setModuleFilter] = useState("")
  const [search, setSearch] = useState("")

  const [detailDrawing, setDetailDrawing] = useState<Drawing | null>(null)
  const [reviseDrawing, setReviseDrawing] = useState<Drawing | null>(null)

  const { data: drawings } = useProductionDrawings({ company_id: companyFilter, project_id: projectFilter, module_id: moduleFilter })

  const { data: companies } = useCompanies()
  const { data: projects } = useProjects(companyFilter)
  const { data: filteredModules } = useModules(projectFilter)

  useEffect(() => { setProjectFilter(""); setModuleFilter("") }, [companyFilter])
  useEffect(() => { setModuleFilter("") }, [projectFilter])

  const filteredDrawings = useMemo(() => {
    let d = drawings ?? []
    if (search.trim()) {
      const q = search.toLowerCase()
      d = d.filter((dw) => dw.document_no.toLowerCase().includes(q) || (dw.description || "").toLowerCase().includes(q))
    }
    return d
  }, [drawings, search])

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
          <h1 className="macro-title text-[clamp(2rem,6vw,4rem)] text-black">
            Production List
          </h1>
          <p className="micro text-xs mt-1 text-gray-500">
            {filteredDrawings.length} drawing{filteredDrawings.length !== 1 ? "s" : ""} transmitted
          </p>
        </div>
        <button
          onClick={handleExport}
          className="border-4 border-black px-5 py-3 font-mono font-bold text-xs uppercase flex items-center gap-2 transition-all"
          style={{ background: "#E61919", color: "#fff" }}
        >
          <FileSpreadsheet size={16} />
          [ EXPORT EXCEL ]
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Cari document no atau deskripsi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-4 border-black px-4 py-3 font-mono text-sm flex-1 min-w-[200px] focus:outline-none"
          style={{ background: "#EAE8E3", color: "#111" }}
        />
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none"
          style={{ background: "#EAE8E3", color: "#111" }}
        >
           <option value="">[ ALL COMPANIES ]</option>
          {(companies ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          disabled={!companyFilter}
          className="border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none disabled:opacity-40"
          style={{ background: "#EAE8E3", color: "#111" }}
        >
          <option value="">[ ALL PROJECTS ]</option>
          {(projects ?? []).map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          disabled={!projectFilter}
          className="border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none disabled:opacity-40"
          style={{ background: "#EAE8E3", color: "#111" }}
        >
          <option value="">[ ALL MODULES ]</option>
          {(filteredModules ?? []).map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="border-4 border-black overflow-x-auto" style={{ background: "#EAE8E3" }}>
        <table className="w-full font-mono text-xs">
          <thead>
            <tr className="text-white" style={{ background: "#111" }}>
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
                <td colSpan={9} className="py-12 text-center font-mono text-sm text-gray-500">
                  [ NO DRAWINGS IN PRODUCTION ]
                </td>
              </tr>
            )}
            {filteredDrawings.map((d, i) => (
              <tr
                key={d.id}
                className="border-b-4 border-black"
                style={{ background: i % 2 === 0 ? "#EAE8E3" : "#E0DDD8" }}
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
                      className="border-2 border-black p-2 transition-all"
                      style={{ background: "#111", color: "#fff" }}
                      title="Detail"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => setReviseDrawing(d)}
                      className="border-2 border-black p-2 transition-all"
                      style={{ background: "#E61919", color: "#fff" }}
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
    <th className={`px-4 py-4 text-left border-r border-white/20 ${className} micro text-[10px] font-bold`}>
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
      <div className="w-full max-w-2xl border-4 border-black max-h-[90vh] overflow-y-auto" style={{ background: "#F4F4F0" }}>
        <div className="flex items-center justify-between border-b-4 border-black px-6 py-4" style={{ background: "#EAE8E3" }}>
          <h2 className="font-mono font-bold text-sm uppercase">[ DRAWING DETAIL ]</h2>
          <button onClick={onClose} className="border-2 border-black p-1.5 transition-all" style={{ color: "#E61919" }}>
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
              <p className="font-mono text-xs py-4 text-center text-gray-500">
                [ NO REVISIONS ]
              </p>
            )}
            {revisions && revisions.length > 0 && (
              <div className="space-y-3">
                {[...revisions].reverse().map((rev) => (
                  <div key={rev.id} className="border-2 border-black p-4" style={{ background: "#EAE8E3" }}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white px-2 py-0.5" style={{ background: "#111" }}>
                          REV {rev.revision_no}
                        </span>
                        <span className="micro text-[10px] text-gray-500">
                          {rev.creator?.name || "-"} | {formatDate(rev.created_at)}
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
                            className="inline-flex items-center gap-1.5 border-2 border-black px-3 py-2 font-mono text-[10px] font-bold uppercase transition-all"
                            style={{ background: "#F4F4F0", color: "#E61919" }}
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
      <p className="micro text-[10px] font-bold mb-0.5 text-gray-500">
        {label}
      </p>
      <p className="font-mono text-xs font-bold text-black">
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
      <div className="w-full max-w-md border-4 border-black" style={{ background: "#F4F4F0" }}>
        <div className="flex items-center justify-between border-b-4 border-black px-6 py-4" style={{ background: "#EAE8E3" }}>
          <h2 className="font-mono font-bold text-sm uppercase">[ RAISE REVISION ]</h2>
          <button onClick={onClose} className="border-2 border-black p-1.5 transition-all" style={{ color: "#E61919" }}>
            <X size={14} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="micro text-[10px] font-bold mb-1 text-gray-500">
              Drawing
            </p>
            <p className="font-mono text-xs font-bold text-black">
              {drawing.document_no} — {drawing.description || "-"}
            </p>
          </div>

          <div>
            <label className="micro text-[10px] font-bold mb-1 block text-gray-500">
              New Revision No {latestRev ? `(current Rev ${latestRev}, recommended ${nextRevHint})` : ""}
            </label>
            <input
              type="text"
              value={revNo}
              onChange={(e) => setRevNo(e.target.value)}
              placeholder={nextRevHint}
              className="w-full border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none"
              style={{ background: "#EAE8E3", color: "#111" }}
            />
          </div>

          <div>
            <label className="micro text-[10px] font-bold mb-1 block text-gray-500">
              Reason for Revision
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Describe revision reason..."
              className="w-full border-4 border-black px-4 py-3 font-mono text-sm resize-none focus:outline-none"
              style={{ background: "#EAE8E3", color: "#111" }}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={raiseRevision.isPending}
              className="flex-1 border-4 border-black py-3 font-mono font-bold text-xs uppercase disabled:opacity-50 transition-all"
              style={{ background: "#E61919", color: "#fff" }}
            >
              {raiseRevision.isPending ? ">>> PROCESSING..." : ">>> SUBMIT REVISION"}
            </button>
            <button
              onClick={onClose}
              className="border-4 border-black py-3 px-6 font-mono font-bold text-xs uppercase transition-all"
              style={{ background: "#111", color: "#fff" }}
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
