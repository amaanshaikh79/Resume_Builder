import React from 'react';
import './ui.css';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => (
  <span className="tooltip-wrap" tabIndex={0}>
    {children}
    <span className="tooltip-bubble" role="tooltip">
      {content}
    </span>
  </span>
);

export default Tooltip;
