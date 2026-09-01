'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  StockSymbol,
  RiskProfile,
  StockMarketData,
  AgentResult,
  SynthesisResult,
  EvidenceItem,
  PortfolioHolding,
  WatchlistItem,
  ReasoningTraceEntry,
} from '../lib/types';
import { getMarketData, runMultiAgentAnalysis } from '../lib/api';
import {
  MOCK_AGENTS,
  MOCK_SYNTHESIS,
  MOCK_EVIDENCE,
  MOCK_PORTFOLIO,
  MOCK_WATCHLIST,
  MOCK_STOCKS,
  DEGRADED_SYNTHESIS,
} from '../lib/mockData';

import { Sidebar }               from '../components/Sidebar';
import { Header }                from '../components/Header';
import { MetricsBanner }         from '../components/MetricsBanner';
import { MarketSignalsCard }     from '../components/MarketSignalsCard';
import { AgentPanel }            from '../components/AgentPanel';
import { ProfileSwitcher }       from '../components/ProfileSwitcher';
import { SynthesisPanel }        from '../components/SynthesisPanel';
import { EvidencePanel }         from '../components/EvidencePanel';
import { PortfolioPanel }        from '../components/PortfolioPanel';
import { ReasoningTraceTimeline } from '../components/ReasoningTraceTimeline';

