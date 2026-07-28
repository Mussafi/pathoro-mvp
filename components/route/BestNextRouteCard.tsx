"use client";

import Link from "next/link";
import { ArrowRight, Compass, Heart, Lock, Sparkles, Star } from "lucide-react";
import { routes } from "@/lib/routes";
import { getOpportunityDetailHref } from "@/lib/opportunitySchema";
import { mergeReviewedOnly, getRelevantSeedOpportunities, filterForRoute } from "@/lib/reviewedOpportunities";
import { useReviewedOpportunities } from "@/lib/useReviewedOpportunities";
import { useLiveOpportunities } from "@/lib/useLiveOpportunities";
import { useLatestScoutCandidates } from "@/lib/useLatestScoutCandidates";
import type { DirectionAnswers } from "@/lib/direction";
import { OpportunityTile } from "@/components/route/OpportunityTile";
import { ScoutCandidateCard } from "@/components/ScoutCandidateCard";
import { useTrailMarkers } from "@/lib/useTrailMarkers";
import { MARKER_TYPE_LABELS } from "@/lib/trailMarkerSchema";

type BestNextRouteCardProps = {
  selectedRouteId: string;
  suggestedRouteId: string;
  answers: DirectionAnswers;
  onExploreOthers: () => void;
};

const ACCESS_POINT_HEADING = {
  reviewed: "Reviewed access point",
  ai: "AI-found access points",
  seed: "Example access point",
} as const;

