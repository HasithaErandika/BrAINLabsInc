import { useState, useEffect } from "react";
import { X, Loader2, User, Briefcase, Mail, ImageIcon, Save, CheckCircle2 } from "lucide-react";
import { api, type Member } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { token, user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState<Partial<Member>>({
    name: "",
    position: "",
    contact_email: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      setLoading(true);
      setError(null);
      setSuccess(false);
      api.me.get(token)
        .then((member) => {
          setFormData({
            name: member.name,
            position: member.position ?? "",
            contact_email: member.contact_email ?? "",
            image_url: member.image_url ?? "",
          });
        })
        .catch(() => setError("Failed to load profile details."))
        .finally(() => setLoading(false));
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await api.me.update(token, formData);
      updateUser({
        name: updated.name,
        position: updated.position,
        email: updated.contact_email ?? user?.email,
        avatar: updated.image_url,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-8 border-b border-zinc-100 bg-white">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tighter">Profile <span className="text-zinc-300">Settings</span></h2>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">Manage your public researcher identity</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 -mr-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-2xl transition-all active:scale-90"
          >
            <X size={22} />
          </button>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-black" />
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Retrieving Secure Data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {error && (
              <div className="p-4 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Image Preview */}
              <div className="md:col-span-2 flex flex-col items-center justify-center p-8 bg-zinc-50 rounded-[2rem] border border-zinc-100 border-dashed border-2">
                 <div className="relative group">
                    {formData.image_url ? (
                      <img 
                        src={formData.image_url} 
                        className="w-24 h-24 rounded-[1.5rem] object-cover ring-4 ring-white shadow-xl group-hover:scale-105 transition-transform" 
                        alt="Preview"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}&backgroundColor=000000&textColor=ffffff`;
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-[1.5rem] bg-zinc-900 flex items-center justify-center text-white ring-4 ring-white shadow-xl">
                        <User size={32} />
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-zinc-100">
                       <ImageIcon size={14} className="text-zinc-400" />
                    </div>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-4">Identity Preview</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Full Name <span className="text-black">*</span></label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" />
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-zinc-400 transition-all font-bold text-zinc-900 placeholder:text-zinc-300"
                    placeholder="Dr. Jane Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Professional Title</label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" />
                  <input
                    type="text"
                    value={formData.position || ""}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-zinc-400 transition-all font-bold text-zinc-900 placeholder:text-zinc-300"
                    placeholder="Lead Researcher"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Contact Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" />
                  <input
                    type="email"
                    value={formData.contact_email || ""}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-zinc-400 transition-all font-bold text-zinc-900 placeholder:text-zinc-300"
                    placeholder="jane.doe@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Avatar URL</label>
                <div className="relative">
                  <ImageIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" />
                  <input
                    type="url"
                    value={formData.image_url || ""}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-zinc-400 transition-all font-bold text-zinc-900 placeholder:text-zinc-300 text-sm"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-8 flex items-center justify-between border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                disabled={saving || !formData.name || success}
                className={cn(
                  "flex items-center gap-3 px-10 py-4 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50",
                  success ? "bg-emerald-600 shadow-emerald-900/10" : "bg-black shadow-black/10 hover:bg-zinc-800"
                )}
              >
                {success ? (
                  <>
                    <CheckCircle2 size={18} />
                    Profile Updated
                  </>
                ) : (
                  <>
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? "Deploying..." : "Synchronize Profile"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
