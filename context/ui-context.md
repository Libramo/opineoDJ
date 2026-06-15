# UI Context — OpineoDJ

## Claude Code context

Read this file before touching any component, layout, or style.
All color decisions reference the token tables below.
All animation decisions reference the Motion section.

---

## Theme

Both light and dark modes supported. Default follows the system preference.
The design draws from professional analysis tools and European statistical
publications — clean, information-dense, and readable without being austere.
No generic navy blue. The palette is built around a **deep slate green** (primary)
and an **analytical amber** (accent) — rare in data tooling, immediately
recognizable, evoking cartographic precision and editorial warmth.

---

## Colors

> The hex values below are **token definitions only** — they belong in one place:
> `globals.css` (as CSS custom properties) and `tailwind.config.ts` (mapped to
> Tailwind theme tokens). **Never use hex values directly in components, className
> strings, Recharts props, or inline SVGs.** Always reference the CSS variable or
> its shadcn/Tailwind alias (`bg-background`, `text-muted-foreground`, `var(--chart-1)`).
> shadcn/ui semantic token names take priority over custom variable names where both exist.

### shadcn/ui Semantic Token Mapping

Map OpineoDJ tokens to shadcn tokens in `globals.css` so shadcn components
inherit the palette automatically:

| shadcn token           | OpineoDJ role          |
| ---------------------- | ---------------------- |
| `--background`         | `--bg-base`            |
| `--card`               | `--bg-surface`         |
| `--popover`            | `--bg-surface`         |
| `--foreground`         | `--text-primary`       |
| `--muted-foreground`   | `--text-muted`         |
| `--primary`            | `--accent-primary`     |
| `--primary-foreground` | white / `--bg-base`    |
| `--secondary`          | `--bg-elevated`        |
| `--accent`             | `--accent-secondary`   |
| `--border`             | `--border-default`     |
| `--ring`               | `--border-strong`      |
| `--destructive`        | `--state-error`        |

In components, always use **shadcn semantic classes**:
`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`,
`border-border`, `bg-primary`, `text-primary-foreground`, `ring-ring`, etc.
Use `var(--chart-N)` only in Recharts props (no shadcn equivalent exists).

### Light Mode

| Role             | CSS Variable          | Value     | Note                             |
| ---------------- | --------------------- | --------- | -------------------------------- |
| Page background  | `--bg-base`           | `#F7F6F2` | Warm off-white, not pure white   |
| Surface          | `--bg-surface`        | `#FFFFFF` | Cards, panels                    |
| Surface elevated | `--bg-elevated`       | `#EFEDE6` | Hover states, secondary panels   |
| Primary text     | `--text-primary`      | `#1C1C1A` | Warm near-black                  |
| Muted text       | `--text-muted`        | `#6B6B63` | Labels, captions                 |
| Primary accent   | `--accent-primary`    | `#2D6A4F` | Slate green — brand color        |
| Accent hover     | `--accent-hover`      | `#235C43` | Darker slate green               |
| Secondary accent | `--accent-secondary`  | `#C77B2E` | Analytical amber — highlights    |
| Border           | `--border-default`    | `#E0DDD5` | Separators, outlines             |
| Border strong    | `--border-strong`     | `#C5C2B8` | Focus rings, major dividers      |
| Error            | `--state-error`       | `#C0392B` | Validation, alerts               |
| Success          | `--state-success`     | `#2D6A4F` | Same as accent-primary           |
| Warning          | `--state-warning`     | `#C77B2E` | Same as accent-secondary         |
| Chart 1          | `--chart-1`           | `#2D6A4F` | Primary series                   |
| Chart 2          | `--chart-2`           | `#C77B2E` | Secondary series                 |
| Chart 3          | `--chart-3`           | `#5E8B7E` | Tertiary series                  |
| Chart 4          | `--chart-4`           | `#A44A3F` | Quaternary series                |
| Chart 5          | `--chart-5`           | `#8C7B4E` | Quinary series                   |

