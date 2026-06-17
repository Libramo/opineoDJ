# Code Standards — OpineoDJ

## Claude Code context

When Claude Code starts a session, it reads these files in order:
1. `progress-tracker.md` — what is done, what is next
2. `architecture.md` — stack and invariants
3. `code-standards.md` — this file
4. `ui-context.md` — before touching any component

---

## General

- Keep modules small and single-purpose — one function, one responsibility
- Fix root causes, never layer workarounds
- Do not mix unrelated concerns in one component or route
- All new code must be typed — no `any`, no implicit types
- Prefer readability over cleverness when the two are in tension

---

## TypeScript

- Strict mode required: `"strict": true` in `tsconfig.json`
- No `any` — use explicit interfaces or narrowly scoped types
- Validate all external input (form data, URL params, request bodies)
  with **Zod** before trusting it
- Define API response types in `lib/types/` and share them between
  the frontend and route handlers
- Interfaces and types in PascalCase: `SurveyQuestion`, `WeightedResult`, `RakingInput`

---

## Next.js (App Router)

- Default to **Server Components**. Add `"use client"` only when browser
  interactivity is required (state, effects, realtime subscriptions)
- **Route Handlers** (`app/api/`) are focused on a single responsibility each
- Never perform statistical computation in a route handler — always delegate
  to the FastAPI microservice (`/api/py/`)
- Admin pages live in `app/(admin)/` with a layout that verifies the session
- Public pages live in `app/(public)/` — never check auth here
- Use `generateMetadata()` on all public pages (SEO + social sharing)
- Dashboard initial data is loaded via SSR (`fetch` in a Server Component),
  then hydrated by Supabase Realtime on the client side

---

## Styling

- **Zero hardcoded hex values in components** — no exceptions. Not in `className`,
  not in inline styles, not in Recharts props, not in inline SVGs.
- Use **shadcn/ui semantic classes** as the primary approach:
  `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`,
  `bg-primary`, `text-primary-foreground`, `border-border`, `ring-ring`, etc.
- For Recharts only, use CSS variables: `var(--chart-1)` through `var(--chart-5)`.
  Never hardcode hex in Recharts `fill`, `stroke`, or `color` props.
- Follow the border-radius scale in `ui-context.md` via Tailwind classes
  (`rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`)
- Tailwind classes only — no inline styles (`style={{}}`), no CSS modules,
  except for complex CSS animations not supported by Tailwind
- Dark mode via the `dark` class on `<html>` managed by `next-themes` —
  never detect the mode manually inside components
- Hex values in `globals.css` (token definitions) are the **only exception** —
  that is the single authorized location for hex values in the entire codebase

---

## Forms

- All forms use **react-hook-form** (`useForm` + `zodResolver`) + **Zod** for validation
- Form state managed via `useForm<FormValues>` — no local `useState` for field values
- Use `<Controller />` for every controlled input; never use `register` for custom inputs
- Use the shadcn `<Field />` component to wrap each `<Controller />` for accessible markup:
  ```tsx
  <Controller
    name="fieldName"
    control={form.control}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>Label</FieldLabel>
        <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
        <FieldDescription>Helper text.</FieldDescription>
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )}
  />
  ```
- Import `Field`, `FieldLabel`, `FieldDescription`, `FieldError` from `@/components/ui/field`
- For wizard / multi-step forms: call `form.trigger(fieldName)` to validate a single field
  before advancing to the next step — do not use a separate `isAnswered` helper
- The submit button is disabled while `form.formState.isSubmitting`
- Dynamic schemas (field list known only at runtime) are built with a factory function
  outside the component and memoized with `useMemo` inside it
- Never use a bare `<form>` tag — always use `form.handleSubmit(onSubmit)` on the `<form>` element
- Validation errors display inline below the relevant field via `<FieldError />`

---

## API Routes (Next.js Route Handlers)

- Validate and parse the request body with Zod before any logic runs
- Verify auth and ownership before any mutation — return 401/403 otherwise
- Consistent response shapes:
  ```ts
  // Success
  { success: true, data: T }
  // Error
  { success: false, error: string, code?: string }
  ```
- Never expose stack traces in production
- Public routes (form submission) must have rate limiting (via Next.js middleware)

---

## FastAPI (Python — `/api/py/`)

- One file per endpoint in `api/py/`
- Typed with **Pydantic** v2 — all inputs and outputs are Pydantic models
- Raking (iterative proportional fitting) lives in `api/py/lib/raking.py`
- Question-type aggregations live in `api/py/lib/aggregations.py`
- Confidence interval calculations live in `api/py/lib/stats.py`
- Python dependencies in `api/py/requirements.txt`
- Allowed libraries: `numpy`, `scipy`, `pandas`, `pydantic`, `fastapi`

---

## Database (Drizzle + Supabase PostgreSQL)

- **Drizzle ORM is the only ORM in this project** — Prisma is not used
- The Drizzle schema in `lib/db/schema.ts` is the **single source of truth**
  for the database structure
- Migrations managed by Drizzle Kit:
  - Dev: `drizzle-kit push` (direct sync, no migration files)
  - Prod: `drizzle-kit generate` then `drizzle-kit migrate`
- **All queries go through the typed Drizzle client** — no raw SQL
  in components or route handlers
- Exception: complex Supabase RPC functions for statistical aggregations,
  called via `supabase.rpc()` — document all RPCs in `lib/db/rpc.ts`
- Never use the Supabase JS client for CRUD mutations — Drizzle handles
  all reads and writes
- Never instantiate the Supabase service role client in the browser
- Raw responses (`answers`) are **immutable** after insertion —
  no updates, no deletes. Weights live in a separate `weights` table.
- RLS enabled on all tables — policies are documented as comments
  in `lib/db/schema.ts` above each relevant table

---

## Email (Resend)

- All email sending functions live in `lib/email/`
- Templates are React components (`lib/email/templates/`)
  rendered with `@react-email/components`
- Emails are sent from Next.js route handlers only — never from client components
- Sending address: `noreply@opineodj.com` (or BlyAnalytics subdomain)

---

## File Organization

```
app/
  (admin)/        — Analyst dashboard pages (auth required)
  (public)/       — Public forms and results pages
  api/            — Next.js route handlers
api/
  py/             — FastAPI Python (Vercel Python runtime)
    lib/          — Shared stats logic (raking, aggregations, stats)
components/
  ui/             — shadcn/ui — never edit manually
  charts/         — Wrapped Recharts components
  survey/         — Form components (builder + public form)
  dashboard/      — Analyst dashboard components
lib/
  db/             — Drizzle schema, migrations, queries
  email/          — Resend functions, React Email templates
  analysis/       — FastAPI calls + shared types
  auth/           — better-auth configuration
  types/          — Shared TypeScript types
  utils/          — Generic helpers
public/           — Static assets, OpineoDJ logo
```

---

## Naming Conventions

| Element            | Convention               | Example                         |
| ------------------ | ------------------------ | ------------------------------- |
| React components   | PascalCase               | `SurveyResultCard.tsx`          |
| Hooks              | camelCase prefixed `use` | `useSurveyRealtime.ts`          |
| Utility functions  | camelCase                | `formatPercent.ts`              |
| Route handlers     | `route.ts`               | `app/api/surveys/[id]/route.ts` |
| Types / interfaces | PascalCase               | `WeightedAnswer`                |
| Env variables      | SCREAMING_SNAKE_CASE     | `SUPABASE_SERVICE_ROLE_KEY`     |
| DB tables          | snake_case plural        | `survey_waves`, `respondents`   |
| DB columns         | snake_case               | `created_at`, `survey_id`       |
