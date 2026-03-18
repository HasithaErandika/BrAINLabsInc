import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleGuard } from "./components/RoleGuard";
import { AppLayout } from "./components/AppLayout";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Publications from "./pages/Publications";
import Blog from "./pages/Blog";
import Research from "./pages/Research";
import Events from "./pages/Events";
import Users from "./pages/Users";

// Dev-login bypass: visiting /?devlogin=1 sets a mock super_admin session
// so you can explore the full UI without a running backend.
function DevLoginHandler() {
  const [params] = useSearchParams();
  const { setSession, token } = useAuth();

  useEffect(() => {
    if (params.get("devlogin") === "1" && !token) {
      setSession("dev-mock-token", "super_admin", {
        name: "Dr. Asel Silva",
        email: "asel@brainlabsinc.org",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AS&backgroundColor=000000&textColor=ffffff",
      });
    }
  }, [params, setSession, token]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <DevLoginHandler />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected admin routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="publications" element={<Publications />} />
          <Route path="blog" element={<Blog />} />
          <Route path="research" element={<Research />} />
          <Route path="events" element={<Events />} />
          <Route
            path="users"
            element={
              <RoleGuard allowedRoles={["super_admin"]}>
                <Users />
              </RoleGuard>
            }
          />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
