import React from 'react';

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, description, children }) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-card backdrop-blur-sm">
      {(title || description) && (
        <div className="mb-5 border-b border-slate-100 pb-4">
          {title && (
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
