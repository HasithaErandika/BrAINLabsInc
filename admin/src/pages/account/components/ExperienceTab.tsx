import { useState } from "react";
import { Loader2, Trash2, Plus, Briefcase, ChevronRight } from "lucide-react";
import { api, type MemberCV, type CareerExperience } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";

export function ExperienceTab({ cv, onUpdate, isEditing }: { cv: MemberCV; onUpdate: () => void; isEditing?: boolean }) {
  const { token } = useAuth();
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [form, setForm] = useState<Partial<CareerExperience>>({
    category: "ACADEMIC",
    role: "",
    institution: "",
    period: "",
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await api.me.cv.create(token, "career_experiences", form);
      setForm({ category: "ACADEMIC", role: "", institution: "", period: "" });
      setAdding(false);
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this experience?")) return;
    setDeletingId(id);
    try {
      await api.me.cv.delete(token, "career_experiences", id);
      onUpdate();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 font-mono tracking-tight underline decoration-zinc-100 underline-offset-8">Career Experience</h2>
        {isEditing && (
          <button onClick={() => setAdding(!adding)} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-black text-white rounded-lg hover:bg-zinc-800 transition-all shadow-sm active:scale-95">
            <Plus size={12} /> Add Experience
          </button>
        )}
      </div>

      {isEditing && adding && (
        <form onSubmit={handleAdd} className="bg-white border border-dashed border-zinc-300 p-5 rounded-xl space-y-4 animate-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Sector</label>
              <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-0 focus:border-zinc-400">
                <option value="ACADEMIC">ACADEMIC</option>
                <option value="INDUSTRY">INDUSTRY</option>
                <option value="VOLUNTEER">VOLUNTEER</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Role / Position</label>
              <input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-0 focus:border-zinc-400" placeholder="e.g. Senior Researcher" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Institution / Company</label>
              <input required value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-0 focus:border-zinc-400" placeholder="e.g. MIT Labs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Period</label>
              <input required value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-0 focus:border-zinc-400" placeholder="e.g. 2020 - Present" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setAdding(false)} className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg uppercase tracking-widest transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-md active:scale-95 transition-all">
              {saving ? <Loader2 size={12} className="animate-spin" /> : "Save Experience"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {cv.career_experiences?.length === 0 && !adding && (
          <div className="p-12 text-center border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
            <Briefcase className="mx-auto text-zinc-300 mb-3" size={32} />
            <p className="text-sm font-medium text-zinc-500">No data has added yet</p>
            {isEditing && <p className="text-[10px] text-zinc-400 uppercase mt-1">Click 'Add Experience' to begin</p>}
          </div>
        )}
        
        {cv.career_experiences?.map((item) => (
          <div key={item.id} className="group bg-white border border-zinc-200 p-6 rounded-xl relative hover:border-zinc-400 transition-all shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="mt-1 p-2 bg-zinc-50 rounded-lg border border-zinc-100 group-hover:bg-zinc-100 transition-colors">
                  <Briefcase size={18} className="text-zinc-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-[9px] font-black bg-zinc-100 text-zinc-600 rounded uppercase tracking-tighter border border-zinc-200">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.period}</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 group-hover:text-black">{item.role}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500 mt-0.5">
                    <ChevronRight size={14} className="text-zinc-300" />
                    <span>{item.institution}</span>
                  </div>
                </div>
              </div>
              {isEditing && (
                <button 
                  onClick={() => handleDelete(item.id!)} 
                  disabled={deletingId === item.id} 
                  className="absolute top-4 right-4 p-2 text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                >
                  {deletingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
