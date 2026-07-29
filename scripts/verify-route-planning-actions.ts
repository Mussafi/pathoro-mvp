/**
 * Regression check for Best Next Route's opportunity matching — run with:
 *
 *   npx tsx scripts/verify-route-planning-actions.ts
 *
 * Imports resolveBestNextRouteMatch() directly from
 * lib/bestNextRouteMatch.ts — the exact function BestNextRouteCard.tsx
 * renders from — so a regression in the matching logic fails this script
 * before it ever reaches a user, not just a screenshot check.
 *
 * Scope note: this validates the matching DECISION (which opportunity,
 * or none, a goal/route resolves to), not the rendered DOM/HTML — there's
 * no headless browser in this project to check actual button text against
 * a running server. Whether "Take this opportunity" literally appears on
 * screen for these URLs was verified separately, by hand, in a real
 * browser against a production build. What this script guarantees is that
 * BestNextRouteCard can never silently fall into the "no opportunity"
 * render branch for these cases without this script failing first.
 *
 * Exits non-zero (and prints every failure) so this can run in CI.
 */
import { defaultDirectionAnswers } from "../lib/direction";
import { resolveBestNextRouteMatch } from "../lib/bestNextRouteMatch";

const REAL_OPENINGS = "real-openings";

const CASES: { label: string; goal: string; routeId: string; expectedTitle: string | null }[] = [
  { label: "vegetarian on Real Openings", goal: "Become vegetarian", routeId: REAL_OPENINGS, expectedTitle: "Plant-Based Cooking Class" },
  { label: "HVAC on Real Openings", goal: "HVAC technician", routeId: REAL_OPENINGS, expectedTitle: "HVAC Apprenticeship Info Session" },
  { label: "wedding photographer on Real Openings", goal: "wedding photographer", routeId: REAL_OPENINGS, expectedTitle: "Wedding Photographer Assistant Opportunity" },
  // Real Openings Route promises a concrete access point regardless of
  // whether currentGoal happens to match a known keyword — see "Use
  // opportunity fallback for real openings route". An obscure/unmatched
  // goal, or no goal at all (the plain /route-planning case), must still
  // resolve to the route's default opportunity, never to Scout.
  { label: "obscure goal on Real Openings", goal: "rare obscure path", routeId: REAL_OPENINGS, expectedTitle: "Plant-Based Cooking Class" },
  { label: "empty goal on Real Openings (plain /route-planning)", goal: "", routeId: REAL_OPENINGS, expectedTitle: "Plant-Based Cooking Class" },
  // Control: the route-level default is scoped to Real Openings only —
  // an unmatched goal on any other route must still fall through to the
  // Scout empty state, proving this fallback didn't leak everywhere.
  { label: "obscure goal on Community Route (control, no fallback)", goal: "rare obscure path", routeId: "community", expectedTitle: null },
];

let failed = false;

for (const { label, goal, routeId, expectedTitle } of CASES) {
  const { accessPointKind, opportunity } = resolveBestNextRouteMatch({
    reviewed: [],
    live: [],
    aiCandidates: [],
    selectedRouteId: routeId,
    moveToward: goal,
    location: defaultDirectionAnswers.location,
  });

  if (expectedTitle === null) {
    if (accessPointKind !== "none" || opportunity) {
      console.error(
        `FAIL  ${label}  goal="${goal}" routeId="${routeId}"  expected the "Scout access points" empty state but got "${opportunity?.title}" (${accessPointKind})`
      );
      failed = true;
    } else {
      console.log(`OK    ${label}  ->  "Scout access points" (no fake match)`);
    }
    continue;
  }

  if (!opportunity || opportunity.title !== expectedTitle) {
    console.error(
      `FAIL  ${label}  goal="${goal}" routeId="${routeId}"  expected "Take this opportunity" -> "${expectedTitle}" but got "${opportunity?.title ?? "null"}" (${accessPointKind})`
    );
    failed = true;
  } else {
    console.log(`OK    ${label}  ->  "Take this opportunity" -> "${opportunity.title}"`);
  }
}

if (failed) {
  console.error("\nFAILED — Best Next Route would dead-end for a known goal/route.");
  process.exit(1);
} else {
  console.log("\nAll Best Next Route action-state checks passed.");
}
