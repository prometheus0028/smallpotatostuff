'use client';

import { BarChart2, Activity, Zap } from 'lucide-react';

interface MarketSignalsProps {
  momentum: number;
  avgVolume: number;
  currentVolume: number;
  sentimentScore: number;
}

export function MarketSignals({ momentum, avgVolume, currentVolume, sentimentScore }: MarketSignalsProps) {
  const volumeAnomaly = ((currentVolume - avgVolume) / avgVolume) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-[var(--color-cream)] border border-[var(--color-border-subtle)] p-5 rounded-xl flex items-center gap-4 shadow-sm">
        <div className="p-2.5 bg-[var(--color-ivory)] text-[var(--color-forest)] rounded-lg border border-[var(--color-border-subtle)]">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Price Momentum</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-[var(--color-text-main)]">{momentum.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-cream)] border border-[var(--color-border-subtle)] p-5 rounded-xl flex items-center gap-4 shadow-sm">
        <div className="p-2.5 bg-[var(--color-ivory)] text-[var(--color-forest)] rounded-lg border border-[var(--color-border-subtle)]">
          <BarChart2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Volume Anomaly</h3>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-bold ${volumeAnomaly > 0 ? 'text-[var(--color-sage)]' : 'text-slate-600'}`}>
              {volumeAnomaly > 0 ? '+' : ''}{volumeAnomaly.toFixed(1)}%
            </span>
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">vs avg</span>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-cream)] border border-[var(--color-border-subtle)] p-5 rounded-xl flex items-center gap-4 shadow-sm">
        <div className="p-2.5 bg-[var(--color-ivory)] text-[var(--color-forest)] rounded-lg border border-[var(--color-border-subtle)]">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Sentiment Score</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-[var(--color-text-main)]">{sentimentScore.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
