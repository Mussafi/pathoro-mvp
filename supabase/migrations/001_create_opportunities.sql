-- Pathoro v0.8 — opportunities table
-- Mirrors the Opportunity type in lib/opportunitySchema.ts.
-- Public (anon) role may only ever read status = 'live' rows.
-- All writes go through the server-side service role key (see lib/supabaseAdmin.ts).

create table if not exists opportunities (
  id text primary key,
  title text not null,
  source_url text,
  source_name text,
  source_type text not null,
  city text not null,
  state text,
  location_label text,
  date_label text,
  cost_label text,
  host_name text,
  description text,
  route_id text not null,
  opportunity_type text,
  who_it_is_for text,
  path_it_supports text,
  what_it_may_open_next text,
  effort_level text,
  friction_level text,
  trust_level text,
  status text not null default 'needs_review'
    check (status in ('draft', 'needs_review', 'live', 'expired', 'preview', 'rejected')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists opportunities_status_idx on opportunities (status);
create index if not exists opportunities_route_id_idx on opportunities (route_id);
create index if not exists opportunities_city_idx on opportunities (city);
create index if not exists opportunities_source_url_idx on opportunities (source_url);

-- Keep updated_at current on every write.
create or replace function set_opportunities_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists opportunities_set_updated_at on opportunities;
create trigger opportunities_set_updated_at
  before update on opportunities
  for each row
  execute function set_opportunities_updated_at();

-- Row Level Security: public (anon) can only read live opportunities.
-- No insert/update/delete policies are granted to anon or authenticated —
-- all writes happen server-side with the service role key, which bypasses RLS.
alter table opportunities enable row level security;

drop policy if exists "public can read live opportunities" on opportunities;
create policy "public can read live opportunities"
  on opportunities
  for select
  to anon
  using (status = 'live');
