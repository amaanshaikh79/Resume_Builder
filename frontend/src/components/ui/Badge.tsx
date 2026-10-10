import React from 'react';
import './ui.css';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'gradient';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', dot = false, className = '' }) => (
  <span className={`badge badge-${variant} ${dot ? 'badge-dot' : ''} ${className}`}>{children}</span>
);

export const StatusBadge: React.FC<{ status?: string | null }> = ({ status }) => {
  const map: Record<string, BadgeVariant> = {
    complete: 'success',
    published: 'success',
    draft: 'warning',
    archived: 'neutral',
  };
  const v = map[(status || 'draft').toLowerCase()] || 'neutral';
  return <Badge variant={v} dot>{status || 'draft'}</Badge>;
};

export const ScoreBadge: React.FC<{ score: number | null | undefined }> = ({ score }) => {
  if (score === null || score === undefined) return <Badge variant="neutral">Not scored</Badge>;
  const v: BadgeVariant = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger';
  return <Badge variant={v}>{score}/100</Badge>;
};

export default Badge;
