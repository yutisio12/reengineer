import { useState, useRef } from "react"
import { useParams } from "react-router-dom"
import {
  useDrawing,
  useActivities,
  usePerformAction,
  useRevisions,
  useCreateRevision,
  useUpdateDrawing,
  useCompanies,
  useProjects,
  useModules,
  useDrawingTypes,
  useDisciplines,
  useUsers,
} from "../hooks/use-api"
import { STATUS_LABEL, STATUS_COLOR } from "../lib/constants"
import { cn, formatDate } from "../lib/utils"
import { showConfirm, showToast } from "../lib/swal"
import { Undo2, Play, Square, Check, Send, Upload, X, FileText, Pencil } from "lucide-react"
import type { PerformActionPayload } from "../api/activities"
import type { CreateRevisionPayload } from "../api/revisions"
import { uploadFile } from "../api/revisions"

type ActiveTab = "activity" | "revision"

export default function DrawingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState<ActiveTab>("activity")

  if (!id) return null

  return (
    <div>
      <DrawingHeader drawingId={id} />

      <div className="flex border-b-4 border-black mb-6">
        <button
          onClick={() => setTab("activity")}
          className={cn(
            "px-6 py-3 font-mono font-bold text-sm uppercase border-4 border-b-0 -mb-[4px] transition-all",
            tab === "activity"
              ? "bg-black text-white border-black"
              : "bg-white text-black border-transparent hover:border-black",
          )}
        >
          Activity
        </button>
        <button
          onClick={() => setTab("revision")}
          className={cn(
            "px-6 py-3 font-mono font-bold text-sm uppercase border-4 border-b-0 -mb-[4px] transition-all",
            tab === "revision"
              ? "bg-black text-white border-black"
              : "bg-white text-black border-transparent hover:border-black",
          )}
        >
          Revision
        </button>
      </div>

      {tab === "activity" ? (
        <ActivityTab drawingId={id} />
      ) : (
        <RevisionTab drawingId={id} />
      )}
    </div>
  )
}

