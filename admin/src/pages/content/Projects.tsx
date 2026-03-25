import { useState, useEffect } from "react";
import {
  Plus, Search, Box, CheckCircle2, Pencil, Trash2, ArrowLeft,
  ChevronDown, Lock, Filter, ExternalLink, Columns,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { api, type Project, type ProjectItem } from "../../lib/api";
import { cn } from "../../lib/utils";

/* ─── Shared UI ────────────────────────────────────────────────────────────── */
function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    PENDING_REVIEW: "bg-amber-50 text-amber-700 ring-amber-200/70",
    DRAFT: "bg-zinc-100 text-zinc-500 ring-zinc-200",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 shadow-sm", map[status] ?? map.DRAFT)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", status === "PUBLISHED" ? "bg-emerald-500 animate-pulse" : status === "PENDING_REVIEW" ? "bg-amber-500 animate-pulse" : "bg-zinc-400")} />
      {status.replace("_", " ")}
    </span>
  );
}

function Field({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all text-sm font-medium text-zinc-900 placeholder:text-zinc-400";
const selectCls = inputCls + " appearance-none";

const EMPTY_PROJECT: Partial<Project> = { category: "", icon_name: "", description: "", status: "DRAFT" };

type View = "list" | "detail" | "edit";

export default function Projects() {
  const { token, role, user } = useAuth();
  const isAdmin = role === "super_admin";
  const memberId = user?.id;
  const t = token ?? "";

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Project>>(EMPTY_PROJECT);
  const [view, setView] = useState<View>("list");
  const [saving, setSaving] = useState(false);
  
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  
  // For adding new sub-items inside edit mode
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const selectedProj = projects.find((i) => i.id === selectedId) ?? null;

  useEffect(() => {
    if (!t) return;
    api.projects.list(t).then((data) => {
      const filtered = isAdmin ? data.filter((p) => p.status !== "DRAFT") : memberId ? data.filter((p) => p.member_id === memberId) : data;
      setProjects(filtered);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [t, isAdmin, memberId]);

  useEffect(() => {
    const pId = view === "edit" ? editing.id : selectedId;
    if (pId) {
      setItemsLoading(true);
      api.projectItems.list(t, pId).then(setItems).finally(() => setItemsLoading(false));
    } else {
      setItems([]);
    }
  }, [selectedId, editing.id, view, t]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing.id) {
        const u = await api.projects.update(t, editing.id, editing);
        setProjects((p) => p.map((i) => (i.id === u.id ? u : i)));
        setSelectedId(u.id!);
        setView("detail");
      } else {
        const c = await api.projects.create(t, editing);
        setProjects((p) => [c, ...p]);
        setSelectedId(c.id!);
        setView("detail");
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleTogglePublish = async (item: Project) => {
    const u = await api.projects.update(t, item.id!, { status: item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" });
    setProjects((p) => p.map((i) => (i.id === u.id ? u : i)));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this project and all its nested items?")) return;
    await api.projects.delete(t, id);
    setProjects((p) => p.filter((i) => i.id !== id));
    setView("list");
    setSelectedId(null);
  };

  const handleAddItem = async () => {
    if (!editing.id || !newItemTitle || !newItemDesc) return;
    try {
      const displayOrder = items.length > 0 ? Math.max(...items.map((i) => i.display_order)) + 1 : 0;
      const c = await api.projectItems.create(t, { project_id: editing.id, title: newItemTitle, description: newItemDesc, display_order: displayOrder });
      setItems([...items, c]);
      setNewItemTitle("");
      setNewItemDesc("");
    } catch (err) { console.error(err); }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await api.projectItems.delete(t, id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) { console.error(err); }
  };

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.category.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "ALL" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return (
    <div className="flex-1 p-10 space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-3xl bg-zinc-100 animate-pulse" />)}
    </div>
  );

  /* ══════ EDIT VIEW ══════ */
  if (view === "edit")
    return (
      <div className="min-h-screen bg-[#fafaf9]">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl px-6 py-4 shadow-sm">
          <button onClick={() => setView(editing.id ? "detail" : "list")} className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors group">
            <div className="p-2 rounded-xl group-hover:bg-zinc-100 transition-colors"><ArrowLeft size={16} /></div>
            {editing.id ? "Back to Detail" : "Back to List"}
          </button>
          <button onClick={handleSave} disabled={saving || !editing.category} className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 disabled:opacity-40 transition-all active:scale-95">
            <Box size={14} />
            {saving ? "Saving…" : editing.id ? "Update Project" : "Create Project"}
          </button>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{editing.id ? "Edit Project" : "New Project"}</h1>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Define overarching projects and their constituent sub-modules.</p>
          </div>
          <div className="bg-white border border-zinc-200/60 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm">
            <Field label="Category / Name" full>
              <input className={inputCls} value={editing.category ?? ""} onChange={(e) => setEditing((p) => ({ ...p, category: e.target.value }))} placeholder="Global Intelligence Initiatives…" />
            </Field>
            <Field label="System Icon Name">
              <input className={inputCls} value={editing.icon_name ?? ""} onChange={(e) => setEditing((p) => ({ ...p, icon_name: e.target.value }))} placeholder="Box, Brain, Layout…" />
            </Field>
            <Field label="Status">
              <div className="relative">
                <select className={selectCls} value={editing.status ?? "DRAFT"} onChange={(e) => setEditing((p) => ({ ...p, status: e.target.value as Project["status"] }))}>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_REVIEW">Submit for Review</option>
                  {isAdmin && <option value="PUBLISHED">Published</option>}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-zinc-400 pointer-events-none" />
              </div>
            </Field>
            <Field label="Description" full>
              <textarea className={inputCls + " min-h-[100px] resize-none"} value={editing.description ?? ""} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))} placeholder="High-level overview of this ecosystem…" />
            </Field>
          </div>

          {editing.id && (
            <div className="bg-white border border-zinc-200/60 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-4">
                <Columns size={16} className="text-zinc-900" />
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900">Nested Sub-Modules</h3>
                <span className="ml-auto text-xs font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">{items.length}</span>
              </div>

              {!isAdmin && (
                <div className="p-5 bg-zinc-50 border border-zinc-200/60 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Inject New Module</h4>
                  <div className="flex flex-col gap-3">
                    <input className={inputCls} value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)} placeholder="Module Title (e.g. Model Architecture)" />
                    <textarea className={inputCls + " min-h-[80px] resize-none"} value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)} placeholder="Technical details of this component…" />
                    <button onClick={handleAddItem} disabled={!newItemTitle || !newItemDesc} className="ml-auto inline-flex items-center gap-2 px-5 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 disabled:opacity-40 transition-all active:scale-95 text-[10px] uppercase tracking-widest">
                      <Plus size={12} strokeWidth={3} /> Integrate Component
                    </button>
                  </div>
                </div>
              )}

              {itemsLoading ? (
                <div className="h-20 rounded-2xl bg-zinc-50 animate-pulse border border-zinc-100" />
              ) : items.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-zinc-200/60 rounded-2xl">
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">No integrated modules yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((it) => (
                    <div key={it.id} className="group relative p-5 bg-white border border-zinc-200/60 rounded-2xl flex flex-col gap-2 shadow-sm hover:border-zinc-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest leading-tight">{it.title}</h4>
                        {!isAdmin && (
                          <button onClick={() => handleDeleteItem(it.id!)} className="p-1.5 text-zinc-300 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors -mt-1 -mr-1">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">{it.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );

  /* ══════ DETAIL VIEW ══════ */
  if (view === "detail" && selectedProj)
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl px-6 py-4">
          <button onClick={() => setView("list")} className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors group">
            <div className="p-2 rounded-xl group-hover:bg-zinc-100 transition-colors"><ArrowLeft size={16} /></div>
            All Projects
          </button>
          <div className="flex items-center gap-2">
            {!isAdmin && (
              <>
                <button onClick={() => { setEditing(selectedProj); setView("edit"); }} className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-900 text-xs font-bold rounded-xl hover:bg-zinc-200 transition-all active:scale-95">
                  <Pencil size={14} /> Edit Architecture
                </button>
                <button onClick={() => handleDelete(selectedProj.id!)} className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-all active:scale-95">
                  <Trash2 size={14} /> Decommission
                </button>
              </>
            )}
            {isAdmin && selectedProj.status === "PENDING_REVIEW" && (
              <button onClick={() => handleTogglePublish(selectedProj)} className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-600/20">
                <CheckCircle2 size={14} /> Approve & Publish
              </button>
            )}
            {isAdmin && selectedProj.status === "PUBLISHED" && (
              <button onClick={() => handleTogglePublish(selectedProj)} className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-600 text-xs font-bold rounded-xl hover:bg-zinc-50 transition-all active:scale-95">
                <Lock size={14} /> Unpublish
              </button>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
          {/* header area */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-12 border-b border-zinc-100">
            <div className="space-y-4 max-w-2xl">
              <Badge status={selectedProj.status} />
              <h1 className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tighter leading-[1.05]">{selectedProj.category}</h1>
              {selectedProj.description && (
                <p className="text-xl text-zinc-500 font-medium leading-relaxed italic border-l-4 border-zinc-200 pl-6 mt-4">
                  "{selectedProj.description}"
                </p>
              )}
            </div>
            <div className="w-24 h-24 rounded-3xl bg-zinc-900 text-white flex items-center justify-center shadow-2xl shadow-zinc-900/10 shrink-0">
              <Box size={40} strokeWidth={1.5} />
            </div>
          </div>

          {/* items grid */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Columns size={16} className="text-zinc-400" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">Integrated Components ({items.length})</h2>
            </div>
            {itemsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => <div key={i} className="h-32 rounded-3xl bg-zinc-50 animate-pulse border border-zinc-100" />)}
              </div>
            ) : items.length === 0 ? (
              <div className="py-20 text-center bg-zinc-50 border border-zinc-100 rounded-3xl">
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">No sub-modules initialized</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((it, idx) => (
                  <div key={it.id} className="group relative p-6 bg-white border border-zinc-200/60 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col gap-4 overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-zinc-50 rounded-bl-3xl -mr-5 -mt-5 group-hover:bg-zinc-100 transition-colors" />
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center text-[10px] font-black uppercase shadow-inner shrink-0 group-hover:bg-zinc-900 group-hover:text-white transition-colors">{idx + 1}</span>
                      <h3 className="text-sm font-black text-zinc-900 leading-tight pr-4">{it.title}</h3>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed relative z-10">{it.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );

  /* ══════ LIST VIEW ══════ */
  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <div className="sticky top-0 z-30 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl px-6 py-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Box size={14} className="text-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Architectural Frameworks</span>
            </div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Research <span className="text-zinc-400">Projects</span></h1>
            <p className="text-xs text-zinc-500 mt-1 font-medium">{projects.length} {projects.length === 1 ? "project" : "projects"} instantiated</p>
          </div>
          {!isAdmin && (
            <button onClick={() => { setEditing(EMPTY_PROJECT); setView("edit"); }} className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-xs font-bold rounded-2xl hover:bg-zinc-800 hover:shadow-lg transition-all active:scale-95 shrink-0">
              <Plus size={16} strokeWidth={2.5} /> New Project
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-zinc-200/60 bg-white/50 px-6 py-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center max-w-7xl mx-auto">
          <div className="relative flex-1 max-w-md group">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
            <input type="text" placeholder="Search ecosystems…" className="w-full pl-9 pr-4 py-2.5 text-xs bg-zinc-100/60 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 focus:bg-white transition-all placeholder:text-zinc-400 font-medium" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl w-fit">
            {["ALL", "PUBLISHED", "PENDING_REVIEW", "DRAFT"].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)} className={cn("px-3.5 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all whitespace-nowrap", filterStatus === s ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>
                {s === "ALL" ? "All" : s === "PENDING_REVIEW" ? "Pending" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {filtered.length === 0 ? (
          <div className="py-32 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-zinc-100 flex items-center justify-center shadow-inner">
              <Filter size={28} className="text-zinc-300" />
            </div>
            <p className="text-zinc-400 font-bold text-sm">No projects match your filter</p>
            {!isAdmin && (
              <button onClick={() => { setEditing(EMPTY_PROJECT); setView("edit"); }} className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-xs font-bold rounded-2xl hover:bg-zinc-800 transition-all mt-2">
                <Plus size={15} /> Architect first project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((proj) => (
              <article key={proj.id} onClick={() => { setSelectedId(proj.id!); setView("detail"); }} className="group relative bg-white border border-zinc-200/60 rounded-3xl p-6 hover:border-indigo-400/50 hover:shadow-2xl hover:shadow-indigo-900/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-[280px]">
                {/* diagonal decorative splash */}
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl group-hover:bg-indigo-100/80 transition-all" />

                <div className="flex justify-between items-start mb-6 relative">
                  <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                    <Box size={24} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge status={proj.status} />
                  </div>
                </div>

                <div className="flex-1 mt-2 relative">
                  <h2 className="text-xl font-black text-zinc-900 leading-tight mb-2 line-clamp-2 pr-4">{proj.category}</h2>
                  {proj.description && <p className="text-xs text-zinc-500 font-medium leading-relaxed line-clamp-3">{proj.description}</p>}
                </div>

                <div className="pt-4 mt-auto border-t border-zinc-100 flex items-center justify-between relative opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {!isAdmin && (
                      <>
                        <button title="Edit" onClick={() => { setEditing(proj); setView("edit"); }} className="p-2 bg-zinc-100 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors"><Pencil size={13} /></button>
                        <button title="Delete" onClick={() => handleDelete(proj.id!)} className="p-2 bg-zinc-100 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
                      </>
                    )}
                    {isAdmin && proj.status === "PENDING_REVIEW" && (
                      <button title="Approve" onClick={() => handleTogglePublish(proj)} className="p-2 bg-zinc-100 rounded-xl text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"><CheckCircle2 size={13} /></button>
                    )}
                    {isAdmin && proj.status === "PUBLISHED" && (
                      <button title="Unpublish" onClick={() => handleTogglePublish(proj)} className="p-2 bg-zinc-100 rounded-xl text-zinc-500 hover:text-zinc-600 transition-colors"><Lock size={13} /></button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                    Explore <ExternalLink size={10} strokeWidth={3} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
