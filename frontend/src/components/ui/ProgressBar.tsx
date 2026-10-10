import React from 'react';
import './ui.css';

interface ProgressBarProps {
  value: number; // 0-100
  tone?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showValue?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  tone = 'default',
  size = 'md',
  label,
  showValue = false,
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={`progress-wrapper ${className}`}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
          {label && <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>}
          {showValue && <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text)' }}>{clamped}%</span>}
        </div>
      )}
      <div
        className={`progress progress-${size}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'progress'}
      >
        <div
          className={`progress-fill ${tone !== 'default' ? tone : ''}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

/** Circular score ring (SVG) used for ATS scores. */
export const ScoreRing: React.FC<{
  score: number;
  size?: number;
  label?: string;
  stroke?: number;
}> = ({ score, size = 72, label, stroke = 7 }) => {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (clamped / 100) * circumference;
  const color = clamped >= 80 ? '#10b981' : clamped >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
      <svg width={size} height={size} role="img" aria-label={`${label || 'score'} ${clamped} percent`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={size * 0.26} fontWeight="800" fill="var(--text)">
          {clamped}
        </text>
      </svg>
      {label && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>}
    </div>
  );
};

export default ProgressBar;
