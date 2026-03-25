import { useState, useEffect } from "react";
import { 
  Loader2, CheckCircle2, Clock, MapPin, 
  GraduationCap, ShieldCheck, Eye, Linkedin,
  ArrowLeft, Search, ShieldAlert, Fingerprint, 
  Globe, Quote, Mail
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { api, type Member } from "../../lib/api";
import { cn } from "../../lib/utils";

/* ─── Shared UI ───────────────────────────────────────────────────────────── */
function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    PENDING_REVIEW: "bg-amber-50 text-amber-700 ring-amber-200/70",
    DRAFT: "bg-zinc-100 text-zinc-500 ring-zinc-200",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 shadow-sm", map[status] ?? map.DRAFT)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", status === "PUBLISHED" ? "bg-emerald-500 animate-pulse" : status === "PENDING_REVIEW" ? "bg-amber-500 animate-pulse" : "bg-zinc-400")} />
      {status.replace("_", " ")}
    </span>
  );
}

type View = "list" | "detail";

export default function Members() {
  const { token, role } = useAuth();
  const isAdmin = role === "super_admin";
  const t = token ?? "";

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<View>("list");
  const [search, setSearch] = useState("");

  useEffect(() => { 
    if (t) {
      api.members.list(t).then((d) => { setMembers(d); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [t]);

  const selectedMember = members.find(m => m.id === selectedId);

  const handleStatusChange = async (member: Member, newStatus: string) => {
    if (!member.id) return;
    setUpdatingId(member.id);
    try {
      const updated = await api.members.updateStatus(t, member.id, newStatus);
      setMembers((p) => p.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      console.error("Status update failed", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { 
    year: "numeric", month: "long", day: "numeric" 
  });

  const filtered = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.contact_email?.toLowerCase().includes(search.toLowerCase()) ||
    m.university?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex-1 p-10 space-y-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-3xl bg-zinc-100 animate-pulse" />)}
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     DETAIL VIEW (Member ID Card)
  ══════════════════════════════════════════════════════════════════════════ */
  if (view === "detail" && selectedMember)
    return (
      <div className="min-h-screen bg-white pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl px-6 py-4">
          <button onClick={() => setView("list")} className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors group">
            <div className="p-2 rounded-xl group-hover:bg-zinc-100 transition-colors"><ArrowLeft size={16} /></div>
            Registry Index
          </button>
          
          {isAdmin && (
            <div className="flex items-center gap-2">
              {selectedMember.status !== "PUBLISHED" ? (
                <button
                  onClick={() => handleStatusChange(selectedMember, "PUBLISHED")}
                  disabled={!!updatingId}
                  className="px-6 py-2.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50"
                >
                  {updatingId === selectedMember.id ? <Loader2 size={14} className="animate-spin" /> : "Approve & Certify"}
                </button>
              ) : (
                <button
                  onClick={() => handleStatusChange(selectedMember, "DRAFT")}
                  disabled={!!updatingId}
                  className="px-6 py-2.5 bg-white border border-zinc-200 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 hover:border-red-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  {updatingId === selectedMember.id ? <Loader2 size={14} className="animate-spin" /> : "Revoke Certification"}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12">
           <div className="relative mb-16">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-zinc-100/50 rounded-[3.5rem] -rotate-1 scale-105" />
              <div className="relative bg-white border border-zinc-200/60 rounded-[3.5rem] p-10 shadow-2xl shadow-zinc-200/50 flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
                 <div className="relative group">
                    <div className="absolute inset-0 bg-zinc-900 rounded-[2.5rem] rotate-3 scale-95 group-hover:rotate-6 transition-transform blur-xl opacity-10" />
                    {selectedMember.image_url ? (
                      <img src={selectedMember.image_url} alt={selectedMember.name} className="w-40 h-40 rounded-[2.5rem] object-cover border-4 border-white shadow-xl relative z-10" />
                    ) : (
                      <div className="w-40 h-40 rounded-[2.5rem] bg-zinc-900 flex items-center justify-center text-5xl font-black text-white shadow-xl relative z-10">
                        {selectedMember.name[0]}
                      </div>
                    )}
                 </div>

                 <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                       <Badge status={selectedMember.status} />
                       <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest">ID: #{selectedMember.id?.slice(-8).toUpperCase()}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter leading-none">{selectedMember.name}</h1>
                    <p className="text-lg font-bold text-zinc-400 uppercase tracking-widest italic">{selectedMember.position ?? "Lead Researcher"}</p>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                       <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-zinc-600">
                          <MapPin size={14} className="text-zinc-400" />
                          <span className="text-xs font-bold uppercase tracking-tight">{selectedMember.country ?? "Global"}</span>
                       </div>
                       {selectedMember.linkedin_url && (
                          <a href={selectedMember.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-zinc-50 text-zinc-400 hover:text-[#0077b5] hover:bg-[#0077b5]/5 border border-zinc-100 rounded-xl transition-all">
                             <Linkedin size={18} />
                          </a>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="space-y-6">
                 <div>
                    <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] mb-4">Core Identification</h3>
                    <div className="space-y-3">
                       <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 transition-colors hover:border-zinc-300 group">
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 group-hover:text-zinc-500 transition-colors">Digital Mailbox</p>
                          <p className="text-sm font-black text-zinc-900 break-all flex items-center gap-2"><Mail size={14} className="text-zinc-300" /> {selectedMember.contact_email}</p>
                       </div>
                       <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 transition-colors hover:border-zinc-300 group">
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Academic Nexus</p>
                          <p className="text-sm font-black text-zinc-900 flex items-center gap-2"><GraduationCap size={14} className="text-zinc-300" /> {selectedMember.university ?? "BrAIN Labs HQ"}</p>
                       </div>
                    </div>
                 </div>

                 <div className="p-8 bg-zinc-900 rounded-[2.5rem] text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                       <ShieldCheck size={80} />
                    </div>
                    <div className="relative z-10 space-y-4">
                       <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Governance Protocol</p>
                       <h4 className="text-xl font-black tracking-tight italic">Trust & Verification</h4>
                       <p className="text-xs text-zinc-400 leading-relaxed font-medium">As a certified researcher, this individual has delegated authority to contribute scientific content to the global BrAIN network.</p>
                    </div>
                 </div>
              </section>

              <section className="space-y-6">
                 <div>
                    <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] mb-4">Professional Statement</h3>
                    <div className="p-8 bg-zinc-50 border border-zinc-200/60 rounded-[2.5rem] relative group min-h-[200px]">
                       <Quote className="absolute top-6 left-6 text-zinc-200" size={32} />
                       <p className="relative z-10 text-zinc-600 font-medium leading-relaxed italic pt-4">
                          "{selectedMember.summary || "No executive summary has been provided for this ID card entry. The researcher maintains a clean academic profile."}"
                       </p>
                    </div>
                 </div>

                 <div>
                    <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] mb-4">System Metadata</h3>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-5 bg-zinc-50 border border-zinc-100 rounded-2xl flex flex-col gap-1">
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Enrolled</p>
                          <p className="text-xs font-black text-zinc-900">{selectedMember.created_at ? formatDate(selectedMember.created_at) : "Legacy Record"}</p>
                       </div>
                       <div className="p-5 bg-zinc-50 border border-zinc-100 rounded-2xl flex flex-col gap-1">
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Auth Link</p>
                          <p className="text-xs font-black text-zinc-900 truncate flex items-center gap-1.5"><Fingerprint size={12} className="text-zinc-300" /> @{selectedMember.auth_user_id?.slice(0, 8) ?? "GUEST"}</p>
                       </div>
                    </div>
                 </div>
              </section>
           </div>
        </div>
      </div>
    );

  /* ══════════════════════════════════════════════════════════════════════════
     LIST VIEW (Registry Table)
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 pb-10">
        <div>
          <div className="flex items-center gap-2 mb-2 text-zinc-400">
            <ShieldCheck size={16} className="text-zinc-900" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Identity Governance</span>
          </div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase">Member <span className="text-zinc-300">Terminal</span></h1>
          <p className="text-zinc-500 mt-2 font-medium">Global authority for researcher certification and platform access.</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm group hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between mb-4">
             <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                <CheckCircle2 size={22} className="text-emerald-600" />
             </div>
             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest font-mono">Status: 01</span>
          </div>
          <p className="text-5xl font-black text-zinc-900 tracking-tighter mb-1">{members.filter((m) => m.status === "PUBLISHED").length}</p>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Certified Researchers</p>
        </div>

        <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm group hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between mb-4">
             <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
                <Clock size={22} className="text-amber-600" />
             </div>
             <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest font-mono">Status: 02</span>
          </div>
          <p className="text-5xl font-black text-zinc-900 tracking-tighter mb-1">{members.filter((m) => m.status !== "PUBLISHED").length}</p>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Pending Verification</p>
        </div>

        <div className="bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl shadow-zinc-900/20 text-white relative overflow-hidden group">
           <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700">
              <ShieldAlert size={140} />
           </div>
           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Security Protocol</p>
           <h3 className="text-2xl font-black tracking-tighter leading-tight italic">RBAC <span className="text-zinc-500 underline underline-offset-4 decoration-zinc-700">Enforcement</span></h3>
           <p className="text-[11px] text-zinc-400 font-medium mt-4 leading-relaxed">Only High-Level Administrators can finalize scientific credentialing.</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-zinc-200/60 rounded-[3rem] shadow-xl shadow-zinc-200/40 overflow-hidden">
        <div className="px-10 py-8 border-b border-zinc-100 bg-zinc-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest font-mono">Registry Index</h3>
              <div className="h-6 w-[1px] bg-zinc-200" />
              <div className="flex items-center gap-2 px-3 py-1 bg-white border border-zinc-100 rounded-lg shadow-sm">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Real-time Sync</span>
              </div>
           </div>
           <div className="relative group max-w-sm w-full">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
              <input 
                type="text" 
                placeholder="Search registry by name, email or nexus..." 
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-400 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="px-10 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Researcher Identification</th>
                <th className="px-10 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] hidden lg:table-cell">Academic Credentials</th>
                <th className="px-10 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Verification Status</th>
                <th className="px-10 py-5 text-right text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((member) => (
                <tr key={member.id} className="group hover:bg-zinc-50/50 transition-all duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="relative shrink-0">
                        {member.image_url ? (
                          <img src={member.image_url} alt={member.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-zinc-50 shadow-sm transition-transform group-hover:scale-105 duration-500" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-sm font-black text-white uppercase shadow-lg shadow-black/10">
                            {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                        )}
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm",
                          member.status === "PUBLISHED" ? "bg-emerald-500" : "bg-amber-500"
                        )}>
                           {member.status === "PUBLISHED" ? <CheckCircle2 size={10} className="text-white" /> : <Clock size={10} className="text-white" />}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-black text-zinc-900 tracking-tight group-hover:text-indigo-600 transition-colors">{member.name}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{member.position ?? "Lead Researcher"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 hidden lg:table-cell">
                     <div className="space-y-1.5">
                        <p className="text-[11px] font-black text-zinc-800 tracking-tight flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                           <Mail size={12} className="text-zinc-300 shrink-0" /> {member.contact_email}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Globe size={12} className="text-zinc-200 shrink-0" /> {member.university ?? "Global Operations"}
                        </p>
                     </div>
                  </td>
                  <td className="px-10 py-6">
                    <Badge status={member.status} />
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => { setSelectedId(member.id!); setView("detail"); }}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all shadow-sm active:scale-95 group/btn"
                      >
                        <Eye size={14} className="group-hover/btn:scale-110 transition-transform" />
                        <span className="hidden sm:inline">Details</span>
                      </button>
                      
                      {isAdmin && (
                        <>
                          <div className="h-6 w-[1px] bg-zinc-100 mx-1" />
                          {member.status !== "PUBLISHED" ? (
                            <button
                              onClick={() => handleStatusChange(member, "PUBLISHED")}
                              disabled={!!updatingId}
                              className="px-5 py-2.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-xl shadow-zinc-900/10 active:scale-95 disabled:opacity-50"
                            >
                              {updatingId === member.id ? <Loader2 size={14} className="animate-spin" /> : "Certify"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(member, "DRAFT")}
                              disabled={!!updatingId}
                              className="p-2.5 bg-white border border-zinc-200 text-zinc-300 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95 disabled:opacity-50"
                              title="Revoke Certification"
                            >
                              {updatingId === member.id ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                   <td colSpan={4} className="px-10 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                         <div className="w-16 h-16 rounded-3xl bg-zinc-50 flex items-center justify-center text-zinc-200">
                            <Search size={32} />
                         </div>
                         <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">No matching identity found in registry</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
