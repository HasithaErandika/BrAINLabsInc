import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Brain, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function Login() {
  const { token, loginWithEmail } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    const { error: authError } = await loginWithEmail(email, password);

    if (authError) {
      setError(authError);
      setLoading(false);
      return;
    }

    // loginWithEmail already set the session — navigate to dashboard
    navigate("/dashboard", { replace: true });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans antialiased text-black">
      <div className="w-full max-w-sm space-y-12">

        {/* Logo */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-black flex items-center justify-center">
            <Brain size={28} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">BrAIN Labs</h1>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-400 mt-1">Admin Console</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-zinc-50 border border-zinc-200 p-3 flex items-start gap-3">
              <AlertCircle size={16} className="text-black mt-0.5 shrink-0" />
              <p className="text-xs font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@brainlabsinc.org"
              className="w-full bg-white border-2 border-zinc-100 px-4 py-3 text-sm transition-all focus:border-black focus:outline-none placeholder:text-zinc-300"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border-2 border-zinc-100 px-4 py-3 text-sm transition-all focus:border-black focus:outline-none placeholder:text-zinc-300"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="group w-full bg-black text-white hover:bg-zinc-800 py-4 px-6 font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Enter Console
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-8 border-t border-zinc-100 text-center space-y-2">
          <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-medium">
            Authorized Personnel Only
          </p>
          <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">
            &copy; {new Date().getFullYear()} BrAIN Labs Inc.
          </p>
        </div>
      </div>
    </div>
  );
}
