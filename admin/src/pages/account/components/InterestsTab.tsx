import { useState } from "react";
import { Loader2, Trash2, Plus, Search } from "lucide-react";
import { api, type MemberCV, type ResearchInterest } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";

export function InterestsTab({ cv, onUpdate, isEditing }: { cv: MemberCV; onUpdate: () => void; isEditing?: boolean }) {
  const { token } = useAuth();
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [form, setForm] = useState<Partial<ResearchInterest>>({ category: "THEORETICAL", interest_name: "" });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await api.me.cv.create(token, "research_interests", form);
      setForm({ category: "THEORETICAL", interest_name: "" });
      setAdding(false);
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this research interest?")) return;
    setDeletingId(id);
    try {
      await api.me.cv.delete(token, "research_interests", id);
      onUpdate();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 font-mono tracking-tight underline decoration-zinc-100 underline-offset-8">Research Interests</h2>
        {isEditing && (
          <button onClick={() => setAdding(!adding)} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-black text-white rounded-lg hover:bg-zinc-800 transition-all shadow-sm active:scale-95">
            <Plus size={12} /> Add Interest
          </button>
        )}
      </div>

      {isEditing && adding && (
        <form onSubmit={handleAdd} className="bg-white border border-dashed border-zinc-300 p-5 rounded-xl space-y-4 animate-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Type</label>
              <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-0 focus:border-zinc-400">
                <option value="THEORETICAL">THEORETICAL</option>
                <option value="APPLIED">APPLIED</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Topic Area</label>
              <input required value={form.interest_name} onChange={(e) => setForm({ ...form, interest_name: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-0 focus:border-zinc-400" placeholder="e.g. Distributed Consensus" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setAdding(false)} className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg uppercase tracking-widest transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-md active:scale-95 transition-all">
              {saving ? <Loader2 size={12} className="animate-spin" /> : "Save Interest"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {cv.research_interests?.length === 0 && !adding && (
          <div className="p-12 text-center border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
            <Search className="mx-auto text-zinc-300 mb-3" size={32} />
            <p className="text-sm font-medium text-zinc-500">No data has added yet</p>
            {isEditing && <p className="text-[10px] text-zinc-400 uppercase mt-1">Click 'Add Interest' to begin</p>}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cv.research_interests?.map((item) => (
            <div key={item.id} className="group bg-white border border-zinc-200 p-4 rounded-xl flex items-center justify-between hover:border-zinc-400 transition-all shadow-sm">
              <div className="flex items-center gap-4">
                <span className={`px-2 py-0.5 text-[9px] font-black rounded border uppercase tracking-tighter ${
                  item.category === 'THEORETICAL' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-900 border-zinc-900'
                }`}>
                  {item.category}
                </span>
                <p className="text-sm font-bold text-zinc-900 tracking-tight">{item.interest_name}</p>
              </div>
              {isEditing && (
                <button onClick={() => handleDelete(item.id!)} disabled={deletingId === item.id} className="p-2 text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                  {deletingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
