-- Pathoro v0.26 — path guide requests
-- The "Need a path guide?" card's "Find a guide" flow on /trail-map writes
-- here directly (through the anon key, under RLS) so an admin can manually
-- match a requester with someone who has direct experience on that path.
-- Path Guides are people ahead on the path, not generic coaches — see
-- docs/MVP-LOCKED-PRINCIPLES.md. Reading and updating a request (review/
-- match/reject) only ever happens server-side with the service role key —
-- see lib/pathGuideRequestsAdminDb.ts.

create table if not exists path_guide_requests (
  id text primary key,
  goal_id text,
  goal_title text,
  branch_id text,
  branch_title text,
  question text not null,
  requested_guide_type text,
  contact_email text,
  status text not null default 'new'
    check (status in ('new', 'reviewed', 'matched', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists path_guide_requests_status_idx on path_guide_requests (status);
create index if not exists path_guide_requests_goal_id_idx on path_guide_requests (goal_id);

-- Keep updated_at current on every write.
create or replace function set_path_guide_requests_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists path_guide_requests_set_updated_at on path_guide_requests;
create trigger path_guide_requests_set_updated_at
  before update on path_guide_requests
  for each row
  execute function set_path_guide_requests_updated_at();

-- Row Level Security: public (anon) can only ever insert a new request,
-- and only with status = 'new' — no reading, updating, or deleting from
-- the client. Admin review (reviewed/matched/rejected) happens server-side
-- with the service role key, which bypasses RLS.
alter table path_guide_requests enable row level security;

drop policy if exists "public can submit path guide requests" on path_guide_requests;
create policy "public can submit path guide requests"
  on path_guide_requests
  for insert
  to anon
  with check (status = 'new');
