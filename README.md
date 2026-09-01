# HACKVERSE: INTO THE WEB — PS-01

A multi-agent financial intelligence web application.

## System Architecture

- **Frontend**: Web user interface (`frontend/`)
- **Backend**: FastAPI / Python backend framework (`backend/`)
- **Database & Vector Store**: Supabase with pgvector (`supabase/`)

## Four Ownership Areas

1. **Frontend Interface**: UI components, dashboards, and client application (`frontend/`)
2. **Backend & Multi-Agent Engine**: Core API, agent orchestration, and business logic (`backend/`)
3. **Data Pipeline & RAG**: Financial document ingestion, embeddings generation, and market seeds (`data/`, `scripts/`)
4. **Database & Infrastructure**: Supabase schemas, pgvector migrations, and database seed scripts (`supabase/`)
