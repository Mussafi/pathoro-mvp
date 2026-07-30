-- Pathoro v0.40 — Community Layer Foundation
--
-- Extends the existing trail_markers table (002_create_trail_markers.sql)
-- instead of creating a parallel community system. Everything here is
-- additive: new nullable columns, a widened marker_type/status/credibility
-- vocabulary that existing rows are migrated forward into (never dropped),
-- and an updated RLS policy. No column is dropped or renamed.
--
-- Vocabulary rename note: the original table used status values
-- 'needs_review' / 'live' / 'rejected'. The community layer spec calls
-- these 'pending' / 'approved' / 'rejected' (+ new 'archived'). Renaming a
-- CHECK constraint's allowed values (with a one-time UPDATE of existing
-- rows) is additive in the sense that matters here — no column is dropped
-- or renamed, only the values within the existing `status` column.

-- 1. New context columns — where a marker attaches in the product, beyond
--    the original opportunity_id/route_id.
alter table trail_markers add column if not exists context_type text;
alter table trail_markers add column if not exists goal text;
alter table trail_markers add column if not exists trail_goal text;
alter table trail_markers add column if not exists branch_id text;
alter table trail_markers add column if not exists milestone_id text;
alter table trail_markers add column if not exists candidate_id text;

-- 2. New author / credibility columns.
alter table trail_markers add column if not exists author_name text;
alter table trail_markers add column if not exists author_role text;
alter table trail_markers add column if not exists experience_label text;
alter table trail_markers add column if not exists credibility_type text;
alter table trail_markers add column if not exists contact_email text;
alter table trail_markers add column if not exists moderation_notes text;

-- 3. Backfill new columns on any pre-existing rows so constraints below
--    have something valid to check against.
update trail_markers
set context_type = case
  when opportunity_id is not null then 'opportunity'
  when route_id is not null then 'route'
  else 'route'
end
where context_type is null;

update trail_markers
set credibility_type = 'peer'
where credibility_type is null;

-- 4. Widen marker_type: keep every legacy value valid, add the v0.40
--    community-layer vocabulary alongside it.
alter table trail_markers drop constraint if exists trail_markers_marker_type_check;
alter table trail_markers add constraint trail_markers_marker_type_check
  check (marker_type in (
    -- legacy (v0.13) values — still valid, never dropped
    'practical_tip',
    'hidden_requirement',
    'access_advice',
    'what_it_opened',
    'warning_or_friction',
    'bridge_person_or_group',
    'better_first_step',
    'cheaper_alternative',
    'opportunity_quality',
    -- v0.40 community layer values
    'hidden_friction',
    'warning',
    'what_opened_doors',
    'what_required',
    'useful_resource',
    'direct_experience',
    'opportunity_check'
  ));

-- 5. context_type vocabulary.
alter table trail_markers drop constraint if exists trail_markers_context_type_check;
alter table trail_markers add constraint trail_markers_context_type_check
  check (context_type in (
    'trail_map',
    'branch',
    'milestone',
    'opportunity',
    'candidate_opportunity',
    'route'
  ));

-- 6. credibility_type vocabulary.
alter table trail_markers drop constraint if exists trail_markers_credibility_type_check;
alter table trail_markers add constraint trail_markers_credibility_type_check
  check (credibility_type in (
    'peer',
    'verified_experience',
    'licensed_guide',
    'credential_not_verified'
  ));

-- 7. status: needs_review -> pending, live -> approved, plus new archived.
alter table trail_markers drop constraint if exists trail_markers_status_check;
update trail_markers set status = 'pending' where status = 'needs_review';
update trail_markers set status = 'approved' where status = 'live';
alter table trail_markers alter column status set default 'pending';
alter table trail_markers add constraint trail_markers_status_check
  check (status in ('pending', 'approved', 'rejected', 'archived'));

-- 8. Indexes for the new filters community entry points query by.
create index if not exists trail_markers_context_type_idx on trail_markers (context_type);
create index if not exists trail_markers_goal_idx on trail_markers (goal);
create index if not exists trail_markers_branch_id_idx on trail_markers (branch_id);
create index if not exists trail_markers_milestone_id_idx on trail_markers (milestone_id);
create index if not exists trail_markers_candidate_id_idx on trail_markers (candidate_id);

-- 9. RLS: public (anon) reads only approved markers (was status = 'live').
--    Still no insert/update/delete policy for anon/authenticated — all
--    writes go through the server-side service role key, same as before.
drop policy if exists "public can read live trail markers" on trail_markers;
drop policy if exists "public can read approved trail markers" on trail_markers;
create policy "public can read approved trail markers"
  on trail_markers
  for select
  to anon
  using (status = 'approved');
