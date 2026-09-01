export type StockSymbol = 'RELIANCE' | 'TCS' | 'INFOSYS' | 'HDFCBANK' | 'TATAMOTORS';

export type RiskProfile = 'Conservative' | 'Aggressive';

export type AgentStatus = 'IDLE' | 'RUNNING' | 'COMPLETE' | 'UNAVAILABLE';

export type SignalRating = 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'CAUTIOUS' | 'UNAVAILABLE';

export type RecommendationType = 'BUY' | 'HOLD' | 'REDUCE' | 'SELL' | 'INSUFFICIENT EVIDENCE';

export interface StockMarketData {
  symbol: StockSymbol;
  name: string;
  price: number;
  currency: string;
  changePercent: number;
  changeAmount: number;
  priceMomentum: string;
  volumeAnomaly: string;
  sentimentScore: number; // e.g. +0.72
  rsi: number; // e.g. 64.2
  volatility: string; // e.g. "18.4% Moderate"
}

export interface AgentResult {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  signal: SignalRating;
  confidence: number; // 0 - 100
  reasoning: string;
  latencyMs: number;
  keyFactors: string[];
}

export interface SynthesisResult {
  recommendation: RecommendationType;
  confidence: number;
  reasons: string[];
  riskAdjustment: string;
  isDegraded: boolean;
  overallSignal: SignalRating;
}

export interface EvidenceItem {
  id: string;
  title: string;
  source: string;
  excerpt: string;
  agentId: string;
  agentName: string;
  date: string;
  confidenceContribution: number;
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  currentExposure: number;
  returnPercent: number;
  concentrationScore: number; // percentage of total portfolio e.g. 34%
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  signal: SignalRating;
}

export interface ReasoningTraceEntry {
  id: string;
  timestamp: string;
  event: string;
  agentId?: string;
  type: 'INFO' | 'AGENT_START' | 'AGENT_COMPLETE' | 'SYNTHESIS' | 'WARNING';
}

export interface AnalysisResponse {
  marketData: StockMarketData;
  agents: Record<string, AgentResult>;
  synthesis: SynthesisResult;
  evidence: EvidenceItem[];
  trace: ReasoningTraceEntry[];
  totalLatencyMs: number;
  historicalAccuracy: number;
}

