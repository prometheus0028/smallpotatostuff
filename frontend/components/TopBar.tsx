'use client';

import { usePathname } from 'next/navigation';
import { useStock } from '@/app/dashboard/StockContext';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/market': 'Market Signals',
  '/dashboard/agents': 'Agents Execution',
  '/dashboard/portfolio': 'Portfolio',
};

export function TopBar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'Dashboard';
  
  const { selectedSymbol, setSelectedSymbol, availableSymbols } = useStock();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-center mb-8 bg-transparent">
      <h1 className="text-3xl font-bold text-[var(--color-text-main)] tracking-tight">{title}</h1>
      
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-cream)] border border-[var(--color-border-subtle)] rounded-lg text-sm font-semibold text-[var(--color-text-main)] hover:bg-[var(--color-ivory)] transition-colors shadow-sm"
        >
          <span>{selectedSymbol}</span>
          <ChevronDown className="w-4 h-4 text-[var(--color-text-secondary)]" />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-[var(--color-cream)] border border-[var(--color-border-subtle)] rounded-lg shadow-lg overflow-hidden z-50">
            {availableSymbols.map(symbol => (
              <button
                key={symbol}
                onClick={() => {
                  setSelectedSymbol(symbol);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  symbol === selectedSymbol 
                    ? 'bg-[var(--color-forest)] text-white font-medium' 
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-text-main)]'
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