export function BestNextRouteCard({
  selectedRouteId,
  suggestedRouteId,
  answers,
  onExploreOthers,
}: BestNextRouteCardProps) {
  const selected = routes.find((r) => r.id === selectedRouteId) ?? routes[0];
  const isSuggested = selectedRouteId === suggestedRouteId;
  const { reviewed } = useReviewedOpportunities();
  const live = useLiveOpportunities();

  // Priority: reviewed/live Supabase opportunities first, then AI-found
  // scout candidates for this exact path, then relevant seed/mock data,
  // then nothing — see "Hide irrelevant seed opportunities" in the v0.18
  // task notes. A vegetarian cooking class should never stand in as the
  // access point for "build wealth."
  const reviewedForRoute = filterForRoute(
    mergeReviewedOnly(reviewed, live),
    selectedRouteId,
    answers.location
  );
  const reviewedOpportunity = reviewedForRoute[0];
  const moreReviewedCount = Math.max(reviewedForRoute.length - 1, 0);

  const { candidates: aiCandidates } = useLatestScoutCandidates({
    city: answers.location,
    routeId: selectedRouteId,
    pathGoal: answers.moveToward,
  });
  const bestCandidate = !reviewedOpportunity
    ? aiCandidates.find((c) => c.status !== "dismissed")
    : undefined;

  const seedForRoute =
    !reviewedOpportunity && !bestCandidate
      ? filterForRoute(getRelevantSeedOpportunities(answers.moveToward), selectedRouteId, answers.location)
      : [];
  const seedOpportunity = seedForRoute[0];
  const moreSeedCount = Math.max(seedForRoute.length - 1, 0);

  const accessPointKind: keyof typeof ACCESS_POINT_HEADING | "none" = reviewedOpportunity
    ? "reviewed"
    : bestCandidate
      ? "ai"
      : seedOpportunity
        ? "seed"
        : "none";

  const opportunity = accessPointKind === "reviewed" ? reviewedOpportunity : seedOpportunity;
  const moreCount = accessPointKind === "reviewed" ? moreReviewedCount : moreSeedCount;
  const detailHref = opportunity ? getOpportunityDetailHref(opportunity) : undefined;
  const { markers: trailMarkers } = useTrailMarkers({ opportunityId: opportunity?.id });
  const previewMarkers = trailMarkers.slice(0, 2);

  const personalSentence = `You said “${answers.reachable}” would make this more reachable, so Pathoro opened ${selected.title} first.`;

  return (
    <div
      id="best-next-route"
      className="shadow-card scroll-mt-6 mt-6 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-soft">
          <Star className="h-4 w-4 fill-green text-green" />
        </span>
        <span className="text-[15px] font-semibold text-ink">Best next route</span>
      </div>

      <h3 className="mt-3 text-[17px] font-semibold text-ink">{selected.title}</h3>

      {isSuggested && (
        <div className="relative mt-2.5 overflow-hidden rounded-2xl border border-green/45 bg-green-soft/60 px-3.5 py-3 shadow-[0_0_0_3px_rgba(84,120,32,0.06)]">
          <div className="flex items-start gap-2.5">
            <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-green/25 blur-[7px]" />
              <Sparkles className="relative h-4 w-4 text-green" strokeWidth={1.75} />
            </span>
            <span>
              <span className="block text-[12px] font-semibold text-green">
                Suggested from your answers
              </span>
              <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-soft">
                {personalSentence}
              </span>
            </span>
          </div>
        </div>
      )}

      <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
        {selected.description}
      </p>

      <div className="mt-4 flex items-start gap-2.5 border-t border-line/70 pt-4">
        <Heart className="mt-0.5 h-4 w-4 shrink-0 text-green" strokeWidth={1.75} />
        <span>
          <span className="block text-[13px] font-semibold text-ink">
            Why this route
          </span>
          <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-soft">
            {selected.why}
          </span>
        </span>
      </div>

      <div className="mt-4 border-t border-line/70 pt-4">
        <span className="block text-[13px] font-semibold text-ink">Route steps</span>
        <ol className="mt-2 flex flex-col gap-2">
          {selected.steps.map((step, i) => (
            <li key={i} className="flex items-center gap-2.5 text-[12.5px] text-ink-soft">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-soft text-[10px] font-semibold text-green">
                {i + 1}
              </span>
              {step.label}
            </li>
          ))}
        </ol>
      </div>

      {opportunity && (accessPointKind === "reviewed" || accessPointKind === "seed") && (
        <div className="mt-4 border-t border-line/70 pt-4">
          <span className="mb-2 block text-[13px] font-semibold text-ink">
            {ACCESS_POINT_HEADING[accessPointKind]}
          </span>
          <OpportunityTile opportunity={opportunity} location={answers.location} />
          {moreCount > 0 && (
            <p className="mt-2 text-[11px] text-ink-faint">
              +{moreCount} more local {moreCount === 1 ? "opportunity" : "opportunities"} for this route
            </p>
          )}
          {previewMarkers.length > 0 && (
            <div className="mt-2.5 flex flex-col gap-1.5">
              {previewMarkers.map((marker) => (
                <div
                  key={marker.id}
                  className="rounded-2xl border border-line/70 bg-cream-field px-3 py-2"
                >
                  <span className="text-[9.5px] font-semibold uppercase tracking-wide text-green">
                    Trail marker · {MARKER_TYPE_LABELS[marker.markerType]}
                  </span>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-ink-soft">
                    {marker.body}
                  </p>
                </div>
              ))}
            </div>
          )}
          {detailHref && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link
                href={`${detailHref}?openTake=1`}
                className="flex items-center justify-center gap-1.5 rounded-full bg-green px-5 py-2.5 text-[13px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50"
              >
                Take this opportunity
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={detailHref}
                className="text-[12.5px] font-medium text-ink-soft underline-offset-2 outline-none transition hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-green/50"
              >
                View details
              </Link>
            </div>
          )}
        </div>
      )}

      {accessPointKind === "ai" && bestCandidate && (
        <div className="mt-4 border-t border-line/70 pt-4">
          <span className="mb-2 block text-[13px] font-semibold text-ink">
            {ACCESS_POINT_HEADING.ai}
          </span>
          <ScoutCandidateCard candidate={bestCandidate} />
        </div>
      )}

      {accessPointKind === "none" && (
        <div className="mt-4 border-t border-line/70 pt-4">
          <div className="rounded-2xl border border-green/40 bg-green-soft/25 px-4 py-4">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-green" strokeWidth={1.75} />
              <span className="text-[13.5px] font-semibold text-ink">
                Pathoro can scout access points for this path.
              </span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
              No reviewed opportunity is available yet. Ask Pathoro to look for real classes,
              events, openings, people, programs, or local access points.
            </p>
            <a
              href="#scout-request"
              className="mt-3 flex items-center justify-center gap-2 rounded-full bg-green px-5 py-2.5 text-[13px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50"
            >
              Scout access points
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <p className="mt-2 text-[11px] leading-snug text-ink-faint">
              This is how this path becomes more concrete.
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onExploreOthers}
        className="mt-5 flex items-center justify-center gap-2 rounded-full border border-line/70 py-2.75 text-[13.5px] font-medium text-ink outline-none transition hover:border-ink-faint/40 focus-visible:ring-2 focus-visible:ring-green/50 focus-visible:ring-offset-2"
      >
        Explore other routes
        <ArrowRight className="h-3.5 w-3.5" />
      </button>

      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-snug text-ink-faint">
        <Lock className="mt-0.5 h-3 w-3 shrink-0" />
        Your progress is private and only visible to you.
      </p>
    </div>
  );
}
