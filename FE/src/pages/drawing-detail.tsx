import { useState, useRef } from "react"
import { useParams } from "react-router-dom"
import {
  useDrawing,
  useActivities,
  usePerformAction,
  useRevisions,
  useCreateRevision,
} from "../hooks/use-api"
import { STATUS_LABEL, STATUS_COLOR } from "../lib/constants"
import { cn, formatDate } from "../lib/utils"
import { Undo2, Play, Square, Check, Send, Upload, X, FileText } from "lucide-react"
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

  if (isLoading || !drawing) {
    return (
      <div className="border-4 border-black p-6 mb-6 bg-white font-mono font-bold">
        {isLoading ? "LOADING..." : "NOT FOUND"}
      </div>
    )
  }

  return (
    <div className="border-4 border-black bg-white p-6 mb-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-mono font-bold uppercase">
            {drawing.document_no}
          </h2>
          <p className="font-mono text-sm text-gray-600">
            {drawing.company?.name} / {drawing.project?.name} /{" "}
            {drawing.discipline?.name} / {drawing.module_name}
          </p>
          <p className="font-mono text-xs text-gray-500">
            Created by {drawing.creator?.name || "-"} on{" "}
            {formatDate(drawing.created_at)} &middot; Drafter:{" "}
            {drawing.drafter?.name || "-"}
          </p>
        </div>
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

  const handleAction = (payload: PerformActionPayload) => {
    performAction.mutate(payload)
  }

  const handleReturn = () => {
    if (!showReturnDialog || !returnReason.trim()) return
    handleAction({
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

      <div className="border-4 border-black bg-white">
        <h3 className="bg-black text-white font-mono font-bold text-xs uppercase px-6 py-3 border-b-4 border-black">
          Activity Timeline
        </h3>
        <div className="divide-y-4 divide-black">
          {activities?.length === 0 && (
            <div className="px-6 py-8 font-mono font-bold text-sm text-center">
              NO ACTIVITIES YET
            </div>
          )}
          {activities
            ?.slice()
            .reverse()
            .map((act) => (
              <div
                key={act.id}
                className="px-6 py-4 flex items-center gap-4 font-mono text-sm even:bg-gray-100"
              >
                <span
                  className={cn(
                    "px-3 py-1 border-2 border-black text-xs font-bold uppercase",
                    act.action === "return"
                      ? "bg-red-200 text-red-800"
                      : act.action === "approve"
                        ? "bg-green-600 text-white"
                        : act.action === "start"
                          ? "bg-blue-200 text-blue-800"
                          : act.action === "stop"
                            ? "bg-gray-300"
                            : "bg-green-200 text-green-800",
                  )}
                >
                  {act.action}
                </span>
                <span className="font-bold uppercase text-xs">
                  {act.stage}
                </span>
                <span className="text-gray-500">
                  {act.user?.name || "-"}
                </span>
                {act.return_reason && (
                  <span className="text-red-600 text-xs italic ml-2">
                    &quot;{act.return_reason}&quot;
                  </span>
                )}
                <span className="ml-auto text-gray-400 text-xs">
                  {formatDate(act.action_time)}
                </span>
              </div>
            ))}
        </div>
      </div>

      {showReturnDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="border-4 border-black bg-white p-6 w-full max-w-md">
            <h3 className="font-mono font-bold text-sm uppercase mb-4">
              Return Reason
            </h3>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              rows={3}
              className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50 mb-4"
              placeholder="Reason for return..."
            />
            <div className="flex gap-3">
              <button
                onClick={handleReturn}
                disabled={!returnReason.trim()}
                className="bg-red-600 text-white font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-red-700 disabled:opacity-50 transition-all"
              >
                CONFIRM RETURN
              </button>
              <button
                onClick={() => setShowReturnDialog(null)}
                className="bg-white text-black font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-black hover:text-white transition-all"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
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
        "flex items-center gap-2 font-mono font-bold text-xs uppercase px-5 py-3 border-4 border-black transition-all",
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
  const { data: revisions, isLoading } = useRevisions(drawingId)
  const createRevision = useCreateRevision(drawingId)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateRevisionPayload>({
    revision_no: "",
    description: "",
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadingRevId, setUploadingRevId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCreate = async () => {
    setUploading(true)
    try {
      const rev = await createRevision.mutateAsync(form)
      if (selectedFiles.length > 0 && rev.id) {
        for (const file of selectedFiles) {
          await uploadFile(rev.id, file)
        }
      }
      setForm({ revision_no: "", description: "" })
      setSelectedFiles([])
      setShowForm(false)
    } catch {
      // error
    } finally {
      setUploading(false)
    }
  }

  const handleUploadFiles = async (
    revisionId: string,
    files: FileList,
  ) => {
    if (!files.length) return
    setUploadingRevId(revisionId)
    try {
      for (const file of Array.from(files)) {
        await uploadFile(revisionId, file)
      }
    } catch {
      // error
    } finally {
      setUploadingRevId(null)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  if (isLoading) {
    return (
      <div className="border-4 border-black p-6 bg-white font-mono font-bold">
        LOADING...
      </div>
    )
  }

  return (
    <div className="space-y-4">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-2">
                Revision No
              </label>
              <input
                type="text"
                value={form.revision_no}
                onChange={(e) =>
                  setForm((f) => ({ ...f, revision_no: e.target.value }))
                }
                className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50"
                placeholder="e.g. A, B, 1, 2"
              />
            </div>
            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-2">
                Attach Files
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  setSelectedFiles((prev) => [...prev, ...files])
                  e.target.value = ""
                }}
                className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white file:border-2 file:border-black file:bg-green-600 file:text-white file:font-mono file:font-bold file:text-xs file:uppercase file:px-3 file:py-1 file:mr-3 file:cursor-pointer hover:file:bg-green-700"
              />
              {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-1">
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 font-mono text-xs bg-gray-100 border-2 border-black px-3 py-2">
                      <FileText size={12} />
                      <span className="flex-1 truncate">{file.name}</span>
                      <span className="text-gray-400">({(file.size / 1024).toFixed(0)} KB)</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50"
              placeholder="Revision description..."
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={!form.revision_no || uploading}
            className="bg-green-600 text-white font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-green-700 disabled:opacity-50 transition-all"
          >
            {uploading ? "SAVING..." : "SAVE REVISION"}
          </button>
        </div>
      )}

      <div className="border-4 border-black bg-white">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="bg-black text-white uppercase text-xs">
              <th className="text-left px-4 py-3 border-r-4 border-white/20">
                Rev No
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">
                Date
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">
                Description
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">
                Created By
              </th>
              <th className="text-left px-4 py-3">Files</th>
            </tr>
          </thead>
          <tbody>
            {revisions?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center font-bold">
                  NO REVISIONS YET
                </td>
              </tr>
            )}
            {revisions?.map((rev, i) => (
              <tr
                key={rev.id}
                className={cn(
                  "border-b-4 border-black",
                  i % 2 === 0 ? "bg-white" : "bg-gray-100",
                )}
              >
                <td className="px-4 py-3 font-bold">{rev.revision_no}</td>
                <td className="px-4 py-3">
                  {formatDate(rev.created_at)}
                </td>
                <td className="px-4 py-3">{rev.description}</td>
                <td className="px-4 py-3">{rev.creator?.name || "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {rev.files && rev.files.length > 0 && rev.files.map((file) => (
                      <a
                        key={file.id}
                        href={`/engineering/api/revisions/files/${file.id}/download`}
                        className="flex items-center gap-1 text-blue-600 underline font-bold text-xs hover:text-blue-800"
                      >
                        <FileText size={12} />
                        {file.file_name}
                      </a>
                    ))}
                    <label className="flex items-center gap-1 text-green-600 font-bold text-xs uppercase border-2 border-green-600 px-2 py-1 cursor-pointer hover:bg-green-600 hover:text-white transition-all">
                      <Upload size={12} />
                      {uploadingRevId === rev.id ? "UPLOADING..." : "Upload"}
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.length) {
                            handleUploadFiles(rev.id, e.target.files)
                            e.target.value = ""
                          }
                        }}
                      />
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
