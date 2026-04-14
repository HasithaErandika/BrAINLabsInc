import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Zap } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const { token, loginWithEmail } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(authError.includes("credentials") ? "Invalid email or password." : authError);
      setLoading(false);
      return;
    }

    navigate("/dashboard", { replace: true });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex font-['Inter']">
      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] bg-black flex-col justify-between p-14 relative overflow-hidden">
        {/* Abstract neural-grid */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.06]"
          viewBox="0 0 800 800"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {Array.from({ length: 12 }).map((_, r) =>
            Array.from({ length: 12 }).map((_, c) => (
              <circle key={`${r}-${c}`} cx={c * 72 + 4} cy={r * 72 + 4} r="2" fill="white" />
            ))
          )}
          {[
            "M4,4 L364,220", "M148,76 L508,292", "M220,4 L508,148",
            "M4,4 L148,220", "M364,4 L508,220", "M76,148 L364,364",
            "M4,220 L220,364", "M220,148 L508,364", "M148,4 L292,220",
            "M4,148 L292,364", "M292,4 L436,220", "M436,76 L580,292",
          ].map((d, i) => (
            <path key={i} d={d} stroke="white" strokeWidth="1" fill="none" />
          ))}
        </svg>

        {/* Gradient blobs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-violet-600 opacity-20 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 rounded-full bg-blue-500 opacity-15 blur-3xl" />

        {/* Top */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-white flex items-center justify-center">
            <img src="/logo.png" alt="BrAIN Labs" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <p className="text-white text-[11px] font-black uppercase tracking-[0.3em] leading-none">BrAIN Labs</p>
            <p className="text-zinc-500 text-[9px] uppercase tracking-[0.2em]">Admin Dashboard</p>
          </div>
        </div>

        {/* Middle */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-zinc-700 rounded-full">
            <Zap size={10} className="text-violet-400" />
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Brain-Inspired AI Research</span>
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter leading-none">
            The Lab's<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
              Command Centre
            </span>
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs font-medium">
            Manage publications, members, events and research content for BrAIN Labs Inc. at SLIIT.
          </p>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} BrAIN Labs Inc. — SLIIT
          </p>
        </div>
      </div>

      {/* ── Right panel (form) ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-zinc-50">
        <div className="w-full max-w-[400px] space-y-10">

          {/* Mobile brand */}
          <div className="lg:hidden text-center space-y-4">
            <div className="w-14 h-14 bg-black flex items-center justify-center mx-auto">
              <img src="/logo.png" alt="BrAIN Labs" className="w-10 h-10 object-contain" />
            </div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Admin Dashboard</p>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-black tracking-tight">Welcome back</h1>
            <p className="text-sm text-zinc-500">Sign in to access your lab dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@sliit.lk"
                className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-zinc-900 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-zinc-900 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs font-semibold text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-black text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-200" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-zinc-200" />
            </div>

            {/* Register */}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full h-12 bg-white border border-zinc-200 text-sm font-bold text-zinc-700 rounded-xl hover:border-zinc-900 hover:text-black transition-all"
            >
              Request Lab Access
            </button>
          </form>

          <p className="text-center text-[10px] text-zinc-400 font-medium">
            Only authorised SLIIT BrAIN Labs personnel may access this system.
          </p>
        </div>
      </div>
    </div>
  );
}
