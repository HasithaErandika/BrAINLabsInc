import { useState, useEffect } from "react";
import { ArrowLeft, Search, Mail, Eye, Users, UserCheck, Clock, ShieldCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../api";
import type { BaseMember } from "../../types";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { StatCard } from "../../components/ui/StatCard";

export default function MemberManagement() {
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState<BaseMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [view, setView] = useState<"list" | "detail">("list");
  const [search, setSearch] = useState("");

  const fetchMembers = async () => {
    try {
      const data = await api.admin.getMembers();
      setMembers(data);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const selectedMember = members.find(m => m.id === selectedId);

  const handleStatusChange = async (member: BaseMember, action: "approve" | "reject") => {
    if (!member.id) return;
    setUpdatingId(member.id);
    try {
      if (action === "approve") await api.admin.approveMember(member.id);
      else await api.admin.rejectMember(member.id);
      await fetchMembers();
    } catch (err) {
      console.error("Status update failed", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    return (
      `${m.first_name} ${m.second_name}`.toLowerCase().includes(q) ||
      m.contact_email?.toLowerCase().includes(q)
    );
  });

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4">{[1,2,3].map(i=><div key={i} className="h-20 bg-zinc-50 border border-zinc-200" />)}</div></div>;

  // ─── Detail view ──────────────────────────────────────────────────────────

  if (view === "detail" && selectedMember) {
    return (
      <div className="space-y-6 animate-enter">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft size={15} /> Back to Members
          </button>

          {isAdmin() && (
            <div className="flex items-center gap-3">
              {selectedMember.approval_status !== "APPROVED" && (
                <Button
                  onClick={() => handleStatusChange(selectedMember, "approve")}
                  isLoading={updatingId === selectedMember.id}
                  className="px-6 h-10 text-[10px] tracking-[0.2em] font-black"
                >
                  Approve
                </Button>
              )}
              {selectedMember.approval_status === "APPROVED" && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange(selectedMember, "reject")}
                  isLoading={updatingId === selectedMember.id}
                  className="px-6 h-10 text-[10px] tracking-[0.2em] font-black"
                >
                  Revoke Access
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="max-w-3xl mx-auto space-y-8 py-8">
          <div className="border border-zinc-200 rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-start bg-white">
            <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center text-3xl font-medium text-zinc-600 shrink-0">
              {selectedMember.first_name[0]}{selectedMember.second_name[0]}
            </div>

            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <Badge status={selectedMember.approval_status} />
                  <span className="text-xs text-zinc-400">#{selectedMember.id}</span>
                </div>
                <h1 className="text-3xl font-bold text-zinc-900 leading-tight">
                  {selectedMember.first_name} {selectedMember.second_name}
                </h1>
                <p className="text-sm font-medium text-zinc-500 capitalize">
                  {selectedMember.role.replace("_", " ")}
                </p>
              </div>

              <div className="pt-6 border-t border-zinc-100 flex flex-col gap-3">
                <p className="flex items-center justify-center md:justify-start gap-3 text-sm text-zinc-700">
                  <Mail size={16} className="text-zinc-400" />
                  {selectedMember.contact_email}
                </p>
                <p className="flex items-center justify-center md:justify-start gap-3 text-xs text-zinc-500">
                  <Clock size={14} className="text-zinc-400" />
                  Joined: {new Date(selectedMember.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── List view ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1 text-zinc-400">
            <ShieldCheck size={14} />
            <span className="text-xs font-medium uppercase tracking-widest">Admin</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Member Management</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Approve registrations and manage member access.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Registered" value={members.length} icon={Users} />
        <StatCard label="Verified Access" value={members.filter(m => m.approval_status === "APPROVED").length} icon={UserCheck} />
        <StatCard label="Pending Review" value={members.filter(m => m.approval_status !== "APPROVED" && m.approval_status !== "REJECTED").length} icon={Clock} />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10 h-10 py-2 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-hidden border border-zinc-200 rounded-xl bg-white">
          <table className="w-full text-left bg-white">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-100 text-zinc-600 rounded-full flex items-center justify-center font-medium shrink-0">
                        {m.first_name[0]}{m.second_name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{m.first_name} {m.second_name}</p>
                        <p className="text-xs text-zinc-500">{m.contact_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-zinc-600 capitalize">
                      {m.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={m.approval_status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {isAdmin() && m.approval_status !== "APPROVED" && (
                        <Button
                          onClick={() => handleStatusChange(m, "approve")}
                          isLoading={updatingId === m.id}
                          className="h-8 px-3 text-[9px] tracking-widest"
                        >
                          Approve
                        </Button>
                      )}
                      <button
                        onClick={() => { setSelectedId(m.id); setView("detail"); }}
                        className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-20 text-center bg-white flex flex-col items-center">
              <Users size={24} className="text-zinc-300 mb-2" />
              <p className="text-sm font-medium text-zinc-400">No members found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
