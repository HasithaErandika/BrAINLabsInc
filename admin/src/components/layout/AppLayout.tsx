import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  FlaskConical,
  CalendarDays,
  Users,
  LogOut,
  Menu,
  Bell,
  Briefcase,
  GraduationCap,
  Settings,
  HelpCircle,
  UserCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["super_admin", "researcher"] },
  { label: "Publications", path: "/publications", icon: BookOpen, roles: ["super_admin", "researcher"] },
  { label: "Blog Posts", path: "/blog", icon: FileText, roles: ["super_admin", "researcher"] },
  { label: "Projects", path: "/projects", icon: FlaskConical, roles: ["super_admin", "researcher"] },
  { label: "Events", path: "/events", icon: CalendarDays, roles: ["super_admin", "researcher"] },
  { label: "Grants", path: "/grants", icon: Briefcase, roles: ["super_admin", "researcher"] },
  { label: "Tutorials", path: "/tutorials", icon: GraduationCap, roles: ["super_admin", "researcher"] },
  { label: "Users", path: "/users", icon: Users, roles: ["super_admin"] },
] as const;

const otherNavItems = [
  { label: "Account", path: "/account", icon: UserCircle, roles: ["super_admin", "researcher"] },
  { label: "Settings", path: "/settings", icon: Settings, roles: ["super_admin", "researcher"] },
  { label: "Help", path: "/help", icon: HelpCircle, roles: ["super_admin", "researcher"] },
] as const;

export function AppLayout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = role === "super_admin";

  useEffect(() => {
    document.title = isAdmin ? "BrAINLabs - Admin Console" : "BrAINLabs - Researcher Console";
  }, [isAdmin]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredNav = navItems.filter((item) =>
    role ? item.roles.includes(role as never) : false
  );

  const filteredOtherNav = otherNavItems.filter((item) =>
    role ? item.roles.includes(role as never) : false
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* Branding Section - Upper Left Corner */}
      <div className="px-6 py-8 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center shadow-xl shadow-black/20 group relative overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain z-10" onError={(e) => {
              // Fallback if logo.png is missing
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('bg-zinc-900');
            }} />
          </div>
          <div>
            <p className="font-black text-[11px] text-zinc-900 tracking-tighter uppercase leading-none mb-1">
              BrAIN Labs
            </p>
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
              {isAdmin ? "Official HQ" : "Research Portal"}
            </p>
          </div>
        </div>
        
        <div className="space-y-0.5">
           <h2 className="text-[10px] font-black text-zinc-300 uppercase tracking-widest leading-none mb-1 px-1">
             {isAdmin ? "Administrative" : "Scientific"}
           </h2>
           <h1 className="text-lg font-black text-zinc-900 tracking-tighter px-1">
             Ecosystem
           </h1>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-1">
        <div className="mb-4">
           <h3 className="px-3 text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] mb-4">Intelligence</h3>
           {filteredNav.map((item) => (
             <NavLink
               key={item.path}
               to={item.path}
               onClick={() => setMobileOpen(false)}
               className={({ isActive }) =>
                 cn(
                   "flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300",
                   isActive 
                     ? "bg-zinc-900 text-white shadow-lg shadow-black/10 translate-x-1" 
                     : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                 )
               }
             >
               {({ isActive }) => (
                 <>
                   <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                   {item.label}
                 </>
               )}
             </NavLink>
           ))}
        </div>

        <div className="pt-8 mb-4">
           <h3 className="px-3 text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] mb-4">Terminal Control</h3>
           {filteredOtherNav.map((item) => (
             <NavLink
               key={item.path}
               to={item.path}
               onClick={() => setMobileOpen(false)}
               className={({ isActive }) =>
                 cn(
                   "flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300",
                   isActive 
                     ? "bg-zinc-900 text-white shadow-lg shadow-black/10 translate-x-1" 
                     : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                 )
               }
             >
               {({ isActive }) => (
                 <>
                   <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                   {item.label}
                 </>
               )}
             </NavLink>
           ))}
        </div>
      </nav>

      {/* Sidebar Footer/User Profile (Optional redundancy if needed in sidebar) */}
      <div className="p-6 border-t border-zinc-100 bg-zinc-50/30">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-400 border border-zinc-200 uppercase tracking-tighter shadow-sm">
              {role?.slice(0, 1)}
           </div>
           <div>
              <p className="text-[10px] font-black text-zinc-900 leading-none mb-1 uppercase tracking-tighter">{role?.replace("_", " ")}</p>
              <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">Active Session</p>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-50/50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-zinc-100 flex-shrink-0 bg-white shadow-2xl shadow-zinc-200/50 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden text-zinc-900">
          <div
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white border-r border-zinc-100 shadow-2xl animate-in slide-in-from-left duration-500">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Global Top Header */}
        <header className="h-16 lg:h-24 bg-white/80 backdrop-blur-md border-b border-zinc-100 flex items-center justify-between px-4 lg:px-12 flex-shrink-0 z-10 shadow-sm sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-3 rounded-2xl hover:bg-zinc-100 transition-colors text-zinc-600 border border-zinc-100 shadow-sm"
            >
              <Menu size={22} />
            </button>
            <div className="hidden lg:flex flex-col">
               <h2 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em] leading-none mb-2">Operational</h2>
               <h1 className="text-2xl font-black text-zinc-900 tracking-tighter">Command <span className="text-zinc-300">Center</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-8">
            <button className="relative p-3 rounded-2xl hover:bg-zinc-50 transition-all text-zinc-400 hover:text-zinc-900 group border border-transparent hover:border-zinc-100">
              <Bell size={22} />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-black border-2 border-white rounded-full group-hover:scale-110 transition-transform shadow-sm" />
            </button>

            <div className="h-10 w-[1px] bg-zinc-100 hidden sm:block" />

            <div className="flex items-center gap-4 pl-2">
              <div className="hidden lg:flex flex-col items-end mr-2">
                <p className="text-[13px] font-black text-zinc-900 leading-none mb-1 tracking-tight">{user?.name ?? "Member"}</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest truncate max-w-[180px]">{user?.email ?? ""}</p>
              </div>
              
              <div className="relative group cursor-pointer active:scale-95 transition-transform">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-[1.25rem] object-cover ring-4 ring-zinc-50 group-hover:ring-black/5 transition-all shadow-xl shadow-black/5" />
                ) : (
                  <div className="w-12 h-12 rounded-[1.25rem] bg-zinc-900 flex items-center justify-center text-sm font-black text-white shadow-xl shadow-black/10 ring-4 ring-zinc-50 group-hover:ring-black/5 transition-all">
                    {user?.name?.[0] ?? "M"}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
              </div>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="ml-2 p-3 rounded-2xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90 border border-transparent hover:border-red-100 shadow-sm"
              >
                <LogOut size={22} />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-zinc-50/30 selection:bg-black selection:text-white">
          <div className={cn(
            "animate-in fade-in zoom-in-95 duration-700 pb-20",
            ["/dashboard", "/account", "/settings", "/help"].includes(location.pathname) 
              ? "pt-6 lg:pt-10 px-4 lg:px-12" 
              : "p-0"
          )}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
