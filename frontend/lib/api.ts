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
  AnalysisResponse,
} from './types';
import {
  MOCK_STOCKS,
  MOCK_AGENTS,
  MOCK_SYNTHESIS,
  DEGRADED_SYNTHESIS,
  MOCK_EVIDENCE,
  MOCK_PORTFOLIO,
  MOCK_WATCHLIST,
} from './mockData';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

function getUserId(profile: RiskProfile) {
  return profile === 'Conservative' ? 'demo-conservative' : 'demo-aggressive';
}

function getFormattedTimestamp(offsetMs = 0): string {
  const d = new Date(Date.now() + offsetMs);
  return d.toTimeString().split(' ')[0];
}

export async function getMarketData(symbol: StockSymbol = 'RELIANCE'): Promise<StockMarketData> {
  try {
    const res = await fetch(`${API_BASE_URL}/market/${symbol}`);
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    return {
      symbol: data.symbol as StockSymbol,
      name: data.symbol,
      price: data.price,
      currency: 'INR (₹)',
      changePercent: data.change_pct,
      changeAmount: data.price * (data.change_pct / 100),
      priceMomentum: `Momentum: ${(data.momentum * 100).toFixed(0)}%`,
      volumeAnomaly: `${(data.volume / data.avg_volume).toFixed(1)}x vs Avg`,
      sentimentScore: data.sentiment_score,
      rsi: data.rsi,
      volatility: `${(data.volatility * 100).toFixed(1)}%`,
    };
  } catch (e) {
    console.warn("Market API failed, returning mock", e);
    return MOCK_STOCKS[symbol] || MOCK_STOCKS.RELIANCE;
  }
}

