# Pathoro MVP

A clickable, three-screen prototype of Pathoro's core opportunity-discovery flow, built with Next.js, TypeScript, and Tailwind CSS. All content is mock data — there is no backend.

## Current routes

| Route | Screen |
|---|---|
| `/` | Onboarding / Landscape — welcome, orientation, and "You Are Here" opportunity map |
| `/route-planning` | Route Planning — the five approved route families, with route detail and next steps |
| `/opportunity/plant-based-cooking-class` | Opportunity Detail — a single example opportunity (Plant-Based Cooking Class) reached via the Real Openings Route |

## Current status

**Three-screen clickable MVP with mock data.** The full path is wired end to end:

`/` → (Continue to Landscape) → `/route-planning` → (Take this step, Real Openings Route) → `/opportunity/plant-based-cooking-class` → (Back to opportunities) → `/route-planning`

Buttons like "Take this opportunity," "Save for later," "View class options," "Join waitlist instead," and "Reflect after" show simple mock clicked states (no persistence).

## What is intentionally not included yet

- Authentication / accounts
- A real database (all data lives in `lib/*.ts` as static mock objects)
- Real AI / recommendation logic
- Opportunity posting tools (for people, groups, businesses, mentors, organizers)
- Payments

See [`docs/MVP-LOCKED-PRINCIPLES.md`](docs/MVP-LOCKED-PRINCIPLES.md) for the product principles this MVP is designed around but does not yet implement.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verifying the build

```bash
npm run lint
npx tsc --noEmit
npm run build
```