export default function DashboardPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<StockSymbol>('RELIANCE');
  const [activeProfile,  setActiveProfile]  = useState<RiskProfile>('Conservative');
  const [isDegradedMode, setIsDegradedMode] = useState(false);
  const [isAnalyzing,    setIsAnalyzing]    = useState(false);

  const [marketData, setMarketData] = useState<StockMarketData>(MOCK_STOCKS.RELIANCE);
  const portfolio: PortfolioHolding[] = MOCK_PORTFOLIO;
  const watchlist:  WatchlistItem[]   = MOCK_WATCHLIST;

  const [agents, setAgents] = useState<Record<string, AgentResult>>({
    technical:   { ...MOCK_AGENTS.technical,   status: 'COMPLETE' },
    sentiment:   { ...MOCK_AGENTS.sentiment,   status: 'COMPLETE' },
    fundamental: { ...MOCK_AGENTS.fundamental, status: 'COMPLETE' },
  });

  const [synthesis, setSynthesis] = useState<SynthesisResult>(MOCK_SYNTHESIS.Conservative);
  const [evidence,  setEvidence]  = useState<EvidenceItem[]>(MOCK_EVIDENCE);
  const [trace,     setTrace]     = useState<ReasoningTraceEntry[]>([]);
  const [totalLatencyMs, setTotalLatencyMs] = useState(1150);

  // Hydration-safe initial trace
  useEffect(() => {
    setTrace([
      {
        id: 'init-1',
        timestamp: new Date().toTimeString().split(' ')[0],
        event: 'System initialized. RELIANCE dataset loaded.',
        type: 'INFO',
      },
    ]);
  }, []);

  const handleSelectSymbol = useCallback(async (symbol: StockSymbol) => {
    setSelectedSymbol(symbol);
    const data = await getMarketData(symbol);
    setMarketData(data);
  }, []);

  const handleRunAnalysis = useCallback(async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setTrace([]);

    try {
      const res = await runMultiAgentAnalysis(
        selectedSymbol,
        activeProfile,
        isDegradedMode,
        (updatedAgents, newTrace) => {
          setAgents(updatedAgents);
          setTrace((prev) => [...prev, newTrace]);
        }
      );
      setSynthesis(res.synthesis);
      setEvidence(res.evidence);
      setTotalLatencyMs(res.totalLatencyMs);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedSymbol, activeProfile, isDegradedMode, isAnalyzing]);

  const handleSelectProfile = useCallback((profile: RiskProfile) => {
    setActiveProfile(profile);
    if (!isDegradedMode) {
      setSynthesis(MOCK_SYNTHESIS[profile]);
      setTrace((prev) => [
        ...prev,
        {
          id: `tr-prof-${Date.now()}`,
          timestamp: new Date().toTimeString().split(' ')[0],
          event: `Risk profile updated to ${profile}.`,
          type: 'INFO',
        },
      ]);
    }
  }, [isDegradedMode]);

  const handleToggleDegradedMode = useCallback(() => {
    setIsDegradedMode((prev) => {
      const next = !prev;
      if (next) {
        setAgents((a) => ({
          ...a,
          fundamental: {
            ...MOCK_AGENTS.fundamental,
            status: 'UNAVAILABLE',
            signal: 'UNAVAILABLE',
            confidence: 0,
            reasoning: 'RAG pipeline offline.',
            keyFactors: [],
          },
        }));
        setSynthesis(DEGRADED_SYNTHESIS);
        setEvidence([]);
        setTrace((t) => [
          ...t,
          {
            id: `tr-deg-${Date.now()}`,
            timestamp: new Date().toTimeString().split(' ')[0],
            event: 'DATA STATUS: DEGRADED — Fundamental pipeline offline.',
            type: 'WARNING',
          },
        ]);
      } else {
        setAgents({
          technical:   { ...MOCK_AGENTS.technical,   status: 'COMPLETE' },
          sentiment:   { ...MOCK_AGENTS.sentiment,   status: 'COMPLETE' },
          fundamental: { ...MOCK_AGENTS.fundamental, status: 'COMPLETE' },
        });
        setSynthesis(MOCK_SYNTHESIS[activeProfile]);
        setEvidence(MOCK_EVIDENCE);
        setTrace((t) => [
          ...t,
          {
            id: `tr-deg-off-${Date.now()}`,
            timestamp: new Date().toTimeString().split(' ')[0],
            event: 'DATA STATUS: NOMINAL — Pipelines restored.',
            type: 'INFO',
          },
        ]);
      }
      return next;
    });
  }, [activeProfile]);

  useEffect(() => {
    handleSelectSymbol('RELIANCE');
  }, [handleSelectSymbol]);

  const currentHolding = portfolio.find((h) => h.symbol === selectedSymbol);
  const concentration   = currentHolding?.concentrationScore ?? 34.2;

  return (
    <div className="flex h-screen bg-fin-bg text-fin-text overflow-hidden font-sans selection:bg-fin-accentDim selection:text-fin-accent">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Header */}
        <Header
          selectedSymbol={selectedSymbol}
          onSelectSymbol={handleSelectSymbol}
          marketData={marketData}
          isDegradedMode={isDegradedMode}
          onToggleDegradedMode={handleToggleDegradedMode}
          onRunAnalysis={handleRunAnalysis}
          isAnalyzing={isAnalyzing}
        />

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto bg-fin-bg">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="max-w-[1500px] mx-auto px-6 py-6 pb-16 space-y-6"
          >
            {/* Top Metrics KPI Cards */}
            <MetricsBanner
              totalLatencyMs={totalLatencyMs}
              historicalAccuracy={89.2}
              concentrationScore={concentration}
            />

            {/* Quantitative Market Signals */}
            <MarketSignalsCard marketData={marketData} />

            {/* 2-Column Main Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (7 cols): Agents + Profile + Synthesis */}
              <div className="lg:col-span-7 space-y-6">
                <AgentPanel agents={agents} isAnalyzing={isAnalyzing} />

                <ProfileSwitcher
                  activeProfile={activeProfile}
                  onSelectProfile={handleSelectProfile}
                />

                <SynthesisPanel
                  synthesis={synthesis}
                  activeProfile={activeProfile}
                />
              </div>

              {/* Right Column (5 cols): Portfolio + Evidence + Trace */}
              <div className="lg:col-span-5 space-y-6">
                <PortfolioPanel
                  portfolio={portfolio}
                  watchlist={watchlist}
                  onSelectStock={handleSelectSymbol}
                  activeSymbol={selectedSymbol}
                />

                <EvidencePanel
                  evidence={evidence}
                  isDegraded={isDegradedMode}
                />

                <ReasoningTraceTimeline
                  trace={trace}
                  isAnalyzing={isAnalyzing}
                />
              </div>
            </div>

            {/* Footer */}
            <footer className="pt-4 border-t border-fin-border text-center text-[11px] text-fin-text3 font-medium">
              HACKVERSE PS-01 • Multi-Agent Autonomous Financial Intelligence System for Retail Investors
            </footer>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
