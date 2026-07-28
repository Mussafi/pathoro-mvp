/**
 * Validates that generateStarterTrailMap() produces a TrailMapGoal the
 * UI can actually render for a fixed list of example goals — run with:
 *
 *   npx tsx scripts/validate-generated-trail-maps.ts
 *
 * Deliberately round-trips each goal through JSON (JSON.parse(JSON.
 * stringify(...))) before validating, because that's exactly what
 * POST /api/trail-map/generate does to it before the client ever sees
 * it. This is how the production crash (branch.icon getting mangled
 * by JSON serialization) should have been caught before it shipped —
 * a bare `generateStarterTrailMap()` call without the round-trip
 * would have looked completely fine.
 *
 * Exits with a non-zero status (and prints every failure) if any goal
 * is missing a field the UI assumes exists, so this can run in CI.
 */
import { generateStarterTrailMap, serializeTrailMapGoalForWire } from "../lib/generatedTrailMaps";
import { normalizeTrailMapGoal } from "../lib/trailMapNormalize";
import type { TrailMapGoal } from "../lib/trailMapData";

const TEST_GOALS = [
  "HVAC technician",
  "wedding photographer",
  "restaurant owner",
  "physical therapist assistant",
  "UX designer",
  "AI safety researcher",
  "tattoo artist",
  "dental hygienist",
  "urban farmer",
];

function jsonRoundTrip(goal: TrailMapGoal): TrailMapGoal {
  return JSON.parse(JSON.stringify(goal));
}

function fail(errors: string[], message: string) {
  errors.push(message);
}

/** lucide-react icons are React.forwardRef components — plain objects
 * with a real `render` function, not functions themselves — so
 * `typeof icon === "function"` is the WRONG test and would flag every
 * valid icon as broken. A genuinely mangled icon (the actual
 * production bug) has neither a callable `render` nor is itself
 * callable. */
function isRenderableIcon(icon: unknown): boolean {
  if (typeof icon === "function") return true;
  if (icon && typeof icon === "object") {
    return typeof (icon as { render?: unknown }).render === "function";
  }
  return false;
}

function validateGoal(goalText: string): string[] {
  const errors: string[] = [];

  // Exactly the path production data takes: generate -> the API
  // route's wire-safe serialization -> JSON (a real network response
  // would go through this same transform) -> the client's normalizer.
  const raw = generateStarterTrailMap(goalText);
  const wireSafe = serializeTrailMapGoalForWire(raw);
  const goal = normalizeTrailMapGoal(jsonRoundTrip(wireSafe));

  if (!goal.pathTitle || !goal.pathTitle.trim()) fail(errors, "pathTitle is empty");
  if (!goal.subtitle || !goal.subtitle.trim()) fail(errors, "subtitle is empty");
  if (goal.confidence !== "generated_starter") fail(errors, `confidence should be "generated_starter", got "${goal.confidence}"`);
  if (!goal.disclaimer || !goal.disclaimer.trim()) fail(errors, "disclaimer is empty");

  if (!Array.isArray(goal.milestones) || goal.milestones.length === 0) {
    fail(errors, "milestones is empty or missing");
  }

  if (!Array.isArray(goal.branches) || goal.branches.length === 0) {
    fail(errors, "branches is empty or missing — this alone would blank the whole page");
  } else {
    if (!goal.branches.some((b) => b.id === goal.defaultBranchId)) {
      fail(errors, `defaultBranchId "${goal.defaultBranchId}" does not match any branch id`);
    }
    for (const branch of goal.branches) {
      const where = `branch "${branch.id}"`;
      if (!branch.id) fail(errors, `${where}: missing id`);
      if (!branch.title) fail(errors, `${where}: missing title`);
      if (!isRenderableIcon(branch.icon)) {
        fail(errors, `${where}: icon is not a renderable component — this is exactly what crashed production`);
      }
      if (!branch.pitch) fail(errors, `${where}: missing pitch`);
      if (!branch.whyItFits) fail(errors, `${where}: missing whyItFits`);
      if (!Array.isArray(branch.nodes) || branch.nodes.length !== 3) fail(errors, `${where}: nodes must have exactly 3 entries`);
      if (!branch.factors?.typicalTime || !branch.factors?.education) fail(errors, `${where}: missing factors.typicalTime/education`);
      if (!branch.branchFactors) {
        fail(errors, `${where}: missing branchFactors`);
      } else {
        const requiredFactorKeys = [
          "routineCognitiveWork", "automationToolFit", "remoteDigitalWork", "humanTrustNeed",
          "regulationBarrier", "physicalPresenceNeed", "emotionalJudgmentNeed", "marketDemand",
          "incomeUpside", "autonomyPotential", "upfrontCost", "timeToCredential", "emotionalLoad",
          "relationshipLeverage", "opportunityLeverage",
        ] as const;
        for (const key of requiredFactorKeys) {
          if (typeof branch.branchFactors[key] !== "number") {
            fail(errors, `${where}: branchFactors.${key} is not a number`);
          }
        }
      }
      if (!Array.isArray(branch.tradeoffs) || branch.tradeoffs.length === 0) fail(errors, `${where}: tradeoffs is empty`);
      if (!branch.nextStep?.title || !branch.nextStep?.description) fail(errors, `${where}: missing nextStep.title/description`);
    }
  }

  if (!Array.isArray(goal.notes)) fail(errors, "notes is not an array");
  if (typeof goal.notesTotal !== "number") fail(errors, "notesTotal is not a number");

  if (!goal.pathGuide) {
    fail(errors, "pathGuide is missing");
  } else {
    if (!goal.pathGuide.cta) fail(errors, "pathGuide.cta is missing");
    if (!goal.pathGuide.badge) fail(errors, "pathGuide.badge is missing");
  }

  return errors;
}

let anyFailed = false;
for (const goalText of TEST_GOALS) {
  const errors = validateGoal(goalText);
  if (errors.length === 0) {
    console.log(`OK   ${goalText}`);
  } else {
    anyFailed = true;
    console.log(`FAIL ${goalText}`);
    for (const e of errors) console.log(`     - ${e}`);
  }
}

if (anyFailed) {
  console.error("\nOne or more generated Trail Maps are missing fields the UI requires.");
  process.exit(1);
} else {
  console.log(`\nAll ${TEST_GOALS.length} generated Trail Maps validated cleanly (post JSON round-trip + normalize).`);
}
