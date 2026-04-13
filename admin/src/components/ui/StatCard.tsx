import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; label: string; type?: 'up' | 'down' };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  trend,
  className = '' 
}) => {
  return (
    <div className={`p-8 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="p-4 bg-zinc-50 rounded-xl group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
          <Icon size={24} />
        </div>
        {trend && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded-sm">
            <span className="text-[10px] font-bold text-black">
              {trend.type === 'up' ? '↑' : '↓'} {trend.value}
            </span>
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-tight">
              {trend.label}
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="text-4xl font-bold tracking-tighter text-black uppercase mb-1">{value}</p>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{label}</p>
      </div>
    </div>
  );
};
