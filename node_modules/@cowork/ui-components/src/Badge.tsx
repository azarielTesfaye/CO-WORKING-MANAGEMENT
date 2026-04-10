import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'green' | 'red' | 'yellow' | 'blue';
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'blue' }) => {
  const colors = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
    red: 'bg-rose-50 text-rose-700 ring-rose-600/15',
    yellow: 'bg-amber-50 text-amber-800 ring-amber-600/15',
    blue: 'bg-indigo-50 text-indigo-700 ring-indigo-600/15',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${colors[color]}`}
    >
      {children}
    </span>
  );
};