### Dark Mode

| Role             | CSS Variable          | Value     | Note                             |
| ---------------- | --------------------- | --------- | -------------------------------- |
| Page background  | `--bg-base`           | `#141412` | Warm near-black (not blue-tinted)|
| Surface          | `--bg-surface`        | `#1E1E1B` | Cards, panels                    |
| Surface elevated | `--bg-elevated`       | `#272724` | Hover states, secondary panels   |
| Primary text     | `--text-primary`      | `#F0EEE8` | Warm off-white                   |
| Muted text       | `--text-muted`        | `#9A9A8E` | Labels, captions                 |
| Primary accent   | `--accent-primary`    | `#3D8B6A` | Slate green lightened for dark   |
| Accent hover     | `--accent-hover`      | `#4A9E7A` | Hover on accent                  |
| Secondary accent | `--accent-secondary`  | `#D4893A` | Analytical amber dark            |
| Border           | `--border-default`    | `#2E2E2A` | Separators                       |
| Border strong    | `--border-strong`     | `#3E3E38` | Focus rings                      |
| Error            | `--state-error`       | `#E05C4B` | Alerts dark                      |
| Success          | `--state-success`     | `#3D8B6A` | Same as accent-primary dark      |
| Warning          | `--state-warning`     | `#D4893A` | Same as accent-secondary dark    |
| Chart 1          | `--chart-1`           | `#3D8B6A` | Primary series                   |
| Chart 2          | `--chart-2`           | `#D4893A` | Secondary series                 |
| Chart 3          | `--chart-3`           | `#6FA897` | Tertiary series                  |
| Chart 4          | `--chart-4`           | `#C4605A` | Quaternary series                |
| Chart 5          | `--chart-5`           | `#A89660` | Quinary series                   |

---

## Typography

| Role       | Font       | Variable        | Note                                     |
| ---------- | ---------- | --------------- | ---------------------------------------- |
| UI text    | Geist Sans | `--font-sans`   | Interface, labels, buttons               |
| Editorial  | Lora       | `--font-serif`  | Report titles, public pages              |
| Code/mono  | Geist Mono | `--font-mono`   | Numeric values, raw data display         |

> Lora (serif) is used only on public pages (forms, results) and PDF exports
> to give an editorial and institutional character.
> The admin dashboard uses Geist Sans exclusively.

---

## Font Sizes (Tailwind scale)

| Context              | Class       |
| -------------------- | ----------- |
| Micro label / badge  | `text-xs`   |
| Body / UI default    | `text-sm`   |
| Subheading           | `text-base` |
| Section heading      | `text-lg`   |
| Page title (admin)   | `text-xl`   |
| Page title (public)  | `text-2xl`  |
| Report headline      | `text-3xl`  |

---

## Border Radius

| Context                 | Class        |
| ----------------------- | ------------ |
| Inline / badges / tags  | `rounded`    |
| Inputs / buttons        | `rounded-md` |
| Cards / panels          | `rounded-lg` |
| Modals / overlays       | `rounded-xl` |

---

## Component Library

shadcn/ui on top of Tailwind CSS v4. Components live in `components/ui/`.
Use the CLI to add components — never edit them manually:
```bash
npx shadcn@latest add [component]
```

Priority components to install from the start:
- `button`, `input`, `select`, `textarea`
- `card`, `separator`, `badge`, `tooltip`
- `dialog`, `sheet`, `dropdown-menu`
- `table`, `tabs`, `progress`
- `form` (with react-hook-form + zod)

---

## Layout Patterns

- **Admin dashboard**: fixed left sidebar (240px) + scrollable main area.
  Top header with breadcrumb and contextual actions.
- **Public form**: centered, max-width 680px. One question at a time (wizard mode)
  or full scroll depending on survey type.
- **Public results page**: editorial layout, max-width 900px, sections per question
  with inline charts. Branded OpineoDJ header.
