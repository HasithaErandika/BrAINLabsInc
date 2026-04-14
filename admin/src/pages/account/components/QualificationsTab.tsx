import { useState } from "react";
import { Loader2, Plus, Trash2, GraduationCap } from "lucide-react";
import { api } from "../../../api";
import type { Profile } from "../../../types";
import { Button } from "../../../components/ui/Button";

interface Props {
  cv: Profile;
  onUpdate: () => void;
  isEditing?: boolean;
}

export function QualificationsTab({ cv, onUpdate, isEditing }: Props) {
  const [newDegree, setNewDegree] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDegree.trim()) return;
    setAdding(true);
    try {
      await api.me.addEducation(newDegree);
      setNewDegree("");
      onUpdate();
    } catch (err) {
      console.error("Add degree failed:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await api.me.removeEducation(id);
      onUpdate();
    } catch (err) {
      console.error("Remove degree failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 pb-6 border-b border-zinc-100">
         <div className="w-12 h-12 bg-zinc-100 text-zinc-600 rounded-lg flex items-center justify-center shrink-0">
           <GraduationCap size={20} />
         </div>
         <div>
           <h2 className="text-xl font-bold text-zinc-900">Academic Records</h2>
           <p className="text-sm text-zinc-500">Verified educational background</p>
         </div>
      </div>

      <div className="space-y-3">
        {cv.role_detail?.education?.map((edu) => (
          <div key={edu.id} className="group p-5 rounded-xl border border-zinc-200 flex items-center justify-between bg-white hover:border-zinc-300 transition-all">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400">
                  <GraduationCap size={18} />
                </div>
                <span className="text-sm font-semibold text-zinc-900">{edu.degree}</span>
             </div>
             {isEditing && (
               <button 
                 onClick={() => handleDelete(edu.id)} 
                 className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                 disabled={deletingId === edu.id}
               >
                 {deletingId === edu.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
               </button>
             )}
          </div>
        ))}
        {(!cv.role_detail?.education || cv.role_detail.education.length === 0) && (
          <div className="py-12 border border-dashed border-zinc-200 rounded-xl text-center bg-zinc-50/50">
             <p className="text-sm font-medium text-zinc-400">No education records found</p>
          </div>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleAdd} className="pt-8 border-t border-zinc-100 flex gap-4 items-end">
           <div className="flex-1">
             <label className="text-xs font-semibold text-zinc-600 uppercase tracking-tight block mb-1.5">New Degree</label>
             <input 
               className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:bg-white"
               placeholder="e.g., PhD in Neural Networks" 
               value={newDegree} 
               onChange={e => setNewDegree(e.target.value)} 
             />
           </div>
           <Button 
             type="submit" 
             disabled={adding || !newDegree} 
             isLoading={adding}
             className="h-10 px-6 text-xs font-semibold shrink-0 mb-0.5"
           >
             <Plus size={14} className="mr-1.5" /> Add Record
           </Button>
        </form>
      )}
    </div>
  );
}
