# API Contract Specification

## Overview

This document defines the API contract for the Financial Intelligence Backend.
All endpoints return JSON. Errors follow standard HTTP status codes.

## Base URL

```
Development: http://localhost:8000
Production:  https://api.hackverse.example.com
```

## Authentication

No authentication required for hackathon demo.
In production: JWT Bearer tokens via Authorization header.

## Endpoints

---

### GET /health

Health check endpoint.

**Response (200):**
```json
{
  "status": "ok",
  "service": "financial-intelligence-backend",
  "version": "1.0.0",
  "openai_configured": true,
  "supabase_configured": false
}
```

---

### GET /api/market/{symbol}

Get simulated market data for a symbol.

**Path Parameters:**
- `symbol` (string): Stock symbol (e.g., "RELIANCE", "HDFCBANK", "TATAMOTORS")

**Response (200):**
```json
{
  "symbol": "RELIANCE",
  "price": 1428.50,
  "change_pct": 1.84,
  "volume": 8420000,
  "avg_volume": 6200000,
  "rsi": 63.4,
  "momentum": 0.72,
  "volatility": 0.19,
  "sector_change_pct": 1.12,
  "sentiment_score": 0.68,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Error (404):** Symbol not found

---

### GET /api/profile/{user_id}

Get user risk profile.

**Path Parameters:**
- `user_id` (string): User identifier (e.g., "demo-conservative", "demo-aggressive", "demo-moderate")

**Response (200):**
```json
{
  "user_id": "demo-conservative",
  "name": "Conservative Investor",
  "risk_profile": {
    "risk_profile": "conservative",
    "volatility_tolerance": 0.15,
    "position_size_tolerance": 0.10
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Error (404):** Profile not found

---

### GET /api/portfolio/{user_id}

Get user portfolio and watchlist.

**Path Parameters:**
- `user_id` (string): User identifier

**Response (200):**
```json
{
  "user_id": "demo-conservative",
  "holdings": [
    {
      "symbol": "RELIANCE",
      "quantity": 20,
      "allocation": 0.18
    }
  ],
  "watchlist": {
    "symbols": ["RELIANCE", "HDFCBANK"]
  }
}
```

**Error (404):** Portfolio not found

---

### POST /api/analyze

Run complete multi-agent analysis.

**Request Body:**
```json
{
  "user_id": "demo-conservative",
  "symbol": "RELIANCE"
}
```

**Response (200):**
```json
{
  "session_id": "abc123",
  "symbol": "RELIANCE",
  "market": { ... },
  "profile": { ... },
  "portfolio": { ... },
  "agents": {
    "technical": {
      "agent": "technical",
      "signal": "BULLISH",
      "confidence": 0.78,
      "reasoning": ["Positive price momentum", "RSI indicates positive momentum"],
      "risk_flags": ["Elevated volatility"],
      "sources": [],
      "latency_ms": 45,
      "started_at": "2024-01-01T00:00:00Z",
      "completed_at": "2024-01-01T00:00:00Z"
    },
    "sentiment": {
      "agent": "sentiment",
      "signal": "BULLISH",
      "confidence": 0.72,
      "reasoning": ["Positive sector momentum", "Strong sentiment score"],
      "risk_flags": [],
      "sources": [],
      "latency_ms": 38,
      "started_at": "2024-01-01T00:00:00Z",
      "completed_at": "2024-01-01T00:00:00Z"
    },
    "fundamental": {
      "agent": "fundamental",
      "signal": "NEUTRAL",
      "confidence": 0.65,
      "reasoning": ["Revenue growth stable", "Based on: Annual Report"],
      "risk_flags": [],
      "sources": [
        {
          "document_id": "rel_annual_2024_001",
          "title": "Reliance Industries Annual Report 2024",
          "source": "BSE Filing",
          "chunk_text": "Revenue grew 12% YoY...",
          "similarity": 0.92
        }
      ],
      "latency_ms": 120,
      "started_at": "2024-01-01T00:00:00Z",
      "completed_at": "2024-01-01T00:00:00Z"
    }
  },
  "synthesis": {
    "action": "BUY",
    "confidence": 0.71,
    "summary": "Technical and sentiment signals support upside...",
    "reasons": ["Strong technical momentum", "Positive sentiment"],
    "risk_adjustment": "Conservative profile reduces position size due to volatility",
    "sources": [
      {
        "agent": "fundamental",
        "document_id": "rel_annual_2024_001",
        "title": "Reliance Industries Annual Report 2024",
        "source": "BSE Filing",
        "similarity": 0.92
      }
    ],
    "base_score": 0.52,
    "risk_adjusted_score": 0.47
  },
  "reasoning_trace": [
    {"event": "market_data_received", "timestamp": "2024-01-01T00:00:00Z", "details": {"symbol": "RELIANCE"}},
    {"event": "technical_started", "timestamp": "2024-01-01T00:00:00Z", "details": {}},
    {"event": "sentiment_started", "timestamp": "2024-01-01T00:00:00Z", "details": {}},
    {"event": "fundamental_started", "timestamp": "2024-01-01T00:00:00Z", "details": {}},
    {"event": "technical_completed", "timestamp": "2024-01-01T00:00:00Z", "details": {"latency_ms": 45}},
    {"event": "sentiment_completed", "timestamp": "2024-01-01T00:00:00Z", "details": {"latency_ms": 38}},
    {"event": "fundamental_completed", "timestamp": "2024-01-01T00:00:01Z", "details": {"latency_ms": 120}},
    {"event": "synthesis_started", "timestamp": "2024-01-01T00:00:01Z", "details": {}},
    {"event": "synthesis_completed", "timestamp": "2024-01-01T00:00:01Z", "details": {}},
    {"event": "recommendation_generated", "timestamp": "2024-01-01T00:00:01Z", "details": {"action": "BUY", "confidence": 0.71}}
  ],
  "metrics": {
    "total_latency_ms": 203,
    "parallel_execution_ms": 120,
    "sequential_estimated_ms": 203,
    "parallelism_saved_ms": 83,
    "technical_latency_ms": 45,
    "sentiment_latency_ms": 38,
    "fundamental_latency_ms": 120,
    "portfolio_concentration_score": 0.0324,
    "simulated_forward_return": 0.02
  },
  "degraded": false,
  "warnings": []
}
```

**Action Values:** `BUY`, `HOLD`, `REDUCE`, `INSUFFICIENT_EVIDENCE`

**Error (400):** Invalid request
**Error (404):** Symbol or user not found
**Error (500):** Internal server error

---

### GET /api/session/{session_id}

Retrieve a stored analysis session.

**Path Parameters:**
- `session_id` (string): Session identifier from analyze response

**Response (200):** Same as POST /api/analyze response

**Error (404):** Session not found

---

### POST /api/demo/degraded-data

Toggle degraded data mode for demo purposes.

**Request Body:**
```json
{
  "enabled": true
}
```

**Response (200):**
```json
{
  "degraded_mode": true,
  "message": "Degraded mode enabled - fundamental evidence will be unavailable"
}
```

When enabled, fundamental document retrieval returns empty results.
The analysis will show `degraded: true` and `warnings` about unavailable fundamental evidence.

---

### GET /api/demo/degraded-data

Get current degraded mode status.

**Response (200):**
```json
{
  "degraded_mode": false
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error description"
}
```

| Status | Description |
|--------|-------------|
| 400 | Bad request - invalid parameters |
| 404 | Not found - symbol, profile, portfolio, or session |
| 500 | Internal server error |

---

## Data Models

### MarketData
| Field | Type | Description |
|-------|------|-------------|
| symbol | string | Stock symbol |
| price | number | Current price |
| change_pct | number | Daily change % |
| volume | integer | Current volume |
| avg_volume | integer | Average volume |
| rsi | number | RSI (0-100) |
| momentum | number | Momentum (-1 to 1) |
| volatility | number | Volatility (0-1) |
| sector_change_pct | number | Sector change % |
| sentiment_score | number | Sentiment (0-1) |

### RiskProfile
| Field | Type | Description |
|-------|------|-------------|
| risk_profile | enum | conservative, moderate, aggressive |
| volatility_tolerance | number | Max volatility (0-1) |
| position_size_tolerance | number | Max position % (0-1) |

### AgentResult
| Field | Type | Description |
|-------|------|-------------|
| agent | enum | technical, sentiment, fundamental |
| signal | enum | BULLISH, BEARISH, NEUTRAL |
| confidence | number | 0.0 - 1.0 |
| reasoning | string[] | Human-readable reasoning |
| risk_flags | string[] | Risk warnings |
| sources | Source[] | Document sources (fundamental only) |
| latency_ms | integer | Agent execution time |

### SynthesisResult
| Field | Type | Description |
|-------|------|-------------|
| action | enum | BUY, HOLD, REDUCE, INSUFFICIENT_EVIDENCE |
| confidence | number | 0.0 - 1.0 |
| summary | string | Human-readable summary |
| reasons | string[] | Key reasons |
| risk_adjustment | string | Risk adjustment explanation |
| sources | Source[] | All propagated sources |
| base_score | number | Pre-risk score |
| risk_adjusted_score | number | Final score |

### SessionMetrics
| Field | Type | Description |
|-------|------|-------------|
| total_latency_ms | integer | Total request time |
| parallel_execution_ms | integer | Parallel agent time |
| sequential_estimated_ms | integer | Sum of individual latencies |
| parallelism_saved_ms | integer | Time saved by parallelism |
| technical_latency_ms | integer | Technical agent time |
| sentiment_latency_ms | integer | Sentiment agent time |
| fundamental_latency_ms | integer | Fundamental agent time |
| portfolio_concentration_score | number | HHI (0-1) |
| simulated_forward_return | number | Explicitly simulated (optional) |

---

## Rate Limits

No rate limits in hackathon demo.

---

## CORS

Enabled for all origins (`*`) in development.
Restrict to frontend domain in production.