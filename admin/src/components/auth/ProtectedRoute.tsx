import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, _hasHydrated } = useAuth();

  // If the store hasn't hydrated yet, don't decide on redirection
  if (!_hasHydrated) {
    return null; // Or a minimal loading spinner
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
