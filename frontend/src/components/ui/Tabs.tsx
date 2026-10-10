import React from 'react';
import './ui.css';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pill';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, active, onChange, variant = 'underline', className = '' }) => (
  <div className={`tabs ${variant === 'pill' ? 'tabs-pill' : ''} ${className}`} role="tablist">
    {items.map((item) => (
      <button
        key={item.id}
        role="tab"
        aria-selected={active === item.id}
        className={`tab ${active === item.id ? 'tab-active' : ''}`}
        onClick={() => onChange(item.id)}
        type="button"
      >
        {item.icon}
        {item.label}
      </button>
    ))}
  </div>
);

export default Tabs;
