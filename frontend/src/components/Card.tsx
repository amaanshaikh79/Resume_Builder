import React from 'react';
import './Button.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const PADDING: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-6',
  lg: 'p-8',
};

const Card: React.FC<CardProps> = ({ children, className = '', padding = 'md', hover = false }) => (
  <div
    className={`card ${PADDING[padding]} ${hover ? 'card-hover' : ''} ${className}`}
  >
    {children}
  </div>
);

export default Card;
