import { useEffect, useState } from "react";
import { Users, BookOpen, FileText, Inbox, ArrowRight, CheckSquare2, ShieldAlert, Plus, CalendarDays, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { Badge } from "../../components/ui/Badge";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

interface Stats { users: number; publications: number; blog: number; pending: number }
interface PendingItem { id: string; title: string; type: string; date: string; href: string }

const TYPE_ICON: Record<string, string> = {
  Publication: "P", Blog: "B", Event: "E", Project: "R",
};

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ users: 0, publications: 0, blog: 0, pending: 0 });
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [users, pubs, blogs, events, projects] = await Promise.all([
          api.admin.getMembers(),
          api.publications.list(),
          api.blogs.list(),
          api.events.list(),
          api.projects.list(),
        ]);
        const collect = (arr: any[], type: string, href: string): PendingItem[] =>
          arr
            .filter(x => x.approval_status === "PENDING_ADMIN")
            .map(x => ({
              id: String(x.id),
              title: x.title ?? "Untitled",
              type,
              date: x.created_at?.split("T")[0] ?? "—",
              href,
            }));
        const all = [
          ...collect(pubs, "Publication", "/publications"),
          ...collect(blogs, "Blog", "/blog"),
          ...collect(events, "Event", "/events"),
          ...collect(projects, "Project", "/projects"),
        ];
        setPendingItems(all);
        setStats({ users: users.length, publications: pubs.length, blog: blogs.length, pending: all.length });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">

      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900 px-8 py-10 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/[0.04] blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-white/[0.03] blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-zinc-400 text-sm mb-1.5">{greeting()},</p>
            <h1 className="text-3xl font-bold tracking-tight leading-none">
              {user?.first_name} {user?.second_name}
            </h1>
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full text-[11px] font-medium text-zinc-300">
                <ShieldAlert size={11} /> Administrator
              </span>
            </div>
          </div>
          {!loading && stats.pending > 0 && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white text-zinc-900 rounded-xl font-semibold text-sm shrink-0 shadow-md">
              <span className="w-2 h-2 bg-zinc-800 rounded-full animate-pulse" />
              {stats.pending} pending approval{stats.pending !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-zinc-100 rounded-xl animate-pulse" />
            ))
          : [
              { label: "Members", value: stats.users, icon: Users, dark: false },
              { label: "Publications", value: stats.publications, icon: BookOpen, dark: false },
              { label: "Blog Posts", value: stats.blog, icon: FileText, dark: false },
              { label: "Needs Review", value: stats.pending, icon: Inbox, dark: stats.pending > 0 },
            ].map(s => (
              <div
                key={s.label}
                className={`rounded-xl p-5 border transition-all ${
                  s.dark
                    ? "bg-zinc-900 border-zinc-900"
                    : "bg-white border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.dark ? "bg-white/10" : "bg-zinc-100"}`}>
                    <s.icon size={15} className={s.dark ? "text-white" : "text-zinc-500"} />
                  </div>
                </div>
                <p className={`text-3xl font-bold tabular-nums leading-none ${s.dark ? "text-white" : "text-zinc-900"}`}>
                  {s.value}
                </p>
                <p className={`text-xs mt-1.5 ${s.dark ? "text-zinc-400" : "text-zinc-500"}`}>{s.label}</p>
              </div>
            ))}
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Pending queue — 2/3 */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-semibold text-zinc-900">Pending Approvals</h2>
              {pendingItems.length > 0 && (
                <span className="px-2 py-0.5 bg-zinc-900 text-white text-[10px] font-bold rounded-full">
                  {pendingItems.length}
                </span>
              )}
            </div>
            <Link
              to="/publications"
              className="text-xs font-medium text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-zinc-50">
            {loading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-14 bg-zinc-50 rounded-lg animate-pulse" />)}
              </div>
            ) : pendingItems.length > 0 ? (
              pendingItems.slice(0, 8).map(item => (
                <Link
                  key={`${item.type}-${item.id}`}
                  to={item.href}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50 group transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 text-[11px] font-bold text-zinc-600">
                    {TYPE_ICON[item.type] ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{item.title}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{item.type} · {item.date}</p>
                  </div>
                  <Badge status="PENDING_ADMIN" />
                  <ArrowRight size={13} className="text-zinc-300 group-hover:text-zinc-600 shrink-0 ml-1" />
                </Link>
              ))
            ) : (
              <div className="py-16 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center">
                  <CheckSquare2 size={20} className="text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-700">All clear</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Nothing pending approval right now</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — 1/3 */}
        <div className="flex flex-col gap-4">

          {/* Quick create */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-2.5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Quick Create</p>
            {[
              { label: "New Publication", href: "/publications", icon: BookOpen },
              { label: "New Blog Post",   href: "/blog",         icon: FileText },
              { label: "New Event",       href: "/events",       icon: CalendarDays },
              { label: "New Project",     href: "/projects",     icon: FlaskConical },
            ].map(a => (
              <Link
                key={a.href}
                to={a.href}
                className="flex items-center justify-between w-full px-3.5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 rounded-lg border border-zinc-100 hover:border-zinc-200 transition-all group"
              >
                <span className="flex items-center gap-2.5">
                  <a.icon size={13} className="text-zinc-400" />
                  {a.label}
                </span>
                <Plus size={12} className="text-zinc-300 group-hover:text-zinc-600 transition-colors" />
              </Link>
            ))}
          </div>

          {/* Members CTA */}
          <Link to="/dashboard/members" className="block flex-1">
            <div className="relative overflow-hidden bg-zinc-900 rounded-xl p-5 h-full group cursor-pointer min-h-[140px] flex flex-col justify-between">
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/[0.05] blur-xl pointer-events-none" />
              <div className="relative z-10">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                  <Users size={16} className="text-white" />
                </div>
                <p className="text-white font-semibold text-sm">Member Management</p>
                <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
                  Review registrations and control lab access.
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-1.5 mt-4 text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors">
                Open Members <ArrowRight size={12} />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
