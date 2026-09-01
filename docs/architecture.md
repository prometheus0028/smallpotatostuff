# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FINANCIAL INTELLIGENCE BACKEND                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                 │
│  │   MARKET     │    │   USER       │    │  PORTFOLIO   │                 │
│  │   DATA       │    │   PROFILE    │    │  / WATCHLIST │                 │
│  │   SERVICE    │    │   SERVICE    │    │  SERVICE     │                 │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                 │
│         │                   │                   │                          │
│         └───────────────────┼───────────────────┘                          │
│                             ▼                                              │
│              ┌────────────────────────────────┐                          │
│              │      AGENT ORCHESTRATOR        │                          │
│              │   (asyncio.gather parallel)    │                          │
│              └───────────────┬────────────────┘                          │
│                              │                                            │
│         ┌────────────────────┼────────────────────┐                      │
│         ▼                    ▼                    ▼                      │
│ ┌───────────────┐    ┌───────────────┐    ┌───────────────┐            │
│ │  TECHNICAL    │    │  SENTIMENT    │    │  FUNDAMENTAL  │            │
│ │  AGENT        │    │  AGENT        │    │  RAG AGENT    │            │
│ │               │    │               │    │               │            │
│ │ • RSI         │    │ • Sentiment   │    │ • retrieve_   │            │
│ │ • Momentum    │    │   score       │    │   documents() │            │
│ │ • Volume      │    │ • Sector      │    │ • Keyword     │            │
│ │ • Volatility  │    │   momentum    │    │   analysis    │            │
│ │ • Price chg   │    │ • Volume      │    │ • LLM enhance │            │
│ └───────┬───────┘    └───────┬───────┘    └───────┬───────┘            │
│         │                    │                    │                      │
│         └────────────────────┼────────────────────┘                      │
│                              ▼                                          │
│              ┌────────────────────────────────┐                         │
│              │       SYNTHESIS ENGINE         │                         │
│              │                                │                         │
│              │ • Weighted scoring             │                         │
│              │   Technical: 30%               │                         │
│              │   Sentiment: 25%               │                         │
│              │   Fundamental: 30%             │                         │
│              │   Risk: 15%                    │                         │
│              │                                │                         │
│              │ • Risk personalization         │                         │
│              │   - Volatility tolerance       │                         │
│              │   - Position size limits       │                         │
│              │   - Portfolio concentration    │                         │
│              │   - Fundamental evidence check │                         │
│              │                                │                         │
│              │ • Action mapping               │                         │
│              │   ≥ 0.45 → BUY                 │                         │
│              │   ≤ -0.45 → REDUCE             │                         │
│              │   else → HOLD                  │                         │
│              │   No fundamental →             │                         │
│              │   INSUFFICIENT_EVIDENCE        │                         │
│              └───────────────┬────────────────┘                         │
│                              │                                          │
│                              ▼                                          │
│              ┌────────────────────────────────┐                         │
│              │         RESPONSE BUILDER       │                         │
│              │                                │                         │
│              │ • Reasoning trace              │                         │
│              │ • Source attribution           │                         │
│              │ • Metrics calculation          │                         │
│              │ • Session storage              │                         │
│              └────────────────────────────────┘                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Market Data Service (`app/services/market.py`)

Simulated market data provider for hackathon demo.
- Deterministic data for RELIANCE, HDFCBANK, TATAMOTORS
- Structured for easy replacement with real provider
- Returns `MarketData` Pydantic model

### 2. Profile Service (`app/services/profile.py`)

Manages user risk profiles.
- Three demo profiles: conservative, aggressive, moderate
- Risk parameters: volatility_tolerance, position_size_tolerance
- Extensible for dynamic profiles

### 3. Portfolio Service (`app/services/portfolio.py`)

Manages holdings and watchlists.
- Holdings with allocation percentages
- Watchlist symbols
- **Concentration metric**: Herfindahl-Hirschman Index (sum of squared weights)

### 4. Specialist Agents (`app/agents/`)

All agents inherit from `BaseAgent` and implement `analyze(context) -> AgentResult`.

#### Technical Agent (`technical.py`)
- Pure deterministic numerical analysis
- Indicators: RSI, momentum, volume ratio, price change, volatility
- No LLM usage - fast and reliable

#### Sentiment Agent (`sentiment.py`)
- Market sentiment interpretation
- Sector momentum, sentiment score, volume behavior
- Price-sentiment alignment check

#### Fundamental/RAG Agent (`fundamental.py`)
- Retrieves documents via `retrieve_documents()` adapter
- Keyword-based deterministic analysis (primary)
- Optional LLM enhancement via OpenAI (fallback-safe)
- **Critical**: Never fabricates evidence; confidence=0 if no documents

### 5. RAG Adapter (`app/services/rag.py`)

**Adapter boundary** for Person 2's retrieval infrastructure.
- Interface: `retrieve_documents(symbol, query, top_k) -> List[Dict]`
- Degraded mode flag for demo control
- Mock documents for hackathon demo
- Ready for Person 2's pgvector implementation

### 6. Synthesis Engine (`app/services/synthesis.py`)

Core decision logic.
- Explicit weighted scoring (not unconstrained LLM)
- Risk adjustment based on user profile
- Portfolio concentration awareness
- Source propagation from agents to final response
- Clear action thresholds

### 7. Session Management (`app/services/session.py`)

In-memory session store (replaceable with Redis/DB).
- Stores complete analysis response
- Retrieval by session_id

## Data Flow

