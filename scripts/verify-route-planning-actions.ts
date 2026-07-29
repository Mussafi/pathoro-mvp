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
 * or none, a goal resolves to for a fresh visitor), not the rendered
 * DOM/HTML — there's no headless browser in this project to check actual
 * button text against a running server. Whether "Take this opportunity"
 * literally appears on screen for these URLs was verified separately,
 * by hand, in a real browser against a production build (see the v0.36
 * "Force route planning opportunity action" commit message for what was
 * checked). What this script guarantees is that BestNextRouteCard can
 * never silently fall into the "no opportunity" render branch for these
 * four goals without this script failing first.
 *
 * Exits non-zero (and prints every failure) so this can run in CI.
 */
import { defaultDirectionAnswers, mapReachableToRouteId } from "../lib/direction";
import { resolveBestNextRouteMatch } from "../lib/bestNextRouteMatch";

const CASES: { goal: string; expectedTitle: string | null }[] = [
  { goal: "Become vegetarian", expectedTitle: "Plant-Based Cooking Class" },
  { goal: "HVAC technician", expectedTitle: "HVAC Apprenticeship Info Session" },
  { goal: "wedding photographer", expectedTitle: "Wedding Photographer Assistant Opportunity" },
  { goal: "rare obscure path", expectedTitle: null },
];

const selectedRouteId = mapReachableToRouteId(defaultDirectionAnswers.reachable);

let failed = false;

for (const { goal, expectedTitle } of CASES) {
  const { accessPointKind, opportunity } = resolveBestNextRouteMatch({
    reviewed: [],
    live: [],
    aiCandidates: [],
    selectedRouteId,
    moveToward: goal,
    location: defaultDirectionAnswers.location,
  });

  if (expectedTitle === null) {
    if (accessPointKind !== "none" || opportunity) {
      console.error(
        `FAIL  goal="${goal}"  expected the "Scout access points" empty state but got "${opportunity?.title}" (${accessPointKind})`
      );
      failed = true;
    } else {
      console.log(`OK    goal="${goal}"  ->  "Scout access points" (no fake match)`);
    }
    continue;
  }

  if (!opportunity || opportunity.title !== expectedTitle) {
    console.error(
      `FAIL  goal="${goal}"  expected "Take this opportunity" -> "${expectedTitle}" but got "${opportunity?.title ?? "null"}" (${accessPointKind})`
    );
    failed = true;
  } else {
    console.log(`OK    goal="${goal}"  ->  "Take this opportunity" -> "${opportunity.title}"`);
  }
}

if (failed) {
  console.error("\nFAILED — Best Next Route would dead-end for a known goal.");
  process.exit(1);
} else {
  console.log("\nAll Best Next Route action-state checks passed.");
}
