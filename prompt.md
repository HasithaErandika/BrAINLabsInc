# BrAIN Labs Inc. — Full-Stack Rebuild Prompt

## Project Overview

**BrAIN Labs Inc.** is a Brain-Inspired AI and Neuroinformatics research laboratory based at SLIIT, Sri Lanka. This system is a full-stack web platform with:

- **Public Website** (`web/`) — React + Vite + Tailwind, deployed to Cloudflare Pages.
- **Admin Dashboard** (`admin/`) — React + Vite + Tailwind, private internal portal.
- **Backend API** (`backend/`) — **Express.js (Node.js)** REST API, replacing the old Ballerina backend.
- **Database** — **Supabase PostgreSQL** using the new `schema(2).sql`.

---

## Why Express.js (Not Ballerina, Not Go)

| Criterion | Ballerina | Go (net/http / Gin) | **Express.js** |
|---|---|---|---|
| Free-tier hosting | Choreo only (limited) | Render, Railway, Fly.io | Render, Railway, Fly.io, Vercel ✅ |
| Ecosystem maturity | Very niche | Excellent | Exceptional ✅ |
| Supabase JS SDK support | None | None | `@supabase/supabase-js` ✅ |
| Auth / JWT libraries | Limited | Solid | Abundant ✅ |
| Team familiarity | Low (Ballerina is exotic) | Medium | High ✅ |
| Cold-start on serverless | N/A | Fast | Fast (ESM) ✅ |
| Community & Stack Overflow coverage | Very low | Good | Dominant ✅ |

**Decision: Express.js on Node.js.** It wins on free-tier hosting compatibility, Supabase SDK availability, ecosystem richness, and team onboarding speed. It can be deployed for free on Render (spin-down after 15 min) or Railway ($5 credit).

---

## New Database Schema — Key Concepts (`schema(2).sql`)

### Approval Workflow Enum
```sql
CREATE TYPE approval_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
```
All content goes through an Admin approval gate before being visible.

### ISA Role Hierarchy
```
member (base table)
├── admin          — can approve/reject content and manage members
├── researcher     — creates events/grants/content; requires admin approval
└── research_assistant — assigned by a researcher; requires admin approval
```
Former members are archived in `former_member` when they resign.

### Tables (all IDs are SERIAL INT, not UUID)

| Table | Owner | Notes |
|---|---|---|
| `member` | — | Base entity; stores auth_user_id, slug, email, password |
| `admin` | member_id FK | Super role |
| `researcher` | member_id FK | country, bio, occupation, workplace |
| `research_assistant` | member_id FK | Assigned by a researcher |
| `former_member` | member_id FK | Archived on resignation |
| `educational_background` | researcher_id | Multi-value degrees |
| `ongoing_research` | researcher_id | Multi-value research topics |
| `blog` | member or former_member | CHECK constraint ensures exactly one creator |
| `tutorial` | member | Requires admin approval |
| `project` | member | Requires admin approval |
| `event` | researcher only | Requires admin approval |
| `grant_info` | researcher only | Requires admin approval |
| `publication` | member | Parent of ISA subtypes |
| `conference_paper` / `book` / `journal` / `article` | publication_id FK | ISA specialisations |
| `blog_image` / `blog_keyword` | blog_id FK | Media/metadata |
| `tutorial_image` / `project_diagram` / `event_image` | respective FK | Media |

---

## Backend API — Express.js Structure

```
backend/
├── src/
│   ├── index.js              # Entry point, Express app, CORS
│   ├── config/
│   │   └── supabase.js       # Supabase client (service role key)
│   ├── middleware/
│   │   ├── auth.js           # JWT / session token validation
│   │   └── requireRole.js    # Role gate: admin, researcher, ra
│   ├── routes/
│   │   ├── auth.js           # POST /auth/login, POST /auth/register
│   │   ├── members.js        # GET/PATCH /admin/members (admin only)
│   │   ├── researchers.js    # Researcher profile CRUD
│   │   ├── blogs.js          # Blog CRUD + approval
│   │   ├── tutorials.js      # Tutorial CRUD + approval
│   │   ├── projects.js       # Project CRUD + approval
│   │   ├── events.js         # Event CRUD + approval (researcher only)
│   │   ├── grants.js         # Grant CRUD + approval (researcher only)
│   │   ├── publications.js   # Publication + subtypes CRUD
│   │   └── public.js         # Public endpoints (no auth)
│   └── db/
│       └── queries.js        # Raw SQL helpers via Supabase JS
├── .env
├── .env.example
├── package.json
└── Dockerfile
```

### Environment Variables (`.env`)
```
PORT=3001
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=your_jwt_secret
ALLOWED_ORIGINS=https://brainlabsinc.org,https://admin.brainlabsinc.org,http://localhost:5173,http://localhost:5174
```

---

## API Endpoints (aligned to new schema)

