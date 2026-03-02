import React, { useState } from 'react';
import './CollapsibleSection.css';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({ title, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`collapsible ${isOpen ? 'open' : ''}`}>
      <button
        className="collapsible-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="chevron">▶</span>
        <span className="collapsible-title">{title}</span>
      </button>
      <div className="collapsible-body">
        {children}
      </div>
    </div>
  );
}
