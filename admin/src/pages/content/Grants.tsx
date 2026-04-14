import { useState, useEffect } from "react";
import { Briefcase, Calendar, ShieldCheck, FileText, ArrowRight, Info } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../api";
import type { Grant, ApprovalStatus } from "../../types";
import { ContentPageTemplate } from "../../components/shared/ContentPageTemplate";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

export default function GrantsPage() {
  const { isAdmin, isResearcher } = useAuth();
  const [items, setItems] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const data = await api.grants.list();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch grants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const emptyItem: Partial<Grant> = {
    title: "",
    description: "",
    passed_date: new Date().toISOString().split('T')[0],
    expire_date: new Date(Date.now() + 31_536_000_000).toISOString().split('T')[0],
    approval_status: "DRAFT" as ApprovalStatus,
  };

  const handleSave = async (item: Partial<Grant>) => {
    if (item.id) await api.grants.update(item.id as number, item);
    else await api.grants.create(item);
    await fetchItems();
  };

  const handleSubmitForReview = async (item: Grant) => {
    await api.content.submit("grant_info", item.id);
    await fetchItems();
  };

  const handleReview = async (item: Grant, status: 'PENDING_ADMIN' | 'REJECTED') => {
    await api.content.review("grant_info", item.id, status);
    await fetchItems();
  };

  const handleToggleStatus = async (item: Grant) => {
    const newStatus = item.approval_status === "APPROVED" ? "REJECTED" : "APPROVED";
    if (newStatus === "APPROVED") await api.admin.approveContent("grant_info", item.id);
    else await api.admin.rejectContent("grant_info", item.id);
    await fetchItems();
  };

  return (
    <ContentPageTemplate<Grant>
      title="Grants"
      subtitle={`${items.length} grant${items.length !== 1 ? "s" : ""} recorded.`}
      icon={Briefcase}
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
                <Briefcase size={14} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Grant</span>
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
            <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">
              EXP: {item.expire_date}
            </span>
            <ArrowRight size={14} className="text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      )}
      renderDetail={(item) => (
        <div className="space-y-12 pb-20 animate-enter">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 border border-zinc-200 bg-white space-y-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Status</span>
              </div>
              <Badge status={item.approval_status} />
            </div>
            <div className="p-8 border border-zinc-200 bg-white space-y-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Awarded</span>
              </div>
              <p className="text-lg font-black text-black uppercase">{item.passed_date}</p>
            </div>
            <div className="p-8 border border-zinc-200 bg-white space-y-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Expiration</span>
              </div>
              <p className="text-lg font-black text-black uppercase">{item.expire_date}</p>
            </div>
          </div>

          {item.description && (
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                <Info size={14} /> Description
              </h4>
              <p className="text-sm font-bold text-black uppercase leading-loose tracking-tight whitespace-pre-wrap italic">
                {item.description}
              </p>
            </div>
          )}

          {item.documents && item.documents.length > 0 && (
            <div className="pt-6 border-t border-zinc-100 flex flex-wrap gap-4">
              {item.documents.map(doc => (
                <Button
                  key={doc.id}
                  onClick={() => window.open(doc.doc_url, '_blank')}
                  variant="outline"
                  className="h-12 px-8 text-[11px] font-black tracking-widest uppercase"
                >
                  <FileText size={16} className="mr-2" /> {doc.doc_label || 'View Document'} (PDF)
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
      renderEdit={(item, setItem) => (
        <div className="space-y-10">
          <Input
            label="Grant Title"
            placeholder="Enter grant name..."
            value={item.title ?? ""} 
            onChange={e => setItem({ ...item, title: e.target.value })} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input 
              label="Award Date" 
              type="date" 
              value={item.passed_date ?? ""} 
              onChange={e => setItem({ ...item, passed_date: e.target.value })} 
            />
            <Input 
              label="Expiry Date" 
              type="date" 
              value={item.expire_date ?? ""} 
              onChange={e => setItem({ ...item, expire_date: e.target.value })} 
            />
          </div>

          <p className="p-8 border border-dashed border-zinc-200 text-center text-[10px] font-medium text-zinc-400 tracking-wide">
            Documents can be attached after the grant is created.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-tight text-zinc-600">
              Description
            </label>
            <textarea
              className="input-monochrome min-h-[160px] py-4"
              placeholder="Describe the grant objectives..."
              value={item.description ?? ""}
              onChange={e => setItem({ ...item, description: e.target.value })}
            />
          </div>
        </div>
      )}
    />
  );
}
