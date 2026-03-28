import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, status, role } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Only researchers with DRAFT status need to complete their profile.
  // Super admins have full access regardless of their members.status.
  if (status === "DRAFT" && role !== "super_admin") {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
}
