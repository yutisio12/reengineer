import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTransmittableDrawings, useTransmit } from "../hooks/use-api"
import { STATUS_LABEL, STATUS_COLOR } from "../lib/constants"
import { cn, formatDate } from "../lib/utils"
import { showConfirm, showToast } from "../lib/swal"
import { Send } from "lucide-react"

export default function TransmitPage() {
  const navigate = useNavigate()
  const { data: drawings, isLoading } = useTransmittableDrawings()
  const transmitMutation = useTransmit()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState("")
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (!drawings) return
    if (selectedIds.size === drawings.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(drawings.map((d) => d.id)))
    }
  }

  const handleTransmit = async () => {
    const confirmed = await showConfirm(
      "Confirm Transmit",
      `Transmit ${selectedIds.size} drawing${selectedIds.size > 1 ? "s" : ""} to Production?`,
    )
    if (!confirmed) return
    try {
      await transmitMutation.mutateAsync({
        drawing_ids: Array.from(selectedIds),
        notes: notes || undefined,
      })
      showToast("success", "Transmitted successfully")
      setSelectedIds(new Set())
      setNotes("")
      setShowConfirmModal(false)
      navigate("/drawings")
    } catch {
      showToast("error", "Transmit failed")
    }
  }

  return (
    <div className="space-y-6">
        <h2 className="macro-title text-[clamp(2rem,6vw,4rem)] text-black">Transmit</h2>

      <div className="border-4 border-black p-6" style={{ background: "#EAE8E3" }}>
        <p className="font-mono text-sm text-gray-500">
          Select Fully Approved drawings to transmit to the Production module.
        </p>
      </div>

      <div className="border-4 border-black overflow-x-auto" style={{ background: "#EAE8E3" }}>
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="text-white uppercase text-xs" style={{ background: "#111" }}>
              <th className="w-12 px-4 py-3 border-r-4 border-white/20">
                <input
                  type="checkbox"
                  checked={
                    drawings &&
                    drawings.length > 0 &&
                    selectedIds.size === drawings.length
                  }
                  onChange={toggleAll}
                  className="w-5 h-5 border-2 border-white"
                />
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20 micro text-[10px] font-bold">
                Company
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20 micro text-[10px] font-bold">
                Project
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20 micro text-[10px] font-bold">
                Document No
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20 micro text-[10px] font-bold">
                Created Date
              </th>
              <th className="text-left px-4 py-3 micro text-[10px] font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center font-bold">
                  [ LOADING... ]
                </td>
              </tr>
            ) : drawings?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center font-bold">
                  [ NO DRAWINGS READY ]
                </td>
              </tr>
            ) : (
              drawings?.map((drawing, i) => (
                <tr
                  key={drawing.id}
                  className="border-b-4 border-black"
                  style={{ background: i % 2 === 0 ? "#EAE8E3" : "#E0DDD8" }}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(drawing.id)}
                      onChange={() => toggleSelect(drawing.id)}
                      className="w-5 h-5 border-4 border-black"
                    />
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {drawing.company?.name || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {drawing.project?.name || "-"}
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {drawing.document_no}
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedIds.size > 0 && (
        <div className="border-4 border-black p-6 space-y-4" style={{ background: "#EAE8E3" }}>
          <div>
            <label className="block micro text-[10px] font-bold mb-2">
              Transmit Notes{" "}
              <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none"
              style={{ background: "#F4F4F0", color: "#111" }}
              placeholder="Optional notes for transmission..."
            />
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center gap-2 font-mono font-bold text-sm uppercase px-8 py-4 border-4 border-black transition-all"
            style={{ background: "#E61919", color: "#fff" }}
          >
            <Send size={18} />
            [ TRANSMIT ] {selectedIds.size} Drawing
            {selectedIds.size > 1 ? "s" : ""}
          </button>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="border-4 border-black p-6 w-full max-w-md" style={{ background: "#F4F4F0" }}>
            <h3 className="font-mono font-bold text-sm uppercase mb-2">
              [ CONFIRM TRANSMIT ]
            </h3>
            <p className="font-mono text-sm mb-4">
              Are you sure you want to transmit {selectedIds.size} drawing
              {selectedIds.size > 1 ? "s" : ""} to Production?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleTransmit}
                disabled={transmitMutation.isPending}
                className="font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black disabled:opacity-50 transition-all"
                style={{ background: "#E61919", color: "#fff" }}
              >
                {transmitMutation.isPending
                  ? ">>> TRANSMITTING..."
                  : ">>> CONFIRM TRANSMIT"}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black transition-all"
                style={{ background: "#111", color: "#fff" }}
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
