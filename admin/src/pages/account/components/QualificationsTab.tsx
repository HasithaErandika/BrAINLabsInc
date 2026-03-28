import { useState } from "react";
import { Loader2, Trash2, Plus, BookOpen } from "lucide-react";
import { api, type MemberCV, type AcademicQualification } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";

export function QualificationsTab({ cv, onUpdate, isEditing }: { cv: MemberCV; onUpdate: () => void; isEditing?: boolean }) {
  const { token } = useAuth();
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [form, setForm] = useState<Partial<AcademicQualification>>({
    degree: "",
    institution: "",
    period: "",
    details: "",
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await api.me.cv.create(token, "academic_qualifications", form);
      setForm({ degree: "", institution: "", period: "", details: "" });
      setAdding(false);
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this qualification?")) return;
    setDeletingId(id);
    try {
      await api.me.cv.delete(token, "academic_qualifications", id);
      onUpdate();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 font-mono tracking-tight underline decoration-zinc-100 underline-offset-8">Academic Qualifications</h2>
        {isEditing && (
          <button onClick={() => setAdding(!adding)} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-black text-white rounded-lg hover:bg-zinc-800 transition-all shadow-sm active:scale-95">
            <Plus size={12} /> Add Degree
          </button>
        )}
      </div>

      {isEditing && adding && (
        <form onSubmit={handleAdd} className="bg-white border border-dashed border-zinc-300 p-5 rounded-xl space-y-4 animate-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Degree Name</label>
              <input required value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" placeholder="e.g. PhD in Computer Science" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Institution</label>
              <input required value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" placeholder="e.g. Stanford University" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Period</label>
              <input required value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" placeholder="e.g. 2015 - 2019" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Additional Details</label>
              <input value={form.details || ""} onChange={(e) => setForm({ ...form, details: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" placeholder="e.g. Specialization in Cryptography" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setAdding(false)} className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg uppercase tracking-widest transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-md active:scale-95 transition-all">
              {saving ? <Loader2 size={12} className="animate-spin" /> : "Save Degree"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {cv.academic_qualifications?.length === 0 && !adding && (
          <div className="p-12 text-center border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
            <BookOpen className="mx-auto text-zinc-300 mb-3" size={32} />
            <p className="text-sm font-medium text-zinc-500">No data has added yet</p>
            {isEditing && <p className="text-[10px] text-zinc-400 uppercase mt-1">Click 'Add Degree' to begin</p>}
          </div>
        )}
        
        {cv.academic_qualifications?.map((item) => (
          <div key={item.id} className="group bg-white border border-zinc-200 p-6 rounded-xl relative hover:border-zinc-400 transition-all shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="mt-1 p-2 bg-zinc-50 rounded-lg border border-zinc-100 group-hover:bg-zinc-100 transition-colors">
                  <BookOpen size={18} className="text-zinc-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.period}</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 group-hover:text-black">{item.degree}</h3>
                  <p className="text-sm text-zinc-600 mt-0.5 font-medium">{item.institution}</p>
                  {item.details && <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{item.details}</p>}
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
