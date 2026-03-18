import { useState, useEffect } from "react";
import { ShieldCheck, User, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { api, type UserProfile } from "../lib/api";

export default function Users() {
  const { token } = useAuth();
  const t = token ?? "";
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => { api.users.list(t).then((d) => { setUsers(d); setLoading(false); }); }, [t]);

  const handleRoleChange = async (user: UserProfile, newRole: "super_admin" | "researcher") => {
    setUpdatingId(user.id);
    const updated = await api.users.updateRole(t, user.id, newRole);
    setUsers((p) => p.map((u) => (u.id === updated.id ? updated : u)));
    setUpdatingId(null);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900">User Management</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage BrAIN Labs admin accounts and roles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white border border-zinc-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-zinc-900">{users.filter((u) => u.role === "super_admin").length}</p>
            <p className="text-xs text-zinc-500">Super Admins</p>
          </div>
        </div>
        <div className="bg-white border border-zinc-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center">
            <User size={16} className="text-zinc-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-zinc-900">{users.filter((u) => u.role === "researcher").length}</p>
            <p className="text-xs text-zinc-500">Researchers</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-14 w-full" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-5 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="text-left px-5 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Role</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold text-white">
                          {user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-zinc-900">{user.full_name}</p>
                        <p className="text-xs text-zinc-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-zinc-500 hidden lg:table-cell">{formatDate(user.created_at)}</td>
                  <td className="px-5 py-4">
                    <span className={`role-badge-${user.role}`}>
                      {user.role === "super_admin" ? "Super Admin" : "Researcher"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {updatingId === user.id ? (
                        <Loader2 size={14} className="animate-spin text-zinc-400" />
                      ) : (
                        <>
                          {user.role !== "super_admin" && (
                            <button
                              onClick={() => handleRoleChange(user, "super_admin")}
                              className="text-xs px-3 py-1.5 border border-zinc-200 rounded-lg hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all"
                            >
                              Promote
                            </button>
                          )}
                          {user.role !== "researcher" && (
                            <button
                              onClick={() => handleRoleChange(user, "researcher")}
                              className="text-xs px-3 py-1.5 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-600"
                            >
                              Demote
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
