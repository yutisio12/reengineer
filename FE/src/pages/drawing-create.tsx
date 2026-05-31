import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import {
  useCompanies,
  useProjects,
  useDisciplines,
  useUsers,
  useCreateDrawing,
} from "../hooks/use-api"

export default function DrawingCreatePage() {
  const navigate = useNavigate()
  const { data: companies } = useCompanies()
  const { data: disciplines } = useDisciplines()
  const { data: drafters } = useUsers("drafter")

  const [companyId, setCompanyId] = useState("")
  const { data: projects } = useProjects(companyId)

  const [form, setForm] = useState({
    company_id: "",
    project_id: "",
    discipline_id: "",
    module_name: "",
    document_no: "",
    assigned_drafter: "",
    description: "",
  })

  const createMutation = useCreateDrawing()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync(form)
      navigate("/drawings")
    } catch {
      // error handled by query
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-mono font-bold uppercase mb-6">
          Create Drawing
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-4 border-black bg-white p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-2">
                  Company
                </label>
                <select
                  value={form.company_id}
                  onChange={(e) => {
                    setCompanyId(e.target.value)
                    setForm((f) => ({
                      ...f,
                      company_id: e.target.value,
                      project_id: "",
                    }))
                  }}
                  required
                  className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50"
                >
                  <option value="">Select Company</option>
                  {companies?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-2">
                  Project
                </label>
                <select
                  value={form.project_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, project_id: e.target.value }))
                  }
                  required
                  disabled={!companyId}
                  className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50 disabled:opacity-40"
                >
                  <option value="">Select Project</option>
                  {projects?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-2">
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
                  className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50"
                >
                  <option value="">Select Discipline</option>
                  {disciplines?.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-2">
                  Module Name
                </label>
                <input
                  type="text"
                  value={form.module_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, module_name: e.target.value }))
                  }
                  required
                  className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50"
                  placeholder="e.g. Main Pipeline"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-2">
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
                  className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50"
                  placeholder="e.g. DOC-001"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-2">
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
                  className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50"
                >
                  <option value="">Select Drafter</option>
                  {drafters?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-2">
                Notes / Description
                <span className="text-gray-400 ml-1">(optional)</span>
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
                className="w-full border-4 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:bg-yellow-50"
                placeholder="Optional notes..."
              />
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-green-600 text-white font-mono font-bold text-sm uppercase px-12 py-4 border-4 border-black hover:bg-green-700 disabled:opacity-50 transition-all"
            >
              {createMutation.isPending ? "SAVING..." : "SAVE"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/drawings")}
              className="bg-white text-black font-mono font-bold text-sm uppercase px-12 py-4 border-4 border-black hover:bg-black hover:text-white transition-all"
            >
              CANCEL
            </button>
          </div>

          {createMutation.isError && (
            <div className="border-4 border-red-600 bg-red-100 px-4 py-3 font-mono text-sm font-bold text-red-800">
              Failed to create drawing. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
