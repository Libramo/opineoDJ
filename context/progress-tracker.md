# Progress Tracker — OpineoDJ

Update this file after every meaningful implementation change.
Claude Code reads this file at the start of every session.

---

## Current Phase

**Phase 2 — Collection** — In Progress

---

## Current Goal

**Phase 3.1** — PostgreSQL aggregations (%, averages, distributions per question type) → feeds Phase 3.2 public results dashboard.

---

## Completed

- [x] Project name defined: **OpineoDJ by BlyAnalytics**
- [x] Product ambition defined: professional polling institute standard (Level 3)
- [x] Tech stack finalized (Next.js 15, Supabase, Drizzle ORM, better-auth,
      FastAPI, Resend, Tailwind v4, shadcn/ui, motion/react)
- [x] Data hierarchy defined:
      `clients → campaigns → survey_waves → surveys → questions → answers`
- [x] Color palette defined (slate green + analytical amber, light + dark)
- [x] Context files initialized and fully written in English
- [x] **1.1 — Drizzle schema** (`lib/db/schema.ts`) — all 11 tables, enums,
      indexes, relations, TypeScript types exported
- [x] **1.1 — Drizzle client** (`lib/db/index.ts`) — postgres-js, max 1
      connection for Vercel serverless
- [x] **1.1 — RPC functions + RLS policies** (`supabase/rpc-and-rls.sql`) —
      4 RPC functions, full RLS on all tables
- [x] **1.1 — Drizzle config** (`drizzle.config.ts`) — strict mode, migrations
      output to `supabase/migrations/`
- [x] **1.2 — Next.js project init** — App Router, Tailwind v4, all dependencies
      installed (drizzle-orm, better-auth, @supabase/supabase-js, next-themes,
      react-hook-form, zod, resend, motion, shadcn/ui)
- [x] **1.3 — Base design system**
  - Root layout — Lora + Geist fonts loaded, ThemeProvider wired, metadata set, lang="fr"
  - `globals.css` — full OpineoDJ token palette (oklch), light + dark, mapped to shadcn semantic variables
  - shadcn/ui core components installed: button, input, select, textarea, card, separator, badge, tooltip, dialog, sheet, dropdown-menu, table, tabs, progress
  - `ThemeToggle.tsx` — animated spring toggle, amber/green thumb, reduced motion aware, accessible
- [x] **2.1 — Admin dashboard layout + better-auth**
  - better-auth configured with Drizzle adapter + email/password
  - `app/(admin)/layout.tsx` — session guard, redirects to `/login`
  - `AdminSidebar.tsx` — fixed 240px sidebar, nav links, theme toggle, user info
  - `app/login/page.tsx` + `LoginForm.tsx` — sign in form, French labels
  - `scripts/seed-admin.ts` — admin account seeder
- [x] **DB migrated to Neon** — `@neondatabase/serverless` + `drizzle-orm/neon-http`
- [x] **Full domain schema pushed to Neon** — 4 enums, 10 domain tables, full Drizzle relations
- [x] **2.3 — Public survey form (`/survey/[slug]`)**
  - `app/(public)/layout.tsx` — public route group layout
  - `app/(public)/survey/[slug]/page.tsx` — Server Component: loads survey + questions by slug, handles draft/closed states, `generateMetadata` for SEO
  - `components/survey/PublicSurveyForm.tsx` — wizard Client Component: all 4 question types (multiple_choice, rating, open_text, date, number), demographic profile step, `AnimatePresence` slide transitions, reduced motion aware
  - `app/api/surveys/[slug]/submit/route.ts` — POST handler: Zod validation, inserts `responses` + `answers` + `respondent_profiles`, IP hashing
- [x] **2.4 — Response submission + storage** — implemented as part of 2.3 (submit route + DB inserts)
- [x] **Copy URL fix** — `SurveySettings` now copies full absolute URL using `NEXT_PUBLIC_APP_URL` env variable (works on server, client, and in future Resend emails)
- [x] **2.5 — Email notifications via Resend**
  - `lib/email/resend.ts` — Resend singleton, `FROM_ADDRESS` from `RESEND_FROM_ADDRESS` env
  - `lib/email/templates/SubmissionNotification.tsx` — branded email (slate green header, response count, survey link)
  - Submit route fires email after DB insert — fire-and-forget, never blocks response, errors logged not thrown
- [x] **QuestionsEditor overhaul**
  - Individual input fields for multiple choice options (add/remove per option, min 2 validation)
  - Required toggle (Switch), type description hints
  - Edit dialog: options synced without deleting answered options (FK constraint safe)
  - Drag-and-drop reorder via `@dnd-kit/react` + `@dnd-kit/helpers` — persisted via `/api/questions/reorder` route handler (not server action — avoids Next.js re-render on drop)
  - Reverts to original order on server error
