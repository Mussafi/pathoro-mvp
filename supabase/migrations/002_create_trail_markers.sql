-- Pathoro v0.13 — trail markers
-- Structured "signs from people ahead" left on an opportunity or route —
-- not a generic comment thread. See docs/MVP-LOCKED-PRINCIPLES.md#trail-markers-not-comments.
-- Public (anon) role may only ever read status = 'live' rows. All writes
-- (including the initial insert) go through the server-side service role
-- key (see lib/supabaseAdmin.ts) — POST /api/trail-markers forces
-- status = 'needs_review' regardless of what the client sends.

create table if not exists trail_markers (
  id text primary key,
  opportunity_id text,
  route_id text,
  marker_type text not null
    check (marker_type in (
      'practical_tip',
      'hidden_requirement',
      'access_advice',
      'what_it_opened',
      'warning_or_friction',
      'bridge_person_or_group',
      'better_first_step',
      'cheaper_alternative',
      'opportunity_quality'
    )),
  body text not null,
  display_name text,
  city text,
  status text not null default 'needs_review'
    check (status in ('needs_review', 'live', 'rejected')),
  helpful_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  reviewed_at timestamptz
);

create index if not exists trail_markers_status_idx on trail_markers (status);
create index if not exists trail_markers_opportunity_id_idx on trail_markers (opportunity_id);
create index if not exists trail_markers_route_id_idx on trail_markers (route_id);

-- Keep updated_at current on every write.
create or replace function set_trail_markers_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trail_markers_set_updated_at on trail_markers;
create trigger trail_markers_set_updated_at
  before update on trail_markers
  for each row
  execute function set_trail_markers_updated_at();

-- Row Level Security: public (anon) can only read live trail markers.
-- No insert/update/delete policies are granted to anon or authenticated —
-- all writes happen server-side with the service role key, which bypasses
-- RLS. This is intentional: submission (needs_review) and review
-- (live/rejected) both go through admin-controlled API routes, never
-- directly from the browser.
alter table trail_markers enable row level security;

drop policy if exists "public can read live trail markers" on trail_markers;
create policy "public can read live trail markers"
  on trail_markers
  for select
  to anon
  using (status = 'live');
