import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleGuard } from "./components/auth/RoleGuard";
import { AppLayout } from "./components/layout/AppLayout";
import Login from "./pages/auth/Login";
import CompleteProfile from "./pages/auth/CompleteProfile";
import Dashboard from "./pages/dashboard/Dashboard";
import Publications from "./pages/content/Publications";
import Blog from "./pages/content/Blog";
import Events from "./pages/content/Events";
import Grants from "./pages/content/Grants";
import Projects from "./pages/content/Projects";
import Tutorials from "./pages/content/Tutorials";
import Users from "./pages/users/Users";
import Account from "./pages/account/Account";
import Settings from "./pages/settings/Settings";

// Dev-login bypass: visiting /?devlogin=1 sets a mock super_admin session
// so you can explore the full UI without a running backend.
function DevLoginHandler() {
  const [params] = useSearchParams();
  const { setSession, token } = useAuth();

  useEffect(() => {
    if (params.get("devlogin") === "1" && !token) {
      setSession("dev-mock-token", "super_admin", {
        id: "mock-id",
        name: "Dr. Asel Silva",
        email: "asel@brainlabsinc.org",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AS&backgroundColor=000000&textColor=ffffff",
        slug: "asel-silva"
      }, "PUBLISHED");
    }
  }, [params, setSession, token]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <DevLoginHandler />
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />

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
          <Route path="events" element={<Events />} />
          <Route path="projects" element={<Projects />} />
          <Route path="grants" element={<Grants />} />
          <Route path="tutorials" element={<Tutorials />} />
          <Route
            path="users"
            element={
              <RoleGuard allowedRoles={["super_admin"]}>
                <Users />
              </RoleGuard>
            }
          />
          
          <Route path="account" element={<Account />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Navigate to="/account" replace />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
