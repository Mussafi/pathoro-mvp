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
 * or none, a goal resolves to), not the rendered DOM/HTML — there's no
 * headless browser in this project to check actual button text against a
 * running server. Whether "Take this opportunity" literally appears on
 * screen for these URLs was verified separately, by hand, in a real
 * browser against a production build.
 *
 * Product rule under test (see "Prevent irrelevant opportunity
 * fallback"): Pathoro must never show an unrelated opportunity just to
 * avoid the Scout state. An opportunity may only be primary when it's
 * actually relevant to the goal — an unmatched goal must fall through to
 * Scout, never to a random Real Openings default. A prior version of
 * this logic showed "Plant-Based Cooking Class" for every unmatched
 * Real Openings goal (including "licensed therapist"); that fallback
 * was removed, and this script guards against it coming back.
 *
 * Exits non-zero (and prints every failure) so this can run in CI.
 */
import { defaultDirectionAnswers } from "../lib/direction";
import { resolveBestNextRouteMatch } from "../lib/bestNextRouteMatch";

const REAL_OPENINGS = "real-openings";
const IRRELEVANT_DEFAULT = "Plant-Based Cooking Class";

type Case = {
  label: string;
  goal: string;
  routeId: string;
  /** Exact title required, or null to require the Scout empty state. */
  expectedTitle: string | null;
  /** Titles that must never appear for this goal, regardless of state. */
  mustNotBeTitle?: string[];
};

const CASES: Case[] = [
  { label: "vegetarian", goal: "Become vegetarian", routeId: REAL_OPENINGS, expectedTitle: "Plant-Based Cooking Class" },
  { label: "HVAC technician", goal: "HVAC technician", routeId: REAL_OPENINGS, expectedTitle: "HVAC Apprenticeship Info Session" },
  { label: "wedding photographer", goal: "wedding photographer", routeId: REAL_OPENINGS, expectedTitle: "Wedding Photographer Assistant Opportunity" },
  {
    label: "licensed therapist",
    goal: "licensed therapist",
    routeId: REAL_OPENINGS,
    expectedTitle: "Therapist Program Info Session",
    mustNotBeTitle: [IRRELEVANT_DEFAULT],
  },
  {
    label: "obscure/unmatched goal",
    goal: "rare obscure path",
    routeId: REAL_OPENINGS,
    expectedTitle: null,
    mustNotBeTitle: [IRRELEVANT_DEFAULT],
  },
  // Note: plain /route-planning with no ?goal= and no localStorage isn't
  // this case — it resolves to defaultDirectionAnswers.moveToward
  // ("Become vegetarian"), covered by the "vegetarian" case above. This
  // covers the defensive edge case of a truly empty goal string.
  {
    label: "empty goal string",
    goal: "",
    routeId: REAL_OPENINGS,
    expectedTitle: null,
    mustNotBeTitle: [IRRELEVANT_DEFAULT],
  },
];

let failed = false;

for (const { label, goal, routeId, expectedTitle, mustNotBeTitle } of CASES) {
  const { accessPointKind, opportunity } = resolveBestNextRouteMatch({
    reviewed: [],
    live: [],
    aiCandidates: [],
    selectedRouteId: routeId,
    moveToward: goal,
    location: defaultDirectionAnswers.location,
  });

  if (opportunity && mustNotBeTitle?.includes(opportunity.title)) {
    console.error(
      `FAIL  ${label}  goal="${goal}" routeId="${routeId}"  matched irrelevant opportunity "${opportunity.title}" — an unrelated default must never be shown`
    );
    failed = true;
    continue;
  }

  if (expectedTitle === null) {
    if (accessPointKind !== "none" || opportunity) {
      console.error(
        `FAIL  ${label}  goal="${goal}" routeId="${routeId}"  expected the "Scout access points" empty state but got "${opportunity?.title}" (${accessPointKind})`
      );
      failed = true;
    } else {
      console.log(`OK    ${label}  ->  "Scout access points" (no irrelevant match)`);
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
  console.error("\nFAILED — Best Next Route would show an irrelevant opportunity or dead-end for a known goal.");
  process.exit(1);
} else {
  console.log("\nAll Best Next Route relevance checks passed.");
}