```
Request: POST /api/analyze {user_id, symbol}
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│ 1. LOAD CONTEXT (parallel-ready, but sequential for deps)    │
│    • market = get_market_data(symbol)                        │
│    • profile = get_profile(user_id)                          │
│    • portfolio = get_portfolio(user_id)                      │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. PARALLEL AGENT EXECUTION (asyncio.gather)                 │
│    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│    │ Technical   │  │ Sentiment   │  │ Fundamental │        │
│    │ analyze()   │  │ analyze()   │  │ analyze()   │        │
│    └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│           │                │                │                │
│           └────────────────┼────────────────┘                │
│                            ▼                                 │
│    AgentResult objects with: signal, confidence, reasoning,  │
│    risk_flags, sources, latency_ms, timestamps               │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. SYNTHESIS                                                 │
│    • base_score = Σ(weight × signal × confidence)            │
│    • risk_adjustment = f(profile, portfolio, market, flags)  │
│    • final_score = base_score + risk_adjustment              │
│    • action = map(final_score)                               │
│    • reasons, summary, sources collected                     │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. RESPONSE ASSEMBLY                                         │
│    • reasoning_trace (timestamped events)                    │
│    • metrics (latency, parallelism, concentration)           │
│    • degraded flag, warnings                                 │
│    • session storage                                         │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
    Response JSON
```

## Concurrency Model

**CRITICAL REQUIREMENT**: Three specialist agents run in TRUE PARALLEL.

```python
# Correct - parallel execution
results = await asyncio.gather(
    technical_agent.analyze(context),
    sentiment_agent.analyze(context),
    fundamental_agent.analyze(context),
    return_exceptions=True
)

# Incorrect - sequential (DO NOT USE)
technical = await technical_agent.analyze(context)
sentiment = await sentiment_agent.analyze(context)
fundamental = await fundamental_agent.analyze(context)
```

### Timing Metrics Recorded

- `technical_latency_ms`, `sentiment_latency_ms`, `fundamental_latency_ms`
- `parallel_execution_ms` (wall time for all three)
- `sequential_estimated_ms` (sum of individual latencies)
- `parallelism_saved_ms` = sequential - parallel

## Risk Personalization

Two demo profiles demonstrate mathematically different outcomes:

| Parameter | Conservative | Aggressive |
|-----------|-------------|------------|
| volatility_tolerance | 0.15 | 0.30 |
| position_size_tolerance | 0.10 | 0.30 |

### Risk Adjustment Factors

1. **Volatility penalty**: If market.volatility > profile.volatility_tolerance
2. **Concentration penalty**: If portfolio HHI > profile.position_size_tolerance
3. **Existing position penalty**: Large existing holding limits new allocation
4. **Fundamental evidence penalty**: Missing fundamental docs → -0.2
5. **Agent risk flags**: Overbought, distribution, etc.

## Degraded Data Handling

### Demo Control Endpoint
```
POST /api/demo/degraded-data {"enabled": true}
```

### Behavior When Enabled
- Technical agent: Normal operation
- Sentiment agent: Normal operation
- Fundamental agent: Returns confidence=0, risk_flag="Insufficient fundamental evidence"
- Synthesis: Returns `INSUFFICIENT_EVIDENCE` or safe HOLD
- Response includes: `"degraded": true`, `"warnings": ["Fundamental document retrieval unavailable"]`

## Source Attribution

Every document-derived claim traces to a retrieved source:

```
Fundamental Agent → sources: [Document A, Document B]
                      ↓
Synthesis → sources: [Document A, Document B] (propagated)
                      ↓
Response → synthesis.sources + agents.fundamental.sources
```

**Rule**: Never fabricate BSE/SEBI/annual report references. Use actual retrieved documents.

## Fallback Strategy

| Failure | Handling |
|---------|----------|
| OpenAI unavailable | Deterministic keyword analysis only |
| Supabase unavailable | Mock documents (demo) |
| RAG returns zero docs | Fundamental confidence=0, risk flag |
| One agent fails | Other agents continue, failed agent → NEUTRAL/confidence=0 |
| All agents fail | Synthesis handles gracefully |

## Metrics & Observability

### Session Metrics (in every response)
- Latency breakdown (total, parallel, per-agent)
- Parallelism savings demonstration
- Portfolio concentration (HHI)
- Simulated forward return (explicitly labeled)

### Reasoning Trace (in every response)
Timestamped events:
- market_data_received
- technical_started, sentiment_started, fundamental_started
- technical_completed, sentiment_completed, fundamental_completed
- synthesis_started, synthesis_completed
- recommendation_generated

## Security

- No secrets in code or responses
- Service-role keys never sent to frontend
- CORS permissive for demo only
- Input validation via Pydantic

## Deployment

### Backend
- Python 3.11+
- FastAPI + Uvicorn
- Deploy to any Python host (Render, Fly.io, Railway, etc.)

### Environment Variables
```
OPENAI_API_KEY=sk-...        # Optional
SUPABASE_URL=https://...     # Optional
SUPABASE_SERVICE_ROLE_KEY=... # Optional (never exposed)
```

### Frontend Integration
Frontend (Person 3) calls only:
- `POST /api/analyze` - single comprehensive response
- `GET /api/session/{id}` - retrieve past analysis

No multi-endpoint chaining required.

## Extensibility Points

1. **Real market data**: Replace `MarketService.get_market_data()`
2. **Real RAG**: Person 2 implements `retrieve_documents()` in `rag.py`
3. **More agents**: Add to `asyncio.gather()` in orchestrator
4. **Persistent sessions**: Replace `SessionStore` with Redis/DB
5. **Authentication**: Add middleware to routes
6. **More profiles**: Extend `ProfileService`