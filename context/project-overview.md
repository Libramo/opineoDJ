# OpineoDJ

## Claude Code context

Read this file first at the start of every session to understand
what OpineoDJ is, who it is for, and what success looks like.

---

## Overview

OpineoDJ is a professional survey collection and analysis platform built by
BlyAnalytics. It enables the creation and management of multiple survey forms,
stores responses in a Supabase PostgreSQL database, applies advanced statistical
processing (quota weighting, confidence intervals, cross-tabulations), and
publishes results in real time on public dashboards. The platform is designed
to meet the standards of professional polling institutes, with an architecture
built to scale toward panel management, survey waves, and longitudinal campaigns.

## Goals

1. Give BlyAnalytics full autonomy to create, distribute, and analyze surveys
   without depending on third-party tools (Typeform, SurveyMonkey, etc.)
2. Produce statistically rigorous results: quota weighting (raking), confidence
   intervals, and inter-wave trend tracking
3. Publish real-time public dashboards that clients and the public can consult
   and cite as a source ("According to OpineoDJ...")

## Core User Flow

### Analyst Flow (back-office)
1. Analyst signs in via the admin dashboard (better-auth)
2. Creates a campaign tied to a client
3. Creates a survey (wave) within that campaign, defines questions and quotas
4. Publishes the form — a public URL is generated (`/results/[slug]`)
5. Respondents fill out the public form (no authentication required)
6. Responses accumulate in real time — analyst monitors collection progress
7. Once quotas are met, analyst triggers weight calculation (raking)
8. Weighted results are published on the public dashboard
9. Analyst exports data (PDF, Excel, API)

### Respondent Flow (public)
1. Respondent accesses the form via a shared link
2. Fills out questions (multiple choice, scales, open text, date/number)
3. Submits — an email notification is sent to the analyst
4. Can view public results at `/results/[slug]`

## Features

### Survey Management
- Multi-type form creation (multiple choice, rating scales, open text, date/number)
- Organization into campaigns and waves (longitudinal tracking)
- Client and survey portfolio management
- Demographic quota definition per survey

### Collection
- Public form with no authentication required
- Real-time response storage (Supabase)
- Automatic email notifications on submission (Resend)
- Milestone notifications (10th response, quota reached, etc.)

### Statistical Analysis
- Aggregations by question type (%, averages, distributions)
- Weighting engine using raking (iterative proportional fitting)
- Confidence interval calculation (margin of error ±)
- Cross-tabulations (flat breakdown / cross-tab)
- Inter-wave trend tracking (delta between waves)

### Dashboards & Visualization
- Real-time public dashboard (`/results/[slug]`)
- Analyst dashboard (deep views, raw + weighted data)
- Cross-tab explorer
- Inter-wave trend charts

### Export & Integration
- PDF export (branded OpineoDJ / BlyAnalytics report)
- Excel/CSV export (raw and weighted data)
- REST API for integration with other BlyAnalytics tools
- Webhooks for external data pipelines

## Scope

### In Scope
- Survey form creation and management
- Response collection via public form
- Statistical analysis engine (weighting, confidence intervals, cross-tabs)
- Real-time public dashboard
- Analyst dashboard
- Email notifications (Resend)
- PDF and Excel export
- Internal REST API
- Multi-client, multi-campaign, multi-wave management

### Out of Scope
- Registered respondent panel (Phase 2)
- Field interviewer network / CAPI (Phase 3)
- SYNTEC / ESOMAR certification (parallel business process, not a technical scope item)
- Native mobile application
- AI processing on open-text responses (Phase 2, optional)

## Success Criteria

1. An analyst can create a survey, publish it, and receive responses in under 10 minutes
2. The weighting engine produces consistent results on a 1,000-response test dataset
   in under 5 seconds
3. The public dashboard updates in real time without a page reload
4. A generated PDF export is citable and branded OpineoDJ by BlyAnalytics
5. `npm run build` passes without errors on the main branch
