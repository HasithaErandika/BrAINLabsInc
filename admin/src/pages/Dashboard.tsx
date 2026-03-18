import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  FileText,
  FlaskConical,
  CalendarDays,
  Users,
  ArrowRight,
  TrendingUp,
  Brain,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  href: string;
  sub?: string;
}

function StatCard({ label, value, icon: Icon, href, sub }: StatCardProps) {
  return (
    <Link
      to={href}
      className="group flex flex-col gap-4 p-5 bg-white border border-zinc-100 rounded-xl hover:border-zinc-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center group-hover:bg-zinc-900 transition-colors">
          <Icon size={18} className="text-zinc-600 group-hover:text-white transition-colors" />
        </div>
        <ArrowRight size={14} className="text-zinc-300 group-hover:text-zinc-600 transition-colors" />
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900">{value}</p>
        <p className="text-sm font-medium text-zinc-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user, role } = useAuth();
  const token = useAuth((s) => s.token) ?? "";
  const [stats, setStats] = useState({ publications: 0, blog: 0, research: 0, events: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [pubs, blog, research, events] = await Promise.all([
          api.publications.list(token),
          api.blog.list(token),
          api.research.list(token),
          api.events.list(token),
        ]);
        const users = role === "super_admin" ? await api.users.list(token) : [];
        setStats({
          publications: pubs.length,
          blog: blog.length,
          research: research.length,
          events: events.length,
          users: users.length,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [token, role]);

  const modules = [
    { label: "Publications", icon: BookOpen, href: "/publications", roles: ["super_admin", "researcher"] },
    { label: "Blog Posts", icon: FileText, href: "/blog", roles: ["super_admin", "researcher"] },
    { label: "Research", icon: FlaskConical, href: "/research", roles: ["super_admin", "researcher"] },
    { label: "Events", icon: CalendarDays, href: "/events", roles: ["super_admin", "researcher"] },
    { label: "Users", icon: Users, href: "/users", roles: ["super_admin"] },
  ].filter((m) => m.roles.includes(role ?? ""));

  const statItems = [
    { label: "Publications", value: loading ? "—" : stats.publications, icon: BookOpen, href: "/publications", sub: "Total entries" },
    { label: "Blog Posts", value: loading ? "—" : stats.blog, icon: FileText, href: "/blog", sub: "Total posts" },
    { label: "Research Articles", value: loading ? "—" : stats.research, icon: FlaskConical, href: "/research", sub: "Total articles" },
    { label: "Events", value: loading ? "—" : stats.events, icon: CalendarDays, href: "/events", sub: "Total events" },
    ...(role === "super_admin"
      ? [{ label: "Users", value: loading ? "—" : stats.users, icon: Users, href: "/users", sub: "Active accounts" }]
      : []),
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              Welcome back, {user?.name?.split(" ")[0] ?? "User"}
            </h1>
          </div>
        </div>
        <p className="text-sm text-zinc-500 ml-11">
          {user?.email} &middot;{" "}
          <span className={`role-badge-${role}`}>
            {role === "super_admin" ? "Super Admin" : "Researcher"}
          </span>
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} className="text-zinc-400" />
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Overview</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statItems.slice(0, 4).map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
        {role === "super_admin" && (
          <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard {...statItems[4]} />
          </div>
        )}
      </div>

      {/* Quick access */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Quick Access</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {modules.map((m) => (
            <Link
              key={m.href}
              to={m.href}
              className="flex flex-col items-center gap-2 p-4 bg-white border border-zinc-100 rounded-xl hover:border-zinc-300 hover:bg-zinc-50 transition-all text-center group"
            >
              <div className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center group-hover:bg-black transition-colors">
                <m.icon size={16} className="text-zinc-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-xs font-medium text-zinc-700">{m.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
