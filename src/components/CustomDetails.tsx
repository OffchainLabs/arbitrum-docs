import React, { ReactNode } from 'react';

interface CustomDetailsProps {
  children: ReactNode;
  summary?: string;
  open?: boolean;
  className?: string;
}

export default function CustomDetails({ children, summary = "Details", open = false, className = "" }: CustomDetailsProps) {
  return (
    <details className={`border rounded-lg p-4 ${className}`} open={open}>
      <summary className="font-semibold cursor-pointer">{summary}</summary>
      <div className="mt-3">
        {children}
      </div>
    </details>
  );
}