-- Pathoro v0.16 — public scout request results
-- Lets a user who submitted a scout request come back later and check on
-- it, without an account. The public_token is the only thing that gates
-- access to a single request's public-safe fields — see
-- GET /api/scout-requests/[id]/public in app/api/scout-requests/[id]/public/route.ts,
-- which validates id + token server-side (with the service role key) rather
-- than through a new anon RLS select policy, so admin-only fields
-- (admin_notes) can never leak through this path.

alter table scout_requests
  add column if not exists public_token text,
  add column if not exists result_summary text,
  add column if not exists responded_at timestamptz;

-- Existing rows (pre-v0.16) are left with a null public_token — nothing to
-- backfill, since those requests were never given a result link to begin
-- with. New rows always get one, generated server-side in
-- lib/scoutRequestsDb.ts before insert.
drop index if exists scout_requests_public_token_idx;
create unique index scout_requests_public_token_idx
  on scout_requests (public_token)
  where public_token is not null;
