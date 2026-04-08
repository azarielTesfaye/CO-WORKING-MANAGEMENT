import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="border rounded-lg shadow-md p-4 bg-white">
      {title && <h3 className="text-lg font-bold mb-2">{title}</h3>}
      {children}
    </div>
  );
};