- [x] **Rating scale configurable** — `config` JSONB column added to `questions` table, analyst sets scaleMin, scaleMax, labelMin, labelMax; public form renders accordingly
- [x] **AdminSidebar active link fix** — `/dashboard` only highlights on exact match
- [x] **seed-admin.ts** — upsert pattern, supports multiple users, loads `.env` via `tsx --env-file`

---

## In Progress

- [ ] **3.1 — Aggregations** (%, averages, distributions per question type)

---

## Next Up

**Phase 1.2 — Next.js Project Init**
- `create-next-app` with TypeScript + App Router + Tailwind v4
- Install: `drizzle-orm`, `postgres`, `drizzle-kit`
- Install: `better-auth`
- Install: `@supabase/supabase-js`
- Install: `shadcn/ui` + core components
- Install: `motion` (Framer Motion)
- Install: `next-themes` (dark/light mode)
- Install: `react-hook-form`, `zod`, `@hookform/resolvers`
- Install: `resend`, `@react-email/components`
- Environment variables structure (`.env.local.example`)
- Folder structure per `code-standards.md`

**Phase 1.3 — Base Design System**
- `globals.css` — CSS tokens mapped to shadcn semantic variables
- `tailwind.config.ts` — custom color tokens
- shadcn components installed: button, input, select, textarea, card,
  separator, badge, tooltip, dialog, sheet, dropdown-menu, table, tabs,
  progress, form
- `next-themes` provider in root layout
- Dark/light mode toggle component

See **Full Roadmap** section below for all phases through Level 3.

---

## Full Roadmap — All Levels

The build is structured in three levels of maturity. Levels 1 and 2 are the
immediate build. Level 3 is the target state — architecture decisions made today
must not block Level 3 later.

---

### Level 1 — Basic Survey Tool (Phases 1–3)
*Target: ~6 weeks*

**Phase 1 — Foundation** ✅ COMPLETE
- [x] 1.1 Full Supabase schema + Drizzle ORM schema (`lib/db/schema.ts`)
- [x] 1.2 Next.js project init (App Router, Tailwind v4, shadcn/ui, better-auth)
- [x] 1.3 Base design system (CSS tokens mapped to shadcn, core components installed)

**Phase 2 — Collection**
- [x] 2.1 Admin dashboard layout + better-auth (sign in, session, protected routes)
- [x] 2.2 Survey creation flow — clients, campaigns, waves, survey builder
  - Clients list + create/delete
  - Campaigns list + create/archive, campaign detail with waves
  - Wave detail with surveys list
  - Survey builder: questions editor (add/edit/delete, multiple choice options), quotas editor (demographic dropdowns, grouped by key), settings (publish/close/reopen, public URL)
  - `/dashboard/surveys` global list page
- [x] 2.2 Survey creation flow (campaign → wave → questions → quotas)
- [x] 2.3 Public survey form (`/survey/[slug]`) — all 4 question types
- [x] 2.4 Response submission + storage (answers, respondent profile)
- [x] 2.5 Email notifications via Resend (on submission + milestones)

**Phase 3 — Basic Analysis**
- [ ] 3.1 PostgreSQL RPC aggregations (%, averages, distributions per question type)
- [ ] 3.2 Real-time public dashboard (`/results/[slug]`) + Supabase Realtime
- [ ] 3.3 Analyst dashboard — raw results view with basic charts (Recharts)

---

### Level 2 — Professional Analysis (Phases 4–5)
*Target: ~4 weeks after Level 1*

**Phase 4 — Advanced Statistical Engine**
- [ ] 4.1 FastAPI microservice setup (Vercel Python runtime → Railway on launch)
- [ ] 4.2 Quota definition UI — demographic cells (gender, age, region, profession)
- [ ] 4.3 Quota fill tracking — real-time progress against targets during collection
- [ ] 4.4 Raking engine (iterative proportional fitting) — `api/py/lib/raking.py`
- [ ] 4.5 Confidence intervals + margin of error display on all results (± %)
- [ ] 4.6 Cross-tabulation explorer (flat breakdown / cross-tab by demographic)
- [ ] 4.7 Inter-wave trend tracking — delta calculation between waves, trend charts

**Phase 5 — Export & Integration**
- [ ] 5.1 PDF export — branded OpineoDJ/BlyAnalytics report (react-pdf)
- [ ] 5.2 Excel/CSV export — raw data + weighted data (xlsx)
- [ ] 5.3 Internal REST API — aggregated results per survey for BlyAnalytics tools
- [ ] 5.4 Webhooks — notify external pipelines on quota reached / raking complete

