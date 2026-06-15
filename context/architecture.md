# Architecture Context — OpineoDJ

## Claude Code Setup

This project is developed using **Claude Code inside VS Code**.
Context files live in `docs/` at the project root. Claude Code reads them
at the start of every session. The primary terminal is the VS Code integrated
terminal — all commands run from the project root.

---

## Stack

| Layer         | Technology                  | Role                                                     |
| ------------- | --------------------------- | -------------------------------------------------------- |
| Framework     | Next.js 15 + TypeScript     | App Router, SSR, API routes, public forms, dashboards    |
| UI            | Tailwind CSS v4 + shadcn/ui | Design system, reusable components                       |
| Auth          | better-auth                 | Analyst authentication (admin side only)                 |
| Database      | Supabase (PostgreSQL)       | All structured data storage                              |
| Realtime      | Supabase Realtime           | Push new responses to public dashboards                  |
| ORM           | Drizzle ORM                 | Typed PostgreSQL queries, migrations                     |
| Stats engine  | FastAPI (Python)            | Raking, confidence intervals, complex aggregations       |
| Email         | Resend                      | Automatic notifications on submission and milestones     |
| Deployment    | Vercel                      | Next.js + FastAPI via Vercel Python runtime (`/api/py/`) |
| Export        | react-pdf + xlsx            | PDF report generation and Excel file output              |

> **FastAPI / Vercel Python runtime note**: the choice between Vercel Python runtime
> and a separate service (Railway/Render) is open. Default: Vercel Python runtime
> (zero extra infra, sufficient up to ~5k responses per survey). Migrate if execution
> time exceeds 25s or dataset size demands it. See Open Questions in `progress-tracker.md`.

## Data Model — Main Hierarchy

```
clients
  └── campaigns              (a study commissioned by a client)
        └── survey_waves     (each wave = one survey instance)
              └── surveys
                    ├── questions
                    │     └── question_options   (for multiple choice)
                    ├── quotas                   (target demographic cells)
                    ├── responses
                    │     └── answers            (raw value per question)
                    └── respondent_profiles      (respondent demographics)

weights                      (calculated post-collection, linked to response_id)
question_insights            (optional AI summaries for open text — Phase 2)
```

## System Boundaries

- `app/`              — Next.js routes (App Router): pages, layouts, route handlers
- `app/(admin)/`      — Analyst dashboard — protected by better-auth
- `app/(public)/`     — Public forms and results pages — no auth
- `app/api/`          — Next.js route handlers (submission, notifications, export)
- `api/py/`           — FastAPI Python endpoints (raking, stats, aggregations)
- `components/`       — Shared React components
- `components/ui/`    — shadcn/ui components — never edit manually
- `lib/`              — Utilities, Supabase clients, Resend helpers
- `lib/db/`           — Drizzle schema, migrations, typed queries
- `lib/analysis/`     — Calls to the FastAPI microservice + shared types
- `public/`           — Static assets

## Storage Model

- **Supabase PostgreSQL**: all structured data — surveys, questions, responses,
  respondents, quotas, weights, campaigns, clients
- **Supabase Realtime**: subscription channel on the `answers` table for
  real-time dashboard updates
- **No external file storage**: PDF/Excel exports are generated on the fly
  and streamed to the client (not persisted)

## Auth and Access Model

- **Authentication**: better-auth, email + password, server-side sessions
- **Roles**:
  - `analyst` — full access to admin dashboard, survey creation and management
  - `admin` — BlyAnalytics superuser, user management
- **Public**: forms (`/survey/[slug]`) and results (`/results/[slug]`) are
  fully public — no authentication required
- **Ownership**: each survey belongs to an `analyst_id`. Only the creator
  or an `admin` can edit or delete a survey.
- **Supabase RLS**: Row Level Security enabled on all sensitive tables.
  Public routes use the Supabase anonymous client (anon key).
  Admin routes use the service role client (server-side only).

## API Design

```
POST  /api/surveys/[id]/submit        → submit a response (public)
GET   /api/surveys/[slug]/results     → aggregated results (SSR initial load)
POST  /api/surveys/[id]/notify        → send email via Resend (internal)
POST  /api/py/analyze                 → trigger raking calculation (admin only)
GET   /api/py/stats/[survey_id]       → weighted stats by question
GET   /api/export/[survey_id]/pdf     → PDF export
GET   /api/export/[survey_id]/excel   → Excel export
```

## Invariants

1. No raw response data is exposed on public routes — only aggregations are public
2. Weight calculation (raking) never mutates raw responses — weights are stored
   separately in the `weights` table
3. Next.js route handlers never perform statistical computation — they always
   delegate to the FastAPI microservice (`/api/py/`)
4. shadcn/ui components (`components/ui/`) are never edited manually —
   use the shadcn CLI for updates
5. Every data mutation goes through auth and ownership verification
   before any business logic runs
6. The Supabase service role client is never instantiated in the browser
