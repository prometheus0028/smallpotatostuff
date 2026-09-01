'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type StockContextType = {
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  availableSymbols: string[];
};

const StockContext = createContext<StockContextType | undefined>(undefined);

export function StockProvider({ children }: { children: ReactNode }) {
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  
  // Hardcoded for now based on the backend data. Ideally, this would be fetched from an API endpoint.
  const availableSymbols = ['RELIANCE', 'HDFCBANK', 'TATAMOTORS'];

  return (
    <StockContext.Provider value={{ selectedSymbol, setSelectedSymbol, availableSymbols }}>
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
}
