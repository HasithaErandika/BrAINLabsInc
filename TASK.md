# TASK.md — BrAIN Labs Inc.

> Status legend: `[ ]` = TODO · `[/]` = In Progress · `[x]` = Done

---

## Phase 0 — Schema & Architecture

- [x] Finalise corrected schema (`schema(2).sql`) — canonical source of truth
- [x] Define approval workflow: `DRAFT → PENDING_RESEARCHER → PENDING_ADMIN → APPROVED / REJECTED`
- [x] ISA role pattern: `member → admin / researcher / research_assistant / former_member`
- [x] Monochrome design system (black/white/zinc, Inter font, no shadows)
- [x] Define project layout: `backend/`, `admin/`, `web/`

---

## Phase 1 — Backend (`backend/`)

### Auth
- [x] `POST /auth/register` — creates member + role row (handles `assigned_by_researcher_id` for RAs)
- [x] `POST /auth/login` — role resolution + JWT with `sub` (member id) and `role`
- [x] `requireAuth` middleware
- [x] `requireRole(...roles)` middleware

### Bugs fixed
- [x] All content routes now create with `approval_status: 'DRAFT'` (was `'PENDING'`)
- [x] `getAllPendingContent` queries `PENDING_ADMIN` (was `PENDING`)
- [x] Events: removed non-existent `event_date`/`event_time` fields — uses `event_datetime` (TIMESTAMPTZ)
- [x] Grants: removed non-existent `legal_docs` column — uses `grant_document` child table with CRUD endpoints
- [x] Tutorials: added missing `title` to Zod schema
- [x] Projects: added `content` field to Zod schema
- [x] Publications: added `authors` and `publication_year` to Zod schema; subtype upsert on `publication_id`

### Content routes (`/blogs`, `/tutorials`, `/projects`, `/events`, `/grants`, `/publications`)
- [x] `GET /` — list (admin sees all, others see own)
- [x] `POST /` — create with `approval_status: 'DRAFT'`
- [x] `GET /:id` — get one (ownership check)
- [x] `PUT /:id` — update (resets to `DRAFT`)
- [x] `DELETE /:id` — delete (own or admin)
- [x] `POST /grants/:id/documents` — add document to grant
- [x] `DELETE /grants/:id/documents/:docId` — remove document
- [x] `POST /publications/:id/:subtype` — link ISA subtype (upsert)

### Approval workflow (`/content`)
- [x] `PATCH /content/:table/:id/submit` — RA → `PENDING_RESEARCHER`; Researcher/Admin → `PENDING_ADMIN`
- [x] `PATCH /content/:table/:id/review` — Researcher forwards `PENDING_RESEARCHER` → `PENDING_ADMIN` or `REJECTED`
- [x] `GET /content/researcher/reviews` — items in `PENDING_RESEARCHER` state for researcher queue

### Admin routes (`/admin`)
- [x] `GET /admin/members` — list all members with role info
- [x] `PATCH /admin/members/:id/approve` — approve member
- [x] `PATCH /admin/members/:id/reject` — reject member
- [x] `GET /admin/content/pending` — all `PENDING_ADMIN` content across tables
- [x] `PATCH /admin/content/:table/:id/approve` — approve content
- [x] `PATCH /admin/content/:table/:id/reject` — reject content

### TODO
- [ ] Rate limiting middleware
- [ ] Request logging for workflow transitions
- [ ] Resignation workflow (create `former_member`, remove role row)

---

## Phase 2 — Admin Dashboard (`admin/`)

### Design system
- [x] Global CSS: Inter font, zinc palette, monochrome tokens
- [x] UI primitives: `Button`, `Input`, `Badge`, `StatCard`
- [x] `ContentPageTemplate` — shared template for all content pages (list / detail / edit)

### Auth
- [x] JWT stored in localStorage (`brain_labs_token`)
- [x] 401 handling: custom event `brain:session-expired` → `SessionHandler` component (no infinite loop)
- [x] Session timeout banner with countdown

### Layout
- [x] `AppLayout` — sidebar navigation, role-aware menu items
- [x] Protected routes with role guards

### Bug fixes
- [x] Removed duplicate API client (`admin/src/lib/api.ts` — old, had wrong status strings)
- [x] All pages import from `../../api` (the correct `admin/src/api/index.ts`)
- [x] Fixed `ApprovalStatus` mismatch checking (`'PENDING'` shifted to `'PENDING_ADMIN'`)
- [x] Corrected backend port to 3000 across env files and API client
- [x] Created proper `.env.example` configurations and updated `.gitignore`

### Jargon removed — all pages now use plain language
- [x] Login: "Institutional Oversight Terminal" → "Admin Dashboard"; "Authorize Access" → "Sign In"
- [x] Register: "Personnel Entry Protocol" → "Create Account"; "Access Password" → "Password"
- [x] AdminDashboard: "Central Oversight" → "Admin"; "Intelligence" → "Blog Posts"; "Initialize Record" → "Quick Actions"
- [x] ResearcherDashboard: "Command Center" → "Dashboard"; "Identity Ledger" → "Your Profile"; "Peer Records" → "Publications"
- [x] ResearchAssistantDashboard: "Support Terminal" → "Dashboard"; "Entry Protocols" → "Quick Actions"
- [x] MemberManagement: "Personnel Directory" → "Members"; "AUTHORIZE" → "Approve"; "VERIFY" → "Approve"
- [x] Blog: "Research Title", "ENTER PROTOCOL NAME", "Core Content" → plain labels
- [x] Events: "Engagement Name", "Operation Location", "Scope of Engagement" → plain labels
- [x] Projects: "Initiative Name", "Verification Status", "Initialization Date" → plain labels
- [x] Tutorials: "Educational Asset", "Curriculum Content", "Module Title" → plain labels
- [x] Grants: "Fiscal Unit", "Compliance Status", "Appropriation Title" → plain labels
- [x] Publications: "Scholarly Asset", "ISO-{year}", "Authorship Ledger", "Scholarly Class" → plain labels

### Workflow buttons — correct role-based actions
- [x] DRAFT + owner: Edit + "Submit for review"
- [x] PENDING_RESEARCHER + isResearcher: "Reject" + "Forward to admin"
- [x] PENDING_ADMIN + isAdmin: "Approve"
- [x] APPROVED + isAdmin: "Revoke"

### TODO
- [ ] Profile settings page (`/account`) — edit `me`, change password, manage education/research
- [ ] Researcher review queue page — dedicated view of `PENDING_RESEARCHER` items

---

## Phase 3 — Public Website (`web/`)

- [ ] Connect to Express `/public/*` endpoints
- [ ] Matching monochrome design
- [ ] SEO (sitemap, metadata, semantic HTML)
- [ ] End-to-end smoke test: RA draft → public visibility

---

## Phase 4 — Deployment

- [ ] Dockerfile for backend
- [ ] CI/CD: Render (backend) + Cloudflare Pages (admin + web)
- [ ] Supabase Storage for images / grant documents
- [ ] Refresh token support
