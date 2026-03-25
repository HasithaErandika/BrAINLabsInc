import { useState, useEffect } from "react";
import {
  Plus, Search, Calendar, CheckCircle2, Filter,
  Pencil, Trash2, Image as ImageIcon, ArrowLeft, Lock,
  Save, ChevronDown, ExternalLink, BookOpen
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { api, type Blog as BlogType } from "../../lib/api";
import { cn } from "../../lib/utils";

/* ─── Markdown → React renderer (no external deps) ────────────────────────── */
function inlineFormat(text: string, _key: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  const re = /(`[^`]+`)|(\*\*\*([^*]+)\*\*\*)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(_([^_]+)_)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > cursor) parts.push(text.slice(cursor, m.index));
    if (m[1]) parts.push(<code key={m.index} className="px-1.5 py-0.5 bg-zinc-100 text-rose-600 rounded text-[0.85em] font-mono">{m[1].slice(1, -1)}</code>);
    else if (m[2]) parts.push(<strong key={m.index} className="font-bold italic text-zinc-900">{m[3]}</strong>);
    else if (m[4]) parts.push(<strong key={m.index} className="font-bold text-zinc-900">{m[5]}</strong>);
    else if (m[6]) parts.push(<em key={m.index} className="italic text-zinc-600">{m[7]}</em>);
    else if (m[8]) parts.push(<em key={m.index} className="italic text-zinc-600">{m[9]}</em>);
    else if (m[10]) parts.push(<a key={m.index} href={m[12]} className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800 transition-colors" target="_blank" rel="noopener noreferrer">{m[11]}</a>);
    cursor = m.index + m[0].length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts.length === 1 && typeof parts[0] === "string" ? text : <>{parts}</>;
}

function renderMarkdown(md: string): React.ReactNode[] {
  const lines = md.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trimStart().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) { codeLines.push(lines[i]); i++; }
      nodes.push(<div key={`cb${i}`} className="my-6 rounded-2xl overflow-hidden border border-zinc-200 shadow-xl text-sm"><div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900"><div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400/80" /><span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" /><span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" /></div>{lang && <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{lang}</span>}</div><pre className="bg-zinc-950 px-5 py-5 overflow-x-auto font-mono leading-relaxed text-zinc-300"><code>{codeLines.join("\n")}</code></pre></div>);
      i++; continue;
    }
    if (line.startsWith(">")) {
      const bqLines: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) { bqLines.push(lines[i].slice(1).trimStart()); i++; }
      nodes.push(<blockquote key={`bq${i}`} className="my-6 pl-6 border-l-4 border-zinc-900 italic text-zinc-600 leading-relaxed text-lg space-y-2">{bqLines.map((l, idx) => <p key={idx}>{inlineFormat(l, `bq${idx}`)}</p>)}</blockquote>);
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) { nodes.push(<hr key={`hr${i}`} className="my-10 border-zinc-200" />); i++; continue; }
    const hm = line.match(/^(#{1,6})\s+(.+)/);
    if (hm) {
      const level = hm[1].length; const text = hm[2];
      const styles = ["", "text-4xl font-black text-zinc-900 mt-12 mb-6 tracking-tighter leading-tight", "text-2xl font-black text-zinc-900 mt-10 mb-4 tracking-tight", "text-xl font-bold text-zinc-800 mt-8 mb-3", "text-lg font-bold text-zinc-800 mt-6 mb-2", "text-base font-bold text-zinc-700 mt-4 mb-2", "text-sm font-bold text-zinc-600 mt-3 mb-1"];
      const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";
      nodes.push(<Tag key={`h${i}`} className={styles[level]}>{inlineFormat(text, `h${i}`)}</Tag>);
      i++; continue;
    }
    if (line.includes("|") && lines[i + 1]?.match(/^\s*\|?[\s\-|:]+\|?\s*$/)) {
      const headerCells = line.split("|").map(c => c.trim()).filter(Boolean); i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) { rows.push(lines[i].split("|").map(c => c.trim()).filter(Boolean)); i++; }
      nodes.push(<div key={`tbl${i}`} className="my-8 overflow-x-auto rounded-2xl border border-zinc-200 shadow-sm"><table className="w-full text-sm"><thead className="bg-zinc-50 border-b border-zinc-200"><tr>{headerCells.map((c, idx) => <th key={idx} className="px-5 py-4 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">{inlineFormat(c, `th${idx}`)}</th>)}</tr></thead><tbody className="divide-y divide-zinc-100">{rows.map((row, ridx) => <tr key={ridx} className="hover:bg-zinc-50/50 transition-colors">{row.map((cell, cidx) => <td key={cidx} className="px-5 py-4 text-zinc-700">{inlineFormat(cell, `td${ridx}${cidx}`)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    if (/^\s*[-*+]\s/.test(line)) {
      const items: Array<{ text: string; depth: number }> = [];
      while (i < lines.length && /^\s*[-*+]\s/.test(lines[i])) { const depth = lines[i].search(/\S/); items.push({ text: lines[i].replace(/^\s*[-*+]\s/, ""), depth }); i++; }
      nodes.push(<ul key={`ul${i}`} className="my-6 space-y-3">{items.map((it, idx) => <li key={idx} className="flex gap-4 text-zinc-700 leading-relaxed" style={{ paddingLeft: it.depth * 16 }}><span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-zinc-900 shrink-0" /><span>{inlineFormat(it.text, `li${idx}`)}</span></li>)}</ul>);
      continue;
    }
    const imgM = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgM) { nodes.push(<figure key={`fig${i}`} className="my-10"><img src={imgM[2]} alt={imgM[1]} className="w-full rounded-[2.5rem] border border-zinc-200 shadow-2xl" />{imgM[1] && <figcaption className="mt-4 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">{imgM[1]}</figcaption>}</figure>); i++; continue; }
    if (line.trim() === "") { i++; continue; }
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].match(/^#{1,6}\s/) && !lines[i].startsWith(">") && !lines[i].startsWith("```") && !/^\s*[-*+]\s/.test(lines[i])) { paraLines.push(lines[i]); i++; }
    if (paraLines.length) nodes.push(<p key={`p${i}`} className="my-6 text-zinc-700 leading-[1.8] text-lg font-medium">{inlineFormat(paraLines.join(" "), `p${i}`)}</p>);
  }
  return nodes;
}

