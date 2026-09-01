'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PortfolioHolding, WatchlistItem, StockSymbol } from '../lib/types';
import { Briefcase, Eye, PieChart, TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioPanelProps {
  portfolio: PortfolioHolding[];
  watchlist: WatchlistItem[];
  onSelectStock: (symbol: StockSymbol) => void;
  activeSymbol: StockSymbol;
}

export const PortfolioPanel: React.FC<PortfolioPanelProps> = ({
  portfolio,
  watchlist,
  onSelectStock,
  activeSymbol,
}) => {
  const holding = portfolio.find((h) => h.symbol === activeSymbol);

  return (
    <div className="bg-fin-surface border border-fin-border rounded-xl p-5 shadow-card space-y-5">
      {/* Portfolio Position */}
      <div>
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-fin-border">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-fin-accent" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-fin-text">
              Retail Portfolio Position
            </h2>
          </div>
          <span className="text-[10px] font-mono text-fin-text3">ACCOUNT #7829-R</span>
        </div>

        {holding ? (
          <div className="space-y-3">
            {/* Holdings Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-[10px] uppercase font-bold text-fin-text3 border-b border-fin-border pb-1">
                    <th className="pb-1.5 font-semibold">Holding</th>
                    <th className="pb-1.5 font-semibold">Qty</th>
                    <th className="pb-1.5 font-semibold">Avg Price</th>
                    <th className="pb-1.5 font-semibold text-right">Exposure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fin-border/60">
                  <motion.tr
                    className="font-mono text-fin-text2 cursor-default"
                    whileHover={{ backgroundColor: '#F8FAFC' }}
                    transition={{ duration: 0.15 }}
                  >
                    <td className="py-2.5 text-fin-text font-sans font-bold">{holding.symbol}</td>
                    <td className="py-2.5">{holding.quantity}</td>
                    <td className="py-2.5">
                      ₹{holding.avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 text-fin-text text-right font-bold">
                      ₹{holding.currentExposure.toLocaleString('en-IN')}
                    </td>
                  </motion.tr>
                </tbody>
              </table>
            </div>

            {/* Concentration Alert Strip */}
            <div className="p-3 rounded-lg bg-fin-surface2 border border-fin-border flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-fin-cautious shrink-0" />
                <div>
                  <span className="text-xs font-bold text-fin-text block leading-tight">
                    Portfolio Concentration Risk
                  </span>
                  <span className="text-[10px] text-fin-text3">Elevated allocation relative to total capital</span>
                </div>
              </div>
              <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-fin-cautiousBg text-fin-cautious border border-fin-cautiousBorder">
                {holding.concentrationScore}% Exposure
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-fin-surface2 border border-fin-border text-xs text-fin-text3 italic text-center">
            No active position in {activeSymbol}. Available for allocation.
          </div>
        )}
      </div>

      {/* Watchlist Chips */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-fin-text">
            <Eye className="w-3.5 h-3.5 text-fin-text3" />
            <span>Watchlist Quick-Switch</span>
          </div>
          <span className="text-[10px] text-fin-text3 font-mono">Click ticker to analyze</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {watchlist.map((item) => {
            const isActive = activeSymbol === item.symbol;
            const isPos = item.changePercent >= 0;

            return (
              <motion.button
                key={item.symbol}
                type="button"
                onClick={() => onSelectStock(item.symbol as StockSymbol)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isActive
                    ? 'bg-fin-surface2 border-fin-accent text-fin-text ring-1 ring-fin-accent/40 shadow-sm'
                    : 'bg-fin-surface border-fin-border text-fin-text2 hover:border-fin-border2 hover:bg-fin-surface2/60'
                }`}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.12 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold font-mono text-fin-text">{item.symbol}</span>
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isPos ? 'bg-fin-bullishBg text-fin-bullish' : 'bg-fin-bearishBg text-fin-bearish'
                    }`}
                  >
                    {isPos ? '+' : ''}{item.changePercent}%
                  </span>
                </div>
                <div className="text-[11px] font-mono text-fin-text3">
                  ₹{item.price.toLocaleString('en-IN')}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
