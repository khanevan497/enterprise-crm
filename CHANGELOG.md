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

### 2025-04-30

**fix: resolve N+1 query on contacts list with eager loading**

Added includes(:company) to contacts query. Reduced 51 queries to 2 on a 50-contact page.

### 2025-05-10

**feat: Sidekiq background job integration with Redis**

Sidekiq configured with Redis. Used for sending notification emails and async AI insight generation.

### 2025-05-19

**feat: monthly revenue area chart with Recharts**

AreaChart showing sum of closed-won deal values by month over trailing 12 months.

### 2025-05-22

**feat: pipeline distribution pie chart on dashboard**

PieChart showing deal count and total value by stage. Updates live when deals change stage.

### 2025-06-25

**fix: JWT token expiry not refreshing frontend session**

AuthContext now checks token expiry on each request. Automatically logs out and redirects on 401.

### 2025-07-01

**refactor: extract API envelope to ApplicationController concern**

All responses now wrapped via render_success and render_error helpers. Consistent {data, error, meta} shape.

### 2025-07-12

**feat: one-click login buttons for all demo role accounts**

Login page shows 5 buttons for owner, admin, manager, sales rep, viewer. Fills credentials and submits.

### 2025-07-14

**feat: contact status badge and filter sidebar**

Sidebar filters by status. Badge color matches status: green=active, yellow=lead, blue=prospect.

### 2025-07-17

**fix: resolve CORS configuration for production environment**

Added explicit CORS origins list for production. Development uses wildcard. Credentials flag enabled.

### 2025-07-21

**feat: deal stage inline update from Kanban card**

Click deal card to open slide-over. Stage dropdown updates immediately without leaving Kanban view.

### 2025-07-28

**feat: activity type filter tabs on feed page**

Tab bar filters feed by: All, Calls, Emails, Meetings, Demos, Notes.

### 2025-07-29

**perf: add database indexes on organization_id foreign keys**

Added index on organization_id to contacts, companies, deals, tasks, activities tables.

### 2025-07-29

**chore: add RuboCop configuration and fix all style offenses**

Set RuboCop to Rails 8 defaults. Fixed 47 offenses across controllers and models.

### 2025-09-24

**fix: correct deal total value aggregation on dashboard**

Dashboard was summing all deals instead of only closed-won. Fixed scope in DashboardController.

### 2025-09-28

**feat: company-contact many-to-one relationship management**

Contact creation form includes company select. Company detail shows all linked contacts.

### 2025-11-27

**docs: document all API v1 endpoints with example payloads**

Full reference for 18 endpoint groups with request/response bodies and error codes.

### 2025-12-09

**feat: deal expected close date tracking and overdue indicator**

Deals past expected close date shown with overdue badge. Filter for overdue deals on pipeline page.

### 2025-12-29

**refactor: centralize current_user auth logic in ApplicationController**

before_action :authenticate_user! with JWT decode. current_user memoized per request.

### 2026-01-18

**feat: contact CSV import with validation and error reporting**

POST /api/v1/contacts/import accepts CSV. Returns imported count and array of row-level errors.

### 2026-01-30

**fix: fix audit log pagination returning wrong page**

Offset was calculated incorrectly for page > 1. Fixed to (page - 1) * per_page.

### 2026-02-07

**feat: task due date badge and overdue highlighting**

Tasks past due_date highlighted in red. Badge shows days overdue.

### 2026-02-12

**chore: add GitHub Actions CI workflow for test and lint**

CI runs RuboCop, Rails tests, and Vite build on every push to main and pull_request.

### 2026-03-04

**feat: deal won and lost reason capture on stage change**

When moving deal to Closed Won or Closed Lost, modal prompts for reason. Stored on deal record.

### 2026-04-07

**fix: resolve race condition on concurrent deal stage update**

Added optimistic locking via lock_version on deals. Returns 409 if version mismatch on update.

### 2026-04-26

**feat: company revenue tier classification and filtering**

Revenue tiers: startup (<1M), smb (1-10M), mid-market (10-100M), enterprise (100M+). Filter on companies page.

### 2026-05-30

**perf: optimize dashboard aggregate queries with SQL window functions**

Replaced Ruby-level aggregation loops with single SQL query using SUM and GROUP BY.

### 2026-06-25

**feat: TanStack Query infinite scroll on contacts list**

useInfiniteQuery with cursor-based pagination. Contacts load as user scrolls down.
