import React from 'react';
import type { ApprovalStatus } from '../../types';

interface BadgeProps {
  status: ApprovalStatus;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const variants: Record<ApprovalStatus, string> = {
    APPROVED: 'bg-zinc-900 text-white',
    PENDING_ADMIN: 'bg-zinc-100 text-zinc-900 border border-zinc-200',
    PENDING_RESEARCHER: 'bg-zinc-100 text-zinc-900 border border-zinc-200',
    DRAFT: 'bg-white text-zinc-500 border border-zinc-100',
    REJECTED: 'bg-zinc-50 text-zinc-400 border border-zinc-200 line-through opacity-70',
  };

  return (
    <span className={`status-pill rounded-full whitespace-nowrap ${variants[status]} ${className}`}>
      {status.replace('_', ' ')}
    </span>
  );
};
