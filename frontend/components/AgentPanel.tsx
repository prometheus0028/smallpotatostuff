'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentResult, AgentStatus } from '../lib/types';
import { Cpu, Zap, MessageSquare, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface AgentPanelProps {
  agents: Record<string, AgentResult>;
  isAnalyzing: boolean;
}

const AGENT_CONFIG = [
  {
    key: 'technical',
    label: 'Technical Agent',
    role: 'Quantitative Momentum & RSI Indicators',
    icon: Zap,
  },
  {
    key: 'sentiment',
    label: 'Sentiment Agent',
    role: 'NLP News & Retail Feeds Analysis',
    icon: MessageSquare,
  },
  {
    key: 'fundamental',
    label: 'Fundamental Agent',
    role: 'Quarterly Filings & Vector RAG Intelligence',
    icon: FileText,
  },
];

function StatusBadge({ status }: { status: AgentStatus }) {
  if (status === 'RUNNING') {
    return (
      <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        <motion.span
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.0, ease: 'easeInOut' }}
          className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"
        />
        <span>RUNNING</span>
      </span>
    );
  }
  if (status === 'COMPLETE') {
    return (
      <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-fin-bullishBg text-fin-bullish border border-fin-bullishBorder">
        <CheckCircle2 className="w-3 h-3 text-fin-bullish" />
        <span>COMPLETE</span>
      </span>
    );
  }
  if (status === 'UNAVAILABLE') {
    return (
      <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-fin-bearishBg text-fin-bearish border border-fin-bearishBorder">
        <AlertCircle className="w-3 h-3 text-fin-bearish" />
        <span>UNAVAILABLE</span>
      </span>
    );
  }
  return (
    <span className="text-[11px] font-medium text-fin-text3 px-2 py-0.5 rounded-full bg-fin-surface2 border border-fin-border">
      IDLE
    </span>
  );
}

function SignalPill({ signal }: { signal: string }) {
  if (signal === 'BULLISH') {
    return (
      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-fin-bullishBg text-fin-bullish border border-fin-bullishBorder">
        BULLISH
      </span>
    );
  }
  if (signal === 'BEARISH') {
    return (
      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-fin-bearishBg text-fin-bearish border border-fin-bearishBorder">
        BEARISH
      </span>
    );
  }
  if (signal === 'CAUTIOUS') {
    return (
      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-fin-cautiousBg text-fin-cautious border border-fin-cautiousBorder">
        CAUTIOUS
      </span>
    );
  }
  return <span className="text-[11px] font-medium text-fin-text3">—</span>;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ agents }) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  return (
    <div className="bg-fin-surface border border-fin-border rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-fin-border">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-fin-accent" />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-fin-text">
              Autonomous Agent Analysis
            </h2>
            <p className="text-[11px] text-fin-text3 font-medium mt-0.5">
              Simultaneous parallel execution (Promise.all pipeline)
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-fin-surface2 border border-fin-border text-fin-text2">
          3 AGENTS · PARALLEL EXECUTION
        </span>
      </div>

      {/* PS-01 Visual Flow Diagram */}
      <div className="mb-6 px-4 py-3 bg-fin-surface2/40 border border-fin-border/60 rounded-lg flex items-center justify-between text-[10px] font-mono font-bold text-fin-text3">
        <div className="flex flex-col items-center">
          <span className="text-fin-text2">MARKET DATA</span>
        </div>
        <div className="w-8 h-px bg-fin-border/80 relative">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-[6px] border-l-fin-border/80" />
        </div>
        <div className="flex flex-col gap-1 border-l-2 border-fin-border/60 pl-3 py-1">
          <span>TECHNICAL</span>
          <span>SENTIMENT</span>
          <span>FUNDAMENTAL</span>
        </div>
        <div className="w-8 h-px bg-fin-border/80 relative">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-[6px] border-l-fin-border/80" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-fin-accent">SYNTHESIS</span>
        </div>
        <div className="w-8 h-px bg-fin-border/80 relative">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-[6px] border-l-fin-border/80" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-fin-bullish">RECOMMENDATION</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-fin-border text-[10px] uppercase font-bold text-fin-text3 tracking-wider">
              <th className="py-2.5 font-semibold w-[32%]">Agent Pipeline</th>
              <th className="py-2.5 font-semibold w-[20%]">Status</th>
              <th className="py-2.5 font-semibold w-[18%]">Signal</th>
              <th className="py-2.5 font-semibold w-[16%]">Confidence</th>
              <th className="py-2.5 font-semibold w-[14%] text-right">Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fin-border">
            {AGENT_CONFIG.map(({ key, label, role, icon: Icon }) => {
              const agent = agents[key];
              if (!agent) return null;
              const isHovered = hoveredKey === key;

              return (
                <React.Fragment key={key}>
                  <motion.tr
                    onHoverStart={() => setHoveredKey(key)}
                    onHoverEnd={() => setHoveredKey(null)}
                    animate={{ backgroundColor: isHovered ? '#F8FAFC' : 'transparent' }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="cursor-pointer transition-colors"
                  >
                    {/* Agent Name + Icon + Role */}
                    <td className="py-3.5 pr-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-fin-surface2 border border-fin-border flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-fin-text2" />
                        </div>
                        <div>
                          <span className="font-bold text-fin-text block leading-snug">{label}</span>
                          <span className="text-[10px] text-fin-text3 block">{role}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5">
                      <StatusBadge status={agent.status} />
                    </td>

                    {/* Signal */}
                    <td className="py-3.5">
                      <SignalPill signal={agent.signal} />
                    </td>

                    {/* Confidence Meter */}
                    <td className="py-3.5">
                      {agent.status === 'COMPLETE' ? (
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-fin-text">{agent.confidence}%</span>
                          <div className="w-14 bg-fin-surface2 rounded-full h-1.5 overflow-hidden border border-fin-border/60">
                            <div
                              className="bg-fin-accent h-full rounded-full transition-all duration-500"
                              style={{ width: `${agent.confidence}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-fin-text3 font-mono">—</span>
                      )}
                    </td>

                    {/* Latency */}
                    <td className="py-3.5 text-right font-mono font-semibold text-fin-text2">
                      {agent.latencyMs > 0 ? (
                        <span className="inline-flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-fin-text3" />
                          <span>{agent.latencyMs}ms</span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </motion.tr>

                  {/* Expandable Reasoning snippet */}
                  <tr>
                    <td colSpan={5} className="p-0">
                      <AnimatePresence initial={false}>
                        {isHovered && agent.status === 'COMPLETE' && agent.reasoning && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="overflow-hidden bg-fin-surface2/70 border-b border-fin-border"
                          >
                            <div className="px-4 py-3 text-xs border-l-2 border-fin-accent space-y-2">
                              <p className="text-fin-text2 italic">&ldquo;{agent.reasoning}&rdquo;</p>
                              {key === 'fundamental' && (
                                <div className="pt-1.5 flex items-center justify-between border-t border-fin-border/60">
                                  <span className="text-[10px] font-bold tracking-wide uppercase text-fin-text3">
                                    Evidence used: 3 sources
                                  </span>
                                  <a href="#evidence" onClick={(e) => {
                                      e.preventDefault();
                                      document.querySelector('#evidence')?.scrollIntoView({ behavior: 'smooth' });
                                  }} className="text-[10px] font-bold text-fin-accent hover:underline flex items-center gap-1 cursor-pointer">
                                    VIEW EVIDENCE →
                                  </a>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
