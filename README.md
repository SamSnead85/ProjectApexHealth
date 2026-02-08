# Project Apex - Complete Health Platform

Enterprise healthcare administration platform with modular architecture, deep agentic AI capabilities, and full regulatory compliance (HIPAA, CMS, EDI).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)              │
│  130+ pages · 174+ components · Apex Obsidian Design System  │
├─────────────────────────────────────────────────────────────┤
│                      API Gateway (NestJS)                     │
│  JWT Auth · RBAC · HIPAA Audit · Rate Limiting · Swagger     │
├────────────────────┬────────────────────────────────────────┤
│   Core Services    │         Domain Modules                  │
│  Auth · Audit      │  Claims · Eligibility · Prior Auth      │
│  Org · Documents   │  Providers · Members · Billing          │
│  Health Check      │  Analytics · Compliance · Workflow       │
├────────────────────┼────────────────────────────────────────┤
│ Integration Layer  │         AI Services (Python)             │
│  EDI X12 Engine    │  Agent Orchestrator (LangGraph)          │
│  FHIR R4 Server    │  Voice Agent Platform                   │
│  Clearinghouse     │  Document Intelligence                  │
│  EHR Bridge        │  Fraud Detection · Risk Scoring         │
├────────────────────┴────────────────────────────────────────┤
│                       Data Layer                              │
│  PostgreSQL + pgvector · Redis · MinIO (S3) · Elasticsearch  │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start infrastructure (PostgreSQL, Redis, MinIO, Elasticsearch, Keycloak)
npm run docker:up

# 4. Wait for services to be ready, then seed the database
npm run db:seed

# 5. Start all services
npm run dev:all
```

### Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:4200 | React SPA |
| API | http://localhost:3000 | NestJS Backend |
| API Docs | http://localhost:3000/api/docs | Swagger/OpenAPI |
| AI Services | http://localhost:8000 | Python FastAPI |
| AI Docs | http://localhost:8000/docs | FastAPI Swagger |
| Keycloak | http://localhost:8080 | Identity Management |
| MinIO Console | http://localhost:9001 | Object Storage UI |

### Demo Credentials

All demo accounts use password: `ApexDemo2024!`

| Email | Role | Portal |
|-------|------|--------|
| sarah.chen@apexhealth.com | Org Admin | Admin |
| marcus.johnson@apexhealth.com | Claims Supervisor | Admin |
| dr.emily.park@apexhealth.com | Medical Director | Admin |
| james.wilson@member.apexhealth.com | Member | Member |
| michael.torres@broker.com | Broker | Broker |
| patricia.morrison@techcorp.com | Employer Admin | Employer |

## Standalone Modules

Each module can be independently licensed and deployed:

| Module | Description |
|--------|-------------|
| **Claims Intelligence** | Claims processing, auto-adjudication, EDI 837/835, AI analysis |
| **Eligibility Hub** | Real-time eligibility verification, enrollment, EDI 270/271/834 |
| **Prior Auth Center** | CMS-compliant prior authorization, clinical review, FHIR PAS |
| **Provider Network** | Credentialing, contracting, network adequacy, fee schedules |
| **Member Experience** | Member portal, digital ID cards, secure messaging, wellness |
| **Revenue Cycle** | Premium billing, payment processing, collections, EDI 820 |
| **Analytics Command** | Executive dashboards, custom reports, HEDIS/Star Ratings |
| **Compliance Suite** | HIPAA audit trails, breach response, regulatory tracking |
| **AI Operations** | Visual workflow builder, agent orchestrator, document intelligence |
| **Voice Center** | AI voice agents, call center operations, outreach automation |

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite 5 (build tool)
- Framer Motion (animations)
- Recharts (data visualization)
- Zustand (state management)
- Lucide React (icons)

### Backend API
- NestJS 10 (TypeScript)
- TypeORM (database ORM)
- Passport + JWT (authentication)
- Bull (job queues)
- Swagger/OpenAPI (documentation)

### AI Services
- Python 3.11 + FastAPI
- LangChain + LangGraph (agent orchestration)
- Google Gemini AI (LLM)
- Deepgram (speech-to-text)
- ElevenLabs (text-to-speech)

### Infrastructure
- PostgreSQL 16 + pgvector
- Redis 7
- Elasticsearch 8
- MinIO (S3-compatible storage)
- Keycloak 24 (identity management)
- Docker + Kubernetes
- Terraform (IaC)
- GitHub Actions (CI/CD)

## Compliance

- **HIPAA**: PHI encryption (AES-256-GCM), audit logging, access controls, session management
- **CMS**: Interoperability rules, prior auth timelines, price transparency
- **EDI**: X12 transactions (270/271, 837P/I, 835, 834, 820, 276/277, 999)
- **FHIR**: R4 resources, SMART on FHIR, Da Vinci Implementation Guides
- **Quality**: HEDIS measures, CMS Star Ratings, CAHPS

## Project Structure

```
/
├── src/                          # Frontend (React SPA)
│   ├── components/               # 174+ UI components
│   ├── pages/                    # 138+ page components
│   ├── services/                 # API clients & services
│   ├── stores/                   # Zustand state stores
│   ├── context/                  # React contexts (Auth, Theme, Nav)
│   ├── styles/                   # Global styles & design system
│   └── App.tsx                   # Main router
├── apps/
│   ├── api/                      # NestJS Backend
│   │   └── src/
│   │       ├── modules/          # 14 domain modules
│   │       ├── common/           # Shared guards, middleware, utils
│   │       └── database/         # Migrations & seed scripts
│   └── ai-services/              # Python AI Services
│       └── app/
│           ├── agents/           # LangGraph agent orchestrator
│           └── routers/          # FastAPI routes
├── packages/
│   └── shared/                   # Shared TypeScript types
│       └── src/types/            # 15 type definition files
├── docker/                       # Docker configs (Postgres, Keycloak)
├── k8s/                          # Kubernetes manifests
├── infrastructure/               # Terraform IaC
├── .github/workflows/            # CI/CD pipelines
├── docker-compose.yml            # Local dev infrastructure
└── turbo.json                    # Monorepo configuration
```

## License

Proprietary - All rights reserved.
