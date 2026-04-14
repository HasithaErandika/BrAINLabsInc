import { useAuth } from "../../hooks/useAuth";
import { AdminDashboard } from "./AdminDashboard";
import { ResearcherDashboard } from "./ResearcherDashboard";
import { ResearchAssistantDashboard } from "./ResearchAssistantDashboard";
import { Clock, ShieldAlert } from "lucide-react";

export default function Dashboard() {
  const { user, token, isAdmin, isResearcher, isAssistant } = useAuth();

  if (!token || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-black border-t-transparent animate-spin" />
      </div>
    );
  }

  // Handle Pending status for Researchers and Assistants
  if (user.approval_status === 'PENDING_ADMIN' && !isAdmin()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-10 text-center space-y-12 animate-enter">
        <div className="w-24 h-24 bg-black flex items-center justify-center border border-black group">
          <Clock className="w-12 h-12 text-white group-hover:rotate-12 transition-transform" />
        </div>
        
        <div className="space-y-4 max-w-lg">
          <div className="flex items-center justify-center gap-2 text-zinc-400">
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Protocol: Identity Review</span>
          </div>
          <h1 className="text-4xl font-black text-black tracking-tighter uppercase leading-none">Security Clearance Required</h1>
          <p className="text-sm font-bold text-black uppercase leading-loose tracking-tight pt-4">
            Personnel <span className="underline">{user.first_name} {user.second_name}</span> is currently in the verification queue. 
            Access to laboratory systems is restricted until authorization is granted.
          </p>
        </div>

        <div className="border border-black px-8 py-3 flex items-center gap-4">
          <div className="w-2 h-2 bg-black animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Awaiting Administrative Sign-off</span>
        </div>

        <p className="text-[10px] text-zinc-300 font-black uppercase tracking-widest pt-8">Reference: BRN-{user.id}-IDENT</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-enter">
      {isAdmin() ? (
        <AdminDashboard />
      ) : isResearcher() ? (
        <ResearcherDashboard memberId={user.id} />
      ) : isAssistant() ? (
        <ResearchAssistantDashboard memberId={user.id} />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
          <div className="w-16 h-16 bg-black flex items-center justify-center text-white">
            <ShieldAlert size={32} />
          </div>
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-black uppercase tracking-[0.3em]">Critical Exception</p>
            <p className="text-sm font-bold text-zinc-500 uppercase">Role configuration mismatch. Contact Oversight.</p>
          </div>
        </div>
      )}
    </div>
  );
}
