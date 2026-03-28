import { useState } from "react";
import { Loader2 } from "lucide-react";
import { api, type MemberCV } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";

interface Props {
  cv: MemberCV;
  onUpdate: () => void;
  isEditing?: boolean;
}

export function BasicInfoTab({ cv, onUpdate, isEditing }: Props) {
  const { token, updateUser, user } = useAuth();
  const [formData, setFormData] = useState({
    name: cv.name,
    position: cv.position ?? "",
    contact_email: cv.contact_email ?? "",
    image_url: cv.image_url ?? "",
    university: cv.university ?? "",
    country: cv.country ?? "",
    linkedin_url: cv.linkedin_url ?? "",
    summary: cv.summary ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
    "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
    "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
    "Fiji", "Finland", "France",
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Holy See", "Honduras", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
    "Jamaica", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
    "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
    "Oman",
    "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
    "Qatar",
    "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan",
    "Vanuatu", "Venezuela", "Vietnam",
    "Yemen",
    "Zambia", "Zimbabwe"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await api.me.update(token, formData);
      updateUser({
        name: updated.name,
        position: updated.position,
        email: updated.contact_email ?? user?.email,
        avatar: updated.image_url,
      });
      setSuccess(true);
      onUpdate();
    } catch (err: any) {
      console.error("Profile update error:", err);
      // Enhanced error handling: extract message from API response if possible
      const msg = err.message || (typeof err === 'string' ? err : "Failed to save profile.");
      setError(msg);
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-6 lg:p-8 shadow-sm transition-all duration-300">
        <h2 className="text-lg font-bold text-zinc-900 mb-6 font-mono tracking-tight">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div className="group">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5 group-hover:text-zinc-500 transition-colors">Full Name</label>
            <p className="text-zinc-900 font-medium">{cv.name || <span className="text-zinc-300 italic">No data has added yet</span>}</p>
          </div>
          <div className="group">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5 group-hover:text-zinc-500 transition-colors">Position</label>
            <p className="text-zinc-900">{cv.position || <span className="text-zinc-300 italic">No data has added yet</span>}</p>
          </div>
          <div className="group">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5 group-hover:text-zinc-500 transition-colors">Contact Email</label>
            <p className="text-zinc-900 underline decoration-zinc-100 underline-offset-4">{cv.contact_email || <span className="text-zinc-300 italic">No data has added yet</span>}</p>
          </div>
          <div className="group">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5 group-hover:text-zinc-500 transition-colors">University</label>
            <p className="text-zinc-900">{cv.university || <span className="text-zinc-300 italic">No data has added yet</span>}</p>
          </div>
          <div className="group">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5 group-hover:text-zinc-500 transition-colors">Country</label>
            <p className="text-zinc-900">{cv.country || <span className="text-zinc-300 italic">No data has added yet</span>}</p>
          </div>
          <div className="group">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5 group-hover:text-zinc-500 transition-colors">LinkedIn Profile</label>
            {cv.linkedin_url ? (
              <a href={cv.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-zinc-900 font-medium hover:text-black hover:underline underline-offset-4 truncate block max-w-xs transition-all">{cv.linkedin_url}</a>
            ) : (
              <p className="text-zinc-300 italic">No data has added yet</p>
            )}
          </div>
          <div className="md:col-span-2 group">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5 group-hover:text-zinc-500 transition-colors">Biography</label>
            <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap text-sm">{cv.summary || <span className="text-zinc-300 italic">No data has added yet</span>}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 lg:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-lg font-bold text-zinc-900 underline decoration-amber-200 underline-offset-8">Edit Profile Details</h2>
      </div>
      
      {error && <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Display Name <span className="text-red-500">*</span></label>
            <input type="text" required value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-400 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Position / Academic Title</label>
            <input type="text" value={formData.position || ""} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-400 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Contact Email</label>
            <input type="email" value={formData.contact_email || ""} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-400 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Avatar URL</label>
            <input type="url" value={formData.image_url || ""} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-400 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Primary Institution</label>
            <input type="text" value={formData.university || ""} onChange={(e) => setFormData({ ...formData, university: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-400 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Country</label>
            <select 
              value={formData.country || ""} 
              onChange={(e) => setFormData({ ...formData, country: e.target.value })} 
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-400 text-sm"
            >
              <option value="">Select Country</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">LinkedIn Address</label>
            <input type="url" value={formData.linkedin_url || ""} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-400 text-sm" placeholder="https://linkedin.com/in/..." />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Professional Bio</label>
            <textarea rows={4} value={formData.summary || ""} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-400 text-sm" />
          </div>
        </div>
        
        <div className="pt-4 flex items-center justify-end gap-4 border-t border-zinc-100">
          {success && <span className="text-sm text-green-600 font-bold">Details Saved</span>}
          <button type="submit" disabled={saving || !formData.name} className="flex items-center gap-2 px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-md active:scale-95">
            {saving && <Loader2 size={16} className="animate-spin" />}
            Commit Changes
          </button>
        </div>
      </form>
    </div>
  );
}
