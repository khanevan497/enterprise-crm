# Enterprise CRM

A full-stack multi-tenant CRM built as a portfolio project demonstrating enterprise software patterns: role-based access control, audit logging, real-time pipeline management, and AI-assisted customer insights.

## Stack

| Layer | Technology |
|---|---|
| Backend | Ruby on Rails 8.1 (API mode) |
| Database | PostgreSQL |
| Background jobs | Sidekiq + Redis |
| Frontend | React 18 + TypeScript + Vite 8 |
| Styling | Tailwind CSS v4 |
| State management | TanStack Query v5 |
| Charts | Recharts |
| Auth | JWT (Bearer token) |

## Features

- **Multi-tenancy** — every resource is scoped to an organization; the backend enforces isolation, never the frontend
- **RBAC** — five roles: `owner`, `admin`, `manager`, `sales_representative`, `viewer`
- **Contact & company management** — full CRUD with search, status filtering, and relationship linking
- **Deal pipeline** — Kanban board across six stages (Lead → Closed Won/Lost) with inline stage changes
- **Task management** — grouped by status (To Do / In Progress / Completed / Cancelled), priority levels, due date tracking
- **Activity feed** — timeline of calls, emails, meetings, demos, and notes
- **Dashboard** — KPI cards, monthly revenue area chart, pipeline distribution pie chart, deals-by-stage bar chart
- **Audit log** — append-only, read-only record of every create/update/delete action
- **AI assistant** — chat interface and per-contact insight panel (proxies to a Python FastAPI service; falls back to mock responses when the AI service is offline)
- **Global search** — searches contacts, companies, and deals in a single query

## Project structure

```
enterprise-crm/
├── backend/                  # Rails API
│   ├── app/
│   │   ├── controllers/api/v1/
│   │   │   ├── auth_controller.rb
│   │   │   ├── contacts_controller.rb
│   │   │   ├── companies_controller.rb
│   │   │   ├── deals_controller.rb
│   │   │   ├── tasks_controller.rb
│   │   │   ├── activities_controller.rb
│   │   │   ├── audit_logs_controller.rb
│   │   │   ├── dashboard_controller.rb
│   │   │   ├── search_controller.rb
│   │   │   └── ai_controller.rb
│   │   └── models/
│   │       ├── organization.rb
│   │       ├── user.rb
│   │       ├── contact.rb
│   │       ├── company.rb
│   │       ├── deal.rb
│   │       ├── task.rb
│   │       ├── activity.rb
│   │       └── audit_log.rb
│   ├── lib/json_web_token.rb
│   └── db/seeds.rb
└── frontend/                 # React + Vite
    └── src/
        ├── features/
        │   ├── auth/         # Login page
        │   ├── dashboard/    # KPI + charts
        │   ├── contacts/     # List + detail tabs
        │   ├── companies/    # Card grid + detail
        │   ├── deals/        # Kanban board
        │   ├── tasks/        # Grouped list
        │   ├── activities/   # Feed
        │   ├── audit/        # Log table
        │   └── ai/           # Chat interface
        ├── components/
        │   ├── Layout.tsx    # Sidebar + header
        │   └── ui/           # Button, Input, Modal, Card, Badge
        ├── services/api.ts   # Axios + all API calls
        ├── contexts/AuthContext.tsx
        └── types/index.ts
```

## Prerequisites

- Ruby 3.3+
- Node.js 20+
- PostgreSQL (running, peer auth on Unix socket)
- Redis (for Sidekiq)

## Setup

### Backend

```bash
cd backend
bundle install
rails db:create db:migrate db:seed
rails server -p 3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` → `http://localhost:3001`, so no CORS configuration is needed during development.

Open **http://localhost:5173** in your browser.

### Sidekiq (optional)

```bash
cd backend
bundle exec sidekiq
```

## Demo accounts

All accounts use password `password123`.

| Role | Email |
|---|---|
| Owner | evan@acmesales.co |
| Admin | sarah@acmesales.co |
| Manager | marcus@acmesales.co |
| Sales Rep | ahmed@acmesales.co |
| Viewer | lisa@acmesales.co |

The login page has one-click buttons to switch between these accounts.

## API

All endpoints are under `/api/v1/` and require a `Bearer <token>` header except `POST /api/v1/auth/login`.

Responses use the envelope:
```json
{ "data": ..., "error": null, "meta": { "total": 42, "page": 1, "per_page": 25 } }
```

Key endpoints:

```
POST   /api/v1/auth/login
DELETE /api/v1/auth/logout
GET    /api/v1/me

GET|POST        /api/v1/contacts
GET|PATCH|DELETE /api/v1/contacts/:id

GET|POST        /api/v1/companies
GET|PATCH|DELETE /api/v1/companies/:id

GET|POST        /api/v1/deals
GET|PATCH|DELETE /api/v1/deals/:id

GET|POST        /api/v1/tasks
GET|PATCH|DELETE /api/v1/tasks/:id

GET|POST /api/v1/activities
GET      /api/v1/audit_logs

GET  /api/v1/dashboard
GET  /api/v1/search?q=

POST /api/v1/ai/customer-insight
POST /api/v1/ai/chat
```

## Architecture notes

**Multi-tenancy** is enforced at the Rails model layer via `for_org` scopes. Every query includes `where(organization_id: current_user.organization_id)` — there is no frontend-side filtering.

**Audit logging** is append-only. The `AuditLog` model has no update or destroy endpoints. Every write operation in the app calls `log_audit` in `ApplicationController` which delegates to `AuditLog.log`.

**JWT** tokens are signed with `Rails.application.credentials.secret_key_base` and expire in 24 hours. The frontend stores the token in `localStorage` and attaches it as a `Bearer` header via an Axios interceptor.

**AI service** — the Rails `AiController` proxies requests to a Python FastAPI service at `http://localhost:8000` (configured via `AI_SERVICE_URL` env var). If the service is unreachable it returns deterministic mock responses so the frontend remains functional.
