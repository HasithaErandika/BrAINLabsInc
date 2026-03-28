import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ShieldOff } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: Array<"super_admin" | "researcher">;
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role } = useAuth();

  if (!role) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center">
          <ShieldOff className="w-8 h-8 text-zinc-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Access Restricted</h2>
          <p className="text-zinc-500 mt-1 text-sm max-w-xs">
            You don't have permission to view this section. Contact a super admin if you need access.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
