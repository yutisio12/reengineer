import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTransmittableDrawings, useTransmit } from "../hooks/use-api"
import { STATUS_LABEL, STATUS_COLOR } from "../lib/constants"
import { cn, formatDate } from "../lib/utils"
import { Send } from "lucide-react"

export default function TransmitPage() {
  const navigate = useNavigate()
  const { data: drawings, isLoading } = useTransmittableDrawings()
  const transmitMutation = useTransmit()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)

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
    try {
      await transmitMutation.mutateAsync({
        drawing_ids: Array.from(selectedIds),
        notes: notes || undefined,
      })
      setSelectedIds(new Set())
      setNotes("")
      setShowConfirm(false)
      navigate("/drawings")
    } catch {
      // error handled
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-mono font-bold uppercase">Transmit</h2>

      <div className="border-4 border-black bg-white p-6">
        <p className="font-mono text-sm text-gray-600">
          Select Fully Approved drawings to transmit to the Production module.
        </p>
      </div>

      <div className="border-4 border-black overflow-x-auto bg-white">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="bg-black text-white uppercase text-xs">
              <th className="w-12 px-4 py-3 border-r-4 border-white/20">
                <input
                  type="checkbox"
                  checked={
                    drawings &&
                    drawings.length > 0 &&
                    selectedIds.size === drawings.length
                  }
                  onChange={toggleAll}
                  className="w-5 h-5 border-2 border-white bg-transparent"
                />
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">
                Company
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">
                Project
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">
                Document No
              </th>
              <th className="text-left px-4 py-3 border-r-4 border-white/20">
                Created Date
              </th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center font-bold">
                  LOADING...
                </td>
              </tr>
            ) : drawings?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center font-bold">
                  NO DRAWINGS READY FOR TRANSMIT
                </td>
              </tr>
            ) : (
              drawings?.map((drawing, i) => (
                <tr
                  key={drawing.id}
                  className={cn(
                    "border-b-4 border-black transition-all hover:bg-yellow-50",
                    i % 2 === 0 ? "bg-white" : "bg-gray-100",
                  )}
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
        <div className="border-4 border-black bg-white p-6 space-y-4">
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">
              Transmit Notes{" "}
              <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50"
              placeholder="Optional notes for transmission..."
            />
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 bg-green-600 text-white font-mono font-bold text-sm uppercase px-8 py-4 border-4 border-black hover:bg-green-700 transition-all"
          >
            <Send size={18} />
            Transmit {selectedIds.size} Drawing
            {selectedIds.size > 1 ? "s" : ""}
          </button>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="border-4 border-black bg-white p-6 w-full max-w-md">
            <h3 className="font-mono font-bold text-sm uppercase mb-2">
              Confirm Transmit
            </h3>
            <p className="font-mono text-sm mb-4">
              Are you sure you want to transmit {selectedIds.size} drawing
              {selectedIds.size > 1 ? "s" : ""} to Production?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleTransmit}
                disabled={transmitMutation.isPending}
                className="bg-green-600 text-white font-mono font-bold text-xs uppercase px-6 py-3 border-4 border-black hover:bg-green-700 disabled:opacity-50 transition-all"
              >
                {transmitMutation.isPending
                  ? "TRANSMITTING..."
                  : "CONFIRM TRANSMIT"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
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
