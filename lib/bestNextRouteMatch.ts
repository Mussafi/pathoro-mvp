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
 */
const FORCED_SEED_MATCHERS: { keywords: string[]; id: string }[] = [
  { keywords: ["vegetarian", "plant-based", "plant based"], id: "plant-based-cooking-class" },
  { keywords: ["hvac"], id: "hvac-apprenticeship-info-session" },
  { keywords: ["wedding photographer", "photography"], id: "wedding-photographer-assistant-opportunity" },
];

export function getForcedSeedOpportunity(goal: string): Opportunity | undefined {
  const g = goal.toLowerCase();
  const match = FORCED_SEED_MATCHERS.find((m) => m.keywords.some((k) => g.includes(k)));
  return match ? routeOpportunities.find((o) => o.id === match.id) : undefined;
}

export type BestNextRouteMatch = {
  accessPointKind: AccessPointKind;
  opportunity: Opportunity | undefined;
  bestCandidate: ScoutCandidateRecord | undefined;
  moreCount: number;
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
  const seedOpportunity =
    seedForRoute[0] ??
    (!reviewedOpportunity && !bestCandidate ? getForcedSeedOpportunity(input.moveToward) : undefined);

  const accessPointKind: AccessPointKind = reviewedOpportunity
    ? "reviewed"
    : bestCandidate
      ? "ai"
      : seedOpportunity
        ? "seed"
        : "none";

  const opportunity = accessPointKind === "reviewed" ? reviewedOpportunity : seedOpportunity;
  const moreCount = accessPointKind === "reviewed" ? moreReviewedCount : moreSeedCount;

  return { accessPointKind, opportunity, bestCandidate, moreCount };
}
