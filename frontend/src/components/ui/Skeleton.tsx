import React from 'react';
import './ui.css';

export const Skeleton: React.FC<{ width?: string; height?: string; circle?: boolean; className?: string }> = ({
  width = '100%',
  height = '1rem',
  circle = false,
  className = '',
}) => (
  <div
    className={`skeleton ${circle ? 'skeleton-circle' : ''} ${className}`}
    style={{ width, height }}
    aria-hidden="true"
  />
);

export const SkeletonText: React.FC<{ lines?: number; width?: string }> = ({ lines = 3, width = '100%' }) => (
  <div aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="skeleton skeleton-text"
        style={{ width: i === lines - 1 ? '65%' : width }}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC = () => (
  <div className="skeleton-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-xl)' }}>
    <Skeleton width="100%" height="7rem" />
    <div style={{ height: '0.75rem' }} />
    <SkeletonText lines={2} />
  </div>
);

export default Skeleton;
