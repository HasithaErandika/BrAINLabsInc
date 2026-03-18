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
  Menu,
  X,
  Brain,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/utils";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["super_admin", "researcher"] },
  { label: "Publications", path: "/publications", icon: BookOpen, roles: ["super_admin", "researcher"] },
  { label: "Blog Posts", path: "/blog", icon: FileText, roles: ["super_admin", "researcher"] },
  { label: "Research", path: "/research", icon: FlaskConical, roles: ["super_admin", "researcher"] },
  { label: "Events", path: "/events", icon: CalendarDays, roles: ["super_admin", "researcher"] },
  { label: "Users", path: "/users", icon: Users, roles: ["super_admin"] },
] as const;

export function AppLayout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredNav = navItems.filter((item) =>
    role ? item.roles.includes(role as never) : false
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-zinc-100">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <Brain className="w-4.5 h-4.5 text-white" size={18} />
        </div>
        <div>
          <p className="font-bold text-sm text-zinc-900 leading-tight">BrAIN Labs</p>
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Admin Console</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {filteredNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn("nav-link", isActive && "active")
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-zinc-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-50">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">
              {user?.name?.[0] ?? "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">{user?.name ?? "User"}</p>
            <p className="text-xs text-zinc-400 truncate">{user?.email ?? ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 mt-1 text-sm text-zinc-500 rounded-lg hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-zinc-100 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-white border-r border-zinc-100 animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3.5 border-b border-zinc-100">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
              <Brain size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm text-zinc-900">BrAIN Labs Admin</span>
          </div>
          <div className="ml-auto">
            <span className={`role-badge-${role ?? "researcher"}`}>
              {role === "super_admin" ? "Super Admin" : "Researcher"}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
