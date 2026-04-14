import { useState, useEffect } from "react";
import { FlaskConical, ShieldCheck, Info, ArrowRight, ExternalLink } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../api";
import type { Project, ApprovalStatus } from "../../types";
import { ContentPageTemplate } from "../../components/shared/ContentPageTemplate";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { renderMarkdown } from "../../lib/utils/markdown";

export default function ProjectsPage() {
  const { isAdmin, isResearcher } = useAuth();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const data = await api.projects.list();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const emptyItem: Partial<Project> = {
    title: "",
    description: "",
    content: "",
    approval_status: "DRAFT" as ApprovalStatus,
  };

  const handleSave = async (item: Partial<Project>) => {
    if (item.id) await api.projects.update(item.id as number, item);
    else await api.projects.create(item);
    await fetchItems();
  };

  const handleSubmitForReview = async (item: Project) => {
    await api.content.submit("project", item.id);
    await fetchItems();
  };

  const handleReview = async (item: Project, status: 'PENDING_ADMIN' | 'REJECTED') => {
    await api.content.review("project", item.id, status);
    await fetchItems();
  };

  const handleToggleStatus = async (item: Project) => {
    const newStatus = item.approval_status === "APPROVED" ? "REJECTED" : "APPROVED";
    if (newStatus === "APPROVED") await api.admin.approveContent("project", item.id);
    else await api.admin.rejectContent("project", item.id);
    await fetchItems();
  };

  return (
    <ContentPageTemplate<Project>
      title="Projects"
      subtitle={`${items.length} project${items.length !== 1 ? "s" : ""}.`}
      icon={FlaskConical}
      items={items}
      loading={loading}
      isAdmin={isAdmin()}
      isResearcher={isResearcher()}
      emptyItem={emptyItem}
      onSave={handleSave}
      onSubmitForReview={handleSubmitForReview}
      onReview={handleReview}
      onToggleStatus={isAdmin() ? handleToggleStatus : undefined}
      searchFields={item => [item.title, item.description || ""]}
      filterOptions={[
        { label: "ALL", value: "ALL" },
        { label: "PUBLISHED", value: "APPROVED" },
        { label: "PENDING", value: "PENDING_ADMIN" },
        { label: "DRAFT", value: "DRAFT" },
      ]}
      renderListItem={(item, onClick) => (
        <div
          key={item.id}
          onClick={onClick}
          className="group bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-sm rounded-xl p-5 cursor-pointer flex flex-col gap-4 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black text-white shrink-0">
                <FlaskConical size={14} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Project</span>
            </div>
            <Badge status={item.approval_status} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-black text-black uppercase tracking-tight leading-tight line-clamp-2">{item.title}</h3>
            {item.description && (
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight line-clamp-2 italic">
                {item.description}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-[10px] font-black text-black uppercase tracking-[0.2em] flex items-center gap-2">
              <ExternalLink size={12} /> View project
            </span>
            <ArrowRight size={14} className="text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      )}
      renderDetail={item => (
        <div className="space-y-12 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 border border-zinc-200 bg-white space-y-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Status</span>
              </div>
              <Badge status={item.approval_status} />
            </div>
            <div className="p-8 border border-zinc-200 bg-white space-y-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Info size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Created</span>
              </div>
              <p className="text-lg font-black text-black uppercase tracking-tight">
                {new Date(item.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </p>
            </div>
          </div>

          <div className="space-y-12">
            {item.description && (
              <div className="p-8 border border-zinc-200 bg-zinc-50 italic text-sm text-zinc-600 leading-relaxed font-bold uppercase tracking-tight">
                "{item.description}"
              </div>
            )}
            
            <div className="prose prose-zinc max-w-none text-black leading-loose">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 ml-1">Content</h4>
              <div className="markdown-monochrome">
                {renderMarkdown(item.content || "")}
              </div>
            </div>
          </div>
        </div>
      )}
      renderEdit={(item, setItem) => (
        <div className="space-y-10">
          <Input
            label="Project Title"
            placeholder="Enter project title..."
            value={item.title ?? ""} 
            onChange={e => setItem({ ...item, title: e.target.value })} 
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-tight text-zinc-600">
              Summary
            </label>
            <textarea
              className="input-monochrome min-h-[100px] py-4"
              placeholder="Describe the project goals..."
              value={item.description ?? ""}
              onChange={e => setItem({ ...item, description: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-tight text-zinc-600">
              Content (Markdown supported)
            </label>
            <textarea
              className="input-monochrome min-h-[400px] py-6 font-mono text-sm"
              placeholder="# Start writing..."
              value={item.content ?? ""}
              onChange={e => setItem({ ...item, content: e.target.value })}
            />
          </div>
        </div>
      )}
    />
  );
}
