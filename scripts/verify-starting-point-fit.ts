/**
 * Regression check for "Rank opportunities by starting point fit" — run
 * with:
 *
 *   npx tsx scripts/verify-starting-point-fit.ts
 *
 * Scope note: same constraint as the project's other verify-*.ts
 * scripts — no headless browser here, so this exercises the pure
 * classification/ranking functions directly (lib/startingPointFit.ts,
 * lib/goalFitLabel.ts) rather than a rendered page. The concrete bug
 * this guards against: a volunteer electrician role requiring 3 years
 * of experience must never rank as a "good first step" for a user who
 * said they're "curious but unsure."
 *
 * Exits non-zero (and prints every failure) so this can run in CI.
 */
import { computeGoalFit } from "../lib/goalFitLabel";
import {
  computePrerequisiteSignal,
  computeStartingPointFit,
  isPrerequisiteMismatch,
  mapStartingFromToExperienceLevel,
  type StartingPointFit,
} from "../lib/startingPointFit";

let failed = false;

function check(label: string, condition: boolean, detail: string) {
  if (condition) {
    console.log(`OK    ${label}`);
  } else {
    console.error(`FAIL  ${label}  ${detail}`);
    failed = true;
  }
}

function fitFor(goal: string, startingFrom: string, candidateText: string): StartingPointFit {
  const goalFit = computeGoalFit({ title: candidateText }, goal);
  const prereq = computePrerequisiteSignal(candidateText);
  return computeStartingPointFit(prereq, mapStartingFromToExperienceLevel(startingFrom), goalFit);
}

// The exact reported bug: licensed electrician + "curious but unsure" +
// a volunteer role requiring 3 years of experience.
{
  const fit = fitFor(
    "licensed electrician",
    "I’m curious but unsure",
    "Volunteer Electrician — must have 3 years experience, journeyman preferred"
  );
  check(
    "electrician + curious-but-unsure + 3-years-experience role is downranked",
    isPrerequisiteMismatch(fit),
    `expected advanced_not_first_step or poor_fit_from_start, got "${fit}"`
  );
}

// The beginner-friendly counterpart should rank as reachable.
{
  const fit = fitFor(
    "licensed electrician",
    "I’m curious but unsure",
    "Electrician Apprenticeship Info Session — no experience required, learn the trade"
  );
  check(
    "electrician + curious-but-unsure + apprenticeship info session is a good first step",
    fit === "good_first_step" || fit === "beginner_friendly",
    `expected good_first_step or beginner_friendly, got "${fit}"`
  );
}

// The same experience-gated role is fine (not downranked as a mismatch)
// for a user who says they're already trained.
{
  const fit = fitFor(
    "licensed electrician",
    "I’m already moving but want a clearer path",
    "Volunteer Electrician — must have 3 years experience, journeyman preferred"
  );
  check(
    "electrician + already-moving + 3-years-experience role is not flagged as a mismatch",
    !isPrerequisiteMismatch(fit),
    `expected a non-mismatch fit, got "${fit}"`
  );
}

// Licensed therapist + curious but unsure: an experience-gated clinical
// role should be downranked; a counseling program open house should not.
{
  const mismatchFit = fitFor(
    "licensed therapist",
    "I don’t know where to begin",
    "Licensed Clinical Therapist — 2+ years experience required, LCSW preferred"
  );
  check(
    "therapist + don't-know-where-to-begin + experience-required role is downranked",
    isPrerequisiteMismatch(mismatchFit),
    `expected a mismatch fit, got "${mismatchFit}"`
  );

  const goodFit = fitFor(
    "licensed therapist",
    "I don’t know where to begin",
    "Counseling Graduate Program Open House — info session for prospective students"
  );
  check(
    "therapist + don't-know-where-to-begin + open house is a good first step",
    goodFit === "good_first_step" || goodFit === "beginner_friendly",
    `expected good_first_step or beginner_friendly, got "${goodFit}"`
  );
}

// Prerequisite keyword detection itself, independent of goal/starting point.
{
  const downranked = [
    "Requires 3 years experience in commercial electrical work",
    "Must have prior experience and journeyman required",
    "Master electrician certification required",
  ];
  for (const text of downranked) {
    check(
      `prerequisite scan flags "${text}"`,
      computePrerequisiteSignal(text) === "requires_experience",
      `expected "requires_experience", got "${computePrerequisiteSignal(text)}"`
    );
  }

  const uprankedBeginner = [
    "Pre-apprenticeship info session, no experience needed",
    "Open house for our paid training program — entry-level, beginner-friendly",
    "Shadow a working electrician for a day, orientation included",
  ];
  for (const text of uprankedBeginner) {
    check(
      `prerequisite scan flags "${text}"`,
      computePrerequisiteSignal(text) === "beginner",
      `expected "beginner", got "${computePrerequisiteSignal(text)}"`
    );
  }
}

if (failed) {
  console.error("\nFAILED — starting-point fit would misrank an opportunity for at least one goal/starting point.");
  process.exit(1);
} else {
  console.log("\nAll starting-point fit checks passed.");
}