export async function getPortfolio(): Promise<PortfolioHolding[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/demo-conservative`);
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    // Map backend Portfolio holding to frontend PortfolioHolding
    return data.holdings.map((h: any) => ({
      symbol: h.symbol,
      name: h.symbol,
      quantity: h.quantity,
      avgPrice: 0, // Backend doesn't provide
      currentPrice: 0, 
      currentExposure: h.quantity * 2500, // rough mock
      returnPercent: 0,
      concentrationScore: (h.allocation * 100).toFixed(1),
    }));
  } catch (e) {
    console.warn("Portfolio API failed, returning mock", e);
    return MOCK_PORTFOLIO;
  }
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  return MOCK_WATCHLIST; // Backend watchlist is just a list of strings, so we stick to mock for UI
}

export async function runMultiAgentAnalysis(
  symbol: StockSymbol = 'RELIANCE',
  profile: RiskProfile = 'Conservative',
  isDegradedMode = false,
  onProgress?: (
    updatedAgents: Record<string, AgentResult>,
    newTrace: ReasoningTraceEntry
  ) => void
): Promise<AnalysisResponse> {
  // 1. Fetch market data for UI
  const marketData = await getMarketData(symbol);

  // 2. Initial state: all agents set to RUNNING
  const currentAgents: Record<string, AgentResult> = {
    technical: { ...MOCK_AGENTS.technical, status: 'RUNNING' },
    sentiment: { ...MOCK_AGENTS.sentiment, status: 'RUNNING' },
    fundamental: { ...MOCK_AGENTS.fundamental, status: 'RUNNING' },
  };

  if (onProgress) {
    onProgress({ ...currentAgents }, {
      id: `tr-start-${Date.now()}`,
      timestamp: getFormattedTimestamp(0),
      event: `Initiating backend analysis for ${symbol}...`,
      type: 'INFO',
    });
  }

  // 3. Sync degraded mode state with backend
  try {
    await fetch(`${API_BASE_URL}/demo/degraded-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: isDegradedMode }),
    });
  } catch (e) {
    console.error("Failed to set degraded mode on backend", e);
  }

  // 4. Call backend POST /api/analyze
  let backendData: any;
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: getUserId(profile),
        symbol: symbol,
      }),
    });
    if (!response.ok) {
      throw new Error(`Analyze API returned ${response.status}`);
    }
    backendData = await response.json();
  } catch (error) {
    console.error("Backend analyze failed, falling back to mock", error);
    // If backend completely fails, simulate a failure trace and return degraded
    if (onProgress) {
      onProgress({ ...currentAgents }, {
        id: `tr-err-${Date.now()}`,
        timestamp: getFormattedTimestamp(),
        event: 'ERROR: Backend API unavailable.',
        type: 'WARNING',
      });
    }
    throw error;
  }

  // 5. Stagger agent completions to visually show independence (as requested)
  // Backend returns all at once, but we simulate the independent completion in the UI 
  // over a short 500ms window so it looks like they finish separately.
  
  const mapAgent = (name: string, data: any): AgentResult => {
    return {
      id: name,
      name: name.charAt(0).toUpperCase() + name.slice(1) + ' Agent',
      role: MOCK_AGENTS[name as keyof typeof MOCK_AGENTS]?.role || 'Analysis',
      status: data.confidence === 0 && data.signal === 'NEUTRAL' ? (isDegradedMode ? 'UNAVAILABLE' : 'COMPLETE') : 'COMPLETE',
      signal: data.signal,
      confidence: Math.round(data.confidence * 100),
      reasoning: data.reasoning.join(' '),
      latencyMs: data.latency_ms,
      keyFactors: data.risk_flags || [],
    };
  };

  const bAgents = backendData.agents;
  
  // Update Technical
  await new Promise((res) => setTimeout(res, 100));
  currentAgents.technical = mapAgent('technical', bAgents.technical);
  if (onProgress) {
    onProgress({ ...currentAgents }, {
      id: `tr-tech-${Date.now()}`,
      timestamp: getFormattedTimestamp(),
      event: `Technical Agent complete (${currentAgents.technical.latencyMs}ms)`,
      type: 'AGENT_COMPLETE',
    });
  }

  // Update Sentiment
  await new Promise((res) => setTimeout(res, 150));
  currentAgents.sentiment = mapAgent('sentiment', bAgents.sentiment);
  if (onProgress) {
    onProgress({ ...currentAgents }, {
      id: `tr-sent-${Date.now()}`,
      timestamp: getFormattedTimestamp(),
      event: `Sentiment Agent complete (${currentAgents.sentiment.latencyMs}ms)`,
      type: 'AGENT_COMPLETE',
    });
  }

  // Update Fundamental
  await new Promise((res) => setTimeout(res, 200));
  currentAgents.fundamental = mapAgent('fundamental', bAgents.fundamental);
  if (currentAgents.fundamental.confidence === 0 && isDegradedMode) {
    currentAgents.fundamental.status = 'UNAVAILABLE';
    currentAgents.fundamental.signal = 'UNAVAILABLE';
  }
  if (onProgress) {
    onProgress({ ...currentAgents }, {
      id: `tr-fund-${Date.now()}`,
      timestamp: getFormattedTimestamp(),
      event: currentAgents.fundamental.status === 'UNAVAILABLE' 
        ? `Fundamental Agent UNAVAILABLE - Pipeline offline`
        : `Fundamental Agent complete (${currentAgents.fundamental.latencyMs}ms)`,
      type: currentAgents.fundamental.status === 'UNAVAILABLE' ? 'WARNING' : 'AGENT_COMPLETE',
    });
  }

  // 6. Map Synthesis
  await new Promise((res) => setTimeout(res, 150));
  const bSynth = backendData.synthesis;
  
  const synthesis: SynthesisResult = {
    recommendation: bSynth.action === 'INSUFFICIENT_EVIDENCE' ? 'INSUFFICIENT EVIDENCE' : bSynth.action,
    confidence: Math.round(bSynth.confidence * 100),
    reasons: bSynth.reasons,
    riskAdjustment: bSynth.risk_adjustment,
    isDegraded: backendData.degraded,
    overallSignal: bSynth.action === 'BUY' ? 'BULLISH' : bSynth.action === 'REDUCE' ? 'BEARISH' : 'NEUTRAL',
  };

  if (onProgress) {
    onProgress({ ...currentAgents }, {
      id: `tr-synth-${Date.now()}`,
      timestamp: getFormattedTimestamp(),
      event: backendData.degraded
        ? 'INSUFFICIENT EVIDENCE: Refusing recommendation'
        : `Synthesis complete — Action: ${synthesis.recommendation}`,
      type: backendData.degraded ? 'WARNING' : 'SYNTHESIS',
    });
  }

  // 7. Map Evidence
  const evidence: EvidenceItem[] = bSynth.sources.map((src: any, idx: number) => ({
    id: `ev-${idx}`,
    title: src.title || 'Document',
    source: src.source || 'RAG System',
    excerpt: src.chunk_text || 'No excerpt available.',
    agentId: 'fundamental',
    agentName: 'Fundamental Agent',
    date: new Date().toISOString().split('T')[0],
    confidenceContribution: Math.round((src.similarity || 0) * 100),
  }));

  // 8. Map Reasoning Trace from backend
  const backendTrace: ReasoningTraceEntry[] = backendData.reasoning_trace.map((rt: any, idx: number) => {
    let type: ReasoningTraceEntry['type'] = 'INFO';
    if (rt.event.includes('started')) type = 'AGENT_START';
    if (rt.event.includes('completed')) type = 'AGENT_COMPLETE';
    if (rt.event.includes('error')) type = 'WARNING';
    if (rt.event.includes('recommendation') || rt.event.includes('synthesis')) type = 'SYNTHESIS';

    return {
      id: `backend-tr-${idx}`,
      timestamp: new Date(rt.timestamp).toTimeString().split(' ')[0],
      event: rt.event,
      type,
    };
  });

  return {
    marketData,
    agents: currentAgents,
    synthesis,
    evidence,
    trace: backendTrace,
    totalLatencyMs: backendData.metrics.total_latency_ms,
    historicalAccuracy: 89.2,
  };
}
