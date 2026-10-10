import React from 'react';
import './ui.css';

interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  className?: string;
}

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || '?';

export const Avatar: React.FC<AvatarProps> = ({ name = 'User', size = 'md', showStatus = false, className = '' }) => (
  <span
    className={`avatar avatar-${size} ${showStatus ? 'avatar-status' : ''} ${className}`}
    aria-hidden="true"
    title={name}
  >
    {initials(name)}
  </span>
);

export default Avatar;
