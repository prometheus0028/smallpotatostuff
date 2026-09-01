'use client';

import { ShieldAlert, CheckCircle2 } from 'lucide-react';

interface SynthesisPanelProps {
  action: string;
  confidence: number;
  summary: string;
  reasons: string[];
  riskAdjustment: string | null;
}

export function SynthesisPanel({ action, confidence, summary, reasons, riskAdjustment }: SynthesisPanelProps) {
  const isInsufficient = action === 'INSUFFICIENT_EVIDENCE';

  if (isInsufficient) {
    return (
      <div className="bg-[var(--color-cream)] border border-[var(--color-border-subtle)] rounded-xl p-8 mb-8">
        <h2 className="text-xl font-bold text-rose-500 mb-2">INSUFFICIENT EVIDENCE</h2>
        <p className="text-[var(--color-text-main)] leading-relaxed font-medium">{summary}</p>
      </div>
    );
  }

  const signalColor = action === 'BUY' ? 'text-[var(--color-sage)]' : action === 'SELL' ? 'text-rose-500' : 'text-amber-500';
  const signalBg = action === 'BUY' ? 'bg-[#EAF0EC]' : action === 'SELL' ? 'bg-[#F9EAEA]' : 'bg-[#F9F0E1]';

  return (
    <div className="bg-[var(--color-cream)] border border-[var(--color-border-subtle)] rounded-xl mb-8 shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* Recommendation Block */}
      <div className="md:w-1/3 flex flex-col items-center justify-center p-8 bg-[var(--color-ivory)] border-b md:border-b-0 md:border-r border-[var(--color-border-subtle)]">
        <div className={`p-4 rounded-xl ${signalBg} mb-4 flex items-center justify-center min-w-[140px]`}>
          <span className={`text-4xl font-extrabold ${signalColor} tracking-tight`}>{action}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[var(--color-sage)] font-semibold mb-1 text-sm">{Math.round(confidence * 100)}% Confidence</span>
        </div>
      </div>

      {/* Details Block */}
      <div className="md:w-2/3 p-8 flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-4">Why?</h3>
          <ul className="space-y-3">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-3 text-[var(--color-text-secondary)] font-medium text-sm">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-sage)] shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {riskAdjustment && (
          <div className="md:w-1/3">
            <h3 className="text-sm font-bold text-[var(--color-text-main)] mb-3">Risk Adjustment</h3>
            <div className="p-4 bg-[var(--color-ivory)] border border-[var(--color-border-subtle)] rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[var(--color-forest)] shrink-0" />
              <p className="text-sm font-medium text-[var(--color-text-secondary)] leading-snug">{riskAdjustment}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
