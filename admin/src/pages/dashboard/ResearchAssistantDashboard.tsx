import { useEffect, useState } from "react";
import { BookOpen, FlaskConical, ArrowRight, FileText, GraduationCap, Users, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../hooks/useAuth";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const WORKFLOW_STEPS = [
  { n: "1", label: "Create Draft", desc: "Write and save content as a draft" },
  { n: "2", label: "Submit for Review", desc: "Send to your supervising researcher" },
  { n: "3", label: "Published", desc: "Researcher forwards · admin approves" },
];

export function ResearchAssistantDashboard({ memberId }: { memberId: number }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ publications: 0, projects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [pubs, projs] = await Promise.all([
          api.publications.list(),
          api.projects.list(),
        ]);
        setStats({ publications: pubs.length, projects: projs.length });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [memberId]);

  return (
    <div className="space-y-6">

      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900 px-8 py-10 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/[0.04] blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-white/[0.03] blur-xl pointer-events-none" />

        <div className="relative z-10">
          <p className="text-zinc-400 text-sm mb-1.5">{greeting()},</p>
          <h1 className="text-3xl font-bold tracking-tight leading-none">
            {user?.first_name} {user?.second_name}
          </h1>
          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full text-[11px] font-medium text-zinc-300">
              <Users size={11} /> Research Assistant
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {loading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-28 bg-zinc-100 rounded-xl animate-pulse" />
            ))
          : [
              { label: "Lab Publications", value: stats.publications, icon: BookOpen },
              { label: "Active Projects",  value: stats.projects,     icon: FlaskConical },
            ].map(s => (
              <div key={s.label} className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-all">
                <div className="mb-4">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                    <s.icon size={15} className="text-zinc-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold tabular-nums text-zinc-900 leading-none">{s.value}</p>
                <p className="text-xs text-zinc-500 mt-1.5">{s.label}</p>
              </div>
            ))}
      </div>

      {/* ── Workflow steps ────────────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-5">Submission Workflow</p>
        <div className="flex flex-col sm:flex-row gap-0">
          {WORKFLOW_STEPS.map((step, i) => (
            <div key={step.n} className="flex-1 flex sm:flex-col gap-4 sm:gap-3">
              {/* Step header with connector line */}
              <div className="flex items-center gap-3 sm:gap-0">
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {step.n}
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className="hidden sm:block flex-1 h-px bg-zinc-200 mx-3" />
                )}
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className="sm:hidden w-px flex-1 bg-zinc-200 mx-0 ml-3.5" style={{ minHeight: 24 }} />
                )}
              </div>
              {/* Step body */}
              <div className="sm:mt-3 pb-4 sm:pb-0">
                <p className="text-sm font-semibold text-zinc-800">{step.label}</p>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Create content — 2/3 */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Create Content</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Publications",  href: "/publications", icon: BookOpen,      desc: "Submit research papers" },
              { label: "Projects",      href: "/projects",     icon: FlaskConical,  desc: "Document research work" },
              { label: "Blog Posts",    href: "/blog",         icon: FileText,      desc: "Write lab articles" },
              { label: "Tutorials",     href: "/tutorials",    icon: GraduationCap, desc: "Create learning content" },
            ].map(a => (
              <Link
                key={a.href}
                to={a.href}
                className="flex items-center justify-between p-4 border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 rounded-xl transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                    <a.icon size={14} className="text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 leading-none">{a.label}</p>
                    <p className="text-[11px] text-zinc-400 mt-1">{a.desc}</p>
                  </div>
                </div>
                <ArrowRight size={13} className="text-zinc-300 group-hover:text-zinc-600 shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Profile CTA — 1/3 */}
        <Link to="/account" className="block">
          <div className="relative overflow-hidden bg-zinc-900 rounded-xl p-5 h-full group cursor-pointer min-h-[200px] flex flex-col justify-between">
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/[0.05] blur-xl pointer-events-none" />
            <div className="relative z-10">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <CheckCircle2 size={16} className="text-white" />
              </div>
              <p className="text-white font-semibold text-sm">Your Profile</p>
              <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
                Keep your contact information and details up to date.
              </p>
            </div>
            <div className="relative z-10 flex items-center gap-1.5 mt-4 text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors">
              Edit Profile <ArrowRight size={12} />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
