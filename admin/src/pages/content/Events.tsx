import { useState, useEffect } from "react";
import { CalendarDays, MapPin, Clock, Users, Info, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../api";
import type { Event, ApprovalStatus } from "../../types";
import { ContentPageTemplate } from "../../components/shared/ContentPageTemplate";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";

export default function EventsPage() {
  const { isAdmin, isResearcher } = useAuth();
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const data = await api.events.list();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const emptyItem: Partial<Event> = {
    title: "",
    description: "",
    event_datetime: new Date().toISOString(),
    premises: "BrAIN LABS HQ",
    host: "LAB ADMINISTRATION",
    approval_status: "DRAFT" as ApprovalStatus,
  };

  const handleSave = async (item: Partial<Event>) => {
    if (item.id) await api.events.update(item.id as number, item);
    else await api.events.create(item);
    await fetchItems();
  };

  const handleSubmitForReview = async (item: Event) => {
    await api.content.submit("event", item.id);
    await fetchItems();
  };

  const handleReview = async (item: Event, status: 'PENDING_ADMIN' | 'REJECTED') => {
    await api.content.review("event", item.id, status);
    await fetchItems();
  };

  const handleToggleStatus = async (item: Event) => {
    const newStatus = item.approval_status === "APPROVED" ? "REJECTED" : "APPROVED";
    if (newStatus === "APPROVED") await api.admin.approveContent("event", item.id);
    else await api.admin.rejectContent("event", item.id);
    await fetchItems();
  };

  return (
    <ContentPageTemplate<Event>
      title="Events"
      subtitle={`${items.length} event${items.length !== 1 ? "s" : ""} recorded.`}
      icon={CalendarDays}
      items={items}
      loading={loading}
      isAdmin={isAdmin()}
      isResearcher={isResearcher()}
      emptyItem={emptyItem}
      onSave={handleSave}
      onSubmitForReview={handleSubmitForReview}
      onReview={handleReview}
      onToggleStatus={isAdmin() ? handleToggleStatus : undefined}
      searchFields={(item) => [item.title, item.description || "", item.premises]}
      filterOptions={[
        { label: "ALL", value: "ALL" },
        { label: "PUBLISHED", value: "APPROVED" },
        { label: "PENDING", value: "PENDING_ADMIN" },
        { label: "DRAFT", value: "DRAFT" },
      ]}
      renderListItem={(item, onClick) => {
        const date = new Date(item.event_datetime);
        return (
          <div 
            key={item.id} 
            onClick={onClick} 
            className="group bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-sm rounded-xl p-5 cursor-pointer flex flex-col gap-4 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black text-white">
                  <CalendarDays size={14} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  {date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <Badge status={item.approval_status} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-black text-black uppercase tracking-tight leading-tight line-clamp-2">{item.title}</h3>
              <p className="text-[10px] text-zinc-400 font-bold flex items-center gap-2 uppercase tracking-wide">
                <MapPin size={12} /> {item.premises}
              </p>
            </div>
            
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Clock size={12} /> {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
              <ArrowRight size={14} className="text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        );
      }}
      renderDetail={(item) => {
        const date = new Date(item.event_datetime);
        return (
          <div className="space-y-12 animate-enter">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 border border-zinc-200 bg-white space-y-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <MapPin size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Location</span>
                </div>
                <p className="text-lg font-black text-black uppercase tracking-tight">{item.premises}</p>
              </div>
              <div className="p-8 border border-zinc-200 bg-white space-y-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Time</span>
                </div>
                <p className="text-lg font-black text-black uppercase tracking-tight">
                  {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="p-8 border border-zinc-200 bg-white space-y-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Users size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Host</span>
                </div>
                <p className="text-lg font-black text-black uppercase tracking-tight">{item.host}</p>
              </div>
            </div>

            {item.description && (
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                  <Info size={14} /> Description
                </h4>
                <p className="text-sm text-black font-bold uppercase tracking-tight leading-loose">
                  {item.description}
                </p>
              </div>
            )}
          </div>
        );
      }}
      renderEdit={(item, setItem) => (
        <div className="space-y-10">
          <Input
            label="Event Title"
            placeholder="Enter event title..."
            value={item.title ?? ""} 
            onChange={e => setItem({...item, title: e.target.value})} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input
              label="Location"
              placeholder="Campus / Platform / Online..."
              value={item.premises ?? ""} 
              onChange={e => setItem({...item, premises: e.target.value})} 
            />
            <Input
              label="Host / Organiser"
              placeholder="Organiser name..."
              value={item.host ?? ""} 
              onChange={e => setItem({...item, host: e.target.value})} 
            />
            <Input 
              label="Scheduled Date & Time" 
              type="datetime-local" 
              value={item.event_datetime ? new Date(item.event_datetime).toISOString().slice(0, 16) : ""} 
              onChange={e => setItem({...item, event_datetime: e.target.value})} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-tight text-zinc-600">
              Engagement Description
            </label>
            <textarea 
              className="input-monochrome min-h-[160px] py-4" 
              placeholder="Describe the event..."
              value={item.description ?? ""} 
              onChange={e => setItem({...item, description: e.target.value})} 
            />
          </div>
        </div>
      )}
    />
  );
}
