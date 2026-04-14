import { useState, useEffect } from "react";
import { GraduationCap, BookOpen, Calendar } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../api";
import type { Tutorial, ApprovalStatus } from "../../types";
import { ContentPageTemplate } from "../../components/shared/ContentPageTemplate";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { renderMarkdown } from "../../lib/utils/markdown";

export default function TutorialsPage() {
  const { isAdmin, isResearcher } = useAuth();
  const [items, setItems] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const data = await api.tutorials.list();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch tutorials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const emptyItem: Partial<Tutorial> = {
    title: "",
    description: "",
    content: "",
    approval_status: "DRAFT" as ApprovalStatus,
  };

  const handleSave = async (item: Partial<Tutorial>) => {
    if (item.id) await api.tutorials.update(item.id as number, item);
    else await api.tutorials.create(item);
    await fetchItems();
  };

  const handleSubmitForReview = async (item: Tutorial) => {
    await api.content.submit("tutorial", item.id);
    await fetchItems();
  };

  const handleReview = async (item: Tutorial, status: 'PENDING_ADMIN' | 'REJECTED') => {
    await api.content.review("tutorial", item.id, status);
    await fetchItems();
  };

  const handleToggleStatus = async (item: Tutorial) => {
    const newStatus = item.approval_status === "APPROVED" ? "REJECTED" : "APPROVED";
    if (newStatus === "APPROVED") await api.admin.approveContent("tutorial", item.id);
    else await api.admin.rejectContent("tutorial", item.id);
    await fetchItems();
  };

  return (
    <ContentPageTemplate<Tutorial>
      title="Tutorials"
      subtitle={`${items.length} tutorial${items.length !== 1 ? "s" : ""} available.`}
      icon={GraduationCap}
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
                <GraduationCap size={14} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tutorial</span>
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

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2 text-black">
              <BookOpen size={12} /> View tutorial
            </span>
            <span className="flex items-center gap-2 text-zinc-400">
               <Calendar size={12} /> {new Date(item.created_at).toLocaleDateString()}
            </span>
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
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 ml-1">Content</h4>
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
            placeholder="Enter tutorial title..."
            value={item.title ?? ""} 
            onChange={e => setItem({...item, title: e.target.value})} 
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-tight text-zinc-600">
              Summary
            </label>
            <textarea
              className="input-monochrome min-h-[100px] py-4"
              placeholder="What will learners achieve..."
              value={item.description ?? ""}
              onChange={e => setItem({...item, description: e.target.value})}
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
              onChange={e => setItem({...item, content: e.target.value})}
            />
          </div>
        </div>
      )}
    />
  );
}