/* ─── Shared UI ───────────────────────────────────────────────────────────── */
function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    PENDING_REVIEW: "bg-amber-50 text-amber-700 ring-amber-200/70",
    DRAFT: "bg-zinc-100 text-zinc-500 ring-zinc-200",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 shadow-sm", map[status] ?? map.DRAFT)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", status === "PUBLISHED" ? "bg-emerald-500 animate-pulse" : status === "PENDING_REVIEW" ? "bg-amber-500 animate-pulse" : "bg-zinc-400")} />
      {status.replace("_", " ")}
    </span>
  );
}

function Field({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all text-sm font-medium text-zinc-900 placeholder:text-zinc-400";
const selectCls = inputCls + " appearance-none";

const EMPTY: Partial<BlogType> = { title: "", slug: "", content: "", excerpt: "", image_url: "", tags: [], status: "DRAFT" };
type View = "list" | "detail" | "edit";

export default function Blog() {
  const { token, role, user } = useAuth();
  const isAdmin = role === "super_admin";
  const memberId = user?.id;
  const t = token ?? "";

  const [items, setItems] = useState<BlogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<BlogType>>(EMPTY);
  const [view, setView] = useState<View>("list");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  useEffect(() => {
    if (!t) return;
    api.blog.list(t).then((data) => {
      const filtered = isAdmin ? data.filter((p) => p.status !== "DRAFT") : memberId ? data.filter((p) => p.member_id === memberId) : data;
      setItems(filtered);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [t, isAdmin, memberId]);

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing.id) {
        const updated = await api.blog.update(t, editing.id, editing);
        setItems((p) => p.map((x) => (x.id === updated.id ? updated : x)));
        setSelectedId(updated.id!);
        setView("detail");
      } else {
        const created = await api.blog.create(t, editing);
        setItems((p) => [created, ...p]);
        setSelectedId(created.id!);
        setView("detail");
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleTogglePublish = async (post: BlogType) => {
    const updated = await api.blog.update(t, post.id!, { status: post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" });
    setItems((p) => p.map((x) => (x.id === updated.id ? updated : x)));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this post?")) return;
    await api.blog.delete(t, id);
    setItems((p) => p.filter((x) => x.id !== id));
    setSelectedId(null);
    setView("list");
  };

  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

  const filtered = items.filter((i) => {
    const s = i.title.toLowerCase().includes(search.toLowerCase()) || (i.author_name ?? "").toLowerCase().includes(search.toLowerCase());
    const st = filterStatus === "ALL" || i.status === filterStatus;
    return s && st;
  });

  if (loading) return (
    <div className="flex-1 p-10 space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-3xl bg-zinc-100 animate-pulse" />)}
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     EDIT VIEW
  ══════════════════════════════════════════════════════════════════════════ */
  if (view === "edit")
    return (
      <div className="min-h-screen bg-[#fafaf9]">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl px-6 py-4 shadow-sm">
          <button onClick={() => setView(editing.id ? "detail" : "list")} className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors group">
            <div className="p-2 rounded-xl group-hover:bg-zinc-100 transition-colors"><ArrowLeft size={16} /></div>
            {editing.id ? "Back to Post" : "Back to List"}
          </button>
          <button onClick={handleSave} disabled={saving || !editing.title} className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 disabled:opacity-40 transition-all active:scale-95">
            <Save size={14} />
            {saving ? "Saving…" : editing.id ? "Update Post" : "Create Post"}
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{editing.id ? "Edit Article" : "Draft New Article"}</h1>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Compose deep technical insights for the ecosystem.</p>
          </div>

          <div className="bg-white border border-zinc-200/60 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm">
            <Field label="Title" full>
              <input className={inputCls} value={editing.title ?? ""} onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value, slug: slugify(e.target.value) }))} placeholder="Title of the article…" />
            </Field>
            <Field label="URL Slug">
              <input className={inputCls + " font-mono text-xs"} value={editing.slug ?? ""} onChange={(e) => setEditing((p) => ({ ...p, slug: e.target.value }))} placeholder="url-friendly-slug" />
            </Field>
            <Field label="Status">
              <div className="relative">
                <select className={selectCls} value={editing.status ?? "DRAFT"} onChange={(e) => setEditing((p) => ({ ...p, status: e.target.value as BlogType["status"] }))}>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_REVIEW">Submit for Review</option>
                  {isAdmin && <option value="PUBLISHED">Published</option>}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-zinc-400 pointer-events-none" />
              </div>
            </Field>
            <Field label="Cover Image URL" full>
              <div className="relative">
                <ImageIcon size={14} className="absolute left-3.5 top-3.5 text-zinc-400" />
                <input className={inputCls + " pl-10"} value={editing.image_url ?? ""} onChange={(e) => setEditing((p) => ({ ...p, image_url: e.target.value }))} placeholder="https://images.unsplash.com/…" />
              </div>
            </Field>
            <Field label="Excerpt / Summary" full>
              <textarea className={inputCls + " min-h-[100px] resize-none"} value={editing.excerpt ?? ""} onChange={(e) => setEditing((p) => ({ ...p, excerpt: e.target.value }))} placeholder="A brief hook for the article card…" />
            </Field>
            <Field label="Content (Markdown)" full>
              <textarea className="w-full min-h-[500px] p-6 bg-zinc-950 text-zinc-300 font-mono text-sm rounded-3xl resize-y focus:outline-none focus:ring-4 focus:ring-zinc-900/10 shadow-inner" value={editing.content ?? ""} onChange={(e) => setEditing((p) => ({ ...p, content: e.target.value }))} placeholder="# Write your article here..." />
            </Field>
            <Field label="Tags (Comma Separated)" full>
               <input className={inputCls} value={(editing.tags ?? []).join(", ")} onChange={(e) => setEditing((p) => ({ ...p, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) }))} placeholder="ai, research, neuroscience" />
            </Field>
          </div>
        </div>
      </div>
    );

  /* ══════════════════════════════════════════════════════════════════════════
     DETAIL VIEW
  ══════════════════════════════════════════════════════════════════════════ */
  if (view === "detail" && selectedItem)
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl px-6 py-4">
          <button onClick={() => setView("list")} className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors group">
            <div className="p-2 rounded-xl group-hover:bg-zinc-100 transition-colors"><ArrowLeft size={16} /></div>
            Back to Articles
          </button>
          <div className="flex items-center gap-2">
            {!isAdmin && (
              <>
                <button onClick={() => { setEditing(selectedItem); setView("edit"); }} className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-900 text-xs font-bold rounded-xl hover:bg-zinc-200 transition-all active:scale-95">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(selectedItem.id!)} className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-all active:scale-95">
                  <Trash2 size={14} /> Delete
                </button>
              </>
            )}
            {isAdmin && selectedItem.status === "PENDING_REVIEW" && (
              <button onClick={() => handleTogglePublish(selectedItem)} className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-600/20">
                <CheckCircle2 size={14} /> Approve & Publish
              </button>
            )}
            {isAdmin && selectedItem.status === "PUBLISHED" && (
              <button onClick={() => handleTogglePublish(selectedItem)} className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-600 text-xs font-bold rounded-xl hover:bg-zinc-50 transition-all active:scale-95">
                <Lock size={14} /> Unpublish
              </button>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
           {selectedItem.image_url && (
              <div className="w-full aspect-[21/9] overflow-hidden bg-zinc-100 mb-12">
                 <img src={selectedItem.image_url} alt={selectedItem.title} className="w-full h-full object-cover" />
              </div>
           )}
           <div className="px-6 space-y-10">
              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <Badge status={selectedItem.status} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5"><Calendar size={12} /> {fmt(selectedItem.published_date)}</span>
                 </div>
                 <h1 className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tighter leading-[1.05]">{selectedItem.title}</h1>
                 <div className="flex items-center gap-3 text-xs font-bold text-zinc-500">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center uppercase font-black text-[10px]">{selectedItem.author_name?.[0] || "?"}</div>
                    <span>{selectedItem.author_name || "Unknown Author"}</span>
                    <span className="text-zinc-200">/</span>
                    <span className="text-zinc-400 font-mono text-[10px]">/{selectedItem.slug}</span>
                 </div>
              </div>

              {selectedItem.excerpt && (
                 <div className="p-8 bg-zinc-50 border-l-4 border-zinc-900 rounded-r-3xl italic text-xl text-zinc-600 leading-relaxed font-medium">
                    "{selectedItem.excerpt}"
                 </div>
              )}

              <div className="space-y-6 md-content border-t border-zinc-100 pt-10">
                 {renderMarkdown(selectedItem.content || "")}
              </div>

              {selectedItem.tags && selectedItem.tags.length > 0 && (
                 <div className="flex flex-wrap gap-2 pt-10 border-t border-zinc-100">
                    {selectedItem.tags.map(tag => (
                       <span key={tag} className="px-4 py-1.5 bg-zinc-50 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-zinc-200/60 hover:border-zinc-300 transition-colors cursor-default">#{tag}</span>
                    ))}
                 </div>
              )}
           </div>
        </div>
      </div>
    );

  /* ══════════════════════════════════════════════════════════════════════════
     LIST VIEW
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <div className="sticky top-0 z-30 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl px-6 py-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={14} className="text-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Technical Publication</span>
            </div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Blog <span className="text-zinc-400">Insights</span></h1>
            <p className="text-xs text-zinc-500 mt-1 font-medium">{items.length} {items.length === 1 ? "article" : "articles"} indexed</p>
          </div>
          {!isAdmin && (
            <button onClick={() => { setEditing(EMPTY); setView("edit"); }} className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-xs font-bold rounded-2xl hover:bg-zinc-800 hover:shadow-lg transition-all active:scale-95 shrink-0 shadow-lg shadow-zinc-900/10">
              <Plus size={16} strokeWidth={2.5} /> New Article
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-zinc-200/60 bg-white/50 px-6 py-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center max-w-7xl mx-auto">
          <div className="relative flex-1 max-w-md group">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
            <input type="text" placeholder="Search insights…" className="w-full pl-9 pr-4 py-2.5 text-xs bg-zinc-100/60 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 focus:bg-white transition-all placeholder:text-zinc-400 font-medium" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl w-fit">
            {["ALL", "PUBLISHED", "PENDING_REVIEW", "DRAFT"].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)} className={cn("px-3.5 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all whitespace-nowrap", filterStatus === s ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>
                {s === "ALL" ? "All" : s === "PENDING_REVIEW" ? "Pending" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {filtered.length === 0 ? (
          <div className="py-32 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-zinc-100 flex items-center justify-center shadow-inner">
              <Filter size={28} className="text-zinc-300" />
            </div>
            <p className="text-zinc-400 font-bold text-sm">No articles match your filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <article key={post.id} onClick={() => { setSelectedId(post.id!); setView("detail"); }} className="group relative bg-white border border-zinc-200/60 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-indigo-900/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-[420px]">
                <div className="aspect-[16/10] overflow-hidden bg-zinc-100 relative">
                   {post.image_url ? (
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300">
                         <ImageIcon size={40} strokeWidth={1} />
                      </div>
                   )}
                   <div className="absolute top-4 left-4">
                      <Badge status={post.status} />
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-7 flex flex-col flex-1 gap-4 relative">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                         <Calendar size={12} /> {fmt(post.published_date)}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" onClick={e => e.stopPropagation()}>
                         {!isAdmin && (
                            <button onClick={() => { setEditing(post); setView("edit"); }} className="p-2 bg-zinc-50 rounded-xl hover:bg-zinc-900 hover:text-white transition-colors"><Pencil size={13} /></button>
                         )}
                      </div>
                   </div>

                   <h2 className="text-xl font-black text-zinc-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{post.title}</h2>
                   <p className="text-sm font-medium text-zinc-500 leading-relaxed line-clamp-2">{post.excerpt || "No summary provided."}</p>

                   <div className="mt-auto pt-6 border-t border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[9px] font-black uppercase">{post.author_name?.[0] || "?"}</div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 truncate max-w-[100px]">{post.author_name || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 group-hover:gap-3 transition-all">
                         Read Insight <ExternalLink size={10} strokeWidth={3} />
                      </div>
                   </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}