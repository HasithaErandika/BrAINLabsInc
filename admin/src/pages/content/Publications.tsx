import { useState, useEffect } from "react";
import {
  Plus, Search, Sparkles, BookOpen, Calendar, Link as LinkIcon,
  CheckCircle2, Loader2, Filter, Pencil, Trash2, ArrowLeft,
  ChevronDown, Globe, Lock, FileText, Users, ExternalLink,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { api, type ResearchPublication } from "../../lib/api";
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

/* ─── Constants ────────────────────────────────────────────────────────────── */
const EMPTY: Partial<ResearchPublication> = {
  title: "", authors: "", abstract: "", doi: "",
  publication_year: new Date().getFullYear(), link: "", venue: "", status: "DRAFT",
};

type View = "list" | "detail" | "edit";

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function Publications() {
  const { token, role, user } = useAuth();
  const isAdmin = role === "super_admin";
  const memberId = user?.id;
  const t = token ?? "";

  const [items, setItems] = useState<ResearchPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<ResearchPublication>>(EMPTY);
  const [view, setView] = useState<View>("list");
  const [saving, setSaving] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  useEffect(() => {
    if (!t) return;
    api.publications.list(t).then((data) => {
      const filtered = isAdmin ? data.filter((p) => p.status !== "DRAFT") : memberId ? data.filter((p) => p.member_id === memberId) : data;
      setItems(filtered);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [t, isAdmin, memberId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing.id) {
        const updated = await api.publications.update(t, editing.id, editing);
        setItems((p) => p.map((x) => (x.id === updated.id ? updated : x)));
        setSelectedId(updated.id!);
        setView("detail");
      } else {
        const created = await api.publications.create(t, editing);
        setItems((p) => [created, ...p]);
        setSelectedId(created.id!);
        setView("detail");
      }
      setAiSummary("");
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleTogglePublish = async (pub: ResearchPublication) => {
    const updated = await api.publications.update(t, pub.id!, { status: pub.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" });
    setItems((p) => p.map((x) => (x.id === updated.id ? updated : x)));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this publication?")) return;
    await api.publications.delete(t, id);
    const next = items.filter((p) => p.id !== id);
    setItems(next);
    setView("list");
    setSelectedId(null);
  };

  const handleAISummarize = async (text?: string) => {
    if (!text) return;
    setAiLoading(true);
    try {
      const { summary } = await api.publications.summarize(t, text);
      setAiSummary(summary);
    } catch { /* ignore */ }
    finally { setAiLoading(false); }
  };

  const filtered = items.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.authors.toLowerCase().includes(q);
    const matchesStatus = filterStatus === "ALL" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex-1 p-10 space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-3xl bg-zinc-100 animate-pulse" />)}
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     EDIT VIEW
  ══════════════════════════════════════════════════════════════════════════ */
  if (view === "edit")
    return (
      <div className="min-h-screen bg-[#fafaf9]">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl px-6 py-4 shadow-sm">
          <button onClick={() => setView(editing.id ? "detail" : "list")} className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors group">
            <div className="p-2 rounded-xl group-hover:bg-zinc-100 transition-colors"><ArrowLeft size={16} /></div>
            {editing.id ? "Back to Detail" : "Back to List"}
          </button>
          <button onClick={handleSave} disabled={saving || !editing.title || !editing.authors} className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 disabled:opacity-40 transition-all active:scale-95">
            <FileText size={14} />
            {saving ? "Saving…" : editing.id ? "Update Publication" : "Create Publication"}
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{editing.id ? "Edit Publication" : "New Publication"}</h1>
            <p className="text-xs text-zinc-400 mt-1 font-medium">All fields are saved to the database immediately on submit.</p>
          </div>

          <div className="bg-white border border-zinc-200/60 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm">
            <Field label="Title" full>
              <input className={inputCls} value={editing.title ?? ""} onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))} placeholder="Publication title…" />
            </Field>
            <Field label="Authors" full>
              <div className="relative">
                <Users size={14} className="absolute left-3.5 top-3.5 text-zinc-400" />
                <input className={inputCls + " pl-9"} value={editing.authors ?? ""} onChange={(e) => setEditing((p) => ({ ...p, authors: e.target.value }))} placeholder="Author One, Author Two…" />
              </div>
            </Field>
            <Field label="Publication Year">
              <div className="relative">
                <Calendar size={14} className="absolute left-3.5 top-3.5 text-zinc-400" />
                <input type="number" className={inputCls + " pl-9"} value={editing.publication_year ?? ""} onChange={(e) => setEditing((p) => ({ ...p, publication_year: +e.target.value }))} placeholder="2024" />
              </div>
            </Field>
            <Field label="Venue">
              <input className={inputCls} value={editing.venue ?? ""} onChange={(e) => setEditing((p) => ({ ...p, venue: e.target.value }))} placeholder="Nature, IEEE, NeurIPS…" />
            </Field>
            <Field label="DOI">
              <div className="relative">
                <LinkIcon size={14} className="absolute left-3.5 top-3.5 text-zinc-400" />
                <input className={inputCls + " pl-9"} value={editing.doi ?? ""} onChange={(e) => setEditing((p) => ({ ...p, doi: e.target.value }))} placeholder="10.1000/xyz123" />
              </div>
            </Field>
            <Field label="External Link">
              <div className="relative">
                <FileText size={14} className="absolute left-3.5 top-3.5 text-zinc-400" />
                <input className={inputCls + " pl-9"} value={editing.link ?? ""} onChange={(e) => setEditing((p) => ({ ...p, link: e.target.value }))} placeholder="https://…" />
              </div>
            </Field>
            <Field label="Status">
              <div className="relative">
                <select className={selectCls} value={editing.status ?? "DRAFT"} onChange={(e) => setEditing((p) => ({ ...p, status: e.target.value as ResearchPublication["status"] }))}>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_REVIEW">Submit for Review</option>
                  {isAdmin && <option value="PUBLISHED">Published</option>}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-zinc-400 pointer-events-none" />
              </div>
            </Field>
            <Field label="Abstract" full>
              <textarea className={inputCls + " min-h-[140px] resize-none"} value={editing.abstract ?? ""} onChange={(e) => setEditing((p) => ({ ...p, abstract: e.target.value }))} placeholder="Describe the research…" />
            </Field>
          </div>
        </div>
      </div>
    );

  /* ══════════════════════════════════════════════════════════════════════════
     DETAIL VIEW
  ══════════════════════════════════════════════════════════════════════════ */
  if (view === "detail" && selectedItem)
    return (
      <div className="min-h-screen bg-white">
        {/* sticky top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl px-6 py-4">
          <button onClick={() => setView("list")} className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors group">
            <div className="p-2 rounded-xl group-hover:bg-zinc-100 transition-colors"><ArrowLeft size={16} /></div>
            All Publications
          </button>
          <div className="flex items-center gap-2">
            {!isAdmin && (
              <>
                <button onClick={() => { setEditing(selectedItem); setAiSummary(""); setView("edit"); }} className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-900 text-xs font-bold rounded-xl hover:bg-zinc-200 transition-all active:scale-95">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(selectedItem.id!)} className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-all active:scale-95">
                  <Trash2 size={14} /> Delete
                </button>
              </>
            )}
            {isAdmin && selectedItem.status === "PENDING_REVIEW" && (
              <button onClick={() => handleTogglePublish(selectedItem)} className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-600/20">
                <CheckCircle2 size={14} /> Approve & Publish
              </button>
            )}
            {isAdmin && selectedItem.status === "PUBLISHED" && (
              <button onClick={() => handleTogglePublish(selectedItem)} className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-600 text-xs font-bold rounded-xl hover:bg-zinc-50 transition-all active:scale-95">
                <Lock size={14} /> Unpublish
              </button>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
          {/* meta row */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge status={selectedItem.status} />
            {selectedItem.publication_year && <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5"><Calendar size={12} /> {selectedItem.publication_year}</span>}
            {selectedItem.venue && <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5"><Globe size={12} /> {selectedItem.venue}</span>}
          </div>

          {/* title */}
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-[1.1]">{selectedItem.title}</h1>

          {/* authors */}
          <div className="flex flex-wrap gap-2.5">
            {selectedItem.authors.split(",").map((author, idx) => (
              <div key={idx} className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-200/60 rounded-full shadow-sm">
                <span className="inline-flex w-7 h-7 rounded-full bg-zinc-900 text-white text-[10px] font-black items-center justify-center uppercase shrink-0">
                  {author.trim()[0] ?? "?"}
                </span>
                <span className="text-xs font-bold text-zinc-700">{author.trim()}</span>
              </div>
            ))}
          </div>

          {/* abstract */}
          <div className="space-y-5 pt-6 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-zinc-400" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Abstract</h2>
              </div>
              <button onClick={() => handleAISummarize(selectedItem.abstract)} disabled={aiLoading} className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-zinc-800 disabled:opacity-30 transition-all active:scale-95">
                {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                AI Summary
              </button>
            </div>
            <p className="text-lg text-zinc-600 leading-[1.8] font-medium italic border-l-4 border-zinc-200 pl-6">
              {selectedItem.abstract || "No abstract provided."}
            </p>
            {aiSummary && (
              <div className="relative overflow-hidden p-7 rounded-3xl bg-zinc-900 text-white shadow-2xl shadow-zinc-900/20">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-bl-full -mr-10 -mt-10" />
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-white/10 rounded-lg"><Sparkles size={14} className="text-emerald-400" /></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">AI Distilled Summary</span>
                </div>
                <p className="text-sm leading-relaxed font-medium text-zinc-300">"{aiSummary}"</p>
              </div>
            )}
          </div>

          {/* metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {[
              { label: "Year", value: String(selectedItem.publication_year ?? "—"), icon: Calendar },
              { label: "Venue", value: selectedItem.venue || "—", icon: Globe },
              { label: "DOI", value: selectedItem.doi || "—", icon: LinkIcon, mono: true },
            ].map(({ label, value, icon: Icon, mono }) => (
              <div key={label} className="p-5 bg-zinc-50 border border-zinc-200/60 rounded-2xl hover:border-zinc-300 transition-colors">
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon size={12} className="text-zinc-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
                </div>
                <p className={cn("text-sm font-bold text-zinc-800 break-all", mono && "font-mono text-xs text-emerald-700")}>{value}</p>
              </div>
            ))}
          </div>

          {/* actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-zinc-100">
            {selectedItem.link && (
              <a href={selectedItem.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 px-6 py-3.5 bg-zinc-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-800 transition-all active:scale-95 shadow-xl shadow-zinc-900/10">
                <FileText size={16} strokeWidth={2.5} /> View Full Paper
              </a>
            )}
            <div className="ml-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-300">
              {selectedItem.status === "PUBLISHED" ? <Globe size={12} className="text-emerald-500" /> : <Lock size={12} />}
              {selectedItem.status === "PUBLISHED" ? "Public" : "Private"}
            </div>
          </div>
        </div>
      </div>
    );

  /* ══════════════════════════════════════════════════════════════════════════
     LIST VIEW
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* header */}
      <div className="sticky top-0 z-30 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl px-6 py-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={14} className="text-emerald-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Knowledge Base</span>
            </div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Research <span className="text-zinc-400">Publications</span></h1>
            <p className="text-xs text-zinc-500 mt-1 font-medium">{items.length} {items.length === 1 ? "entry" : "entries"} documented</p>
          </div>
          {!isAdmin && (
            <button onClick={() => { setEditing(EMPTY); setAiSummary(""); setView("edit"); }} className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-xs font-bold rounded-2xl hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-900/10 transition-all active:scale-95 shrink-0">
              <Plus size={16} strokeWidth={2.5} /> New Publication
            </button>
          )}
        </div>
      </div>

      {/* filters */}
      <div className="border-b border-zinc-200/60 bg-white/50 px-6 py-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center max-w-7xl mx-auto">
          <div className="relative flex-1 max-w-md group">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
            <input type="text" placeholder="Search by title or author…" className="w-full pl-9 pr-4 py-2.5 text-xs bg-zinc-100/60 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 focus:bg-white transition-all placeholder:text-zinc-400 font-medium" value={search} onChange={(e) => setSearch(e.target.value)} />
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

      {/* grid */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {filtered.length === 0 ? (
          <div className="py-32 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-zinc-100 flex items-center justify-center shadow-inner">
              <Filter size={28} className="text-zinc-300" />
            </div>
            <p className="text-zinc-400 font-bold text-sm">No publications match your filter</p>
            {!isAdmin && (
              <button onClick={() => { setEditing(EMPTY); setAiSummary(""); setView("edit"); }} className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-xs font-bold rounded-2xl hover:bg-zinc-800 transition-all mt-2">
                <Plus size={15} /> Add first publication
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((pub) => (
              <article key={pub.id} onClick={() => { setSelectedId(pub.id!); setView("detail"); }} className="group relative bg-white border border-zinc-200/60 rounded-3xl p-6 hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col gap-4 overflow-hidden">
                {/* decorative corner */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-zinc-50 rounded-bl-[80px] -mr-10 -mt-10 group-hover:bg-zinc-100/80 transition-all duration-500" />

                {/* top */}
                <div className="flex items-start justify-between relative">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-zinc-900 flex flex-col items-center justify-center shadow-lg shadow-zinc-900/10 shrink-0">
                      <span className="text-sm font-black text-white leading-none">{String(pub.publication_year ?? "").slice(-2)}</span>
                      <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest">{String(pub.publication_year ?? "").slice(0, 2)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge status={pub.status} />
                      {pub.venue && <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider line-clamp-1 max-w-[160px]">{pub.venue}</span>}
                    </div>
                  </div>
                  {/* hover actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 relative" onClick={(e) => e.stopPropagation()}>
                    {!isAdmin && (
                      <>
                        <button title="Edit" onClick={() => { setEditing(pub); setAiSummary(""); setView("edit"); }} className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-zinc-900 transition-colors"><Pencil size={13} /></button>
                        <button title="Delete" onClick={() => handleDelete(pub.id!)} className="p-2 hover:bg-red-50 rounded-xl text-zinc-400 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
                      </>
                    )}
                    {isAdmin && pub.status === "PENDING_REVIEW" && (
                      <button title="Approve" onClick={() => handleTogglePublish(pub)} className="p-2 hover:bg-emerald-50 rounded-xl text-zinc-400 hover:text-emerald-600 transition-colors"><CheckCircle2 size={13} /></button>
                    )}
                    {isAdmin && pub.status === "PUBLISHED" && (
                      <button title="Unpublish" onClick={() => handleTogglePublish(pub)} className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-zinc-600 transition-colors"><Lock size={13} /></button>
                    )}
                  </div>
                </div>

                {/* content */}
                <div className="flex-1 space-y-2 relative">
                  <h2 className="text-base font-black text-zinc-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">{pub.title}</h2>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
                    <Users size={11} className="shrink-0 text-zinc-400" />
                    <span className="truncate">{pub.authors}</span>
                  </div>
                </div>

                {/* footer */}
                <div className="pt-4 border-t border-zinc-50 flex items-center justify-between relative">
                  <div className="flex items-center gap-3">
                    {pub.link && (
                      <a title="Link" href={pub.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
                        <FileText size={11} /> Link
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-300 group-hover:text-zinc-600 transition-colors">
                    View <ExternalLink size={9} />
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