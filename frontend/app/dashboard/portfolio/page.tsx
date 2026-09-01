'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Portfolio } from '@/types/api';
import { RefreshCw, Briefcase, TrendingUp } from 'lucide-react';
import { useStock } from '@/app/dashboard/StockContext';
import { ProfileSwitcher } from '@/components/ProfileSwitcher';

export default function PortfolioPage() {
  const { selectedSymbol } = useStock();
  const [profile, setProfile] = useState<'CONSERVATIVE' | 'AGGRESSIVE'>('CONSERVATIVE');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPortfolio = async () => {
    setIsLoading(true);
    try {
      const userId = profile === 'CONSERVATIVE' ? 'demo-conservative' : 'demo-aggressive';
      const data = await api.getPortfolio(userId);
      setPortfolio(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [profile]);

  const handleProfileChange = (newProfile: 'CONSERVATIVE' | 'AGGRESSIVE') => {
    setProfile(newProfile);
  };

  return (
    <div className="pb-20">
      <div className="flex justify-end items-center mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchPortfolio}
            disabled={isLoading}
            className="px-4 py-1.5 bg-[var(--color-forest)] hover:bg-[var(--color-forest-light)] text-white border border-transparent rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Portfolio
          </button>
          
          <ProfileSwitcher currentProfile={profile} onChange={handleProfileChange} />
        </div>
      </div>

      {!portfolio ? (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-[var(--color-forest)] animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[var(--color-cream)] border border-[var(--color-border-subtle)] rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--color-forest)] mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5" /> Current Holdings
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#EBE7DF]/50 text-[var(--color-text-main)] text-xs uppercase tracking-wider font-semibold border-b border-[var(--color-border-subtle)]">
                  <tr>
                    <th className="px-6 py-4">Symbol</th>
                    <th className="px-6 py-4 text-right">Quantity</th>
                    <th className="px-6 py-4 text-right">Target Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">
                  {portfolio.holdings.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-[var(--color-text-secondary)] italic">
                        No holdings currently in portfolio.
                      </td>
                    </tr>
                  ) : (
                    portfolio.holdings.map((holding, index) => (
                      <tr key={index} className={`transition-colors ${holding.symbol === selectedSymbol ? 'bg-[var(--color-ivory)] ring-1 ring-inset ring-[var(--color-sage)]' : 'hover:bg-[var(--color-ivory)]'}`}>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-[var(--color-text-main)]">
                          {holding.symbol} {holding.symbol === selectedSymbol && <span className="ml-2 text-xs font-medium text-[var(--color-forest)] bg-[var(--color-sage)]/20 px-2 py-0.5 rounded">Selected</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                          {holding.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="inline-flex items-center gap-1 bg-[var(--color-sage)]/10 text-[var(--color-forest)] px-2.5 py-1 rounded-full font-bold">
                            {(holding.allocation * 100).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[var(--color-cream)] border border-[var(--color-border-subtle)] rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--color-forest)] mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Watchlist
            </h2>
            <div className="flex gap-3 flex-wrap">
              {portfolio.watchlist.symbols.length === 0 ? (
                <span className="text-sm text-[var(--color-text-secondary)] italic">Watchlist is empty.</span>
              ) : (
                portfolio.watchlist.symbols.map(symbol => (
                  <span key={symbol} className={`px-4 py-2 border rounded-lg text-sm font-bold shadow-sm transition-colors ${symbol === selectedSymbol ? 'bg-[var(--color-sage)]/20 border-[var(--color-forest)] text-[var(--color-forest)]' : 'bg-[var(--color-ivory)] border-[var(--color-border-subtle)] text-[var(--color-text-main)]'}`}>
                    {symbol}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
