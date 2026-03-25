import { useState, useEffect } from "react";
import {
  Plus, Search, Calendar, Link as LinkIcon, CheckCircle2,
  Pencil, Trash2, ArrowLeft, ChevronDown, Globe, Lock, Filter, ExternalLink, Clock, Tag,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { api, type Event } from "../../lib/api";
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

const EVENT_TYPES = ["Seminar", "Workshop", "Conference", "Talk", "Competition"] as const;
const EMPTY: Partial<Event> = { title: "", description: "", event_date: "", event_type: "Seminar", link: "", status: "DRAFT" };

type View = "list" | "detail" | "edit";

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";
const fmtTime = (d?: string) => d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";

export default function Events() {
  const { token, role, user } = useAuth();
  const isAdmin = role === "super_admin";
  const memberId = user?.id;
  const t = token ?? "";

  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Event>>(EMPTY);
  const [view, setView] = useState<View>("list");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  useEffect(() => {
    if (!t) return;
    api.events.list(t).then((data) => {
      const filtered = isAdmin ? data.filter((e) => e.status !== "DRAFT") : memberId ? data.filter((e) => e.member_id === memberId) : data;
      setItems(filtered);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [t, isAdmin, memberId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing.id) {
        const u = await api.events.update(t, editing.id, editing);
        setItems((p) => p.map((i) => (i.id === u.id ? u : i)));
        setSelectedId(u.id!);
        setView("detail");
      } else {
        const c = await api.events.create(t, editing);
        setItems((p) => [c, ...p]);
        setSelectedId(c.id!);
        setView("detail");
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleTogglePublish = async (item: Event) => {
    const u = await api.events.update(t, item.id!, { status: item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" });
    setItems((p) => p.map((i) => (i.id === u.id ? u : i)));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this event?")) return;
    await api.events.delete(t, id);
    setItems((p) => p.filter((i) => i.id !== id));
    setView("list");
    setSelectedId(null);
  };

  const filtered = items.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.title.toLowerCase().includes(q) || (e.description ?? "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "ALL" || e.status === filterStatus;
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
          <button onClick={handleSave} disabled={saving || !editing.title} className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 disabled:opacity-40 transition-all active:scale-95">
            <Calendar size={14} />
            {saving ? "Saving…" : editing.id ? "Update Event" : "Create Event"}
          </button>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{editing.id ? "Edit Event" : "New Event"}</h1>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Schedule a seminar, workshop, conference, or other gathering.</p>
          </div>
          <div className="bg-white border border-zinc-200/60 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm">
            <Field label="Event Title" full>
              <input className={inputCls} value={editing.title ?? ""} onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))} placeholder="Global AI Ethics Symposium…" />
            </Field>
            <Field label="Description" full>
              <textarea className={inputCls + " min-h-[100px] resize-none"} value={editing.description ?? ""} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))} placeholder="Overview of the event objectives and scope…" />
            </Field>
            <Field label="Date & Time">
              <input type="datetime-local" className={inputCls} value={editing.event_date ? editing.event_date.slice(0, 16) : ""} onChange={(e) => setEditing((p) => ({ ...p, event_date: new Date(e.target.value).toISOString() }))} />
            </Field>
            <Field label="Event Type">
              <div className="relative">
                <select className={selectCls} value={editing.event_type ?? "Seminar"} onChange={(e) => setEditing((p) => ({ ...p, event_type: e.target.value }))}>
                  {EVENT_TYPES.map((et) => <option key={et} value={et}>{et}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-zinc-400 pointer-events-none" />
              </div>
            </Field>
            <Field label="Reference Link">
              <div className="relative">
                <LinkIcon size={14} className="absolute left-3.5 top-3.5 text-zinc-400" />
                <input className={inputCls + " pl-9"} value={editing.link ?? ""} onChange={(e) => setEditing((p) => ({ ...p, link: e.target.value }))} placeholder="https://registration.example.com" />
              </div>
            </Field>
            <Field label="Status">
              <div className="relative">
                <select className={selectCls} value={editing.status ?? "DRAFT"} onChange={(e) => setEditing((p) => ({ ...p, status: e.target.value as Event["status"] }))}>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_REVIEW">Submit for Review</option>
                  {isAdmin && <option value="PUBLISHED">Published</option>}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-zinc-400 pointer-events-none" />
              </div>
            </Field>
          </div>
        </div>
      </div>
    );

  /* ══════ DETAIL VIEW ══════ */
  if (view === "detail" && selectedItem)
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl px-6 py-4">
          <button onClick={() => setView("list")} className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors group">
            <div className="p-2 rounded-xl group-hover:bg-zinc-100 transition-colors"><ArrowLeft size={16} /></div>
            All Events
          </button>
          <div className="flex items-center gap-2">
            {!isAdmin && (
              <>
                <button onClick={() => { setEditing(selectedItem); setView("edit"); }} className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-900 text-xs font-bold rounded-xl hover:bg-zinc-200 transition-all active:scale-95">
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
          <div className="flex flex-wrap items-center gap-3">
            <Badge status={selectedItem.status} />
            {selectedItem.event_type && <span className="text-xs font-bold text-zinc-400 px-3 py-1 bg-zinc-100 rounded-full uppercase tracking-widest">{selectedItem.event_type}</span>}
          </div>

          {/* big calendar card */}
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="w-36 h-36 shrink-0 rounded-3xl bg-zinc-900 flex flex-col items-center justify-center text-white shadow-2xl shadow-zinc-900/20">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">{new Date(selectedItem.event_date || "").toLocaleString("default", { month: "short" })}</span>
              <span className="text-6xl font-black tracking-tighter leading-none mt-1">{selectedItem.event_date ? new Date(selectedItem.event_date).getDate() : "?"}</span>
              <span className="text-[10px] font-bold text-zinc-500 mt-1">{selectedItem.event_date ? new Date(selectedItem.event_date).getFullYear() : ""}</span>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-[1.1]">{selectedItem.title}</h1>
              <div className="flex flex-wrap items-center gap-3">
                {selectedItem.event_date && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 px-3 py-1.5 bg-zinc-50 rounded-xl border border-zinc-200">
                    <Clock size={12} /> {fmtTime(selectedItem.event_date)}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 px-3 py-1.5 bg-zinc-50 rounded-xl border border-zinc-200">
                  <Calendar size={12} /> {fmtDate(selectedItem.event_date)}
                </span>
              </div>
            </div>
          </div>

          {/* description */}
          <div className="space-y-5 pt-6 border-t border-zinc-100">
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-zinc-400" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Overview</h2>
            </div>
            <p className="text-lg text-zinc-600 leading-[1.8] font-medium italic border-l-4 border-zinc-200 pl-6">
              {selectedItem.description || "No description provided."}
            </p>
          </div>

          {/* link */}
          {selectedItem.link && (
            <div className="pt-4 border-t border-zinc-100">
              <a href={selectedItem.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 px-6 py-3.5 bg-zinc-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-800 transition-all active:scale-95 shadow-xl shadow-zinc-900/10">
                <LinkIcon size={16} strokeWidth={2.5} /> View Registration Link
              </a>
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t border-zinc-100 mt-4">
            <div className="ml-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-300">
              {selectedItem.status === "PUBLISHED" ? <Globe size={12} className="text-emerald-500" /> : <Lock size={12} />}
              {selectedItem.status === "PUBLISHED" ? "Public" : "Private"}
            </div>
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
              <Calendar size={14} className="text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Scientific Gatherings</span>
            </div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Laboratory <span className="text-zinc-400">Events</span></h1>
            <p className="text-xs text-zinc-500 mt-1 font-medium">{items.length} {items.length === 1 ? "event" : "events"} scheduled</p>
          </div>
          {!isAdmin && (
            <button onClick={() => { setEditing(EMPTY); setView("edit"); }} className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-xs font-bold rounded-2xl hover:bg-zinc-800 hover:shadow-lg transition-all active:scale-95 shrink-0">
              <Plus size={16} strokeWidth={2.5} /> Schedule Event
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-zinc-200/60 bg-white/50 px-6 py-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center max-w-7xl mx-auto">
          <div className="relative flex-1 max-w-md group">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
            <input type="text" placeholder="Search events…" className="w-full pl-9 pr-4 py-2.5 text-xs bg-zinc-100/60 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 focus:bg-white transition-all placeholder:text-zinc-400 font-medium" value={search} onChange={(e) => setSearch(e.target.value)} />
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
            <p className="text-zinc-400 font-bold text-sm">No events match your filter</p>
            {!isAdmin && (
              <button onClick={() => { setEditing(EMPTY); setView("edit"); }} className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-xs font-bold rounded-2xl hover:bg-zinc-800 transition-all mt-2">
                <Plus size={15} /> Schedule first event
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((event) => (
              <article key={event.id} onClick={() => { setSelectedId(event.id!); setView("detail"); }} className="group relative bg-white border border-zinc-200/60 rounded-3xl p-6 hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col gap-4 overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-blue-50/40 rounded-bl-[80px] -mr-10 -mt-10 group-hover:bg-blue-50/80 transition-all duration-500" />

                <div className="flex items-start justify-between relative">
                  <div className="flex items-start gap-3">
                    {/* mini calendar */}
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex flex-col items-center justify-center shrink-0 shadow-lg shadow-zinc-900/10">
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">{event.event_date ? new Date(event.event_date).toLocaleString("default", { month: "short" }) : "—"}</span>
                      <span className="text-lg font-black text-white leading-none">{event.event_date ? new Date(event.event_date).getDate() : ""}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge status={event.status} />
                      {event.event_type && <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{event.event_type}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 relative" onClick={(e) => e.stopPropagation()}>
                    {!isAdmin && (
                      <>
                        <button title="Edit" onClick={() => { setEditing(event); setView("edit"); }} className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-zinc-900 transition-colors"><Pencil size={13} /></button>
                        <button title="Delete" onClick={() => handleDelete(event.id!)} className="p-2 hover:bg-red-50 rounded-xl text-zinc-400 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
                      </>
                    )}
                    {isAdmin && event.status === "PENDING_REVIEW" && (
                      <button title="Approve" onClick={() => handleTogglePublish(event)} className="p-2 hover:bg-emerald-50 rounded-xl text-zinc-400 hover:text-emerald-600 transition-colors"><CheckCircle2 size={13} /></button>
                    )}
                    {isAdmin && event.status === "PUBLISHED" && (
                      <button title="Unpublish" onClick={() => handleTogglePublish(event)} className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-zinc-600 transition-colors"><Lock size={13} /></button>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-2 relative">
                  <h2 className="text-base font-black text-zinc-900 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">{event.title}</h2>
                  {event.event_date && (
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
                      <Calendar size={11} className="shrink-0 text-zinc-400" />
                      <span>{fmtDate(event.event_date)}</span>
                      {fmtTime(event.event_date) && <span className="text-zinc-300">•</span>}
                      {fmtTime(event.event_date) && <span className="font-mono">{fmtTime(event.event_date)}</span>}
                    </div>
                  )}
                  {event.description && <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{event.description}</p>}
                </div>

                <div className="pt-4 border-t border-zinc-50 flex items-center justify-between relative">
                  {event.link && (
                    <a href={event.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1.5">
                      <LinkIcon size={11} /> Link
                    </a>
                  )}
                  <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-300 group-hover:text-zinc-600 transition-colors ml-auto">
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
