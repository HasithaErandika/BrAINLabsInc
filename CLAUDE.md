# CLAUDE.md — BrAIN Labs Inc. Development Context

> This file is the single source of truth for any AI coding assistant working on this repository.
> Read this file completely before making any changes.

---

## Project at a Glance

| Item | Detail |
|---|---|
| **Organisation** | BrAIN Labs Inc. — Brain-Inspired AI & Neuroinformatics Lab, SLIIT |
| **Backend** | **Express.js (Node.js)** in `backend/` |
| **Admin Dashboard** | React + Vite + TypeScript + Tailwind in `admin/` |
| **Public Website** | React + Vite + TypeScript + Tailwind in `web/` |
| **Database** | Supabase PostgreSQL — schema defined in `schema(2).sql` |
| **Auth** | Custom JWT via `jsonwebtoken`; Supabase Auth for email/password |
| **Free-tier Hosting** | Backend → Render free tier; Frontend → Cloudflare Pages |

---

## Directory Layout

```
BrAINLabsInc/
├── backend/                  # Express.js REST API (NEW — replaces api/)
│   ├── src/
│   │   ├── index.js
│   │   ├── config/supabase.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── requireRole.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── members.js
│   │   │   ├── researchers.js
│   │   │   ├── blogs.js
│   │   │   ├── tutorials.js
│   │   │   ├── projects.js
│   │   │   ├── events.js
│   │   │   ├── grants.js
│   │   │   ├── publications.js
│   │   │   └── public.js
│   │   └── db/queries.js
│   ├── .env
│   ├── .env.example
│   └── package.json
├── admin/                    # Admin React dashboard
├── web/                      # Public-facing website
├── schema.sql             # CANONICAL schema — always reference this
├── prompt.md                 # Full project specification
├── CLAUDE.md                 # This file
└── TASK.md                   # Current sprint task list
```

---

## The New Schema — Critical Rules

**Always use `schema(2).sql` as truth. Never reference `schema.sql`.**

### Role System (ISA pattern)

```
member
  ├── admin            (member_id PK + FK)
  ├── researcher       (member_id PK + FK)
  └── research_assistant (member_id PK + FK)
  └── former_member    (archived after resignation)
```

To determine a user's role at runtime:
```sql
SELECT
  m.id,
  CASE
    WHEN a.member_id IS NOT NULL THEN 'admin'
    WHEN r.member_id IS NOT NULL THEN 'researcher'
    WHEN ra.member_id IS NOT NULL THEN 'research_assistant'
    ELSE 'pending'
  END AS role
FROM member m
LEFT JOIN admin a ON a.member_id = m.id
LEFT JOIN researcher r ON r.member_id = m.id
LEFT JOIN research_assistant ra ON ra.member_id = m.id
WHERE m.id = $1;
```

### Approval Status
Content and member roles use `approval_status_enum ('PENDING', 'APPROVED', 'REJECTED')`.
- **PENDING** — default on creation, not publicly visible.
- **APPROVED** — admin has approved; visible to public endpoints.
- **REJECTED** — admin rejected; hidden but preserved in DB.

### Primary Keys
All tables use `SERIAL` (auto-increment integer), **not UUID**. Examples:
- `member.id` — INT
- `researcher.member_id` — INT (FK to member.id)
- `blog.id` — INT

### Blog Creator Constraint
`blog` has a `CHECK` constraint: exactly one of `created_by_member_id` OR `created_by_former_member_id` must be non-null. Enforce this at the application layer before insert.

### Publications — ISA Subtypes
A `publication` row must be created first, then exactly one of:
- `conference_paper` (has `paper_id`, `link`, `description`)
- `book` (has `isbn`, `link`, `description`)
- `journal` (has `issn`, `link`, `description`)
- `article` (has `doi`, `link`, `description`)

### Researcher-Only Tables
`event` and `grant_info` have `created_by_researcher INT NOT NULL` — FK directly to `researcher.member_id`. Only researchers can insert into these tables. Enforce in `requireRole` middleware.

---

## Backend (Express.js) — Conventions

### Module System
```json
// backend/package.json
{ "type": "module" }
```
Use ES module `import`/`export` syntax everywhere. No `require()`.

### Entry Point Pattern
```js
// backend/src/index.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter } from './routes/auth.js';
// ...

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(','), credentials: true }));
app.use(express.json());

app.use('/auth', authRouter);
// ... mount other routers

// Centralised error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: err.message });
});

app.listen(process.env.PORT ?? 3001);
```

