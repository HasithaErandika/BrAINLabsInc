import { useEffect, useState } from "react";
import { 
  Users, 
  BookOpen, 
  FileText, 
  CalendarDays, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  FlaskConical,
  CheckCircle2,
  Inbox
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { StatCard } from "./components/StatCard";

interface Stats {
  users: number;
  publications: number;
  blog: number;
  events: number;
  pending: number;
}

interface PendingItem {
  id: string;
  title: string;
  type: 'Publication' | 'Blog' | 'Event' | 'Project';
  author: string;
  date: string;
  href: string;
}

export function SuperAdminDashboard({ token }: { token: string }) {
  const [stats, setStats] = useState<Stats>({ users: 0, publications: 0, blog: 0, events: 0, pending: 0 });
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, pubs, blogs, events, projects] = await Promise.all([
          api.members.list(token),
          api.publications.list(token),
          api.blog.list(token),
          api.events.list(token),
          api.projects.list(token),
        ]);

        const pendingPubs: PendingItem[] = pubs.filter(p => p.status === 'PENDING_REVIEW').map(p => ({
          id: p.id!,
          title: p.title,
          type: 'Publication',
          author: p.authors.split(',')[0],
          date: p.publication_year?.toString() ?? "N/A",
          href: '/publications'
        }));

        const pendingBlogs: PendingItem[] = blogs.filter(b => b.status === 'PENDING_REVIEW').map(b => ({
          id: b.id!,
          title: b.title,
          type: 'Blog',
          author: b.author_name ?? "Unknown",
          date: b.published_date ?? "N/A",
          href: '/blog'
        }));

        const pendingEvents: PendingItem[] = events.filter(e => e.status === 'PENDING_REVIEW').map(e => ({
          id: e.id!,
          title: e.title,
          type: 'Event',
          author: e.event_type ?? "General",
          date: e.event_date ?? "N/A",
          href: '/events'
        }));

        const pendingProjects: PendingItem[] = projects.filter(p => p.status === 'PENDING_REVIEW').map(p => ({
          id: p.id!,
          title: p.category,
          type: 'Project',
          author: "Research Team",
          date: p.created_at?.split('T')[0] ?? "N/A",
          href: '/projects'
        }));

        const allPending = [...pendingPubs, ...pendingBlogs, ...pendingEvents, ...pendingProjects];
        setPendingItems(allPending);

        setStats({
          users: users.length,
          publications: pubs.length,
          blog: blogs.length,
          events: events.length,
          pending: allPending.length,
        });
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Subtle Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-zinc-400">
            <ShieldCheck size={14} className="text-zinc-900" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Governance Terminal</span>
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase">Admin <span className="text-zinc-300">Console</span></h1>
        </div>
      </div>

      {/* Mini Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Members" value={loading ? "..." : stats.users} icon={Users} href="/users" />
        <StatCard label="Research" value={loading ? "..." : stats.publications} icon={BookOpen} href="/publications" />
        <StatCard label="Articles" value={loading ? "..." : stats.blog} icon={FileText} href="/blog" />
        <StatCard label="Queue" value={loading ? "..." : stats.pending} icon={AlertCircle} href="/publications" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main: Advanced Review Queue */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm overflow-hidden relative group">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10">
                    <Inbox size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-zinc-900 tracking-tight uppercase">Priority Flow</h2>
                    <p className="text-[10px] items-center gap-1 font-bold text-zinc-400 uppercase tracking-widest flex">
                      <Clock size={10} /> Real-time Audit Queue
                    </p>
                  </div>
               </div>
               <Link to="/publications" className="px-5 py-2.5 bg-zinc-50 text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-100 transition-all border border-zinc-100">
                 System Audit
               </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="skeleton h-20 w-full rounded-2xl" />)
              ) : pendingItems.length > 0 ? (
                pendingItems.map(item => (
                  <Link 
                    key={`${item.type}-${item.id}`} 
                    to={item.href}
                    className="flex items-center justify-between p-5 bg-zinc-50/50 hover:bg-white border border-transparent hover:border-zinc-200 rounded-2xl transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-5">
                       <div className="w-10 h-10 bg-white rounded-xl border border-zinc-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                         {item.type === 'Publication' && <BookOpen size={18} className="text-zinc-400" />}
                         {item.type === 'Blog' && <FileText size={18} className="text-zinc-400" />}
                         {item.type === 'Event' && <CalendarDays size={18} className="text-zinc-400" />}
                         {item.type === 'Project' && <FlaskConical size={18} className="text-zinc-400" />}
                       </div>
                       <div>
                         <div className="flex items-center gap-2 mb-0.5">
                            <span className="px-2 py-0.5 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-md">{item.type}</span>
                            <h4 className="text-xs font-black text-zinc-900 line-clamp-1 max-w-[300px]">{item.title}</h4>
                         </div>
                         <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                           {item.author} • {item.date}
                         </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="hidden sm:flex flex-col items-end">
                          <span className="text-[10px] font-black text-zinc-900 uppercase tracking-tighter leading-none mb-1">Moderation Request</span>
                          <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">Awaiting Command</span>
                       </div>
                       <div className="w-8 h-8 rounded-full bg-white border border-zinc-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                          <ArrowRight size={14} />
                       </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-20 text-center flex flex-col items-center">
                   <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mb-6">
                      <CheckCircle2 size={32} className="text-emerald-500" />
                   </div>
                   <p className="text-zinc-900 text-sm font-black uppercase tracking-[0.2em] mb-2">Protocol Optimal</p>
                   <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest italic">All nodes have been verified and processed.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Quick Control */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-black/20 relative overflow-hidden group border border-zinc-800 h-fit">
            <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck size={200} />
            </div>
            <div className="relative">
               <h3 className="text-lg font-black tracking-tighter mb-2 italic">Quick <span className="text-zinc-500">Links</span></h3>
               <p className="text-zinc-400 text-[11px] font-medium mb-8 leading-relaxed">Rapidly deploy new content across the ecosystem.</p>
               <div className="grid grid-cols-1 gap-3">
                 {[
                   { label: "New Publication", href: "/publications", icon: BookOpen },
                   { label: "New Blog Post", href: "/blog", icon: FileText },
                   { label: "New Event", href: "/events", icon: CalendarDays },
                   { label: "New Project", href: "/projects", icon: FlaskConical },
                 ].map((action) => (
                   <Link 
                     key={action.label}
                     to={action.href} 
                     className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all group/btn active:scale-95"
                   >
                     <div className="flex items-center gap-4">
                       <action.icon size={16} className="text-zinc-500 group-hover:text-black transition-colors" />
                       <span className="text-[10px] font-black uppercase tracking-widest">{action.label}</span>
                     </div>
                     <ArrowRight size={14} className="opacity-0 group-hover/btn:opacity-100 transition-all -translate-x-2 group-hover/btn:translate-x-0" />
                   </Link>
                 ))}
               </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center border border-zinc-100">
                   <Users size={18} className="text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900 tracking-tight uppercase">Control Hub</h3>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Global Ops</p>
                </div>
             </div>
             <p className="text-[11px] text-zinc-500 font-medium mb-6 leading-relaxed">Analyze and manage the researcher community profiles and permissions.</p>
             <Link to="/users" className="w-full flex items-center justify-center gap-3 py-4 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-800 transition-all active:scale-95 shadow-xl shadow-black/10">
               Member Control <ArrowRight size={14} />
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
