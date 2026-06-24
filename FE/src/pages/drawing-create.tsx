import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import {
  useCompanies,
  useProjects,
  useModules,
  useDrawingTypes,
  useDisciplines,
  useUsers,
  useCreateDrawing,
} from "../hooks/use-api"
import { showConfirm, showToast } from "../lib/swal"

export default function DrawingCreatePage() {
  const navigate = useNavigate()
  const { data: companies } = useCompanies()
  const { data: drawingTypes } = useDrawingTypes()
  const { data: disciplines } = useDisciplines()
  const { data: drafters } = useUsers("drafter")

  const [companyId, setCompanyId] = useState("")
  const { data: projects } = useProjects(companyId)
  const [projectId, setProjectId] = useState("")
  const { data: modules } = useModules(projectId)

  const [form, setForm] = useState({
    company_id: "",
    project_id: "",
    discipline_id: "",
    drawing_type_id: "",
    module_id: "",
    document_no: "",
    assigned_drafter: "",
    description: "",
  })

  const createMutation = useCreateDrawing()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const confirmed = await showConfirm("Save Drawing?", "Create a new drawing?")
    if (!confirmed) return
    try {
      await createMutation.mutateAsync(form)
      showToast("success", "Drawing created")
      navigate("/drawings")
    } catch {
      showToast("error", "Failed to create drawing")
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-mono font-bold uppercase mb-6">
          Create Drawing
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-4 border-black p-8 space-y-6" style={{ background: "#EAE8E3" }}>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block micro text-[10px] font-bold mb-2">
                  Company
                </label>
                <select
                  value={form.company_id}
                  onChange={(e) => {
                    setCompanyId(e.target.value)
                    setProjectId("")
                    setForm((f) => ({
                      ...f,
                      company_id: e.target.value,
                      project_id: "",
                      module_id: "",
                    }))
                  }}
                  required
                  className="w-full border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none"
                  style={{ background: "#F4F4F0", color: "#111" }}
                >
                  <option value="">[ SELECT COMPANY ]</option>
                  {companies?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block micro text-[10px] font-bold mb-2">
                  Project
                </label>
                <select
                  value={form.project_id}
                  onChange={(e) => {
                    setProjectId(e.target.value)
                    setForm((f) => ({ ...f, project_id: e.target.value, module_id: "" }))
                  }}
                  required
                  disabled={!companyId}
                  className="w-full border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none disabled:opacity-40"
                  style={{ background: "#F4F4F0", color: "#111" }}
                >
                  <option value="">[ SELECT PROJECT ]</option>
                  {projects?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block micro text-[10px] font-bold mb-2">
                  Module
                </label>
                <select
                  value={form.module_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, module_id: e.target.value }))
                  }
                  required
                  disabled={!form.project_id}
                  className="w-full border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none disabled:opacity-40"
                  style={{ background: "#F4F4F0", color: "#111" }}
                >
                  <option value="">[ SELECT MODULE ]</option>
                  {modules?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block micro text-[10px] font-bold mb-2">
                  Discipline
                </label>
                <select
                  value={form.discipline_id}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      discipline_id: e.target.value,
                    }))
                  }
                  required
                  className="w-full border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none"
                  style={{ background: "#F4F4F0", color: "#111" }}
                >
                  <option value="">[ SELECT DISCIPLINE ]</option>
                  {disciplines?.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block micro text-[10px] font-bold mb-2">
                  Drawing Type
                </label>
                <select
                  value={form.drawing_type_id}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      drawing_type_id: e.target.value,
                    }))
                  }
                  required
                  className="w-full border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none"
                  style={{ background: "#F4F4F0", color: "#111" }}
                >
                  <option value="">[ SELECT TYPE ]</option>
                  {drawingTypes?.map((dt) => (
                    <option key={dt.id} value={dt.id}>
                      {dt.code} — {dt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block micro text-[10px] font-bold mb-2">
                  Document No
                </label>
                <input
                  type="text"
                  value={form.document_no}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      document_no: e.target.value,
                    }))
                  }
                  required
                  className="w-full border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none"
                  style={{ background: "#F4F4F0", color: "#111" }}
                  placeholder="e.g. DOC-001"
                />
              </div>

              <div>
                <label className="block micro text-[10px] font-bold mb-2">
                  Assign Drafter
                </label>
                <select
                  value={form.assigned_drafter}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      assigned_drafter: e.target.value,
                    }))
                  }
                  required
                  className="w-full border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none"
                  style={{ background: "#F4F4F0", color: "#111" }}
                >
                  <option value="">[ SELECT DRAFTER ]</option>
                  {drafters?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block micro text-[10px] font-bold mb-2">
                Notes / Description
                <span className="text-gray-500 ml-1">(optional)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full border-4 border-black px-4 py-3 font-mono text-sm focus:outline-none"
                style={{ background: "#F4F4F0", color: "#111" }}
                placeholder="Optional notes..."
              />
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="font-mono font-bold text-sm uppercase px-12 py-4 border-4 border-black disabled:opacity-50 transition-all"
              style={{ background: "#E61919", color: "#fff" }}
            >
              {createMutation.isPending ? ">>> SAVING..." : ">>> SAVE"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/drawings")}
              className="font-mono font-bold text-sm uppercase px-12 py-4 border-4 border-black transition-all"
              style={{ background: "#111", color: "#fff" }}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}