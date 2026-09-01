'use client';

import { useState, useEffect } from 'react';
import { useStock } from '@/app/dashboard/StockContext';
import { api } from '@/services/api';
import { RefreshCw } from 'lucide-react';
import { AgentPanel } from '@/components/AgentPanel';
import { EvidencePanel } from '@/components/EvidencePanel';

export default function AgentsPage() {
  const { selectedSymbol } = useStock();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await api.analyzeStock('demo-conservative', selectedSymbol);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [selectedSymbol]);

  return (
    <div className="pb-20">
      <div className="flex justify-end items-center mb-8">
        <button 
          onClick={fetchAnalysis}
          disabled={isLoading}
          className="px-4 py-1.5 bg-[var(--color-forest)] hover:bg-[var(--color-forest-light)] text-white border border-transparent rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Run Agents
        </button>
      </div>

      {!data && isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-[var(--color-forest)] animate-spin" />
        </div>
      ) : data ? (
        <div className="space-y-8">
          <AgentPanel agents={data.agents} isLoading={isLoading} />
          
          {data.agents.fundamental?.sources && data.agents.fundamental.sources.length > 0 && (
            <div className="pt-8 border-t border-[var(--color-border-subtle)]">
              <EvidencePanel sources={data.agents.fundamental.sources} />
            </div>
          )}
          
          <div className="bg-[var(--color-cream)] border border-[var(--color-border-subtle)] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--color-text-main)] mb-4">Complete Reasoning Trace</h3>
            <div className="font-mono text-sm text-[var(--color-text-secondary)] space-y-2 h-64 overflow-y-auto bg-[var(--color-ivory)] p-4 rounded-lg border border-[var(--color-border-subtle)]">
              {data.reasoning_trace.map((trace: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  <span className="text-[var(--color-sage)] font-semibold shrink-0">{new Date(trace.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                  <span className="text-[var(--color-text-secondary)] font-medium">{trace.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-[var(--color-text-secondary)]">
          <p>Failed to load agent data.</p>
        </div>
      )}
    </div>
  );
}
