'use client';

import { TrendingUp, Activity, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  symbol: string;
  price: number;
  changePct: number;
  overallSignal: string;
  confidence: number;
}

export function Header({ symbol, price, changePct, overallSignal, confidence }: HeaderProps) {
  const isPositive = changePct >= 0;

  return (
    <div className="bg-[var(--color-cream)] border border-[var(--color-border-subtle)] rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-forest)] flex items-center gap-2">
            {symbol}
            <span className="text-xs font-semibold px-2 py-0.5 bg-[var(--color-sage)]/20 text-[var(--color-forest-light)] rounded-md border border-[var(--color-sage)]/30">NSE</span>
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl font-bold text-[var(--color-text-main)]">
              ₹{price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-sm font-semibold flex items-center gap-1 px-2 py-0.5 rounded-md ${isPositive ? 'text-[var(--color-sage)]' : 'text-rose-500'}`}>
              <TrendingUp className={`w-4 h-4 ${!isPositive && 'rotate-180'}`} />
              {isPositive ? '+' : ''}{changePct}%
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col items-center justify-center bg-[var(--color-ivory)] px-6 py-3 rounded-lg border border-[var(--color-border-subtle)] min-w-[120px]">
            <span className="text-xs text-[var(--color-text-secondary)] font-medium flex items-center gap-1 mb-1">
              <Activity className="w-3 h-3" /> Signal
            </span>
            <span className={`font-bold text-lg ${overallSignal === 'BULLISH' ? 'text-[var(--color-sage)]' : overallSignal === 'BEARISH' ? 'text-rose-500' : 'text-amber-500'}`}>
              {overallSignal}
            </span>
          </div>
          
          <div className="flex flex-col items-center justify-center bg-[var(--color-ivory)] px-6 py-3 rounded-lg border border-[var(--color-border-subtle)] min-w-[120px]">
            <span className="text-xs text-[var(--color-text-secondary)] font-medium flex items-center gap-1 mb-1">
              <CheckCircle2 className="w-3 h-3" /> Confidence
            </span>
            <span className="font-bold text-lg text-[var(--color-text-main)]">
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
