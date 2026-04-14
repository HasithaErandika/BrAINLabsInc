import { useState, useEffect } from "react";
import { BookOpen, Calendar, Image as ImageIcon, ExternalLink, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../api";
import type { Blog, ApprovalStatus } from "../../types";
import { ContentPageTemplate } from "../../components/shared/ContentPageTemplate";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { renderMarkdown } from "../../lib/utils/markdown";

export default function BlogPage() {
  const { isAdmin, isResearcher } = useAuth();
  const [items, setItems] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const data = await api.blogs.list();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const emptyItem: Partial<Blog> = {
    title: "",
    content: "",
    description: "",
    approval_status: "DRAFT" as ApprovalStatus,
  };

  const handleSave = async (item: Partial<Blog>) => {
    if (item.id) await api.blogs.update(item.id as number, item);
    else await api.blogs.create(item);
    await fetchItems();
  };

  const handleSubmitForReview = async (item: Blog) => {
    await api.content.submit("blog", item.id);
    await fetchItems();
  };

  const handleReview = async (item: Blog, status: 'PENDING_ADMIN' | 'REJECTED') => {
    await api.content.review("blog", item.id, status);
    await fetchItems();
  };

  const handleToggleStatus = async (item: Blog) => {
    const newStatus = item.approval_status === "APPROVED" ? "REJECTED" : "APPROVED";
    if (newStatus === "APPROVED") await api.admin.approveContent("blog", item.id);
    else await api.admin.rejectContent("blog", item.id);
    await fetchItems();
  };

  return (
    <ContentPageTemplate<Blog>
      title="Articles"
      subtitle={`${items.length} article${items.length !== 1 ? "s" : ""}.`}
      icon={BookOpen}
      items={items}
      loading={loading}
      isAdmin={isAdmin()}
      isResearcher={isResearcher()}
      emptyItem={emptyItem}
      onSave={handleSave}
      onSubmitForReview={handleSubmitForReview}
      onReview={handleReview}
      onToggleStatus={isAdmin() ? handleToggleStatus : undefined}
      searchFields={(item) => [item.title, item.description || ""]}
      filterOptions={[
        { label: "ALL", value: "ALL" },
        { label: "APPROVED", value: "APPROVED" },
        { label: "PENDING", value: "PENDING_ADMIN" },
        { label: "DRAFT", value: "DRAFT" },
      ]}
      renderListItem={(item, onClick) => (
        <div 
          key={item.id} 
          onClick={onClick}
          className="group bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-sm rounded-xl p-5 cursor-pointer flex flex-col gap-4 transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black text-white shrink-0">
                <ImageIcon size={14} />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <Calendar size={12} />
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <Badge status={item.approval_status} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-black text-black uppercase tracking-tight leading-tight line-clamp-2">{item.title}</h2>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-tight line-clamp-2 italic">
              {item.description || "No metadata provided."}
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-[10px] font-black text-black uppercase tracking-[0.2em] flex items-center gap-2">
              <ExternalLink size={12} /> Read article
            </span>
            <ArrowRight size={14} className="text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      )}
      renderDetail={(item) => (
        <div className="space-y-12 pb-20">
           {item.description && (
            <div className="p-8 border border-zinc-200 bg-zinc-50 italic text-sm text-zinc-600 leading-relaxed font-bold uppercase tracking-tight">
              "{item.description}"
            </div>
          )}
           <div className="prose prose-zinc max-w-none text-black leading-loose">
              <div className="markdown-monochrome">
                {renderMarkdown(item.content || "")}
              </div>
           </div>
        </div>
      )}
      renderEdit={(item, setItem) => (
        <div className="space-y-10">
          <Input
            label="Title"
            placeholder="Enter article title..."
            value={item.title || ""} 
            onChange={e => setItem({ ...item, title: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-tight text-zinc-600">
              Description
            </label>
            <textarea
              placeholder="Brief summary of the article..."
              value={item.description || ""}
              onChange={e => setItem({ ...item, description: e.target.value })}
              className="input-monochrome min-h-[100px] py-4"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-tight text-zinc-600">
              Content (Markdown supported)
            </label>
            <textarea
              className="input-monochrome min-h-[400px] py-6 font-mono text-sm"
              placeholder="# Start writing..."
              value={item.content || ""}
              onChange={e => setItem({ ...item, content: e.target.value })}
            />
          </div>
        </div>
      )}
    />
  );
}