- **Modals**: centered overlay with `backdrop-blur-sm`. Never apply
  `overflow-hidden` to the body.
- **Sidebars**: fixed width, `border-r` using `border-border`, no shadow.

---

## Icons

Lucide React. Stroke only. Sizes:
- `h-4 w-4` — inline icons in text or badges
- `h-5 w-5` — buttons, navigation items
- `h-6 w-6` — section titles, empty states

---

## Motion & Animation

Library: **motion/react** (Framer Motion). No CSS transitions for meaningful
animations — always use motion components.

### Philosophy
Orchestrated over scattered. One cinematic moment per page beats ten
micro-animations fighting for attention. Motion should feel like data
coming alive — numbers counting up, results breathing in, charts drawing
themselves.

### Page Load Sequence (orchestrated)
Every page has a single staggered entrance — elements reveal in order,
not all at once:
```
1. Header / nav fades in        (delay: 0s,    duration: 0.4s)
2. Hero element animates        (delay: 0.15s, duration: 0.6s)
3. Primary content stagger      (delay: 0.1s between each child)
4. Secondary content fades      (delay: 0.05s between each child)
```
Use `variants` + `staggerChildren` on a parent `motion.div` — never
hardcode delays on individual elements.

### Signature Elements

**Percentage counter** (hero metric on results pages):
- Counts up from 0 to the real value on mount
- Spring easing: `{ type: "spring", stiffness: 60, damping: 20 }`
- Font: Lora serif, large display size
- This is the single most memorable animation in the product

**Survey result bars** (charts):
- Bars grow from 0 width to their real value on scroll into view
- Use `useInView` + `animate` — never animate off-screen elements
- Duration: 0.8s, ease: `[0.16, 1, 0.3, 1]` (expo out)

**Card hover** (survey cards, result cards):
- Subtle 3D tilt following cursor position (transform perspective)
- `rotateX` / `rotateY` max ±6deg
- Scale: 1.02 on hover
- Spring: `{ stiffness: 300, damping: 30 }`

**Live pulse indicator** (active surveys collecting responses):
- Ambient ping animation on the status dot
- CSS keyframe via Tailwind `animate-ping` — no motion needed here

**Page transitions** (route changes):
- Fade out current page (0.15s), fade in next (0.3s)
- Use `AnimatePresence` in the root layout

### Scroll Animations
Use `whileInView` + `viewport={{ once: true }}` — elements animate once
when they enter the viewport, never repeat on scroll back.
Standard entrance: `{ opacity: 0, y: 24 }` → `{ opacity: 1, y: 0 }`

### Reduced Motion
Always respect `prefers-reduced-motion`. Wrap animation values with
`useReducedMotion()` hook — if true, skip transforms and counters,
keep only opacity fades at reduced duration (0.15s max).

```tsx
const prefersReduced = useReducedMotion()
const variants = {
  hidden: { opacity: 0, y: prefersReduced ? 0 : 24 },
  visible: { opacity: 1, y: 0 }
}
```

### What NOT to animate
- Form inputs and validation states — instant feedback only
- Data tables — no row animations, too noisy
- Sidebar navigation items — static
- Error messages — appear instantly, never slide in
- Anything that delays the user completing a task

---

## Charts

Recharts. Always use CSS variables for colors:
`var(--chart-1)`, `var(--chart-2)`, etc.
Never hardcode hex values in chart component props.

Chart type by question type:
- **Multiple choice** → horizontal `BarChart`
- **Rating / NPS** → vertical `BarChart` + average line
- **Open text** → paginated list (no chart)
- **Date / Number** → `LineChart` or `AreaChart` for trends

---

## Branding

- Display name: **OpineoDJ**
- Subtitle: *by BlyAnalytics*
- The "DJ" in OpineoDJ can be rendered in `--accent-secondary` (amber)
  to create a distinct visual identity in the logo/wordmark.
- Tagline (public pages): *"L'analyse qui compte."*
