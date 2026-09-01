'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { MarketSignals } from '@/components/MarketSignals';
import { AgentPanel } from '@/components/AgentPanel';
import { SynthesisPanel } from '@/components/SynthesisPanel';
import { EvidencePanel } from '@/components/EvidencePanel';
import { MetricsPanel } from '@/components/MetricsPanel';
import { ProfileSwitcher } from '@/components/ProfileSwitcher';
import { api } from '@/services/api';
import { useStock } from '@/app/dashboard/StockContext';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function DashboardOverview() {
  const { selectedSymbol } = useStock();
  const [profile, setProfile] = useState<'CONSERVATIVE' | 'AGGRESSIVE'>('CONSERVATIVE');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDegraded, setIsDegraded] = useState(false);

  const fetchData = async (useDegraded = false) => {
    setIsLoading(true);
    try {
      if (useDegraded) {
        await api.toggleDegradedMode(true);
      } else {
        await api.toggleDegradedMode(false);
      }
      const userId = profile === 'CONSERVATIVE' ? 'demo-conservative' : 'demo-aggressive';
      const result = await api.analyzeStock(userId, selectedSymbol);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(isDegraded);
  }, [profile, isDegraded, selectedSymbol]);

  const handleProfileChange = (newProfile: 'CONSERVATIVE' | 'AGGRESSIVE') => {
    setProfile(newProfile);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="pb-20 max-w-6xl mx-auto">
      <div className="flex justify-end items-center mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDegraded(!isDegraded)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
              isDegraded 
                ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                : 'bg-[var(--color-ivory)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] border border-[var(--color-border-subtle)]'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            {isDegraded ? 'Fix Data Source' : 'Trigger Degraded Data'}
          </button>
          
          <button 
            onClick={() => fetchData(isDegraded)}
            disabled={isLoading}
            className="px-4 py-1.5 bg-[var(--color-forest)] hover:bg-[var(--color-forest-light)] text-white border border-transparent rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Run Analysis
          </button>
          
          <ProfileSwitcher currentProfile={profile} onChange={handleProfileChange} />
        </div>
      </div>

      {!data ? (
        <div className="h-96 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-[var(--color-forest)] animate-spin" />
        </div>
      ) : (
        <>
          <Header 
            symbol={data.symbol} 
            price={data.market.price}
            changePct={data.market.change_pct}
            overallSignal={data.synthesis.action !== 'INSUFFICIENT_EVIDENCE' ? data.synthesis.action : 'UNKNOWN'}
            confidence={data.synthesis.confidence}
          />
          
          <MarketSignals 
            momentum={data.market.momentum}
            avgVolume={data.market.avg_volume}
            currentVolume={data.market.volume}
            sentimentScore={data.market.sentiment_score}
          />
          
          <AgentPanel agents={data.agents} isLoading={isLoading} />
          
          <SynthesisPanel 
            action={data.synthesis.action}
            confidence={data.synthesis.confidence}
            summary={data.synthesis.summary}
            reasons={data.synthesis.reasons}
            riskAdjustment={data.synthesis.risk_adjustment}
          />
          
          <MetricsPanel metrics={data.metrics} />
          
          {data.agents.fundamental?.sources && data.agents.fundamental.sources.length > 0 && (
            <EvidencePanel sources={data.agents.fundamental.sources} />
          )}
          
          {/* Reasoning Trace snippet for the overview page */}
          <div className="bg-[var(--color-cream)] border border-[var(--color-border-subtle)] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--color-text-main)] mb-4">Reasoning Trace</h3>
            <div className="font-mono text-sm text-[var(--color-text-secondary)] space-y-2 h-40 overflow-y-auto">
              {data.reasoning_trace.map((trace: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  <span className="text-[var(--color-sage)] font-semibold shrink-0">{new Date(trace.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                  <span className="text-[var(--color-text-secondary)] font-medium">{trace.event}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
