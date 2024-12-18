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
