import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Brain, Loader2 } from "lucide-react";

/**
 * Handles the redirect back from the Ballerina Google OAuth flow.
 * The backend redirects here with: ?token=xxx&role=yyy&name=yyy&email=yyy&avatar=yyy
 *
 * Dev bypass: visiting /?devlogin=1 in App.tsx redirects here with mock params.
 */
export default function AuthCallback() {
  const [params] = useSearchParams();
  const { setSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    const role = params.get("role") as "super_admin" | "researcher" | null;
    const name = params.get("name");
    const email = params.get("email");
    const avatar = params.get("avatar");

    if (token && role && name && email) {
      setSession(token, role, { name, email, avatar: avatar ?? undefined });
      navigate("/dashboard", { replace: true });
    } else {
      // No valid params — send back to login
      navigate("/login", { replace: true });
    }
  }, [params, setSession, navigate]);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
          <Brain size={22} className="text-white" />
        </div>
        <div className="flex items-center gap-2 text-zinc-500">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Completing sign in…</span>
        </div>
      </div>
    </div>
  );
}
