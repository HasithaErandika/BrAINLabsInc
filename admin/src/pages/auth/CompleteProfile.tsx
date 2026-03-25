import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { api, type Member } from "../../lib/api";
import { UserPlus, ArrowRight, Loader2, Info } from "lucide-react";

export default function CompleteProfile() {
  const { user, token, status, logout, setSession } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Member>>({
    name: user?.name || "",
    slug: user?.slug || "",
    university: "",
    position: "",
    country: "",
    summary: ""
  });

  useEffect(() => {
    if (!token) navigate("/login");
    if (status === "PUBLISHED" || status === "PENDING_REVIEW") navigate("/dashboard");
  }, [token, status, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Find the member record first to get the ID
      const members = await api.members.list(token!);
      const me = members.find(m => m.contact_email === user?.email);
      
      if (!me?.id) throw new Error("Member profile not found");

      // Update the profile and set status to PENDING_REVIEW
      const updated = await fetch(`${import.meta.env.VITE_API_URL}/admin/members/${me.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, status: "PENDING_REVIEW" })
      }).then(r => r.json());

      // Update local session
      setSession(token!, "researcher", {
        id: me.id,
        name: updated.name,
        email: updated.contact_email || user!.email,
        avatar: updated.image_url,
        slug: updated.slug,
        position: updated.position
      }, "PENDING_REVIEW");

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-4">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shrink-0">
            <UserPlus size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Complete Your Profile</h1>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-0.5">Step 2: Researcher Onboarding</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600">
               <Info size={18} className="shrink-0 mt-0.5" />
               <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Display Name</label>
              <input 
                required
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="Dr. Hasitha Erandika"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">University / Institute</label>
              <input 
                required
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                value={formData.university}
                onChange={e => setFormData(p => ({ ...p, university: e.target.value }))}
                placeholder="SLIIT"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Position</label>
              <input 
                required
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                value={formData.position}
                onChange={e => setFormData(p => ({ ...p, position: e.target.value }))}
                placeholder="Senior Lecturer / Researcher"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Professional Summary</label>
              <textarea 
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all min-h-[100px] resize-none"
                value={formData.summary}
                onChange={e => setFormData(p => ({ ...p, summary: e.target.value }))}
                placeholder="Briefly describe your research interests..."
              />
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-100 flex items-center justify-between">
            <button type="button" onClick={logout} className="text-sm font-medium text-zinc-400 hover:text-zinc-900 transition-colors">Sign out</button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-black text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all flex items-center gap-2 group disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  Submit for Approval <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
