'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StockMarketData } from '../lib/types';
import { Activity, BarChart3, MessageSquare, Gauge, ShieldAlert } from 'lucide-react';

interface Signal {
  label: string;
  primary: string;
  secondary: string;
  semantic?: 'bullish' | 'bearish' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}

interface MarketSignalsCardProps {
  marketData: StockMarketData;
}

export const MarketSignalsCard: React.FC<MarketSignalsCardProps> = ({ marketData }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const signals: Signal[] = [
    {
      label:     'Price Momentum',
      primary:   marketData.priceMomentum.split(' ').slice(1).join(' ') || marketData.priceMomentum,
      secondary: marketData.priceMomentum.split(' ')[0],
      semantic:  'bullish',
      icon: Activity,
    },
    {
      label:     'Volume Anomaly',
      primary:   marketData.volumeAnomaly.split(' ')[0],
      secondary: 'vs 20D Avg',
      semantic:  'bullish',
      icon: BarChart3,
    },
    {
      label:     'NLP Sentiment',
      primary:   `+${marketData.sentimentScore}`,
      secondary: 'Positive Tone',
      semantic:  'bullish',
      icon: MessageSquare,
    },
    {
      label:     'RSI Indicator (14D)',
      primary:   String(marketData.rsi),
      secondary: 'Neutral Bullish',
      semantic:  'neutral',
      icon: Gauge,
    },
    {
      label:     'Implied Volatility',
      primary:   marketData.volatility.split(' ')[0],
      secondary: marketData.volatility.split(' ')[1] ?? 'Moderate',
      semantic:  'neutral',
      icon: ShieldAlert,
    },
  ];

  const semanticStyles: Record<string, { text: string; bg: string }> = {
    bullish: { text: 'text-fin-bullish', bg: 'bg-fin-bullishBg border-fin-bullishBorder' },
    bearish: { text: 'text-fin-bearish', bg: 'bg-fin-bearishBg border-fin-bearishBorder' },
    neutral: { text: 'text-fin-text2',   bg: 'bg-fin-surface2 border-fin-border' },
  };

  return (
    <div className="bg-fin-surface border border-fin-border rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-fin-border">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-fin-accent" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-fin-text">
            Quantitative Market Signals
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-fin-bullishBg text-fin-bullish border border-fin-bullishBorder">
          ● LIVE TELEMETRY
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-fin-border -mx-2">
        {signals.map((sig, idx) => {
          const Icon = sig.icon;
          const style = semanticStyles[sig.semantic ?? 'neutral'];
          return (
            <motion.div
              key={sig.label}
              className="px-4 py-3 cursor-default rounded-lg relative transition-colors"
              onHoverStart={() => setHoveredIdx(idx)}
              onHoverEnd={() => setHoveredIdx(null)}
              animate={{
                backgroundColor: hoveredIdx === idx ? '#F1F5F9' : 'transparent',
              }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between text-fin-text3 mb-1.5">
                <span className="text-[11px] font-medium text-fin-text2">{sig.label}</span>
                <Icon className="w-3.5 h-3.5 text-fin-text3" />
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono text-base font-extrabold text-fin-text tracking-tight">
                  {sig.primary}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.text} ${style.bg}`}>
                  {sig.secondary}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
