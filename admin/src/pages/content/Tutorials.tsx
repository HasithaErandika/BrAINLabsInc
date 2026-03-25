import { useState, useEffect } from "react";
import {
  Plus, Search, BookOpen, Layers, CheckCircle2, Pencil, Trash2, ArrowLeft,
  ChevronDown, Lock, Filter, FileText, Layout,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { api, type TutorialSeries, type TutorialPage } from "../../lib/api";
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

const EMPTY_SERIES: Partial<TutorialSeries> = { title: "", slug: "", description: "", status: "DRAFT" };

type View = "list" | "detail" | "edit" | "edit_page";

export default function Tutorials() {
  const { token, role, user } = useAuth();
  const isAdmin = role === "super_admin";
  const memberId = user?.id;
  const t = token ?? "";

  const [seriesList, setSeriesList] = useState<TutorialSeries[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [editingSeries, setEditingSeries] = useState<Partial<TutorialSeries>>(EMPTY_SERIES);
  const [view, setView] = useState<View>("list");
  const [saving, setSaving] = useState(false);

  const [pages, setPages] = useState<TutorialPage[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [editingPage, setEditingPage] = useState<Partial<TutorialPage> | null>(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const selSeries = seriesList.find((i) => i.id === selectedSeriesId) ?? null;
  const selPage = pages.find((p) => p.id === selectedPageId) ?? null;

  useEffect(() => {
    if (!t) return;
    api.tutorialSeries.list(t).then((data) => {
      const filtered = isAdmin ? data.filter((s) => s.status !== "DRAFT") : memberId ? data.filter((s) => s.member_id === memberId) : data;
      setSeriesList(filtered);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [t, isAdmin, memberId]);

  useEffect(() => {
    const sId = (view === "detail" || view === "edit_page") ? selectedSeriesId : view === "edit" ? editingSeries.id : null;
    if (sId) {
      setPagesLoading(true);
      api.tutorialPages.list(t, sId).then(setPages).finally(() => setPagesLoading(false));
    } else {
      setPages([]);
    }
  }, [selectedSeriesId, editingSeries.id, view, t]);

  const handleSaveSeries = async () => {
    setSaving(true);
    try {
      if (editingSeries.id) {
        const u = await api.tutorialSeries.update(t, editingSeries.id, editingSeries);
        setSeriesList((s) => s.map((i) => (i.id === u.id ? u : i)));
        setSelectedSeriesId(u.id!);
        setView("detail");
      } else {
        const c = await api.tutorialSeries.create(t, editingSeries);
        setSeriesList((s) => [c, ...s]);
        setSelectedSeriesId(c.id!);
        setView("detail");
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleTogglePublish = async (s: TutorialSeries) => {
    const u = await api.tutorialSeries.update(t, s.id!, { status: s.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" });
    setSeriesList((prev) => prev.map((i) => (i.id === u.id ? u : i)));
  };

  const handleDeleteSeries = async (id: string) => {
    if (!window.confirm("Delete this tutorial series and all its pages?")) return;
    await api.tutorialSeries.delete(t, id);
    setSeriesList((s) => s.filter((i) => i.id !== id));
    setView("list");
    setSelectedSeriesId(null);
  };

  const handleSavePage = async () => {
    if (!editingPage || !selSeries) return;
    setSaving(true);
    try {
      if (editingPage.id) {
        const u = await api.tutorialPages.update(t, editingPage.id, editingPage);
        setPages((p) => p.map((i) => (i.id === u.id ? u : i)));
        setSelectedPageId(u.id!);
        setView("detail");
      } else {
        const displayOrder = pages.length > 0 ? Math.max(...pages.map((i) => i.display_order)) + 1 : 0;
        const c = await api.tutorialPages.create(t, { ...editingPage, series_id: selSeries.id!, display_order: displayOrder });
        setPages([...pages, c]);
        setSelectedPageId(c.id!);
        setView("detail");
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDeletePage = async (id: string) => {
    if (!window.confirm("Delete this page?")) return;
    await api.tutorialPages.delete(t, id);
    setPages((p) => p.filter((i) => i.id !== id));
    if (selectedPageId === id) setSelectedPageId(null);
  };

  const filtered = seriesList.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.title.toLowerCase().includes(q) || (s.description ?? "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "ALL" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return (
    <div className="flex-1 p-10 space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-3xl bg-zinc-100 animate-pulse" />)}
    </div>
  );

  /* ══════ EDIT SERIES VIEW ══════ */
  if (view === "edit")
    return (
      <div className="min-h-screen bg-[#fafaf9]">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl px-6 py-4 shadow-sm">
          <button onClick={() => setView(editingSeries.id ? "detail" : "list")} className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors group">
            <div className="p-2 rounded-xl group-hover:bg-zinc-100 transition-colors"><ArrowLeft size={16} /></div>
            {editingSeries.id ? "Back to Detail" : "Back to List"}
          </button>
          <button onClick={handleSaveSeries} disabled={saving || !editingSeries.title} className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 disabled:opacity-40 transition-all active:scale-95">
            <BookOpen size={14} />
            {saving ? "Saving…" : editingSeries.id ? "Update Series" : "Create Series"}
          </button>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{editingSeries.id ? "Edit Tutorial Series" : "New Tutorial Series"}</h1>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Create a structured collection of learning materials.</p>
          </div>
          <div className="bg-white border border-zinc-200/60 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm">
            <Field label="Series Title" full>
              <input className={inputCls} value={editingSeries.title ?? ""} onChange={(e) => setEditingSeries((p) => ({ ...p, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") }))} placeholder="Neural Architectures 101…" />
            </Field>
            <Field label="URL Slug">
              <input className={inputCls + " font-mono text-xs"} value={editingSeries.slug ?? ""} onChange={(e) => setEditingSeries((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") }))} placeholder="neural-architectures-101" />
            </Field>
            <Field label="Status">
              <div className="relative">
                <select className={selectCls} value={editingSeries.status ?? "DRAFT"} onChange={(e) => setEditingSeries((p) => ({ ...p, status: e.target.value as TutorialSeries["status"] }))}>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_REVIEW">Submit for Review</option>
                  {isAdmin && <option value="PUBLISHED">Published</option>}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-zinc-400 pointer-events-none" />
              </div>
            </Field>
            <Field label="Description" full>
              <textarea className={inputCls + " min-h-[120px] resize-none"} value={editingSeries.description ?? ""} onChange={(e) => setEditingSeries((p) => ({ ...p, description: e.target.value }))} placeholder="Core objectives for this learning path…" />
            </Field>
          </div>
        </div>
      </div>
    );

  /* ══════ EDIT PAGE VIEW ══════ */
  if (view === "edit_page" && selSeries)
    return (
      <div className="min-h-screen bg-[#fafaf9] flex flex-col h-screen">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl px-6 py-4 shadow-sm shrink-0">
          <button onClick={() => setView("detail")} className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors group">
            <div className="p-2 rounded-xl group-hover:bg-zinc-100 transition-colors"><ArrowLeft size={16} /></div>
            Back to Series
          </button>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Editing Page in</p>
                <p className="text-xs font-bold text-zinc-900">{selSeries.title}</p>
             </div>
            <button onClick={handleSavePage} disabled={saving || !editingPage?.title} className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 disabled:opacity-40 transition-all active:scale-95 shadow-lg shadow-zinc-900/10">
              <FileText size={14} />
              {saving ? "Saving…" : editingPage?.id ? "Update Page" : "Create Page"}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-10 max-w-5xl mx-auto w-full space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-zinc-200/60 rounded-3xl p-8 shadow-sm">
             <Field label="Page Title">
                <input className={inputCls} value={editingPage?.title ?? ""} onChange={e => setEditingPage(p => ({ ...p, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") }))} placeholder="Module 1: Introduction" />
             </Field>
             <Field label="URL Slug">
                <input className={inputCls + " font-mono text-xs"} value={editingPage?.slug ?? ""} onChange={e => setEditingPage(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") }))} placeholder="mod-1-intro" />
             </Field>
             <Field label="Markdown Content" full>
                <textarea className="w-full min-h-[500px] p-6 bg-zinc-900 text-zinc-100 font-mono text-sm rounded-2xl resize-y focus:outline-none focus:ring-4 focus:ring-zinc-900/20 shadow-inner" value={editingPage?.content ?? ""} onChange={e => setEditingPage(p => ({ ...p, content: e.target.value }))} placeholder="# Write your tutorial content here in Markdown..." />
             </Field>
           </div>
        </div>
      </div>
    );

  /* ══════ DETAIL VIEW ══════ */
  if (view === "detail" && selSeries)
    return (
      <div className="min-h-screen flex flex-col bg-white h-screen">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl px-6 py-4 shrink-0">
          <button onClick={() => setView("list")} className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors group">
            <div className="p-2 rounded-xl group-hover:bg-zinc-100 transition-colors"><ArrowLeft size={16} /></div>
            All Series
          </button>
          <div className="flex items-center gap-2">
            {!isAdmin && (
              <>
                <button onClick={() => { setEditingSeries(selSeries); setView("edit"); }} className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-900 text-xs font-bold rounded-xl hover:bg-zinc-200 transition-all active:scale-95">
                  <Pencil size={14} /> Edit Series Info
                </button>
                <button onClick={() => handleDeleteSeries(selSeries.id!)} className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-all active:scale-95">
                  <Trash2 size={14} /> Delete Series
                </button>
              </>
            )}
            {isAdmin && selSeries.status === "PENDING_REVIEW" && (
              <button onClick={() => handleTogglePublish(selSeries)} className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-600/20">
                <CheckCircle2 size={14} /> Approve & Publish
              </button>
            )}
            {isAdmin && selSeries.status === "PUBLISHED" && (
              <button onClick={() => handleTogglePublish(selSeries)} className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-600 text-xs font-bold rounded-xl hover:bg-zinc-50 transition-all active:scale-95">
                <Lock size={14} /> Unpublish
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar */}
          <div className="w-80 border-r border-zinc-200/60 bg-zinc-50/50 flex flex-col shrink-0 h-full">
            <div className="p-6 border-b border-zinc-200/60 space-y-3 shrink-0">
              <Badge status={selSeries.status} />
              <h2 className="text-xl font-black text-zinc-900 tracking-tight leading-tight">{selSeries.title}</h2>
            </div>
            <div className="p-4 border-b border-zinc-200/60 flex items-center justify-between shrink-0 bg-zinc-100/50">
               <div className="flex items-center gap-2">
                  <Layers size={14} className="text-zinc-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Pages Index</span>
               </div>
               {!isAdmin && (
                 <button onClick={() => { setEditingPage({ title: '', slug: '', content: '' }); setView("edit_page"); }} className="p-1.5 bg-zinc-900 text-white rounded-lg hover:scale-105 transition-transform"><Plus size={12} /></button>
               )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {pagesLoading ? (
                [1,2,3].map(i => <div key={i} className="h-10 rounded-xl bg-zinc-100 animate-pulse border border-zinc-200/60" />)
              ) : pages.length === 0 ? (
                 <div className="py-10 text-center text-zinc-400 border-2 border-dashed border-zinc-200/60 rounded-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest">No pages mapped</p>
                 </div>
              ) : (
                pages.map(p => (
                  <div key={p.id} onClick={() => setSelectedPageId(p.id!)} className={cn("group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border", selectedPageId === p.id ? "bg-zinc-900 border-zinc-900 shadow-md transform scale-[1.02]" : "bg-white border-transparent hover:border-zinc-200 shadow-sm")}>
                     <div className={cn("w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black shrink-0", selectedPageId === p.id ? "bg-white/10 text-white" : "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-colors")}>
                        {p.display_order + 1}
                     </div>
                     <span className={cn("text-xs font-bold truncate flex-1", selectedPageId === p.id ? "text-white" : "text-zinc-700")}>{p.title}</span>
                     {!isAdmin && (
                       <button onClick={(e) => { e.stopPropagation(); handleDeletePage(p.id!); }} className={cn("opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-colors", selectedPageId === p.id ? "hover:bg-red-500/20 hover:text-red-300 text-zinc-500" : "hover:bg-red-50 hover:text-red-500 text-zinc-300")}>
                          <Trash2 size={12} />
                       </button>
                     )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Editor/Viewer Pane */}
          <div className="flex-1 flex flex-col h-full bg-white relative">
             {selPage ? (
                <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-10 py-12">
                   <div className="flex items-start justify-between mb-8 pb-8 border-b border-zinc-100">
                      <div className="space-y-2">
                         <h3 className="text-4xl font-black text-zinc-900 tracking-tight leading-tight">{selPage.title}</h3>
                         <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md">/ {selSeries.slug} / {selPage.slug}</span>
                         </div>
                      </div>
                      {!isAdmin && (
                         <button onClick={() => { setEditingPage(selPage); setView("edit_page"); }} className="p-3 bg-zinc-100 rounded-xl hover:bg-zinc-900 hover:text-white text-zinc-600 transition-colors shadow-sm">
                            <Pencil size={18} />
                         </button>
                      )}
                   </div>
                   <div className="prose prose-zinc max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-indigo-600">
                      {/* Note: in a real app, this would be a Markdown renderer */}
                      <div className="font-serif text-lg leading-relaxed text-zinc-700 whitespace-pre-wrap">{selPage.content}</div>
                   </div>
                </div>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-4 opacity-50">
                   <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-200">
                      <Layout size={32} className="text-zinc-300" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">Select a page from the index</p>
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
              <BookOpen size={14} className="text-pink-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Educational Resources</span>
            </div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Tutorial <span className="text-zinc-400">Series</span></h1>
            <p className="text-xs text-zinc-500 mt-1 font-medium">{seriesList.length} {seriesList.length === 1 ? "series" : "series"} published</p>
          </div>
          {!isAdmin && (
            <button onClick={() => { setEditingSeries(EMPTY_SERIES); setView("edit"); }} className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-xs font-bold rounded-2xl hover:bg-zinc-800 hover:shadow-lg transition-all active:scale-95 shrink-0">
              <Plus size={16} strokeWidth={2.5} /> Create Series
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-zinc-200/60 bg-white/50 px-6 py-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center max-w-7xl mx-auto">
          <div className="relative flex-1 max-w-md group">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
            <input type="text" placeholder="Search series…" className="w-full pl-9 pr-4 py-2.5 text-xs bg-zinc-100/60 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 focus:bg-white transition-all placeholder:text-zinc-400 font-medium" value={search} onChange={(e) => setSearch(e.target.value)} />
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
            <p className="text-zinc-400 font-bold text-sm">No series match your filter</p>
            {!isAdmin && (
              <button onClick={() => { setEditingSeries(EMPTY_SERIES); setView("edit"); }} className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-xs font-bold rounded-2xl hover:bg-zinc-800 transition-all mt-2">
                <Plus size={15} /> Create first series
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => (
              <article key={s.id} onClick={() => { setSelectedSeriesId(s.id!); setView("detail"); setSelectedPageId(null); }} className="group relative bg-white border border-zinc-200/60 rounded-3xl p-6 hover:border-pink-400/50 hover:shadow-2xl hover:shadow-pink-900/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-[300px] overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50/50 rounded-bl-[100px] -mr-10 -mt-10 group-hover:bg-pink-100/80 transition-all duration-500" />

                <div className="flex items-start justify-between relative mb-6">
                  <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-pink-600 group-hover:text-white transition-colors shadow-sm">
                    <BookOpen size={24} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                     <Badge status={s.status} />
                  </div>
                </div>

                <div className="flex-1 relative z-10">
                  <h2 className="text-xl font-black text-zinc-900 leading-tight mb-2 line-clamp-2 pr-4">{s.title}</h2>
                  {s.description && <p className="text-xs text-zinc-500 font-medium leading-relaxed line-clamp-3">{s.description}</p>}
                </div>

                <div className="pt-4 mt-auto border-t border-zinc-100 flex items-center justify-between relative opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {!isAdmin && (
                      <>
                        <button title="Delete" onClick={() => handleDeleteSeries(s.id!)} className="p-2 bg-zinc-100 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
                      </>
                    )}
                    {isAdmin && s.status === "PENDING_REVIEW" && (
                      <button title="Approve" onClick={() => handleTogglePublish(s)} className="p-2 bg-zinc-100 rounded-xl text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"><CheckCircle2 size={13} /></button>
                    )}
                    {isAdmin && s.status === "PUBLISHED" && (
                      <button title="Unpublish" onClick={() => handleTogglePublish(s)} className="p-2 bg-zinc-100 rounded-xl text-zinc-500 hover:text-zinc-600 transition-colors"><Lock size={13} /></button>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-pink-600">
                    Open Series <ArrowLeft size={10} className="rotate-180" strokeWidth={3} />
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
