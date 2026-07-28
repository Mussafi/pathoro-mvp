# Job Dialogue, Not Job Board — Concept

This documents a future product direction. Nothing here is built as a real feature yet — see [Current mock](#current-mock) for what actually exists today. The locked principle this builds toward lives in [MVP-LOCKED-PRINCIPLES.md](MVP-LOCKED-PRINCIPLES.md#job-dialogue-not-job-board).

## The problem

Job boards are full of stale, duplicate, or ghost listings. Browsing them is not useful on its own — a listing tells you almost nothing about whether a role is real, reachable, or worth pursuing from where you actually are. Pathoro should not add to that pile by becoming another job board, or by scraping other job boards into one.

## The reframe

**A job is not just a listing. It is a possible branch on someone's path.**

Instead of showing a list of postings, Pathoro should help someone understand a role through dialogue — the same way a Trail Map turns "what job should I get" into "what path am I on, and what does this branch actually require."

The questions a job dialogue should help answer:

- Is this real?
- Is it still active?
- Is it reachable from where I am?
- What path does it open?
- What hidden requirements matter?
- What would make me competitive?
- Who ahead of me can explain this role?
- What is the next practical move?

## Future concept: Role Dialogue / Opportunity Dialogue

The working name for this feature is **Role Dialogue** (also: **Opportunity Dialogue**). A role dialogue is not a job description page — it's a structured conversation surface attached to a specific role or branch, built around the questions above rather than a listing's raw text.

### Possible UI concept

On a Trail Map branch, a **"Role dialogue"** card:

> Instead of showing you another job listing, Pathoro helps you understand whether this role is real, reachable, and useful for your path.

Possible dialogue prompts:

- Is this role real or stale?
- What does this role open next?
- What hidden requirements matter?
- What would make me competitive?
- Who should I talk to before applying?
- What is the first move from where I am?

### Trust labels

A role dialogue needs a vocabulary for how confident Pathoro (or the community) is that a listing is real and current:

- Verified live
- Recently checked
- Employer-posted
- Community-confirmed
- Stale risk
- Possible ghost listing
- Source unclear

### CTA language

For job-like opportunities, replace simple "Apply" language with Pathoro-native language:

| Instead of | Use |
|---|---|
| Apply | Understand this role |
| Apply | Check if this is real |
| Apply | Map my path to this role |
| Apply | Find someone ahead |
| Apply | Start role dialogue |

## Explicitly out of scope for now

- A full job board of our own
- Scraping external job boards
- Accounts
- Applications
- Employer posting

## Current mock

`components/trailmap/RoleDialogueCard.tsx` renders a static, non-functional preview of the card above on every Trail Map branch, so the direction is visible in-product. It has no backend, no working button, and does not represent a real job listing — it's a concept preview, the same way the very first Path Guide card (v0.24) shipped as a mock before becoming functional in v0.26.

## Tester question

Added to `docs/PUBLIC-ALPHA-TESTING-SCRIPT.md` as a future-direction question: *"Would a role dialogue be more useful than another job board?"*
