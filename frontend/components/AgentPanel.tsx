'use client';

import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { AgentResult } from '@/types/api';

interface AgentPanelProps {
  agents: Record<string, AgentResult>;
  isLoading: boolean;
}

const formatAgentName = (name: string) => {
  return name.charAt(0).toUpperCase() + name.slice(1) + ' Agent';
};

export function AgentPanel({ agents, isLoading }: AgentPanelProps) {
  // Enforce consistent ordering
  const agentOrder = ['technical', 'sentiment', 'fundamental'];
  const orderedAgents = agentOrder
    .map(key => agents[key])
    .filter(Boolean);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[var(--color-forest)] mb-4">Agent Execution</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {orderedAgents.map((agent) => {
          const isUnavailable = agent.confidence === 0 && agent.reasoning.some(r => r.toLowerCase().includes('error'));
          
          return (
          <div 
            key={agent.agent}
            className="bg-[var(--color-cream)] border border-[var(--color-border-subtle)] rounded-xl overflow-hidden flex flex-col shadow-sm"
          >
            <div className="p-5 border-b border-[var(--color-border-subtle)] flex justify-between items-center bg-[var(--color-ivory)]">
              <h3 className="font-bold text-[var(--color-text-main)]">{formatAgentName(agent.agent)}</h3>
              {isLoading ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> RUNNING
                </span>
              ) : isUnavailable ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-rose-500">
                  <AlertCircle className="w-3.5 h-3.5" /> UNAVAILABLE
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-[var(--color-sage)]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETE
                </span>
              )}
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              {!isLoading && !isUnavailable && agent.signal ? (
                <>
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest font-bold block mb-1">Signal</span>
                      <span className={`text-xl font-bold ${agent.signal === 'BULLISH' ? 'text-[var(--color-sage)]' : agent.signal === 'BEARISH' ? 'text-rose-500' : 'text-amber-500'}`}>
                        {agent.signal}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest font-bold block mb-1">Confidence</span>
                      <span className="text-xl font-bold text-[var(--color-text-main)]">{Math.round((agent.confidence || 0) * 100)}%</span>
                    </div>
                  </div>
                  
                  <div className="mb-6 flex-1">
                    <ul className="space-y-2">
                      {agent.reasoning.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)] leading-snug">
                          <span className="text-[var(--color-text-secondary)] mt-0.5">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {agent.latency_ms && (
                    <div className="pt-4 border-t border-[var(--color-border-subtle)] text-[11px] font-medium text-[var(--color-text-secondary)] flex justify-between uppercase tracking-wider">
                      <span>Latency</span>
                      <span>{agent.latency_ms}ms</span>
                    </div>
                  )}
                </>
              ) : isUnavailable ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <AlertCircle className="w-6 h-6 mb-2 text-rose-300" />
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Agent could not complete execution due to missing data.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 text-[var(--color-text-secondary)]/50 animate-spin mb-3" />
                  <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest">Processing signals...</span>
                </div>
              )}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
