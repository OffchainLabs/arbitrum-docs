// Legacy Card component for compatibility
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export default function Card({ children, title, description, className = '' }: CardProps) {
  return (
    <div className={`border rounded-lg p-6 shadow-sm ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
      <div>
        {children}
      </div>
    </div>
  );
}