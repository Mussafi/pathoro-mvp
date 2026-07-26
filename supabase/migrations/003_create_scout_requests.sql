-- Pathoro v0.15 — scout requests
-- The public "Request scout" CTA on /route-planning writes here directly
-- (through the anon key, under RLS) so an admin can see what real users
-- are asking Pathoro to go look for. Reading and updating a request
-- (review/scout/reject) only ever happens server-side with the service
-- role key — see lib/scoutRequestsAdminDb.ts.

create table if not exists scout_requests (
  id text primary key,
  city text,
  state text,
  route_id text,
  path_goal text,
  user_context text,
  requested_from_page text,
  status text not null default 'new'
    check (status in ('new', 'reviewed', 'scouted', 'rejected')),
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  reviewed_at timestamptz
);

create index if not exists scout_requests_status_idx on scout_requests (status);
create index if not exists scout_requests_route_id_idx on scout_requests (route_id);
create index if not exists scout_requests_city_idx on scout_requests (city);

-- Keep updated_at current on every write.
create or replace function set_scout_requests_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists scout_requests_set_updated_at on scout_requests;
create trigger scout_requests_set_updated_at
  before update on scout_requests
  for each row
  execute function set_scout_requests_updated_at();

-- Row Level Security: public (anon) can only ever insert a new request,
-- and only with status = 'new' — no reading, updating, or deleting from
-- the client. Admin review (reviewed/scouted/rejected) happens server-side
-- with the service role key, which bypasses RLS.
alter table scout_requests enable row level security;

drop policy if exists "public can submit scout requests" on scout_requests;
create policy "public can submit scout requests"
  on scout_requests
  for insert
  to anon
  with check (status = 'new');
