# Pathoro — Public Alpha Release Checklist

A working checklist for taking Pathoro from "internal prototype" to "quiet public alpha." Update this file as items change — it's meant to be re-read before each release, not a one-time artifact.

## 1. Migrations applied (Supabase SQL editor)

| # | Migration | Table(s) | Status |
|---|---|---|---|
| 001 | `001_create_opportunities.sql` | `opportunities` | ✅ Applied |
| 002 | `002_create_trail_markers.sql` | `trail_markers` (base) | ✅ Applied |
| 003 | `003_create_scout_requests.sql` | `scout_requests` | ✅ Applied |
| 004 | `004_add_scout_request_public_results.sql` | `scout_requests` (columns) | ✅ Applied |
| 005 | `005_create_scout_candidates.sql` | `scout_candidates` | ✅ Applied |
| 006 | `006_create_path_guide_requests.sql` | `path_guide_requests` | ✅ Applied |
| 007 | `007_create_opportunity_actions.sql` | `opportunity_actions` | ✅ Applied |
| 008 | `008_extend_trail_markers_community_layer.sql` | `trail_markers` (community columns) | ✅ Applied |
| 009 | `009_seed_starter_trail_markers.sql` | `trail_markers` (24 seed rows) | ✅ Applied |
| 010 | `010_create_feedback.sql` | `feedback` | ⚠️ **NOT YET APPLIED** — paste into Supabase SQL editor before relying on the footer/Contact "Share feedback" form. Until then, submissions fail with a visible (but graceful) error. |

Re-verify by hitting `GET /api/opportunities` (should return `{"ok":true}` without a schema error) and, once 010 is applied, submitting the feedback form once and confirming it shows up in `/admin/feedback`.

## 2. Required environment variables

| Variable | Used for | Required for |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public + admin Supabase client | Everything database-backed |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase client (RLS-scoped) | Public reads/writes (trail markers, requests, feedback) |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin Supabase client (bypasses RLS) | All `/admin/*` pages and their APIs |
| `ADMIN_TOKEN` | Shared secret for `x-admin-token` header | Gating every `/admin/*` API route |
| `TAVILY_API_KEY` | `lib/tavily.ts` web search | AI opportunity scouting (`/api/scout-opportunities`, auto-scout on scout requests) |

If any of these are missing, the app degrades gracefully rather than crashing:
- Missing Supabase env → API routes return `{"ok": false, "error": "Supabase isn't configured..."}` instead of throwing.
- Missing `ADMIN_TOKEN` / wrong token → `401` with a clear message, admin pages show "Admin token required."
- Missing `TAVILY_API_KEY` → scouting returns no candidates rather than crashing the request; the public scout-request page shows "Pathoro is still looking. Refresh this page shortly." instead of an error.

Verify all five are set in both `.env.local` (dev) and the Vercel project's environment variables (production) before a public push.

## 3. Deployment

- [ ] Vercel project is deployed from the latest commit on `main`.
- [ ] Production build (`npm run build`) succeeds with no errors.
- [ ] Spot-check the production URL for the same regression matrix used in dev (see below).

## 4. Starter content

- [ ] Migration 009 applied — 24 Pathoro starter trail notes across electrician, HVAC, therapist, wedding photographer, vegetarian, and resale paths.
- [ ] Starter notes show a **"Starter note"** badge and **"Pathoro · Starter trail note"** author line — never "Credential not verified" or any label implying a real, unverified person.
- [ ] No leftover test markers are publicly visible. Known test markers (E2E Tester, Field Scoped Tester, QA Probe, and earlier verification markers) are archived in Supabase and excluded from the public API — confirmed via `GET /api/trail-markers?goal=<x>` returning only `Pathoro`-authored or genuinely approved rows.

## 5. Feedback path

- [ ] Migration 010 applied (see §1).
- [ ] "Share feedback" is reachable from the footer on every public page and from `/contact`.
- [ ] Submitting feedback (category + message, email optional) succeeds and the entry appears in `/admin/feedback` with a valid `ADMIN_TOKEN`.
- [ ] Feedback categories cover: this helped, this confused me, this was wrong, I want this path added, I want to leave a trail marker, something else.

## 6. Trail marker moderation

- [ ] `/admin/trail-markers` loads with a valid `ADMIN_TOKEN` and rejects an invalid one (401).
- [ ] A newly submitted public trail marker lands as `pending` and is invisible on the public API/UI until approved.
- [ ] Approve/reject/archive all work and immediately reflect on the public side.
- [ ] A public submitter can never self-grant `Verified experience` / `Licensed guide` — those credibility levels are admin-only (`lib/trailMarkerCredibility.ts`).

## 7. Scout requests & Path Guide requests

- [ ] `/route-planning` → scout request flow saves to Supabase and returns a public result link (`/scout-request/[id]`).
- [ ] The public result page shows AI-found candidates labeled "Unreviewed scout candidate," ranked strongest-first, with fit language ("Strong fit," "High fit estimate") that reads as Pathoro's own estimate, not a guarantee.
- [ ] `/admin/scout-requests` and `/admin/opportunity-scout` load and let an admin review/promote candidates.
- [ ] Path Guide "Find a guide" request on `/trail-map` saves to Supabase; `/admin/path-guide-requests` lets an admin mark reviewed/matched/rejected.

## 8. Known alpha limitations

Worth stating plainly (and is stated, in `/about` and `/terms`):

- No accounts — nothing is tied to a login; all context lives in the browser (localStorage) or in a submitted request.
- No payments.
- No feed — trail markers and notes are attached to a specific path/opportunity, not a social timeline.
- Guide matching, scout-request review, and trail-marker moderation are all manual in this alpha (a person reads and acts on each one — nothing is instant).
- AI-found opportunities are unreviewed by default; a human only vouches for one once it's promoted to a real `Opportunity` row.
- "Take this opportunity" saves a next-step request Pathoro reviews manually — it does not sign the user up, apply on their behalf, or contact an outside organization.
- Community trail markers are moderated before publishing but their accuracy is not independently verified beyond that review.

## 9. Regression matrix (re-run before each public push)

Pages:
- `/` (homepage)
- `/route-planning?goal=licensed%20electrician`
- `/route-planning?goal=licensed%20therapist`
- `/trail-map?goal=licensed%20electrician`
- `/trail-map?goal=HVAC%20technician`
- `/trail-map?goal=wedding%20photographer`
- `/trail-map?goal=vegetarian`
- `/trail-map?goal=resale`
- An opportunity candidate page (`/opportunity/candidate/[id]`)
- `/about`, `/privacy`, `/terms`, `/contact`

Flows:
- Take this opportunity modal
- Leave a trail marker modal
- Path Guide request modal
- Scout request (from route planning)
- Admin moderation (`/admin/trail-markers`, `/admin/scout-requests`, `/admin/path-guide-requests`, `/admin/opportunity-scout`, `/admin/feedback`)

Checks:
- No console errors on any page.
- No broken navigation or blank landings.
- `npm run lint`, `npx tsc --noEmit`, `npm run build` all pass clean.
