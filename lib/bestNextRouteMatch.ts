import type { Opportunity } from "@/lib/opportunitySchema";
import type { ScoutCandidateRecord } from "@/lib/scoutCandidatesDb";
import { routeOpportunities } from "@/lib/opportunities";
import { mergeReviewedOnly, getRelevantSeedOpportunities, filterForRoute } from "@/lib/reviewedOpportunities";

export type AccessPointKind = "reviewed" | "ai" | "seed" | "none";

/**
 * Safety-net matches for goals whose seed opportunity must surface even
 * if the normal route/keyword matching pipeline below fails for any
 * reason (routeId drift, a relevanceKeywords edit, a stale deploy) — see
 * v0.36 "Force route planning opportunity action". Checked only after
 * reviewed, AI-candidate, and normal seed matching have all come up
 * empty, so a real reviewed opportunity always still wins.
 *
 * Order matters: matchers are checked top to bottom and the first hit
 * wins, so keywords broad enough to appear across goals ("class" alone,
 * "cooking") stay out of this list entirely — a bare "class" here would
 * make e.g. "HVAC class" resolve to the vegetarian matcher just because
 * it's listed first, which defeats the point of a *reliable* fallback.
 */
const FORCED_SEED_MATCHERS: { keywords: string[]; id: string }[] = [
  {
    keywords: [
      "vegetarian",
      "plant-based",
      "plant based",
      "vegan",
      "plant-forward",
      "habit",
      "lifestyle",
      "cooking",
    ],
    id: "plant-based-cooking-class",
  },
  { keywords: ["hvac"], id: "hvac-apprenticeship-info-session" },
  {
    keywords: ["wedding photographer", "wedding photography", "wedding", "photography", "photographer"],
    id: "wedding-photographer-assistant-opportunity",
  },
];

export function getForcedSeedOpportunity(goal: string): Opportunity | undefined {
  const g = goal.toLowerCase();
  const match = FORCED_SEED_MATCHERS.find((m) => m.keywords.some((k) => g.includes(k)));
  return match ? routeOpportunities.find((o) => o.id === match.id) : undefined;
}

/**
 * Last-resort, route-scoped default — see "Use opportunity fallback for
 * real openings route". `currentGoal` can be wrong or stale for reasons
 * that have nothing to do with matching logic (e.g. RoutePlanningBody's
 * ?goal= hand-off permanently persists whatever goal was last in the
 * URL into localStorage, so a single visit to an unmatched goal leaves
 * every later plain `/route-planning` visit looking unmatched too).
 * Real Openings Route promises a concrete access point, so it gets a
 * hard default instead of ever falling through to Scout — every other
 * route keeps the existing "fall through to Scout" behavior.
 */
const ROUTE_DEFAULT_OPPORTUNITY: Record<string, string> = {
  "real-openings": "plant-based-cooking-class",
};

export function getRouteFallbackOpportunity(selectedRouteId: string): Opportunity | undefined {
  const defaultId = ROUTE_DEFAULT_OPPORTUNITY[selectedRouteId];
  return defaultId ? routeOpportunities.find((o) => o.id === defaultId) : undefined;
}

export type BestNextRouteMatch = {
  accessPointKind: AccessPointKind;
  opportunity: Opportunity | undefined;
  bestCandidate: ScoutCandidateRecord | undefined;
  moreCount: number;
  /** Every candidate this render actually considered, for the
   * ?debugRoute=1 panel — lets a "still broken" report be checked
   * against what the matcher saw rather than guessed at. */
  debug: {
    reviewedCandidates: { id: string; title: string }[];
    seedCandidates: { id: string; title: string }[];
    aiCandidateCount: number;
    forcedFallbackId: string | null;
    routeFallbackId: string | null;
  };
};

/**
 * The single source of truth for what Best Next Route's access-point
 * section shows — BestNextRouteCard.tsx renders directly from this, and
 * scripts/verify-route-planning-actions.ts imports it too, so a
 * regression in the matching logic fails the script before it ever
 * reaches a user instead of only showing up as a bug report.
 */
export function resolveBestNextRouteMatch(input: {
  reviewed: Opportunity[];
  live: Opportunity[];
  aiCandidates: ScoutCandidateRecord[];
  selectedRouteId: string;
  moveToward: string;
  location: string;
}): BestNextRouteMatch {
  const reviewedForRoute = filterForRoute(
    mergeReviewedOnly(input.reviewed, input.live),
    input.selectedRouteId,
    input.location
  );
  const reviewedOpportunity = reviewedForRoute[0];
  const moreReviewedCount = Math.max(reviewedForRoute.length - 1, 0);

  const bestCandidate = !reviewedOpportunity
    ? input.aiCandidates.find((c) => c.status !== "dismissed")
    : undefined;

  const seedForRoute =
    !reviewedOpportunity && !bestCandidate
      ? filterForRoute(getRelevantSeedOpportunities(input.moveToward), input.selectedRouteId, input.location)
      : [];
  const moreSeedCount = Math.max(seedForRoute.length - 1, 0);
  const forcedFallback =
    !reviewedOpportunity && !bestCandidate && !seedForRoute[0]
      ? getForcedSeedOpportunity(input.moveToward)
      : undefined;
  const routeFallback =
    !reviewedOpportunity && !bestCandidate && !seedForRoute[0] && !forcedFallback
      ? getRouteFallbackOpportunity(input.selectedRouteId)
      : undefined;
  const seedOpportunity = seedForRoute[0] ?? forcedFallback ?? routeFallback;

  const accessPointKind: AccessPointKind = reviewedOpportunity
    ? "reviewed"
    : bestCandidate
      ? "ai"
      : seedOpportunity
        ? "seed"
        : "none";

  const opportunity = accessPointKind === "reviewed" ? reviewedOpportunity : seedOpportunity;
  const moreCount = accessPointKind === "reviewed" ? moreReviewedCount : moreSeedCount;

  return {
    accessPointKind,
    opportunity,
    bestCandidate,
    moreCount,
    debug: {
      reviewedCandidates: reviewedForRoute.map((o) => ({ id: o.id, title: o.title })),
      seedCandidates: seedForRoute.map((o) => ({ id: o.id, title: o.title })),
      aiCandidateCount: input.aiCandidates.length,
      forcedFallbackId: forcedFallback?.id ?? null,
      routeFallbackId: routeFallback?.id ?? null,
    },
  };
}
