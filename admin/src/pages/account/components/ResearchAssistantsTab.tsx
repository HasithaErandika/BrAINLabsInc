import { useState, useEffect, useCallback } from "react";
import { 
  Users, Mail, Trash2, UserPlus, Search, X, Loader2, UserCheck, FlaskConical, AlertCircle
} from "lucide-react";
import { api } from "../../../api";
import type { Profile } from "../../../types";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";

interface Props {
  cv: Profile;
}

interface RA {
  id: number;
  member_id: number;
  first_name: string;
  second_name: string;
  contact_email: string;
  approval_status: string;
  already_mine?: boolean;
  assigned_by_researcher_id?: number | null;
  assigned_projects?: { id: number; title: string }[];
}

export function ResearchAssistantsTab({ cv }: Props) {
  const [assistants, setAssistants] = useState<RA[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<RA[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const fetchAssistants = useCallback(async () => {
    try {
      const data = await api.me.myAssistants();
      setAssistants(data);
    } catch (err) {
      console.error("Failed to fetch assistants:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants]);

  useEffect(() => {
    if (!showAssignPanel) return;
    setSearchLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const data = await api.me.availableAssistants(searchQ || undefined);
        setSearchResults(data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQ, showAssignPanel]);

  const handleAssign = async (ra: RA) => {
    setAssigningId(ra.id);
    try {
      // Pass the selected project ID if any
      await api.me.assignAssistant(ra.member_id, selectedProjectId || undefined);
      await fetchAssistants();
      setSearchResults(prev => prev.map(r => 
        r.id === ra.id ? { ...r, already_mine: true } : r
      ));
    } catch (err: any) {
      alert(err.response?.data?.error || "Assignment failed");
    } finally {
      setAssigningId(null);
    }
  };

  const handleUnassign = async (raId: number) => {
    if (!confirm("Are you sure you want to unassign this assistant?")) return;
    setRemovingId(raId);
    try {
      await api.me.removeAssistant(raId);
      setAssistants(prev => prev.filter(a => a.id !== raId));
    } catch (err: any) {
      alert(err.response?.data?.error || "Removal failed");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-zinc-400" />
      </div>
    );
  }

  const ongoingResearch = cv.role_detail?.ongoing_research || [];

  return (
    <div className="space-y-6 animate-enter">
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Research Assistants</h2>
            <p className="text-sm text-zinc-500">
              Manage your team of research assistants.
            </p>
          </div>
          <Button 
            onClick={() => setShowAssignPanel(!showAssignPanel)}
            variant={showAssignPanel ? "outline" : "primary"}
            className="text-xs h-9 px-4 font-semibold"
          >
            {showAssignPanel ? <><X size={14} className="mr-1.5" /> Close</> : <><UserPlus size={14} className="mr-1.5" /> Assign Assistant</>}
          </Button>
        </div>

        {showAssignPanel && (
          <div className="p-6 bg-white border-b border-zinc-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text"
                  placeholder="Search assistants by name..."
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:bg-white"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                />
              </div>
              <select 
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:bg-white"
                value={selectedProjectId || ""}
                onChange={e => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">-- Optional: Assign to Research Project --</option>
                {ongoingResearch.map(res => (
                  <option key={res.id} value={res.id}>{res.title}</option>
                ))}
              </select>
            </div>

            <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100 max-h-64 overflow-y-auto">
              {searchLoading ? (
                <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-zinc-300" /></div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 text-sm italic">
                  {searchQ ? "No results found." : "Start typing to search available assistants."}
                </div>
              ) : searchResults.map(ra => (
                <div key={ra.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-900 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                      {ra.first_name[0]}{ra.second_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{ra.first_name} {ra.second_name}</p>
                      <p className="text-xs text-zinc-500">{ra.contact_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={ra.approval_status as any} />
                    {ra.already_mine ? (
                      <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 px-3 py-1.5">
                        <UserCheck size={14} /> Assigned
                      </span>
                    ) : (
                      <Button 
                        onClick={() => handleAssign(ra)}
                        disabled={assigningId === ra.id}
                        className="h-8 px-3 text-[11px] font-bold"
                      >
                        {assigningId === ra.id ? <Loader2 size={12} className="animate-spin" /> : "Assign"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="divide-y divide-zinc-100">
          {assistants.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white">
              <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                <Users size={20} className="text-zinc-400" />
              </div>
              <p className="text-sm font-semibold text-zinc-900">No Assistants Found</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm text-center">
                You do not currently have any research assistants assigned. Click "Assign Assistant" to build your team.
              </p>
            </div>
          ) : (
            assistants.map(ra => (
              <div key={ra.id} className="flex items-center justify-between p-6 bg-white hover:bg-zinc-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-100 text-zinc-600 rounded-xl flex items-center justify-center font-bold text-sm border border-zinc-200">
                    {ra.first_name[0]}{ra.second_name[0]}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-zinc-900">{ra.first_name} {ra.second_name}</p>
                      <Badge status={ra.approval_status as any} />
                    </div>
                    <div className="flex items-center gap-3">
                      <a href={`mailto:${ra.contact_email}`} className="text-xs text-zinc-500 flex items-center gap-1 hover:text-zinc-900 transition-colors">
                        <Mail size={12} /> {ra.contact_email}
                      </a>
                    </div>
                    {ra.assigned_projects && ra.assigned_projects.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ra.assigned_projects.map(p => (
                          <div key={p.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[10px] font-medium border border-zinc-200">
                            <FlaskConical size={10} /> {p.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => handleUnassign(ra.id)}
                  disabled={removingId === ra.id}
                  className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  {removingId === ra.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-zinc-900 rounded-xl p-6 text-white flex items-start gap-4">
        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
          <AlertCircle size={20} className="text-zinc-300" />
        </div>
        <div>
          <h3 className="text-sm font-bold mb-1">Collaboration Notice</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Assigning an assistant allows them to submit content (Blogs, Publications, Projects) for your review. 
            Once submitted, you will find their work in your "Pending Reviews" section on the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
