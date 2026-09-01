# HACKVERSE: INTO THE WEB — PS-01

A multi-agent financial intelligence web application.

## System Architecture

- **Frontend**: Next.js / React / Tailwind (`frontend/`)
- **Backend**: FastAPI / Python multi-agent engine (`backend/`)
- **Database & Vector Store**: Supabase with pgvector (`supabase/`)
- **Data Pipeline**: Document ingestion, embeddings, market seeds (`data/`, `scripts/`)

## Four Ownership Areas

1. **Frontend Interface**: UI components, dashboards, client application (`frontend/`)
2. **Backend & Multi-Agent Engine**: Core API, agent orchestration, business logic (`backend/`)
3. **Data Pipeline & RAG**: Financial document ingestion, embeddings generation, market seeds (`data/`, `scripts/`)
4. **Database & Infrastructure**: Supabase schemas, pgvector migrations, database seed scripts (`supabase/`)

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Database (Supabase)

Apply migrations in `supabase/migrations/` to your Supabase project.
Run seed scripts in `scripts/` to populate data.

## API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/market/{symbol}` | Get market data for symbol |
| GET | `/api/profile/{user_id}` | Get user risk profile |
| GET | `/api/portfolio/{user_id}` | Get user portfolio/watchlist |
| POST | `/api/analyze` | Run multi-agent analysis |
| GET | `/api/session/{session_id}` | Retrieve analysis session |
| POST | `/api/demo/degraded-data` | Toggle degraded mode |
| GET | `/api/demo/degraded-data` | Get degraded mode status |

### Demo Profiles

- `demo-conservative` - Low risk tolerance (volatility: 0.15, position: 0.10)
- `demo-aggressive` - High risk tolerance (volatility: 0.30, position: 0.30)
- `demo-moderate` - Medium risk tolerance (volatility: 0.20, position: 0.20)

### Demo Symbols

- `RELIANCE` - Primary demo stock
- `HDFCBANK` - Secondary stock
- `TATAMOTORS` - Secondary stock

## Multi-Agent Pipeline

```
MARKET DATA + USER PROFILE + PORTFOLIO
                ↓
    ┌───────────┼───────────┐
    ↓           ↓           ↓
TECHNICAL   SENTIMENT   FUNDAMENTAL
  AGENT       AGENT      RAG AGENT
    ↓           ↓           ↓
    └───────────┼───────────┘
                ↓
         SYNTHESIS LAYER
                ↓
      RISK PERSONALIZATION
                ↓
    PERSONALIZED RECOMMENDATION
    (BUY / HOLD / REDUCE / INSUFFICIENT_EVIDENCE)
                ↓
    REASONING TRACE + SOURCES + METRICS
```

### Three Specialist Agents (Run in PARALLEL)

1. **Technical Agent** - Price action, RSI, momentum, volume, volatility
2. **Sentiment Agent** - Sentiment score, sector momentum, volume behavior
3. **Fundamental/RAG Agent** - Document retrieval + keyword/LLM analysis

### Synthesis & Personalization

- Explicit weighted scoring: Technical 30%, Sentiment 25%, Fundamental 30%, Risk 15%
- Risk adjustment based on user profile (volatility tolerance, position limits)
- Same market data → different recommendations for different profiles

### Degraded Data Mode

Toggle with `POST /api/demo/degraded-data {"enabled": true}` to simulate:
- Technical ✓ available
- Sentiment ✓ available
- Fundamental ⚠ unavailable → INSUFFICIENT_EVIDENCE response

## Environment Variables

```bash
OPENAI_API_KEY=your_openai_key      # Optional - LLM enhancement
SUPABASE_URL=your_supabase_url      # Optional - Person 2's vector DB
SUPABASE_SERVICE_ROLE_KEY=your_key  # Optional - Never exposed to frontend
```

## Testing

```bash
cd backend
pytest tests/ -v
```

## Key Features Implemented

- ✅ Three specialist agents running in TRUE PARALLEL (asyncio.gather)
- ✅ Explicit synthesis with weighted scoring
- ✅ Risk personalization (conservative vs aggressive profiles)
- ✅ RAG document retrieval with source attribution
- ✅ Complete reasoning trace with timestamps
- ✅ Latency metrics + parallelism savings
- ✅ Portfolio concentration metric (HHI)
- ✅ Degraded data mode for demo
- ✅ Partial agent failure handling
- ✅ Session storage and retrieval
- ✅ No fabricated financial evidence
- ✅ Deterministic fallbacks when OpenAI unavailable

## Project Structure

```
backend/
├── app/
│   ├── agents/          # Technical, Sentiment, Fundamental agents
│   ├── api/             # FastAPI routes
│   ├── core/            # Configuration
│   ├── db/              # Database adapters
│   ├── models/          # Pydantic models
│   ├── services/        # Market, Profile, Portfolio, RAG, Synthesis
│   └── main.py          # FastAPI app entry point
├── tests/               # Pytest test suite
└── requirements.txt
```

## Demo Scenarios

### Demo A - Normal Analysis
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"user_id": "demo-conservative", "symbol": "RELIANCE"}'
```

### Demo B - Personalization
```bash
# Same stock, different profile
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"user_id": "demo-aggressive", "symbol": "RELIANCE"}'
```

### Demo C - Degraded Data
```bash
# Enable degraded mode
curl -X POST http://localhost:8000/api/demo/degraded-data \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'

# Run analysis - fundamental unavailable
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"user_id": "demo-conservative", "symbol": "RELIANCE"}'
```

## License

Hackathon project - MIT License