### Public (no auth)
| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/public/blogs` | All APPROVED blogs |
| GET | `/public/tutorials` | All APPROVED tutorials |
| GET | `/public/projects` | All APPROVED projects |
| GET | `/public/events` | All APPROVED events |
| GET | `/public/publications` | All APPROVED publications |
| GET | `/public/researchers` | All APPROVED researchers (profile cards) |
| GET | `/public/researchers/:slug` | Full researcher profile |

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register new member (creates member row, defaults to PENDING) |
| POST | `/auth/login` | Login — returns JWT + member info |
| POST | `/auth/logout` | Invalidate session |

### Admin (role: `admin`)
| Method | Path | Description |
|---|---|---|
| GET | `/admin/members` | List all members with roles |
| PATCH | `/admin/members/:id/approve` | Approve researcher/RA |
| PATCH | `/admin/members/:id/reject` | Reject researcher/RA |
| POST | `/admin/members/:id/resign` | Archive to former_member |
| GET | `/admin/content/pending` | All pending blogs/tutorials/projects/events/grants |
| PATCH | `/admin/content/:table/:id/approve` | Approve content |
| PATCH | `/admin/content/:table/:id/reject` | Reject content |

### Researcher Profile
| Method | Path | Description |
|---|---|---|
| GET | `/me` | Current user profile |
| PUT | `/me` | Update own profile (basic fields) |
| POST | `/me/education` | Add educational background |
| DELETE | `/me/education/:id` | Remove education entry |
| POST | `/me/ongoing-research` | Add ongoing research topic |
| DELETE | `/me/ongoing-research/:id` | Remove topic |

### Content (researcher + RA can create; admin approves)
| Method | Path | Description |
|---|---|---|
| GET/POST | `/blogs` | List own / create blog |
| GET/PUT/DELETE | `/blogs/:id` | Get/edit/delete own blog |
| POST | `/blogs/:id/images` | Add image to blog |
| POST | `/blogs/:id/keywords` | Add keyword to blog |
| GET/POST | `/tutorials` | List own / create tutorial |
| GET/PUT/DELETE | `/tutorials/:id` | Manage tutorial |
| GET/POST | `/projects` | List own / create project |
| GET/PUT/DELETE | `/projects/:id` | Manage project |

### Researcher-Only Content
| Method | Path | Description |
|---|---|---|
| GET/POST | `/events` | List own / create event |
| GET/PUT/DELETE | `/events/:id` | Manage event |
| POST | `/events/:id/images` | Add event image |
| GET/POST | `/grants` | List own / create grant |
| GET/PUT/DELETE | `/grants/:id` | Manage grant |

### Publications (polymorphic)
| Method | Path | Description |
|---|---|---|
| GET/POST | `/publications` | List/create publication (base) |
| POST | `/publications/:id/conference-paper` | Link conference paper |
| POST | `/publications/:id/book` | Link book |
| POST | `/publications/:id/journal` | Link journal |
| POST | `/publications/:id/article` | Link article |

---

## Frontend — Admin Dashboard (`admin/`)

**Tech stack:** React + Vite + TypeScript + Tailwind CSS

### Pages / Routes

```
/login                        Login form
/dashboard                    Overview cards (pending counts, recent activity)
/members                      Member list with role badges, approve/reject buttons
/members/:id                  Member detail + role management
/content/pending              Content approval queue (tabs: blogs, tutorials, etc.)
/blogs                        My blogs list
/blogs/new                    Create blog (markdown editor)
/blogs/:id/edit               Edit blog
/tutorials                    My tutorials
/tutorials/new                Create tutorial
/tutorials/:id/edit           Edit tutorial
/projects                     My projects
/projects/new                 Create project
/projects/:id/edit            Edit project
/events                       My events (researcher only)
/events/new                   Create event
/events/:id/edit              Edit event
/grants                       My grants (researcher only)
/grants/new                   Create grant
/grants/:id/edit              Edit grant
/publications                 Publications list
/publications/new             Create publication + subtype
/publications/:id/edit        Edit publication
/profile                      Own profile editor (bio, education, ongoing research)
/profile/password             Change password
```

### Auth Flow
1. Login → POST `/auth/login` → receive JWT + member info.
2. Store JWT in `localStorage` (or `httpOnly` cookie via a proxy).
3. Axios interceptor attaches `Authorization: Bearer <token>` to all requests.
4. On 401 response, clear token and redirect to `/login`.
5. Protected routes use a React context (`AuthContext`) to gate rendering.

---

## Frontend — Public Website (`web/`)

**Tech stack:** React + Vite + TypeScript + Tailwind CSS (already deployed on Cloudflare Pages)

Public website reads only from the public API endpoints (no auth). No changes to its visual design in this rebuild — only update the API base URL if it changes.

---

## Deployment (Free Tiers)

| Service | What | Tier |
|---|---|---|
| **Render** | Express.js backend | Free (spins down after 15 min idle) |
| **Supabase** | PostgreSQL + Auth + Storage | Free (500 MB, 50k auth users) |
| **Cloudflare Pages** | Public web + Admin dashboard | Free (unlimited bandwidth) |

> **Note:** For always-on backend, upgrade to Render Starter ($7/mo) or use Railway free tier ($5 credit/mo).

---

## Coding Conventions

- **Backend:** ES Modules (`"type": "module"` in package.json), async/await, no callbacks.
- **Error handling:** Centralised Express error middleware; all routes use `next(err)` pattern.
- **Validation:** `zod` for request body validation on all POST/PUT routes.
- **Auth:** `jsonwebtoken` for signing/verifying JWTs; token lifetime 7 days.
- **DB access:** Use Supabase JS client for simple queries; raw SQL via `supabase.rpc()` for complex joins.
- **Frontend:** Axios instance with base URL from `VITE_API_URL` env var; React Query for data fetching and caching.
- **Naming:** snake_case for DB columns, camelCase for JS/TS variables, PascalCase for React components.