function DrawingHeader({ drawingId }: { drawingId: string }) {
  const { data: drawing, isLoading } = useDrawing(drawingId)
  const [showEdit, setShowEdit] = useState(false)

  if (isLoading || !drawing) {
    return (
      <div className="border-4 border-black p-6 mb-6 bg-white font-mono font-bold">
        {isLoading ? "LOADING..." : "NOT FOUND"}
      </div>
    )
  }

  return (
    <>
      <div className="border-4 border-black bg-white p-6 mb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-mono font-bold uppercase">
              {drawing.document_no}
            </h2>
            <p className="font-mono text-sm text-gray-600">
              {drawing.company?.name} / {drawing.project?.name} /{" "}
              {drawing.discipline?.name} /{" "}
              {drawing.drawing_type?.name || drawing.drawing_type?.code} /{" "}
              {drawing.module?.name || "-"}
            </p>
            <p className="font-mono text-xs text-gray-500">
              Created by {drawing.creator?.name || "-"} on{" "}
              {formatDate(drawing.created_at)} &middot; Drafter:{" "}
              {drawing.drafter?.name || "-"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1 bg-black text-white font-mono font-bold text-xs uppercase px-3 py-2 border-2 border-black hover:bg-white hover:text-black transition-all"
            >
              <Pencil size={12} /> Edit
            </button>
            <span
              className={cn(
                "px-4 py-2 border-2 border-black font-bold text-xs uppercase",
                STATUS_COLOR[drawing.status],
              )}
            >
              {STATUS_LABEL[drawing.status]}
            </span>
          </div>
        </div>
      </div>
      {showEdit && <EditDrawingModal drawingId={drawingId} onClose={() => setShowEdit(false)} />}
    </>
  )
}

function EditDrawingModal({
  drawingId,
  onClose,
}: {
  drawingId: string
  onClose: () => void
}) {
  const { data: drawing } = useDrawing(drawingId)
  const { data: companies } = useCompanies()
  const { data: drawingTypes } = useDrawingTypes()
  const { data: disciplines } = useDisciplines()
  const { data: drafters } = useUsers("drafter")
  const updateMutation = useUpdateDrawing()

  const [companyId, setCompanyId] = useState(drawing?.company_id || "")
  const { data: projects } = useProjects(companyId)
  const [projectId, setProjectId] = useState(drawing?.project_id || "")
  const { data: modules } = useModules(projectId)

  const [form, setForm] = useState({
    company_id: drawing?.company_id || "",
    project_id: drawing?.project_id || "",
    discipline_id: drawing?.discipline_id || "",
    drawing_type_id: drawing?.drawing_type_id || "",
    module_id: drawing?.module_id || "",
    document_no: drawing?.document_no || "",
    assigned_drafter: drawing?.assigned_drafter || "",
    description: drawing?.description || "",
  })

  if (!drawing) return null

  const handleSave = async () => {
    const confirmed = await showConfirm("Save Changes?", "Update this drawing?")
    if (!confirmed) return
    try {
      await updateMutation.mutateAsync({ id: drawingId, data: form })
      showToast("success", "Drawing updated")
      onClose()
    } catch {
      showToast("error", "Failed to update drawing")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="border-4 border-black bg-white p-6 w-full max-w-2xl my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono font-bold text-sm uppercase">Edit Drawing — {drawing.document_no}</h3>
          <button onClick={onClose} className="hover:text-red-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-2">Company</label>
              <select value={form.company_id} onChange={(e) => { setCompanyId(e.target.value); setProjectId(""); setForm((f) => ({ ...f, company_id: e.target.value, project_id: "", module_id: "" })) }} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50">
                <option value="">Select</option>
                {companies?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-2">Project</label>
              <select value={form.project_id} onChange={(e) => { setProjectId(e.target.value); setForm((f) => ({ ...f, project_id: e.target.value, module_id: "" })) }} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50 disabled:opacity-40" disabled={!companyId}>
                <option value="">Select</option>
                {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-2">Module</label>
              <select value={form.module_id} onChange={(e) => setForm((f) => ({ ...f, module_id: e.target.value }))} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50 disabled:opacity-40" disabled={!form.project_id}>
                <option value="">Select</option>
                {modules?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-2">Discipline</label>
              <select value={form.discipline_id} onChange={(e) => setForm((f) => ({ ...f, discipline_id: e.target.value }))} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50">
                <option value="">Select</option>
                {disciplines?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-2">Drawing Type</label>
              <select value={form.drawing_type_id} onChange={(e) => setForm((f) => ({ ...f, drawing_type_id: e.target.value }))} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50">
                <option value="">Select</option>
                {drawingTypes?.map((dt) => <option key={dt.id} value={dt.id}>{dt.code} — {dt.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-2">Document No</label>
              <input value={form.document_no} onChange={(e) => setForm((f) => ({ ...f, document_no: e.target.value }))} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50" />
            </div>
            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-2">Assign Drafter</label>
              <select value={form.assigned_drafter} onChange={(e) => setForm((f) => ({ ...f, assigned_drafter: e.target.value }))} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50">
                <option value="">Select</option>
                {drafters?.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Notes</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={updateMutation.isPending} className="bg-green-600 text-white font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-green-700 disabled:opacity-50 transition-all">
            {updateMutation.isPending ? "SAVING..." : "SAVE"}
          </button>
          <button onClick={onClose} className="bg-white text-black font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-black hover:text-white transition-all">CANCEL</button>
        </div>
      </div>
    </div>
  )
}

function ActivityTab({ drawingId }: { drawingId: string }) {
  const { data: drawing } = useDrawing(drawingId)
  const { data: activities, isLoading } = useActivities(drawingId)
  const performAction = usePerformAction(drawingId)
  const [returnReason, setReturnReason] = useState("")
  const [showReturnDialog, setShowReturnDialog] = useState<{
    stage: "checker" | "engineer"
  } | null>(null)

  if (isLoading || !drawing) {
    return (
      <div className="border-4 border-black p-6 bg-white font-mono font-bold">
        LOADING...
      </div>
    )
  }

  const status = drawing.status
  const stages: Array<{
    key: "drafter" | "checker" | "engineer"
    label: string
  }> = [
    { key: "drafter", label: "Drafter" },
    { key: "checker", label: "Checker" },
    { key: "engineer", label: "Engineer" },
  ]

  const currentStageIndex = stages.findIndex((s) => status.includes(s.key))

  const handleAction = async (payload: PerformActionPayload) => {
    const actionLabels: Record<string, string> = {
      start: "Start",
      stop: "Stop",
      submit: "Submit",
      approve: "Approve",
      return: "Return",
    }
    const confirmed = await showConfirm(
      `${actionLabels[payload.action] || payload.action}?`,
      `Are you sure you want to ${payload.action} this drawing?`,
    )
    if (!confirmed) return
    try {
      performAction.mutate(payload, {
        onSuccess: () => showToast("success", `${actionLabels[payload.action] || payload.action} successful`),
        onError: () => showToast("error", `${actionLabels[payload.action] || payload.action} failed`),
      })
    } catch {
      showToast("error", "Action failed")
    }
  }

  const handleReturn = async () => {
    if (!showReturnDialog || !returnReason.trim()) return
    await handleAction({
      action: "return",
      stage: showReturnDialog.stage,
      return_reason: returnReason,
    })
    setShowReturnDialog(null)
    setReturnReason("")
  }

  return (
    <div className="space-y-6">
      <div className="border-4 border-black bg-white p-6">
        <div className="flex gap-2">
          {stages.map((s, i) => (
            <div key={s.key} className="flex-1">
              <div
                className={cn(
                  "border-4 px-4 py-3 font-mono font-bold text-sm uppercase text-center transition-all",
                  i === currentStageIndex
                    ? "bg-yellow-500 border-black text-black"
                    : i < currentStageIndex
                      ? "bg-green-600 border-black text-white"
                      : "bg-gray-200 border-gray-300 text-gray-400",
                )}
              >
                {i < currentStageIndex ? "✓ " : ""}
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-4 border-black bg-white p-6">
        <h3 className="font-mono font-bold text-sm uppercase mb-4">Actions</h3>
        <div className="flex flex-wrap gap-3">
          {status === "assigned" && (
            <ActionButton
              icon={Play}
              label="Start"
              onClick={() =>
                handleAction({ action: "start", stage: "drafter" })
              }
              color="green"
            />
          )}

          {status === "in_progress_drafter" && (
            <>
              <ActionButton
                icon={Square}
                label="Stop"
                onClick={() =>
                  handleAction({ action: "stop", stage: "drafter" })
                }
                color="red"
              />
              <ActionButton
                icon={Send}
                label="Submit"
                onClick={() =>
                  handleAction({ action: "submit", stage: "drafter" })
                }
                color="green"
              />
            </>
          )}

          {status === "in_progress_checker" && (
            <>
              <ActionButton
                icon={Play}
                label="Start"
                onClick={() =>
                  handleAction({ action: "start", stage: "checker" })
                }
                color="green"
              />
              <ActionButton
                icon={Square}
                label="Stop"
                onClick={() =>
                  handleAction({ action: "stop", stage: "checker" })
                }
                color="red"
              />
              <ActionButton
                icon={Send}
                label="Submit to Engineer"
                onClick={() =>
                  handleAction({ action: "submit", stage: "checker" })
                }
                color="green"
              />
              <ActionButton
                icon={Undo2}
                label="Return to Drafter"
                onClick={() => setShowReturnDialog({ stage: "checker" })}
                color="red"
              />
            </>
          )}

          {status === "in_progress_engineer" && (
            <>
              <ActionButton
                icon={Play}
                label="Start"
                onClick={() =>
                  handleAction({ action: "start", stage: "engineer" })
                }
                color="green"
              />
              <ActionButton
                icon={Square}
                label="Stop"
                onClick={() =>
                  handleAction({ action: "stop", stage: "engineer" })
                }
                color="red"
              />
              <ActionButton
                icon={Check}
                label="Approve"
                onClick={() =>
                  handleAction({ action: "approve", stage: "engineer" })
                }
                color="green"
              />
              <ActionButton
                icon={Undo2}
                label="Return to Checker"
                onClick={() => setShowReturnDialog({ stage: "engineer" })}
                color="red"
              />
            </>
          )}

          {status === "fully_approved" && (
            <div className="border-4 border-green-600 bg-green-100 px-6 py-3 font-mono font-bold text-sm text-green-800">
              FULLY APPROVED — Ready to Transmit
            </div>
          )}

          {status === "transmitted" && (
            <div className="border-4 border-blue-600 bg-blue-100 px-6 py-3 font-mono font-bold text-sm text-blue-800">
              TRANSMITTED to Production
            </div>
          )}
        </div>
      </div>

      {showReturnDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="border-4 border-black bg-white p-6 w-full max-w-md">
            <h3 className="font-mono font-bold text-sm uppercase mb-4">Return Reason</h3>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              rows={3}
              placeholder="Explain why it's being returned..."
              className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={handleReturn} disabled={!returnReason.trim()} className="bg-red-600 text-white font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-red-700 disabled:opacity-50 transition-all">CONFIRM RETURN</button>
              <button onClick={() => { setShowReturnDialog(null); setReturnReason("") }} className="bg-white text-black font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-black hover:text-white transition-all">CANCEL</button>
            </div>
          </div>
        </div>
      )}

      <div className="border-4 border-black bg-white">
        <div className="border-b-4 border-black px-6 py-4">
          <h3 className="font-mono font-bold text-sm uppercase">Activity Timeline</h3>
        </div>
        <div className="divide-y-4 divide-black">
          {activities?.length === 0 && (
            <div className="px-6 py-12 text-center font-mono font-bold text-sm">NO ACTIVITIES</div>
          )}
          {activities?.map((a) => (
            <div key={a.id} className="px-6 py-4 flex items-start gap-4">
              <div className={cn(
                "w-3 h-3 rounded-full mt-1.5 shrink-0 border-2 border-black",
                a.action === "start" ? "bg-green-500" : a.action === "stop" ? "bg-red-500" : a.action === "return" ? "bg-red-500" : a.action === "approve" ? "bg-green-700" : "bg-blue-500",
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs uppercase">{a.action}</span>
                  <span className="font-mono text-[10px] uppercase text-gray-500">{a.stage}</span>
                </div>
                <p className="font-mono text-xs text-gray-600 mt-0.5">
                  by {a.user?.name || "-"} — {formatDate(a.action_time)}
                </p>
                {a.return_reason && (
                  <p className="font-mono text-xs text-red-600 mt-1 italic">
                    Reason: {a.return_reason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  color,
}: {
  icon: typeof Play
  label: string
  onClick: () => void
  color: "green" | "red"
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 font-mono font-bold text-xs uppercase px-6 py-4 border-4 border-black transition-all",
        color === "green"
          ? "bg-green-600 text-white hover:bg-green-700"
          : "bg-red-600 text-white hover:bg-red-700",
      )}
    >
      <Icon size={16} />
      {label}
    </button>
  )
}

function RevisionTab({ drawingId }: { drawingId: string }) {
  const { data: drawing } = useDrawing(drawingId)
  const { data: revisions, isLoading } = useRevisions(drawingId)
  const createRevision = useCreateRevision(drawingId)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ revision_no: "", description: "" })
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadingRevId, setUploadingRevId] = useState<string | null>(null)

  const handleCreate = async () => {
    const confirmed = await showConfirm("Add Revision?", "Save this revision?")
    if (!confirmed) return
    setUploading(true)
    try {
      let fileIds: string[] = []
      if (files.length > 0) {
        fileIds = await uploadFile(files)
      }
      const payload: CreateRevisionPayload = {
        revision_no: form.revision_no,
        description: form.description,
        file_ids: fileIds,
      }
      await createRevision.mutateAsync(payload)
      showToast("success", "Revision created")
      setForm({ revision_no: "", description: "" })
      setFiles([])
      setShowForm(false)
    } catch {
      showToast("error", "Failed to create revision")
    } finally {
      setUploading(false)
    }
  }

  const handleUploadFiles = async (revId: string, newFiles: FileList) => {
    const confirmed = await showConfirm("Upload Files?", `Upload ${newFiles.length} file(s)?`)
    if (!confirmed) return
    setUploadingRevId(revId)
    try {
      await uploadFile(Array.from(newFiles))
      showToast("success", "Files uploaded")
    } catch {
      showToast("error", "Upload failed")
    } finally {
      setUploadingRevId(null)
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white font-mono font-bold text-sm uppercase px-6 py-3 border-4 border-black hover:bg-green-700 transition-all"
        >
          {showForm ? "CANCEL" : "+ ADD REVISION"}
        </button>
      </div>

      {showForm && (
        <div className="border-4 border-black bg-white p-6 space-y-4">
          <h3 className="font-mono font-bold text-sm uppercase">New Revision</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-2">Revision No</label>
              <input value={form.revision_no} onChange={(e) => setForm((f) => ({ ...f, revision_no: e.target.value }))} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50" placeholder="e.g. A, B, C" />
            </div>
            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-2">Attach Files</label>
              <label className="flex items-center gap-2 border-4 border-black px-4 py-3 font-mono text-sm bg-white cursor-pointer hover:bg-yellow-50">
                <Upload size={16} />
                Choose Files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
                  }}
                />
              </label>
              {files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 font-mono text-xs">
                      <FileText size={12} />
                      <span className="truncate">{f.name}</span>
                      <button type="button" onClick={() => removeFile(i)} className="text-red-600 hover:text-red-800"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50" placeholder="Revision description..." />
          </div>
          <button onClick={handleCreate} disabled={!form.revision_no || uploading} className="bg-green-600 text-white font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-green-700 disabled:opacity-50 transition-all">
            {uploading ? "SAVING..." : "SAVE REVISION"}
          </button>
        </div>
      )}

      <div className="border-4 border-black bg-white">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="bg-black text-white uppercase text-xs">
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Rev No</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Date</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Description</th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">Created By</th>
              <th className="text-left px-4 py-3">Files</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (<tr><td colSpan={5} className="px-4 py-12 text-center font-bold">LOADING...</td></tr>
            ) : revisions?.length === 0 ? (<tr><td colSpan={5} className="px-4 py-12 text-center font-bold">NO REVISIONS YET</td></tr>
            ) : (revisions?.map((rev, i) => (
              <tr key={rev.id} className={cn("border-b-4 border-black", i % 2 === 0 ? "bg-white" : "bg-gray-100")}>
                <td className="px-4 py-3 font-bold">{rev.revision_no}</td>
                <td className="px-4 py-3">{formatDate(rev.created_at)}</td>
                <td className="px-4 py-3">{rev.description}</td>
                <td className="px-4 py-3">{rev.creator?.name || "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {rev.files && rev.files.length > 0 && rev.files.map((file) => (
                      <a key={file.id} href={`/engineering/api/revisions/files/${file.id}/download`} className="flex items-center gap-1 text-blue-600 underline font-bold text-xs hover:text-blue-800"><FileText size={12} />{file.file_name}</a>
                    ))}
                    <label className="flex items-center gap-1 text-green-600 font-bold text-xs uppercase border-2 border-green-600 px-2 py-1 cursor-pointer hover:bg-green-600 hover:text-white transition-all">
                      <Upload size={12} />
                      {uploadingRevId === rev.id ? "UPLOADING..." : "Upload"}
                      <input type="file" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) { handleUploadFiles(rev.id, e.target.files); e.target.value = "" } }} />
                    </label>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  )
}