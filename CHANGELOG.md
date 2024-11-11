# Changelog

All notable changes to this project are documented here.

### 2024-11-09

**feat: Rails 8 API-mode scaffold with JWT authentication**

JWT signed with secret_key_base, 24-hour expiry. Bearer token required on all endpoints except login.

### 2024-11-11

**feat: multi-tenant organization scoping on all models**

All models include for_org scope. Every query enforces where(organization_id: current_user.organization_id).