### Auth Middleware
```js
// middleware/auth.js
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

### Role Middleware
```js
// middleware/requireRole.js
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```
Use as: `router.patch('/members/:id/approve', requireAuth, requireRole('admin'), handler)`.

### Request Validation
Use `zod` for all POST / PUT / PATCH bodies:
```js
import { z } from 'zod';

const CreateBlogSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  description: z.string().optional(),
});

// In route handler:
const parsed = CreateBlogSchema.safeParse(req.body);
if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
```

### Supabase Client
```js
// config/supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Service role — bypasses RLS
);
```
**Never expose the service role key to the frontend.**

### Error Handling
- All async route handlers must be wrapped or use `express-async-errors`.
- Throw errors with `status` property for centralised handler:
  ```js
  const err = new Error('Not found'); err.status = 404; throw err;
  ```

---

## Frontend (React) — Conventions

### API Client
```ts
// src/lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers!.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
```

### Auth Context
```tsx
// src/contexts/AuthContext.tsx
interface User { id: number; role: 'admin' | 'researcher' | 'research_assistant'; email: string; slug: string; }
interface AuthContextType { user: User | null; login: (email, password) => Promise<void>; logout: () => void; }
```
Persist `token` and `user` JSON to `localStorage`. On mount, restore from storage.

### Data Fetching
Use **React Query** (`@tanstack/react-query`) for all server state. Example:
```ts
const { data: blogs, isLoading } = useQuery({
  queryKey: ['blogs'],
  queryFn: () => api.get('/blogs').then(r => r.data),
});
```

### Component Naming
- Files: `PascalCase.tsx` (e.g., `BlogEditor.tsx`)
- Hooks: `useCamelCase.ts` (e.g., `useBlogs.ts`)
- Route pages in `src/pages/`
- Reusable UI in `src/components/`
- API hooks in `src/hooks/`

### Role-Gated UI
```tsx
const { user } = useAuth();

// Only render for admins
{user?.role === 'admin' && <ApprovalQueue />}

// Only render for researchers
{['admin', 'researcher'].includes(user?.role) && <EventsNav />}
```

---

## Content Approval Flow

```
User creates content (blog/tutorial/project/event/grant)
  → approval_status = 'PENDING'
  → Not visible on public endpoints
  → Admin sees it in /admin/content/pending
Admin approves → approval_status = 'APPROVED'
  → Visible on public endpoints
Admin rejects → approval_status = 'REJECTED'
  → Hidden but preserved; user can edit and resubmit
```

---

## Member Lifecycle

```
Registration → member row created (auth_user_id set)
  → researcher or research_assistant row created (approval_status = 'PENDING')
Admin approves → approval_status = 'APPROVED', approved_by_admin_id set
Member resigns → former_member row created (former_role, resign_date, working_period stored)
  → researcher / research_assistant row deleted (CASCADE)
  → member row preserved (for blog authorship FK)
```

---

## Environment Variables Reference

### Backend (`backend/.env`)
```
PORT=3001
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=https://brainlabsinc.org,https://admin.brainlabsinc.org,http://localhost:5173,http://localhost:5174
```

### Frontend Shared (`.env.local` in `admin/` and `web/`)
```
VITE_API_URL=http://localhost:3001
```

---

## Things to Never Do

1. **Never use** `schema.sql` (old schema) for any new code.
2. **Never expose** `SUPABASE_SERVICE_ROLE_KEY` to the frontend bundle.
3. **Never store** JWTs in `sessionStorage` or as URL params.
4. **Never bypass** the `approval_status` filter on public endpoints.
5. **Never allow** a `research_assistant` to create `event` or `grant_info` rows.
6. **Never use** `UUID` for new primary keys — the new schema uses `SERIAL` (INT).
7. **Never use** the Supabase JS client directly in the frontend for data mutations — always go through the Express API.
8. **Never call** `.toJson()` (Ballerina pattern) — use `JSON.stringify()` or `res.json()` in Express.

---

## Running Locally

```bash
# Backend
cd backend
npm install
npm run dev          # nodemon src/index.js

# Admin dashboard
cd admin
npm install
npm run dev          # Vite on :5174

# Public website
cd web
npm install
npm run dev          # Vite on :5173
```

---

## Supabase Schema Setup

Run `schema(2).sql` in the Supabase SQL Editor to initialise the database. The schema is idempotent for new databases (no explicit DROP on all objects yet — run on a fresh project).
