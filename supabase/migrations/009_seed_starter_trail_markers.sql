-- Pathoro v0.41 — Seed High-Quality Starter Trail Markers
--
-- Curated, Pathoro-authored editorial notes for a handful of core paths so
-- the community layer feels useful during alpha before real submissions
-- accumulate. These are never presented as real people: author_name is
-- literally "Pathoro" and author_role is "Starter trail note" — the public
-- UI (components/route/TrailMarkersSection.tsx) checks that exact pair and
-- swaps the credibility badge to "Starter note" instead of "Credential not
-- verified", which would otherwise misleadingly imply an unverified real
-- person's claim. No schema change: this only uses columns and enum values
-- already added in migration 008.
--
-- goal/branch_id values below were confirmed against the running app, not
-- guessed:
--   - electrician, therapist, vegetarian, resale are curated goals in
--     lib/trailMapData.ts — goal id and defaultBranchId read directly from
--     that file.
--   - hvac-technician and wedding-photographer are NOT curated; they only
--     exist as deterministic *generated* starter maps (see
--     lib/generatedTrailMaps.ts). Their goal id and default branch id were
--     captured by calling POST /api/trail-map/generate with the exact
--     goalText the test URLs in this task use ("HVAC technician",
--     "wedding photographer"), matching what /trail-map?goal=... actually
--     renders by default with no ?branchId= override.
--
-- Uses stable explicit ids and ON CONFLICT (id) DO UPDATE so re-running
-- this migration edits existing seed rows in place rather than duplicating
-- them. created_at is intentionally left out of the UPDATE so it never
-- moves on a re-run; helpful_count is left out entirely so a future
-- "helpful" feature incrementing it doesn't get reset by a re-seed.

