import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Star, X, ChevronDown, Users } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { api, type Event } from "../lib/api";

const EVENT_TYPES = ["seminar", "workshop", "conference"] as const;

function StatusPill({ status }: { status: string }) {
  return <span className={`status-pill ${status === "published" ? "status-published" : "status-draft"}`}>{status === "published" ? "Published" : "Draft"}</span>;
}

const EMPTY: Partial<Event> = { title: "", description: "", event_date: "", location: "", type: "seminar", tags: [], max_capacity: 100, status: "draft" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-zinc-600 mb-1.5">{label}</label>{children}</div>;
}

export default function Events() {
  const { token } = useAuth();
  const t = token ?? "";
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Event> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { api.events.list(t).then((d) => { setItems(d); setLoading(false); }); }, [t]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        const u = await api.events.update(t, editing.id, editing);
        setItems((p) => p.map((i) => (i.id === u.id ? u : i)));
      } else {
        const c = await api.events.create(t, editing);
        setItems((p) => [c, ...p]);
      }
      setEditing(null);
    } finally { setSaving(false); }
  };

  const handleTogglePublish = async (item: Event) => {
    const u = await api.events.update(t, item.id, { status: item.status === "published" ? "draft" : "published" });
    setItems((p) => p.map((i) => (i.id === u.id ? u : i)));
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await api.events.delete(t, id);
    setItems((p) => p.filter((i) => i.id !== id));
    setDeletingId(null);
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Events</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage seminars, workshops, and conferences</p>
        </div>
        <button onClick={() => setEditing(EMPTY)} className="flex items-center gap-2 bg-black text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-zinc-800 transition-colors">
          <Plus size={15} /> New Event
        </button>
      </div>

      <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-12 w-full" />)}</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-sm">No events yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-5 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Event</th>
                <th className="text-left px-5 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="text-left px-5 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider hidden lg:table-cell">Registrations</th>
                <th className="text-left px-5 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-900 line-clamp-1">{item.title}</p>
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 mt-0.5 capitalize">{item.type}</span>
                  </td>
                  <td className="px-5 py-4 text-zinc-500 hidden md:table-cell whitespace-nowrap">{formatDate(item.event_date)}</td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Users size={13} />
                      <span>{item.registrations_count ?? 0} / {item.max_capacity}</span>
                    </div>
                    <div className="mt-1 w-24 bg-zinc-100 rounded-full h-1.5">
                      <div className="bg-zinc-900 h-1.5 rounded-full" style={{ width: `${Math.min(100, ((item.registrations_count ?? 0) / item.max_capacity) * 100)}%` }} />
                    </div>
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
              <h2 className="font-semibold text-zinc-900">{editing.id ? "Edit Event" : "New Event"}</h2>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <Field label="Event Title"><input className="field-input" value={editing.title ?? ""} onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))} placeholder="Event name" /></Field>
              <Field label="Description"><textarea className="field-input" value={editing.description ?? ""} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))} rows={3} placeholder="What is this event about?" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date & Time">
                  <input type="datetime-local" className="field-input" value={editing.event_date ? editing.event_date.slice(0, 16) : ""} onChange={(e) => setEditing((p) => ({ ...p, event_date: new Date(e.target.value).toISOString() }))} />
                </Field>
                <Field label="Type">
                  <div className="relative">
                    <select className="field-input appearance-none pr-8" value={editing.type ?? "seminar"} onChange={(e) => setEditing((p) => ({ ...p, type: e.target.value as Event["type"] }))}>
                      {EVENT_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  </div>
                </Field>
              </div>
              <Field label="Location"><input className="field-input" value={editing.location ?? ""} onChange={(e) => setEditing((p) => ({ ...p, location: e.target.value }))} placeholder="University of Colombo / Online" /></Field>
              <Field label="Max Capacity"><input type="number" className="field-input" value={editing.max_capacity ?? 100} onChange={(e) => setEditing((p) => ({ ...p, max_capacity: +e.target.value }))} /></Field>
              <Field label="Tags (comma-separated)"><input className="field-input" value={(editing.tags ?? []).join(", ")} onChange={(e) => setEditing((p) => ({ ...p, tags: e.target.value.split(",").map((x) => x.trim()) }))} /></Field>
              <Field label="Banner Image URL"><input className="field-input" value={editing.banner_url ?? ""} onChange={(e) => setEditing((p) => ({ ...p, banner_url: e.target.value }))} placeholder="https://…" /></Field>
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
