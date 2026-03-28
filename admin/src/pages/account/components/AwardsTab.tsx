import { useState } from "react";
import { Loader2, Trash2, Plus, Award } from "lucide-react";
import { api, type MemberCV } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";

export function AwardsTab({ cv, onUpdate, isEditing }: { cv: MemberCV; onUpdate: () => void; isEditing?: boolean }) {
  const { token } = useAuth();
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ description: "" });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await api.me.cv.create(token, "honours_and_awards", form);
      setForm({ description: "" });
      setAdding(false);
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this award?")) return;
    setDeletingId(id);
    try {
      await api.me.cv.delete(token, "honours_and_awards", id);
      onUpdate();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 font-mono tracking-tight underline decoration-zinc-100 underline-offset-8">Honours & Awards</h2>
        {isEditing && (
          <button onClick={() => setAdding(!adding)} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-black text-white rounded-lg hover:bg-zinc-800 transition-all shadow-sm active:scale-95">
            <Plus size={12} /> Add Award
          </button>
        )}
      </div>

      {isEditing && adding && (
        <form onSubmit={handleAdd} className="bg-white border border-dashed border-zinc-300 p-5 rounded-xl space-y-4 animate-in zoom-in-95 duration-200">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Award Description</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-0 focus:border-zinc-400" placeholder="e.g. Best Researcher Award 2023" rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setAdding(false)} className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg uppercase tracking-widest transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-md active:scale-95 transition-all">
              {saving ? <Loader2 size={12} className="animate-spin" /> : "Save Award"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {cv.honours_and_awards?.length === 0 && !adding && (
          <div className="p-12 text-center border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
            <Award className="mx-auto text-zinc-300 mb-3" size={32} />
            <p className="text-sm font-medium text-zinc-500">No data has added yet</p>
            {isEditing && <p className="text-[10px] text-zinc-400 uppercase mt-1">Click 'Add Award' to begin</p>}
          </div>
        )}
        
        {cv.honours_and_awards?.map((item) => (
          <div key={item.id} className="group bg-white border border-zinc-200 p-4 rounded-xl flex items-center justify-between hover:border-zinc-400 transition-all shadow-sm">
            <div className="flex items-start gap-3">
              <Award className="text-zinc-400 mt-1 flex-shrink-0" size={16} />
              <p className="text-sm font-medium text-zinc-900 tracking-tight leading-relaxed">{item.description}</p>
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
  );
}
