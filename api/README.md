# BrAIN Labs API

Ballerina REST API powering [brainlabsinc.org](https://brainlabsinc.org) and the admin dashboard.

## Project Structure

```
api/
├── main.bal              ← HTTP listener, CORS, all route handlers
├── config.bal            ← Configurable variables (loaded from Config.toml)
├── helpers.bal           ← Response helpers, auth middleware, type converters
├── modules/
│   ├── types/            ← Shared record types (Supabase schema models)
│   │   └── types.bal
│   ├── auth/             ← Google OAuth 2.0 + JWT issue/validate
│   │   └── auth.bal
│   ├── ai/               ← HuggingFace inference (summarize, classify, autoTag)
│   │   └── ai.bal
│   └── db/               ← Supabase REST client (CRUD + profile upsert)
│       └── db.bal
├── tests/                ← Test stubs
│   └── service_test.bal
├── sql/
│   └── schema.sql        ← PostgreSQL DDL + RLS policies
├── Ballerina.toml
├── Config.toml.template
├── Dockerfile
└── .gitignore
```

## Setup

1. Install [Ballerina](https://ballerina.io/downloads/) (Swan Lake 2201.13.x+)
2. Copy the config template:
   ```bash
   cp Config.toml.template Config.toml
   ```
3. Fill in your secrets in `Config.toml` (Supabase, Google OAuth, JWT, HuggingFace)
4. Run the Supabase schema:
   ```bash
   # Paste sql/schema.sql into Supabase SQL Editor
   ```

## Running

```bash
# Development
bal run

# Build JAR
bal build

# Docker
docker build -t brainlabs-api .
docker run -p 8080:8080 -v $(pwd)/Config.toml:/app/Config.toml brainlabs-api
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | — | Health check |
| `GET` | `/auth/google` | — | Start Google OAuth flow |
| `GET` | `/auth/google/callback` | — | OAuth callback (redirects to admin) |
| `GET` | `/publications` | — | Published publications |
| `GET` | `/blog` | — | Published blog posts |
| `GET` | `/research` | — | Published research articles |
| `GET` | `/events` | — | Published events |
| `POST` | `/events/{id}/register` | — | Register for an event |
| `GET/POST/PUT/DELETE` | `/admin/publications` | Bearer JWT | Manage publications |
| `POST` | `/admin/publications/summarize` | Bearer JWT | AI-summarize abstract |
| `GET/POST/PUT/DELETE` | `/admin/blog` | Bearer JWT | Manage blog posts |
| `GET/POST/PUT/DELETE` | `/admin/research` | Bearer JWT | Manage research |
| `POST` | `/admin/research/classify` | Bearer JWT | AI-classify research area |
| `GET/POST/PUT/DELETE` | `/admin/events` | Bearer JWT | Manage events |
| `GET` | `/admin/users` | Bearer JWT (super_admin) | List all users |
| `PUT` | `/admin/users/{id}/role` | Bearer JWT (super_admin) | Change user role |

## Config.toml

Root module variables are at the top level. The `db` sub-module has its own section:

```toml
# Root module
port = 8080
googleClientId = "..."
jwtSecret = "..."

# Database sub-module
[brainlabs.backend.db]
supabaseUrl = "https://xxxx.supabase.co"
supabaseServiceKey = "your-service-role-key"
```