insert into trail_markers (
  id, context_type, goal, route_id, trail_goal, branch_id, milestone_id,
  opportunity_id, candidate_id, marker_type, body,
  author_name, author_role, experience_label, credibility_type,
  contact_email, status, moderation_notes
) values
  -- Licensed electrician (goal "electrician", branch "apprentice-electrician")
  ('seed-electrician-01', 'branch', 'electrician', null, 'electrician', 'apprentice-electrician', null, null, null,
   'better_first_step',
   'For a beginner, the better first step is usually an apprenticeship, pre-apprenticeship, helper role, or licensing information page — not a job post that already requires journeyman-level experience.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),
  ('seed-electrician-02', 'branch', 'electrician', null, 'electrician', 'apprentice-electrician', null, null, null,
   'warning',
   'Watch for electrician listings that look entry-level but mention 2–3 years of experience, journeyman status, or commercial experience. Those are usually not true first steps.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),
  ('seed-electrician-03', 'branch', 'electrician', null, 'electrician', 'apprentice-electrician', null, null, null,
   'what_required',
   'This path usually depends on local licensing rules, supervised work hours, and apprenticeship structure. Verify the requirements in your state or city before choosing a route.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),
  ('seed-electrician-04', 'branch', 'electrician', null, 'electrician', 'apprentice-electrician', null, null, null,
   'what_opened_doors',
   'The strongest access points tend to be union apprenticeship pages, trade school open houses, workforce training programs, and electrical helper roles with paid training.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),

  -- HVAC technician (generated goal "hvac-technician", default branch "hvac-technician-hvac-technician-helper-0")
  ('seed-hvac-01', 'branch', 'hvac-technician', null, 'hvac-technician', 'hvac-technician-hvac-technician-helper-0', null, null, null,
   'better_first_step',
   'Good beginner access points are HVAC helper roles, trade school programs, apprenticeship listings, and EPA 608 preparation resources.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),
  ('seed-hvac-02', 'branch', 'hvac-technician', null, 'hvac-technician', 'hvac-technician-hvac-technician-helper-0', null, null, null,
   'warning',
   'Some HVAC jobs say technician but expect prior field experience, tools, or certification. For a new person, look for helper, apprentice, trainee, or paid training language.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),
  ('seed-hvac-03', 'branch', 'hvac-technician', null, 'hvac-technician', 'hvac-technician-hvac-technician-helper-0', null, null, null,
   'what_required',
   'Many HVAC paths involve hands-on training, comfort with physical work, basic electrical/mechanical troubleshooting, and eventually certification requirements.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),
  ('seed-hvac-04', 'branch', 'hvac-technician', null, 'hvac-technician', 'hvac-technician-hvac-technician-helper-0', null, null, null,
   'useful_resource',
   'An early useful move is to compare local trade schools, union/non-union apprenticeships, and employers that explicitly train beginners.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),

  -- Licensed therapist (goal "therapist", branch "clinical-mental-health-counselor")
  ('seed-therapist-01', 'branch', 'therapist', null, 'therapist', 'clinical-mental-health-counselor', null, null, null,
   'better_first_step',
   'For someone just exploring therapy as a career, the best first step is usually understanding degree paths, licensure types, supervised hours, and what daily clinical work actually feels like.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),
  ('seed-therapist-02', 'branch', 'therapist', null, 'therapist', 'clinical-mental-health-counselor', null, null, null,
   'warning',
   'Do not treat a volunteer mental-health-adjacent role as the same thing as a licensure step. It may build exposure, but it usually does not replace required graduate education or supervised clinical hours.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),
  ('seed-therapist-03', 'branch', 'therapist', null, 'therapist', 'clinical-mental-health-counselor', null, null, null,
   'what_required',
   'This path usually requires graduate education, supervised clinical hours, exams, and state-specific licensure. The exact route depends on whether you pursue counseling, social work, marriage and family therapy, psychology, or another license.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),
  ('seed-therapist-04', 'branch', 'therapist', null, 'therapist', 'clinical-mental-health-counselor', null, null, null,
   'what_opened_doors',
   'Useful access points include graduate program info sessions, admissions events, career panels with clinicians, supervised-hours explainers, and conversations with people already licensed.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),

  -- Wedding photographer (generated goal "wedding-photographer", default branch "wedding-photographer-assistant-second-path-0")
  ('seed-wedding-photographer-01', 'branch', 'wedding-photographer', null, 'wedding-photographer', 'wedding-photographer-assistant-second-path-0', null, null, null,
   'better_first_step',
   'A strong first step is assisting or second-shooting for an established photographer, because it teaches timeline pressure, client expectations, gear flow, and wedding-day pacing.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),
  ('seed-wedding-photographer-02', 'branch', 'wedding-photographer', null, 'wedding-photographer', 'wedding-photographer-assistant-second-path-0', null, null, null,
   'hidden_friction',
   'The hidden challenge is not only taking good photos. It is managing people, timelines, backups, editing turnaround, contracts, and trust during a high-pressure event.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),
  ('seed-wedding-photographer-03', 'branch', 'wedding-photographer', null, 'wedding-photographer', 'wedding-photographer-assistant-second-path-0', null, null, null,
   'what_opened_doors',
   'Portfolio-building shoots, assistant roles, local vendor relationships, styled shoots, and referrals from other photographers often open more doors than cold posting online.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),
  ('seed-wedding-photographer-04', 'branch', 'wedding-photographer', null, 'wedding-photographer', 'wedding-photographer-assistant-second-path-0', null, null, null,
   'warning',
   'Be careful about taking paid wedding work too early without backup gear, clear expectations, and a plan for missed shots or file loss.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),

  -- Vegetarian / plant-based eating (goal "vegetarian", branch "cooking-skill-route")
  ('seed-vegetarian-01', 'branch', 'vegetarian', null, 'vegetarian', 'cooking-skill-route', null, null, null,
   'better_first_step',
   'A better first step is usually finding 3–5 repeatable meals you actually like, not trying to overhaul your whole diet at once.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),
  ('seed-vegetarian-02', 'branch', 'vegetarian', null, 'vegetarian', 'cooking-skill-route', null, null, null,
   'hidden_friction',
   'The hard part is often social situations, convenience, family meals, and protein planning — not just knowing that vegetables are healthy.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),
  ('seed-vegetarian-03', 'branch', 'vegetarian', null, 'vegetarian', 'cooking-skill-route', null, null, null,
   'useful_resource',
   'Good access points include beginner cooking classes, meal-prep guides, grocery lists, and local restaurants where you can learn what you actually enjoy eating.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),
  ('seed-vegetarian-04', 'branch', 'vegetarian', null, 'vegetarian', 'cooking-skill-route', null, null, null,
   'warning',
   'If the goal is health, avoid assuming plant-based automatically means balanced. Make sure meals are filling and nutritionally complete.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),

  -- Resale / flipping (goal "resale", branch "ebay-resale")
  ('seed-resale-01', 'branch', 'resale', null, 'resale', 'ebay-resale', null, null, null,
   'better_first_step',
   'A good first step is testing one small category you can learn deeply, instead of buying random items because they look cheap.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),
  ('seed-resale-02', 'branch', 'resale', null, 'resale', 'ebay-resale', null, null, null,
   'hidden_friction',
   'The hidden friction is time: sourcing, cleaning, photos, listings, storage, shipping, returns, and dead inventory can matter more than the purchase price.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),
  ('seed-resale-03', 'branch', 'resale', null, 'resale', 'ebay-resale', null, null, null,
   'what_opened_doors',
   'People often improve when they learn sell-through rate, completed listings, local sourcing routes, and which categories they can inspect accurately.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.'),
  ('seed-resale-04', 'branch', 'resale', null, 'resale', 'ebay-resale', null, null, null,
   'warning',
   'Do not treat asking price as value. Check completed sales, fees, shipping cost, condition risk, and how long similar items actually take to sell.',
   'Pathoro', 'Starter trail note', null, 'credential_not_verified', null, 'approved', 'Seeded starter marker for alpha.')
on conflict (id) do update set
  context_type = excluded.context_type,
  goal = excluded.goal,
  route_id = excluded.route_id,
  trail_goal = excluded.trail_goal,
  branch_id = excluded.branch_id,
  milestone_id = excluded.milestone_id,
  opportunity_id = excluded.opportunity_id,
  candidate_id = excluded.candidate_id,
  marker_type = excluded.marker_type,
  body = excluded.body,
  author_name = excluded.author_name,
  author_role = excluded.author_role,
  experience_label = excluded.experience_label,
  credibility_type = excluded.credibility_type,
  contact_email = excluded.contact_email,
  status = excluded.status,
  moderation_notes = excluded.moderation_notes;
