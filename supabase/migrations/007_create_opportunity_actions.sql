-- Pathoro v0.36 — opportunity actions
-- The "Take this opportunity" primary CTA on /opportunity/[id] writes here
-- directly (through the anon key, under RLS) so every opportunity page has
-- a real action, not just an external link or a scroll. This is Pathoro's
-- core loop: find opportunities, help users act on them. Reading and
-- updating an action (review/contact/complete) only ever happens
-- server-side with the service role key — see
-- lib/opportunityActionsAdminDb.ts.

create table if not exists opportunity_actions (
  id uuid primary key default gen_random_uuid(),
  opportunity_id text,
  opportunity_title text not null,
  opportunity_slug text,
  goal text,
  route_id text,
  action_type text not null
    check (action_type in ('attend_apply_signup', 'verify_first', 'find_someone_ahead', 'similar_access_points')),
  user_name text,
  user_email text,
  message text,
  source_url text,
  trust_label text,
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'contacted', 'completed', 'archived')),
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists opportunity_actions_status_idx on opportunity_actions (status);
create index if not exists opportunity_actions_opportunity_id_idx on opportunity_actions (opportunity_id);

-- Keep updated_at current on every write.
create or replace function set_opportunity_actions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists opportunity_actions_set_updated_at on opportunity_actions;
create trigger opportunity_actions_set_updated_at
  before update on opportunity_actions
  for each row
  execute function set_opportunity_actions_updated_at();

-- Row Level Security: public (anon) can only ever insert a new action, and
-- only with status = 'new' — no reading, updating, or deleting from the
-- client. Admin review (reviewing/contacted/completed/archived) happens
-- server-side with the service role key, which bypasses RLS.
alter table opportunity_actions enable row level security;

drop policy if exists "public can submit opportunity actions" on opportunity_actions;
create policy "public can submit opportunity actions"
  on opportunity_actions
  for insert
  to anon
  with check (status = 'new');
