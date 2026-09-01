export interface MarketData {
  symbol: string;
  price: number;
  change_pct: number;
  volume: number;
  avg_volume: number;
  rsi: number;
  momentum: number;
  volatility: number;
  sector_change_pct: number;
  sentiment_score: number;
}

export interface RiskProfile {
  risk_profile: string;
  volatility_tolerance: number;
  position_size_tolerance: number;
}

export interface UserProfile {
  user_id: string;
  name: string;
  risk_profile: RiskProfile;
}

export interface Holding {
  symbol: string;
  quantity: number;
  allocation: number;
}

export interface Watchlist {
  symbols: string[];
}

export interface Portfolio {
  user_id: string;
  holdings: Holding[];
  watchlist: Watchlist;
}

export interface AgentSource {
  document_id: string;
  title: string;
  source: string;
  chunk_text: string;
  similarity?: number;
}

export interface AgentResult {
  agent: string;
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  reasoning: string[];
  risk_flags: string[];
  sources: AgentSource[];
  latency_ms: number;
  started_at: string;
  completed_at: string;
}

export interface SynthesisResult {
  action: 'BUY' | 'HOLD' | 'REDUCE' | 'INSUFFICIENT_EVIDENCE';
  confidence: number;
  summary: string;
  reasons: string[];
  risk_adjustment: string;
  sources: AgentSource[];
  base_score: number;
  risk_adjusted_score: number;
}

export interface ReasoningEvent {
  event: string;
  timestamp: string;
  details: Record<string, any>;
}

export interface SessionMetrics {
  total_latency_ms: number;
  parallel_execution_ms: number;
  sequential_estimated_ms: number;
  parallelism_saved_ms: number;
  technical_latency_ms: number;
  sentiment_latency_ms: number;
  fundamental_latency_ms: number;
  portfolio_concentration_score: number;
  simulated_forward_return?: number;
}

export interface AnalysisResponse {
  session_id: string;
  symbol: string;
  market: MarketData;
  profile: UserProfile;
  portfolio: Portfolio;
  agents: Record<string, AgentResult>;
  synthesis: SynthesisResult;
  reasoning_trace: ReasoningEvent[];
  metrics: SessionMetrics;
  degraded: boolean;
  warnings: string[];
}

export interface AnalysisRequest {
  user_id: string;
  symbol: string;
}
