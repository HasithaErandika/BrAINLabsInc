import { useState } from "react";
import { User, Mail, Globe, Linkedin, MapPin, Briefcase } from "lucide-react";
import { api } from "../../../api";
import type { Profile } from "../../../types";
import { useAuth } from "../../../hooks/useAuth";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

interface Props {
  cv: Profile;
  onUpdate: () => void;
  isEditing?: boolean;
}

export function BasicInfoTab({ cv, onUpdate, isEditing }: Props) {
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: cv.first_name,
    second_name: cv.second_name,
    contact_email: cv.contact_email,
    workplace: cv.role_detail?.workplace || "",
    occupation: cv.role_detail?.occupation || "",
    country: cv.role_detail?.country || "",
    linkedin_url: cv.role_detail?.linkedin_url || "",
    bio: cv.role_detail?.bio || "",
    image_url: cv.role_detail?.image_url || ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.me.update(formData);
      await refreshUser();
      setSuccess(true);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Credential Update Failure");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4 pb-6 border-b border-zinc-100">
           <div className="w-12 h-12 bg-zinc-100 text-zinc-600 rounded-lg flex items-center justify-center shrink-0">
             <User size={20} />
           </div>
           <div>
             <h2 className="text-xl font-bold text-zinc-900">Personal Information</h2>
             <p className="text-sm text-zinc-500">Base Personnel Credentials</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Full Identity</label>
            <p className="text-zinc-900 font-medium text-sm flex items-center gap-3">
              <User size={14} className="text-zinc-400" /> {cv.first_name} {cv.second_name}
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Institutional Node</label>
            <p className="text-zinc-900 font-medium text-sm flex items-center gap-3">
              <Briefcase size={14} className="text-zinc-400" /> {cv.role_detail?.workplace || "Global Researcher"}
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Communication Path</label>
            <p className="text-zinc-900 font-medium text-sm flex items-center gap-3">
              <Mail size={14} className="text-zinc-400" /> {cv.contact_email}
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Geographic Sector</label>
            <p className="text-zinc-900 font-medium text-sm flex items-center gap-3">
              <Globe size={14} className="text-zinc-400" /> {cv.role_detail?.country || "Earth Terminal"}
            </p>
          </div>
          <div className="md:col-span-2 space-y-2 pt-4">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Bio</label>
            <p className="text-zinc-900 text-sm leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-zinc-200">
              {cv.role_detail?.bio || "No biography provided."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 pb-6 border-b border-zinc-100">
         <div className="w-12 h-12 bg-zinc-100 text-zinc-600 rounded-lg flex items-center justify-center shrink-0">
           <User size={20} />
         </div>
         <div>
           <h2 className="text-xl font-bold text-zinc-900">Edit Profile</h2>
           <p className="text-sm text-zinc-500">Update Primary Personnel Data</p>
         </div>
      </div>
      
      {error && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-600 flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="GIVEN NAME" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} required />
          <Input label="SURNAME" value={formData.second_name} onChange={e => setFormData({ ...formData, second_name: e.target.value })} required />
          <Input label="INSTITUTIONAL ROLE" value={formData.occupation} onChange={e => setFormData({ ...formData, occupation: e.target.value })} placeholder="e.g., Lead Neural Architect" />
          <Input label="ACADEMIC NODE" value={formData.workplace} onChange={e => setFormData({ ...formData, workplace: e.target.value })} placeholder="e.g., MIT Media Lab" />
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600 uppercase tracking-tight">GEOGRAPHIC SECTOR</label>
            <div className="relative flex items-center">
               <MapPin size={16} className="absolute left-4 text-zinc-400" />
               <input className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:bg-white" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} placeholder="e.g., United States" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600 uppercase tracking-tight">LINKEDIN URL</label>
            <div className="relative flex items-center">
               <Linkedin size={16} className="absolute left-4 text-zinc-400" />
               <input className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:bg-white" value={formData.linkedin_url} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })} placeholder="https://linkedin.com/..." />
            </div>
          </div>

          <div className="md:col-span-2">
            <Input label="AVATAR RESOURCE LOCATION" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600 uppercase tracking-tight">BIO</label>
            <textarea 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:bg-white min-h-[160px]" 
              value={formData.bio} 
              onChange={e => setFormData({ ...formData, bio: e.target.value })} 
              placeholder="Brief biography..." 
            />
          </div>
        </div>
        
        <div className="pt-8 flex items-center justify-between border-t border-zinc-100">
          {success ? (
            <span className="text-sm font-semibold text-green-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" /> Identity updated</span>
          ) : <div />}
          
          <Button type="submit" isLoading={saving} className="px-6 h-10 text-xs font-semibold">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
