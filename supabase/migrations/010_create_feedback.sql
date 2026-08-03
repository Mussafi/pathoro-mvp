-- Pathoro v0.43 — public alpha feedback
-- A simple "Share feedback" form (footer + /contact) so a stranger using
-- the public alpha has an obvious way to say something helped, confused
-- them, was wrong, or that they want a path added or want to leave a
-- trail marker. Mirrors the path_guide_requests pattern exactly: public
-- anon insert only, admin-only read/update with the service role key.

create table if not exists feedback (
  id text primary key,
  category text not null
    check (category in ('helpful', 'confusing', 'wrong', 'path_request', 'trail_marker_interest', 'other')),
  message text not null,
  page_url text,
  contact_email text,
  status text not null default 'new'
    check (status in ('new', 'reviewed', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists feedback_status_idx on feedback (status);
create index if not exists feedback_category_idx on feedback (category);

-- Keep updated_at current on every write.
create or replace function set_feedback_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists feedback_set_updated_at on feedback;
create trigger feedback_set_updated_at
  before update on feedback
  for each row
  execute function set_feedback_updated_at();

-- Row Level Security: public (anon) can only ever insert new feedback,
-- and only with status = 'new' — no reading, updating, or deleting from
-- the client. Admin review happens server-side with the service role key,
-- which bypasses RLS.
alter table feedback enable row level security;

drop policy if exists "public can submit feedback" on feedback;
create policy "public can submit feedback"
  on feedback
  for insert
  to anon
  with check (status = 'new');
