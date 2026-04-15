import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, user, _hasHydrated } = useAuth();

  // If the store hasn't hydrated yet, don't decide on redirection
  if (!_hasHydrated) {
    return null; // Or a minimal loading spinner
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Research assistants who haven't selected a supervisor yet
  // are given role "pending_setup" in their JWT.
  if (user?.role === "pending_setup") {
    const currentPath = window.location.pathname;
    if (!currentPath.startsWith("/setup")) {
      return <Navigate to="/setup/supervisor" replace />;
    }
  }

  // Research assistants who have a supervisor but admin hasn't approved yet
  if (
    user?.role === "research_assistant" &&
    !user.assigned_by_researcher_id &&
    user?.approval_status === "PENDING_ADMIN"
  ) {
    const currentPath = window.location.pathname;
    if (!currentPath.startsWith("/setup")) {
      return <Navigate to="/setup/supervisor" replace />;
    }
  }

  return <>{children}</>;
}

