import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Star, Sparkles, X, ChevronDown } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { api, type ResearchArticle } from "../lib/api";

const RESEARCH_AREAS = ["Large Language Models", "Neuromorphic Computing", "Spiking Neural Networks", "AI Security", "Neuroscience and Health"];

function StatusPill({ status }: { status: string }) {
  return <span className={`status-pill ${status === "published" ? "status-published" : "status-draft"}`}>{status === "published" ? "Published" : "Draft"}</span>;
}

const EMPTY: Partial<ResearchArticle> = { title: "", authors: [], abstract: "", content: "", pdf_url: "", tags: [], research_area: RESEARCH_AREAS[0], status: "draft" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-zinc-600 mb-1.5">{label}</label>{children}</div>;
}

export default function Research() {
  const { token } = useAuth();
  const t = token ?? "";
  const [items, setItems] = useState<ResearchArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<ResearchArticle> | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { api.research.list(t).then((d) => { setItems(d); setLoading(false); }); }, [t]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        const u = await api.research.update(t, editing.id, editing);
        setItems((p) => p.map((i) => (i.id === u.id ? u : i)));
      } else {
        const c = await api.research.create(t, editing);
        setItems((p) => [c, ...p]);
      }
      setEditing(null);
    } finally { setSaving(false); }
  };

  const handleTogglePublish = async (item: ResearchArticle) => {
    const u = await api.research.update(t, item.id, { status: item.status === "published" ? "draft" : "published" });
    setItems((p) => p.map((i) => (i.id === u.id ? u : i)));
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await api.research.delete(t, id);
    setItems((p) => p.filter((i) => i.id !== id));
    setDeletingId(null);
  };

  const handleClassify = async () => {
    if (!editing?.abstract) return;
    setAiLoading(true);
    const { area } = await api.research.classify(t, editing.abstract);
    setEditing((p) => ({ ...p, research_area: area }));
    setAiLoading(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Research Articles</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage deep-dive research content</p>
        </div>
        <button onClick={() => setEditing(EMPTY)} className="flex items-center gap-2 bg-black text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-zinc-800 transition-colors">
          <Plus size={15} /> New Article
        </button>
      </div>

      <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-12 w-full" />)}</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-sm">No research articles yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-5 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider hidden md:table-cell">Area</th>
                <th className="text-left px-5 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-900 line-clamp-1">{item.title}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{item.authors.join(", ")}</p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600">{item.research_area}</span>
                  </td>
                  <td className="px-5 py-4"><StatusPill status={item.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleTogglePublish(item)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors">
                        <Star size={14} fill={item.status === "published" ? "currentColor" : "none"} />
                      </button>
                      <button onClick={() => setEditing(item)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative ml-auto w-full max-w-xl bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="font-semibold text-zinc-900">{editing.id ? "Edit Article" : "New Research Article"}</h2>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <Field label="Title"><input className="field-input" value={editing.title ?? ""} onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))} placeholder="Article title" /></Field>
              <Field label="Authors (comma-separated)"><input className="field-input" value={(editing.authors ?? []).join(", ")} onChange={(e) => setEditing((p) => ({ ...p, authors: e.target.value.split(",").map((a) => a.trim()) }))} /></Field>
              <Field label="Research Area">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select className="field-input appearance-none pr-8 w-full" value={editing.research_area ?? ""} onChange={(e) => setEditing((p) => ({ ...p, research_area: e.target.value }))}>
                      {RESEARCH_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  </div>
                  <button onClick={handleClassify} disabled={aiLoading || !editing.abstract} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-40 transition-colors whitespace-nowrap">
                    <Sparkles size={12} />{aiLoading ? "…" : "AI Classify"}
                  </button>
                </div>
              </Field>
              <Field label="Abstract">
                <textarea className="field-input min-h-[90px] resize-y" value={editing.abstract ?? ""} onChange={(e) => setEditing((p) => ({ ...p, abstract: e.target.value }))} placeholder="Research abstract…" />
              </Field>
              <Field label="Content (Markdown)">
                <textarea className="field-input font-mono text-xs min-h-[160px] resize-y" value={editing.content ?? ""} onChange={(e) => setEditing((p) => ({ ...p, content: e.target.value }))} placeholder="## Introduction&#10;&#10;Write in Markdown…" />
              </Field>
              <Field label="PDF URL"><input className="field-input" value={editing.pdf_url ?? ""} onChange={(e) => setEditing((p) => ({ ...p, pdf_url: e.target.value }))} placeholder="https://…" /></Field>
              <Field label="Tags (comma-separated)"><input className="field-input" value={(editing.tags ?? []).join(", ")} onChange={(e) => setEditing((p) => ({ ...p, tags: e.target.value.split(",").map((x) => x.trim()) }))} /></Field>
              <Field label="Status">
                <div className="relative">
                  <select className="field-input appearance-none pr-8" value={editing.status ?? "draft"} onChange={(e) => setEditing((p) => ({ ...p, status: e.target.value as "draft" | "published" }))}>
                    <option value="draft">Draft</option><option value="published">Published</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </Field>
            </div>
            <div className="px-6 py-4 border-t border-zinc-100 flex gap-2 justify-end">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-zinc-600 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-colors">{saving ? "Saving…" : editing.id ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
