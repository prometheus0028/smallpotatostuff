'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StockSymbol, StockMarketData } from '../lib/types';
import { ChevronDown, Play, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

interface HeaderProps {
  selectedSymbol: StockSymbol;
  onSelectSymbol: (symbol: StockSymbol) => void;
  marketData: StockMarketData;
  isDegradedMode: boolean;
  onToggleDegradedMode: () => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

const STOCKS: { value: StockSymbol; label: string }[] = [
  { value: 'RELIANCE',   label: 'RELIANCE (Reliance Industries)' },
  { value: 'TCS',        label: 'TCS (Tata Consultancy)'         },
  { value: 'INFOSYS',    label: 'INFOSYS (Infosys Ltd)'          },
  { value: 'HDFCBANK',   label: 'HDFCBANK (HDFC Bank)'           },
  { value: 'TATAMOTORS', label: 'TATAMOTORS (Tata Motors)'       },
];

export const Header: React.FC<HeaderProps> = ({
  selectedSymbol,
  onSelectSymbol,
  marketData,
  isDegradedMode,
  onToggleDegradedMode,
  onRunAnalysis,
  isAnalyzing,
}) => {
  const isPositive = marketData.changePercent >= 0;

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-14 border-b border-fin-border bg-fin-surface flex items-center justify-between px-6 sticky top-0 z-50 shrink-0 select-none shadow-sm"
    >
      {/* Left: Asset Selector + Price Telemetry */}
      <div className="flex items-center space-x-5 h-full text-xs">
        {/* Asset Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-fin-text3 font-mono">
            Asset
          </span>
          <div className="relative">
            <select
              value={selectedSymbol}
              onChange={(e) => onSelectSymbol(e.target.value as StockSymbol)}
              className="bg-fin-surface2 border border-fin-border text-fin-text font-bold text-xs rounded-lg pl-3 pr-8 py-1.5 focus:ring-1 focus:ring-fin-accent focus:outline-none cursor-pointer appearance-none tracking-wide"
            >
              {STOCKS.map((s) => (
                <option key={s.value} value={s.value} className="bg-fin-surface text-fin-text font-medium">
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-fin-text3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="w-px h-5 bg-fin-border" />

        {/* Live Price + % Change Badge */}
        <div className="flex items-center space-x-2.5 font-mono">
          <span className="text-base font-extrabold text-fin-text">
            ₹{marketData.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span
            className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              isPositive
                ? 'bg-fin-bullishBg text-fin-bullish border-fin-bullishBorder'
                : 'bg-fin-bearishBg text-fin-bearish border-fin-bearishBorder'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>
              {isPositive ? '+' : ''}
              {marketData.changePercent.toFixed(2)}%
            </span>
          </span>
        </div>
      </div>

      {/* Center: System Label */}
      <div className="hidden md:flex flex-col items-center justify-center opacity-70">
        <span className="text-[10px] font-bold tracking-widest uppercase text-fin-text2">
          FININT PS-01
        </span>
        <span className="text-[10px] font-medium text-fin-text3">
          Market data + multi-agent reasoning + RAG evidence + risk personalization
        </span>
      </div>

      {/* Right: Demo Controls + Primary Run Analysis CTA */}
      <div className="flex items-center space-x-4 h-full">
        {/* Degraded Data Toggle */}
        <button
          onClick={onToggleDegradedMode}
          type="button"
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-colors ${
            isDegradedMode
              ? 'bg-fin-cautiousBg text-fin-cautious border-fin-cautiousBorder shadow-sm'
              : 'bg-fin-surface2 text-fin-text2 border-fin-border hover:text-fin-text hover:bg-fin-surface3/60'
          }`}
          title="Toggle Degraded RAG data mode"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isDegradedMode ? 'bg-fin-cautious animate-pulse' : 'bg-fin-bullish'}`} />
          <span className="font-mono text-[10px]">
            DATA: {isDegradedMode ? 'DEGRADED' : 'NOMINAL'}
          </span>
        </button>

        <div className="w-px h-5 bg-fin-border" />

        {/* Run Analysis Button */}
        <motion.button
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          whileHover={!isAnalyzing ? { scale: 1.02 } : undefined}
          whileTap={!isAnalyzing ? { scale: 0.98 } : undefined}
          transition={{ duration: 0.15 }}
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all ${
            isAnalyzing
              ? 'bg-fin-surface3 text-fin-text3 cursor-not-allowed border border-fin-border'
              : 'bg-fin-text text-white hover:bg-slate-800 border border-fin-text cursor-pointer'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-spin text-fin-accent" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Analysis</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.header>
  );
};
