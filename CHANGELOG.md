# Changelog

All notable changes to this project are documented here.

### 2024-11-09

**feat: Rails 8 API-mode scaffold with JWT authentication**

JWT signed with secret_key_base, 24-hour expiry. Bearer token required on all endpoints except login.

### 2024-11-11

**feat: multi-tenant organization scoping on all models**

All models include for_org scope. Every query enforces where(organization_id: current_user.organization_id).

### 2024-11-30

**feat: contacts CRUD with search and status filtering**

Full CRUD with name/email search and status filter (active, inactive, lead, prospect, customer).

### 2024-12-07

**feat: companies management with contact relationship linking**

Companies have many contacts. Contact detail page shows associated company with link.

### 2024-12-07

**feat: deal pipeline across six stages from Lead to Closed**

Stages: Lead, Qualified, Proposal, Negotiation, Closed Won, Closed Lost.

### 2024-12-18

**feat: Kanban board for deal stage drag-and-drop management**

React DnD Kanban board. Stage changes persist via PATCH /api/v1/deals/:id immediately on drop.

### 2024-12-21

**feat: task management with priority levels and due dates**

Priorities: critical, high, medium, low. Tasks grouped by status: To Do, In Progress, Completed, Cancelled.

### 2024-12-24

**feat: activity feed with call email meeting and note types**

Timeline view sorted by created_at descending. Each activity shows type icon, description, and timestamp.

### 2024-12-25

**feat: append-only audit log for all create update delete actions**

AuditLog.log called from ApplicationController after every write. No update or destroy on audit records.

### 2025-01-11

**feat: dashboard with KPI cards and revenue charts**

KPI: total contacts, active deals, closed won this month, total pipeline value. Monthly revenue area chart.

### 2025-02-10

**feat: AI assistant chat interface proxied to FastAPI service**

Rails AiController proxies to Python FastAPI at AI_SERVICE_URL. Falls back to mock responses if unreachable.

### 2025-03-05

**feat: per-contact AI insight panel with mock fallback**

Contact detail page shows AI-generated insights. Mock response used when AI service is offline.

### 2025-04-02

**feat: global search across contacts companies and deals**

Single GET /api/v1/search?q= endpoint searches across three entity types. Returns ranked combined results.

### 2025-04-05

**feat: RBAC with owner admin manager sales_representative viewer**

Five roles with descending permission levels. Role enforced via authorize! in ApplicationController.
