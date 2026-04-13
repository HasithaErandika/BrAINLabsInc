import { useState } from "react";
import type { ReactNode } from "react";
import { Plus, Search, ArrowLeft } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export type ContentPageView = "list" | "detail" | "edit";

interface ContentPageTemplateProps<T> {
  title: string;
  subtitle: string;
  icon: any;
  items: T[];
  loading: boolean;
  isAdmin: boolean;
  isResearcher?: boolean;

  renderListItem: (item: T, onClick: () => void) => ReactNode;
  searchFields: (item: T) => string[];
  filterOptions?: { label: string; value: string }[];

  renderDetail: (item: T) => ReactNode;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onSubmitForReview?: (item: T) => void;
  onReview?: (item: T, status: 'PENDING_ADMIN' | 'REJECTED') => void;
  onToggleStatus?: (item: T) => void;

  renderEdit: (item: Partial<T>, setItem: (p: Partial<T>) => void, onSave: () => void) => ReactNode;
  emptyItem: Partial<T>;
  onSave: (item: Partial<T>) => Promise<void>;
}

export function ContentPageTemplate<
  T extends { id?: number | string; approval_status?: any; title?: string }
>({
  title,
  subtitle,
  icon: Icon,
  items,
  loading,
  isAdmin,
  isResearcher,
  renderListItem,
  searchFields,
  filterOptions,
  renderDetail,
  renderEdit,
  emptyItem,
  onSave,
  onSubmitForReview,
  onReview,
  onToggleStatus,
}: ContentPageTemplateProps<T>) {
  const [view, setView] = useState<ContentPageView>("list");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<T>>(emptyItem);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const selectedItem = items.find(i => i.id === selectedId) || null;

  const handleCreate = () => {
    setEditingItem(emptyItem);
    setView("edit");
  };

  const handleEdit = (item: T) => {
    setEditingItem({ ...item });
    setView("edit");
  };

  const handleSaveInternal = async () => {
    setSaving(true);
    try {
      await onSave(editingItem);
      setView("list");
      setSelectedId(null);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = items.filter(item => {
    const q = search.toLowerCase();
    const values = searchFields(item).map(s => (s ?? "").toLowerCase());
    const matchesSearch = !q || values.some(v => v.includes(q));
    const matchesFilter = filter === "ALL" || item.approval_status === filter;
    return matchesSearch && matchesFilter;
  });

  if (view === "list") {
    return (
      <div className="space-y-12 animate-enter">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-zinc-100 pb-10">
          <div>
            <div className="flex items-center gap-2 text-zinc-400 mb-3">
              <Icon size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{title} System</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight uppercase">{title}</h1>
            <p className="text-sm font-medium text-zinc-500 mt-2">{subtitle}</p>
          </div>
          {!isAdmin && (
            <Button onClick={handleCreate} className="h-14 px-8 text-xs font-bold rounded-2xl shadow-lg shadow-zinc-100">
              <Plus size={18} className="mr-2" /> New Entry
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder={`SEARCH ${title.toUpperCase()}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-10 text-[10px]"
            />
          </div>

          {filterOptions && (
            <div className="flex bg-zinc-100/50 p-1.5 rounded-2xl border border-zinc-100">
              {filterOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === opt.value ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-40 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">Synchronizing Records</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full py-40 text-center bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200">
              <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">No Records Found</p>
            </div>
          ) : (
            filteredItems.map(item =>
              renderListItem(item, () => {
                setSelectedId(item.id!);
                setView("detail");
              })
            )
          )}
        </div>
      </div>
    );
  }

  if (view === "detail" && selectedItem) {
    return (
      <div className="space-y-8 animate-enter h-full">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-8">
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft size={16} /> Directory
          </button>

          <div className="flex items-center gap-3">
            {/* Workflow Actions */}
            {!isAdmin && selectedItem.approval_status === "DRAFT" && (
              <>
                <Button variant="outline" onClick={() => handleEdit(selectedItem)} className="h-10 px-6 text-[10px] font-black">
                  EDIT DRAFT
                </Button>
                {onSubmitForReview && (
                  <Button onClick={() => onSubmitForReview(selectedItem)} className="h-10 px-6 text-[10px] font-black">
                    SUBMIT FOR REVIEW
                  </Button>
                )}
              </>
            )}
            
            {isResearcher && selectedItem.approval_status === "PENDING_RESEARCHER" && onReview && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onReview(selectedItem, 'REJECTED')} className="h-10 px-6 text-[10px] font-black">
                  REJECT
                </Button>
                <Button onClick={() => onReview(selectedItem, 'PENDING_ADMIN')} className="h-10 px-6 text-[10px] font-black">
                  FORWARD TO ADMIN
                </Button>
              </div>
            )}

            {isAdmin && onToggleStatus && (
              <Button onClick={() => onToggleStatus(selectedItem)} className="h-10 px-6 text-[10px] font-black">
                {selectedItem.approval_status === "APPROVED" ? "REVOKE ACCESS" : "AUTHORIZE"}
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-16 py-12">
          <div className="flex flex-wrap items-center gap-6">
            <Badge status={selectedItem.approval_status} />
            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">Ref: #{selectedItem.id}</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-black text-zinc-900 tracking-tight uppercase leading-[0.9]">
            {selectedItem.title || "Untitled Record"}
          </h1>

          <div className="pt-16 border-t border-zinc-100 min-h-[500px]">
            {renderDetail(selectedItem)}
          </div>
        </div>
      </div>
    );
  }

  if (view === "edit") {
    return (
      <div className="space-y-8 animate-enter">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-8">
          <button
            onClick={() => setView(editingItem.id ? "detail" : "list")}
            className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft size={16} /> Discard
          </button>
          <Button
            onClick={handleSaveInternal}
            isLoading={saving}
            className="h-14 px-10 text-xs font-black tracking-widest rounded-2xl"
          >
            SYNC TO SYSTEM
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-12 py-12">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-zinc-900 tracking-tight uppercase">
              {editingItem.id ? `Modify ${title.replace(/s$/, "")}` : `New ${title.replace(/s$/, "")}`}
            </h1>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] leading-relaxed">
              Records exist as encrypted drafts until submitted for administrative review.
            </p>
          </div>

          <div className="bg-white space-y-10">
            {renderEdit(editingItem, setEditingItem, handleSaveInternal)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 text-center uppercase text-[10px] font-black tracking-[0.5em] text-zinc-300">
      Loading System View...
    </div>
  );
}
