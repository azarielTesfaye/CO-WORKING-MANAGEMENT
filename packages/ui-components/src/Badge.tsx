import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'green' | 'red' | 'yellow' | 'blue';
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'blue' }) => {
  const colors = {
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
    blue: "bg-blue-100 text-blue-800",
  };
  return (
    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${colors[color]}`}>
      {children}
    </span>
  );
};