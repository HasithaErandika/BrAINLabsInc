import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  FlaskConical,
  CalendarDays,
  Users,
  LogOut,
  Bell,
  Briefcase,
  GraduationCap,
  Settings,
  UserCircle,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useSessionTimeout } from "../../hooks/useSessionTimeout";
import { Button } from "../ui/Button";

const mainNav = [
  { label: "Dashboard",    path: "/dashboard",         icon: LayoutDashboard, roles: ["admin", "researcher", "research_assistant"] },
  { label: "Publications", path: "/publications",       icon: BookOpen,        roles: ["admin", "researcher", "research_assistant"] },
  { label: "Blog",         path: "/blog",               icon: FileText,        roles: ["admin", "researcher", "research_assistant"] },
  { label: "Projects",     path: "/projects",           icon: FlaskConical,    roles: ["admin", "researcher", "research_assistant"] },
  { label: "Events",       path: "/events",             icon: CalendarDays,    roles: ["admin", "researcher", "research_assistant"] },
  { label: "Grants",       path: "/grants",             icon: Briefcase,       roles: ["admin", "researcher", "research_assistant"] },
  { label: "Tutorials",    path: "/tutorials",          icon: GraduationCap,   roles: ["admin", "researcher", "research_assistant"] },
  { label: "Members",      path: "/dashboard/members",  icon: Users,           roles: ["admin"] },
] as const;

const settingsNav = [
  { label: "Profile",  path: "/account",  icon: UserCircle, roles: ["admin", "researcher", "research_assistant"] },
  { label: "Settings", path: "/settings", icon: Settings,   roles: ["admin", "researcher", "research_assistant"] },
] as const;

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useSessionTimeout(handleLogout);

  const filteredMain = mainNav.filter(item =>
    user ? item.roles.includes(user.role as never) : false
  );
  const filteredSettings = settingsNav.filter(item =>
    user ? item.roles.includes(user.role as never) : false
  );

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-4 px-6 py-4 rounded-xl transition-all text-xs font-bold ${
      isActive
        ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200"
        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
    }`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white p-6">
      <div className="px-4 py-6 mb-8 bg-zinc-50 rounded-2xl border border-zinc-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl border border-zinc-200 p-2 flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="BrAIN Labs" className="w-full h-full object-contain grayscale" />
          </div>
          <div>
            <p className="font-black text-base text-zinc-900 tracking-tight leading-none uppercase">BrAIN Labs</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-12 px-2 scroll-hide">
        <div className="space-y-1">
          {filteredMain.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={navLinkClass}
            >
              <item.icon size={18} />
              <span className="tracking-tight">{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="space-y-1 pb-10">
          {filteredSettings.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={navLinkClass}
            >
              <item.icon size={18} />
              <span className="tracking-tight">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="mt-auto pt-6 border-t border-zinc-100">
        <div className="bg-zinc-50 rounded-2xl p-4 flex items-center gap-4 border border-zinc-100">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm">
            {user?.first_name?.[0]}{user?.second_name?.[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-zinc-900 leading-none truncate uppercase tracking-tight">
              {user?.first_name} {user?.second_name}
            </p>
            <p className="text-[10px] text-zinc-400 font-bold mt-1 uppercase tracking-widest truncate">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden text-zinc-900 antialiased font-['Inter']">
      <aside className="hidden lg:flex flex-col w-80 shrink-0 border-r border-zinc-100 shadow-sm z-40">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden animate-enter">
          <div
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-80 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 lg:h-24 bg-white/80 backdrop-blur-md border-b border-zinc-100 flex items-center justify-between px-8 lg:px-12 shrink-0 z-30">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all font-black text-[10px]"
            >
               MENU
            </button>
            <div className="hidden lg:block">
              <h1 className="text-xl font-black text-zinc-900 tracking-tight uppercase">Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(v => !v)}
                className={`p-3.5 rounded-xl transition-all flex items-center gap-3 border ${
                  showNotifications ? "bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-zinc-200" : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900 hover:text-zinc-900"
                }`}
              >
                <Bell size={18} />
              </button>

              {showNotifications && (
                <div className="absolute top-16 right-0 w-80 z-50 animate-enter">
                  <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-zinc-50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Central Feed</p>
                      <button onClick={() => setShowNotifications(false)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="py-20 flex flex-col items-center gap-4 text-center px-8 bg-white">
                      <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300 border border-zinc-100">
                        <Bell size={24} />
                      </div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-relaxed">System Secure<br/>Zero Inbound Signals</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => setShowSignOutConfirm(true)}
              className="hidden sm:flex text-[10px] font-black uppercase tracking-widest h-12 px-8 rounded-xl border border-zinc-200 hover:border-zinc-900"
            >
              Sign Out
            </Button>
          </div>
        </header>

        {showSignOutConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-enter">
            <div
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md"
              onClick={() => setShowSignOutConfirm(false)}
            />
            <div className="relative bg-white border border-zinc-200 p-12 w-full max-w-md rounded-3xl shadow-2xl text-center">
              <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center text-white mx-auto mb-10 shadow-xl shadow-zinc-200">
                <LogOut size={40} />
              </div>
              <h2 className="text-3xl font-black text-zinc-900 tracking-tighter mb-4 uppercase">Sign Out?</h2>
              <p className="text-sm text-zinc-500 font-bold mb-10 uppercase tracking-wider leading-relaxed">
                Your session will be cleared from this device.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <Button variant="outline" onClick={() => setShowSignOutConfirm(false)} className="h-14 rounded-2xl font-black text-[11px]">
                  Cancel
                </Button>
                <Button onClick={handleLogout} className="h-14 rounded-2xl font-black text-[11px] bg-zinc-900 text-white">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-zinc-50 p-6 lg:p-10 scroll-hide">
          <div className="max-w-7xl mx-auto h-full">
            <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm min-h-full p-8 lg:p-16">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
