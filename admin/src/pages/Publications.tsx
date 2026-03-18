import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Star, Sparkles, X, ChevronDown } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { api, type Publication } from "../lib/api";

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`status-pill ${status === "published" ? "status-published" : "status-draft"}`}>
      {status === "published" ? "Published" : "Draft"}
    </span>
  );
}

const EMPTY: Partial<Publication> = {
  title: "",
  authors: [],
  abstract: "",
  doi: "",
  year: new Date().getFullYear(),
  tags: [],
  venue: "",
  status: "draft",
};

export default function Publications() {
  const { token } = useAuth();
  const t = token ?? "";
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Publication> | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    api.publications.list(t).then((data) => { setItems(data); setLoading(false); });
  }, [t]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        const updated = await api.publications.update(t, editing.id, editing);
        setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await api.publications.create(t, editing);
        setItems((prev) => [created, ...prev]);
      }
      setEditing(null);
      setAiSummary("");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (pub: Publication) => {
    const updated = await api.publications.update(t, pub.id, {
      status: pub.status === "published" ? "draft" : "published",
    });
    setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await api.publications.delete(t, id);
    setItems((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  };

  const handleAISummarize = async () => {
    if (!editing?.abstract) return;
    setAiLoading(true);
    const { summary } = await api.publications.summarize(t, editing.abstract);
    setAiSummary(summary);
    setAiLoading(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Publications</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage research publications</p>
        </div>
        <button
          onClick={() => { setEditing(EMPTY); setAiSummary(""); }}
          className="flex items-center gap-2 bg-black text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-zinc-800 transition-colors"
        >
          <Plus size={15} /> New Publication
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3].map((i) => <div key={i} className="skeleton h-12 w-full" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-sm">No publications yet. Create one above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-5 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider hidden md:table-cell">Venue</th>
                <th className="text-left px-5 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider hidden lg:table-cell">Year</th>
                <th className="text-left px-5 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {items.map((pub) => (
                <tr key={pub.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-900 line-clamp-1">{pub.title}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{pub.authors.join(", ")}</p>
                  </td>
                  <td className="px-5 py-4 text-zinc-500 hidden md:table-cell">{pub.venue ?? "—"}</td>
                  <td className="px-5 py-4 text-zinc-500 hidden lg:table-cell">{pub.year}</td>
                  <td className="px-5 py-4"><StatusPill status={pub.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleTogglePublish(pub)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                        title={pub.status === "published" ? "Unpublish" : "Publish"}
                      >
                        <Star size={14} fill={pub.status === "published" ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => { setEditing(pub); setAiSummary(""); }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(pub.id)}
                        disabled={deletingId === pub.id}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Drawer */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative ml-auto w-full max-w-xl bg-white h-full shadow-xl flex flex-col animate-slide-in" style={{ animationName: "slideInRight" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="font-semibold text-zinc-900">{editing.id ? "Edit Publication" : "New Publication"}</h2>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <Field label="Title">
                <input
                  className="field-input"
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Publication title"
                />
              </Field>
              <Field label="Authors (comma-separated)">
                <input
                  className="field-input"
                  value={(editing.authors ?? []).join(", ")}
                  onChange={(e) => setEditing((p) => ({ ...p, authors: e.target.value.split(",").map((a) => a.trim()) }))}
                  placeholder="Dr. A. Silva, Dr. R. Perera"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Year">
                  <input type="number" className="field-input" value={editing.year ?? ""} onChange={(e) => setEditing((p) => ({ ...p, year: +e.target.value }))} />
                </Field>
                <Field label="Venue">
                  <input className="field-input" value={editing.venue ?? ""} onChange={(e) => setEditing((p) => ({ ...p, venue: e.target.value }))} placeholder="NeurIPS 2025" />
                </Field>
              </div>
              <Field label="DOI">
                <input className="field-input" value={editing.doi ?? ""} onChange={(e) => setEditing((p) => ({ ...p, doi: e.target.value }))} placeholder="10.1145/…" />
              </Field>
              <Field label="Tags (comma-separated)">
                <input className="field-input" value={(editing.tags ?? []).join(", ")} onChange={(e) => setEditing((p) => ({ ...p, tags: e.target.value.split(",").map((t) => t.trim()) }))} placeholder="SNN, Neuromorphic" />
              </Field>
              <Field label="Abstract">
                <textarea
                  className="field-input min-h-[100px] resize-y"
                  value={editing.abstract ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, abstract: e.target.value }))}
                  placeholder="Paste or type the abstract…"
                />
                <button
                  onClick={handleAISummarize}
                  disabled={aiLoading || !editing.abstract}
                  className="mt-2 flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-40 transition-colors"
                >
                  <Sparkles size={12} />
                  {aiLoading ? "Generating…" : "AI Summarize"}
                </button>
                {aiSummary && (
                  <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-600">
                    <p className="font-medium text-zinc-700 mb-1">AI Summary</p>
                    {aiSummary}
                  </div>
                )}
              </Field>
              <Field label="PDF URL">
                <input className="field-input" value={editing.pdf_url ?? ""} onChange={(e) => setEditing((p) => ({ ...p, pdf_url: e.target.value }))} placeholder="https://…" />
              </Field>
              <Field label="Status">
                <div className="relative">
                  <select
                    className="field-input appearance-none pr-8"
                    value={editing.status ?? "draft"}
                    onChange={(e) => setEditing((p) => ({ ...p, status: e.target.value as "draft" | "published" }))}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </Field>
            </div>

            <div className="px-6 py-4 border-t border-zinc-100 flex gap-2 justify-end">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-zinc-600 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-colors">
                {saving ? "Saving…" : editing.id ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
