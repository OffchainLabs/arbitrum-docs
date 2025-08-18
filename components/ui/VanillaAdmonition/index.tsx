'use client';

import React from 'react';

interface VanillaAdmonitionProps {
  type: 'note' | 'tip' | 'warning' | 'info';
  children: React.ReactNode;
}

export function VanillaAdmonition({ type, children }: VanillaAdmonitionProps) {
  const typeStyles = {
    note: 'border-blue-200 bg-blue-50 text-blue-900',
    tip: 'border-green-200 bg-green-50 text-green-900', 
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-900',
    info: 'border-gray-200 bg-gray-50 text-gray-900'
  };

  return (
    <div className={`border-l-4 p-4 ${typeStyles[type]}`}>
      <div className="flex">
        <div className="ml-3">
          <div className="text-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}