---

### Level 3 — Institut de Sondage (Phases 6–8)
*Target: Phase 2 of the product — after Level 2 is live and generating revenue*

**Phase 6 — Panel Management**
- [ ] 6.1 Respondent registration — public sign-up with demographic profile
- [ ] 6.2 Panel database — searchable pool of registered respondents with profiles
- [ ] 6.3 Quota-based targeting — system matches open quota cells to panel members
- [ ] 6.4 Targeted survey invitations — email campaigns to matching respondents (Resend)
- [ ] 6.5 Respondent portal — personal dashboard showing available surveys and history
- [ ] 6.6 Panel health metrics — activity rates, dropout tracking, demographic balance

**Phase 7 — CAWI Interviewer Mode**
- [ ] 7.1 Interviewer accounts — separate role with restricted permissions
- [ ] 7.2 Interviewer dashboard — assigned surveys, daily quota targets, progress
- [ ] 7.3 Assisted form mode — interviewer fills the form on behalf of a respondent
- [ ] 7.4 Collection attribution — every response tagged with interviewer_id
- [ ] 7.5 Interviewer performance tracking — response counts, quota contribution, timing
- [ ] 7.6 Field supervisor role — view and validate interviewer work

**Phase 8 — Compliance & Institutional Features**
- [ ] 8.1 GDPR / RGPD consent flows — explicit consent on every form, audit log
- [ ] 8.2 Right to erasure — respondent can delete their data, cascade handled cleanly
- [ ] 8.3 Data retention policies — configurable per survey, auto-anonymization
- [ ] 8.4 Methodology documentation generator — auto-produces the standard methodology
       sheet required for publication (sample size, fieldwork dates, weighting method)
- [ ] 8.5 Commission des Sondages registration support — export package for regulatory
       filing of electoral polls
- [ ] 8.6 Audit trail — immutable log of all analyst actions on a survey
- [ ] 8.7 Multi-organization support — BlyAnalytics can manage multiple sub-orgs
       or client workspaces with isolated data

---

## Open Questions

- [x] **FastAPI — deployment**: Vercel free tier (Python runtime) during
      development and testing — fine for small fake datasets. Migrate to
      Railway (~€5/month) when going live with real surveys. Code does not
      change — only the `FASTAPI_URL` environment variable is updated.

- [ ] **Domain**: the app lives on an existing subdomain. What is the target
      subdomain? (e.g. `surveys.blyanalytics.com`) — needed to configure
      Resend and better-auth correctly.

- [ ] **Rate limiting**: what mechanism for public form submissions?
      Next.js middleware, Vercel Edge Config, or Supabase RLS + counter?

- [ ] **Open text — Phase 2**: integrate Claude API for thematic summaries
      of open-text responses? Confirm before starting Phase 4.

---

## Architecture Decisions

- **Drizzle ORM** chosen over Prisma: better compatibility with Supabase,
  stronger PostgreSQL typing, closer to native SQL — easier for a data org
  to reason about.

- **better-auth** chosen for authentication: self-hosted, no external paid
  dependency (vs Clerk), integrates natively with Next.js App Router.

- **FastAPI (Python)** for the analysis engine: Python's scientific libraries
  (scipy, numpy, pandas) have no mature Node.js equivalent for raking and
  advanced statistics. Deployed via Vercel Python runtime initially, Railway
  on first production deployment.

- **Immutable raw responses**: `answers` are never modified after insertion.
  Weighting coefficients live in a separate `weights` table. Ensures raw data
  integrity and allows weights to be recalculated at any time.

- **Slate green + analytical amber palette**: deliberately different from
  generic "AI navy blue". Anchors OpineoDJ visually in an editorial and
  cartographic register, consistent with the identity of a polling institute.

- **shadcn/ui + Drizzle**: no hardcoded colors anywhere in components (tokens
  only via shadcn semantic classes), no ORM other than Drizzle.

- **motion/react (Framer Motion)**: all meaningful animations use motion
  components — no CSS transitions for orchestrated sequences. Reduced motion
  always respected via `useReducedMotion()`.

- **Claude Code in VS Code**: primary development environment. All context
  files live in the repo root under `docs/` and are read at session start.

---

## Session Notes

- Full design conversation completed — all technical and product choices
  validated with the client (BlyAnalytics / Djibouti)
- App lives on a subdomain (exact domain TBD — see Open Questions)
- App UI language is **French**; all developer documentation is in **English**
- Ambition level: **professional polling institute (Level 3)**
- Development environment: **Claude Code inside VS Code**
- Phase 1.1 complete — schema files ready to drop into the project
- Next session: `create-next-app` + full dependency install (Phase 1.2)
