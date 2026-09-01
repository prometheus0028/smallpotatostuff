'use client';

import { useState, useEffect } from 'react';
import { useStock } from '@/app/dashboard/StockContext';
import { api } from '@/services/api';
import { MarketData } from '@/types/api';
import { RefreshCw, TrendingUp, TrendingDown, Activity, Zap, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MarketSignals } from '@/components/MarketSignals';

export default function MarketPage() {
  const { selectedSymbol } = useStock();
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMarket = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMarket(selectedSymbol);
      setMarketData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();
  }, [selectedSymbol]);

  return (
    <div className="pb-20">
      <div className="flex justify-end items-center mb-8">
        <button 
          onClick={fetchMarket}
          disabled={isLoading}
          className="px-4 py-1.5 bg-[var(--color-forest)] hover:bg-[var(--color-forest-light)] text-white border border-transparent rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {!marketData ? (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-[var(--color-forest)] animate-spin" />
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[var(--color-cream)] border border-[var(--color-border-subtle)] rounded-xl p-6 shadow-sm">
              <h3 className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[var(--color-forest)]" /> Current Price
              </h3>
              <div className="text-3xl font-bold text-[var(--color-text-main)]">
                ${marketData.price.toFixed(2)}
              </div>
              <div className={`text-sm mt-2 font-medium flex items-center gap-1 ${marketData.change_pct >= 0 ? 'text-[var(--color-sage)]' : 'text-rose-500'}`}>
                {marketData.change_pct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {Math.abs(marketData.change_pct).toFixed(2)}%
              </div>
            </div>

            <div className="bg-[var(--color-cream)] border border-[var(--color-border-subtle)] rounded-xl p-6 shadow-sm">
              <h3 className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                <BarChart2 className="w-3.5 h-3.5 text-[var(--color-forest)]" /> Volume
              </h3>
              <div className="text-3xl font-bold text-[var(--color-text-main)]">
                {(marketData.volume / 1000000).toFixed(2)}M
              </div>
              <div className="text-sm mt-2 font-medium text-[var(--color-text-secondary)]">
                Avg: {(marketData.avg_volume / 1000000).toFixed(2)}M
              </div>
            </div>

            <div className="bg-[var(--color-cream)] border border-[var(--color-border-subtle)] rounded-xl p-6 shadow-sm">
              <h3 className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[var(--color-forest)]" /> Volatility
              </h3>
              <div className="text-3xl font-bold text-[var(--color-text-main)]">
                {(marketData.volatility * 100).toFixed(1)}%
              </div>
              <div className="text-sm mt-2 font-medium text-[var(--color-text-secondary)]">
                Annualized 30-day
              </div>
            </div>

            <div className="bg-[var(--color-cream)] border border-[var(--color-border-subtle)] rounded-xl p-6 shadow-sm">
              <h3 className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--color-forest)]" /> Sector Change
              </h3>
              <div className="text-3xl font-bold text-[var(--color-text-main)]">
                {marketData.sector_change_pct > 0 ? '+' : ''}{marketData.sector_change_pct.toFixed(2)}%
              </div>
              <div className="text-sm mt-2 font-medium text-[var(--color-text-secondary)]">
                vs peers
              </div>
            </div>
          </div>
          
          <MarketSignals 
            momentum={marketData.momentum}
            avgVolume={marketData.avg_volume}
            currentVolume={marketData.volume}
            sentimentScore={marketData.sentiment_score}
          />
        </motion.div>
      )}
    </div>
  );
}
