-- Pathoro v0.17 — automatic scout candidates
-- When a public scout request is submitted, the server runs the same
-- Tavily-backed scout used by /admin/opportunity-scout (see
-- lib/tavily.ts#scoutOpportunities) and saves the top candidates here so
-- the requester sees something without waiting on manual admin work. These
-- are unreviewed AI-found leads, never auto-published as real
-- opportunities — see lib/opportunitySchema.ts for the real, reviewed
-- Opportunity table these get promoted into by hand.

create table if not exists scout_candidates (
  id text primary key,
  scout_request_id text not null references scout_requests(id) on delete cascade,
  title text not null,
  url text not null,
  source_name text,
  source_type text,
  snippet text,
  likely_route_id text,
  opportunity_type text,
  category text,
  confidence text,
  pathoro_fit text,
  why_this_may_fit text,
  leverage_hint text,
  suggested_next_step text,
  canonical_source_likely boolean default false,
  status text not null default 'candidate'
    check (status in ('candidate', 'sent_to_ingestion', 'dismissed', 'promoted')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists scout_candidates_request_id_idx on scout_candidates (scout_request_id);
create index if not exists scout_candidates_status_idx on scout_candidates (status);

-- Keep updated_at current on every write.
create or replace function set_scout_candidates_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists scout_candidates_set_updated_at on scout_candidates;
create trigger scout_candidates_set_updated_at
  before update on scout_candidates
  for each row
  execute function set_scout_candidates_updated_at();

-- Row Level Security: no public select/insert/update/delete policies at
-- all. Candidates reach the public result page only through
-- GET /api/scout-requests/[id]/public, which looks them up server-side
-- with the service role key after verifying the request's public_token —
-- the same pattern as scout_requests itself. Admin read/write also always
-- goes through the service role key (lib/scoutCandidatesDb.ts).
alter table scout_candidates enable row level security;
