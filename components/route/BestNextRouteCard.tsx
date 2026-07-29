"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, Heart, Lock, Sparkles, Star } from "lucide-react";
import { routes } from "@/lib/routes";
import { getOpportunityDetailHref } from "@/lib/opportunitySchema";
import { resolveBestNextRouteMatch } from "@/lib/bestNextRouteMatch";
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

  const { candidates: aiCandidates } = useLatestScoutCandidates({
    city: answers.location,
    routeId: selectedRouteId,
    pathGoal: answers.moveToward,
  });

  // Priority: reviewed/live Supabase opportunities first, then AI-found
  // scout candidates for this exact path, then relevant seed/mock data,
  // then a forced fallback for a short list of known example goals (v0.36
  // "Force route planning opportunity action"), then nothing. Shared with
  // scripts/verify-route-planning-actions.ts so a regression in this
  // logic fails a script run, not just a user's screen.
  const { accessPointKind, opportunity, bestCandidate, moreCount, debug: matchDebug } = resolveBestNextRouteMatch({
    reviewed,
    live,
    aiCandidates,
    selectedRouteId,
    moveToward: answers.moveToward,
    location: answers.location,
  });

  const detailHref = opportunity ? getOpportunityDetailHref(opportunity) : undefined;
  const { markers: trailMarkers } = useTrailMarkers({ opportunityId: opportunity?.id });
  const previewMarkers = trailMarkers.slice(0, 2);

  const personalSentence = `You said “${answers.reachable}” would make this more reachable, so Pathoro opened ${selected.title} first.`;

  // Every accessPointKind maps to exactly one of these three render
  // branches below, and the third (scout) branch is unconditional — so
  // "Your next step" always renders *something* actionable, never an
  // empty gap. nextActionType is surfaced in the debug panel so a "still
  // broken" report can say which branch actually rendered.
  const showsMatchedOpportunity = Boolean(opportunity) && (accessPointKind === "reviewed" || accessPointKind === "seed");
  const showsAiCandidate = accessPointKind === "ai" && Boolean(bestCandidate);
  const nextActionType: "opportunity" | "ai" | "scout" = showsMatchedOpportunity
    ? "opportunity"
    : showsAiCandidate
      ? "ai"
      : "scout";

  // ?debugRoute=1 (or NODE_ENV=development) shows a small panel with the
  // exact matching decision this render made — added after a user report
  // that the live app kept showing the empty state while every local
  // check passed, to make it possible to check whether a "still broken"
  // report is a code bug or a stale deployment. Read post-mount (not via
  // a lazy useState initializer) so the static-prerendered HTML always
  // matches the client's first render and this never risks a hydration
  // mismatch in the card under scrutiny — same pattern already used for
  // reading ?goal= in RoutePlanningBody.tsx.
  const [debug, setDebug] = useState<{ show: boolean; goalParam: string | null; rawStoredMoveToward: string | null }>({
    show: process.env.NODE_ENV === "development",
    goalParam: null,
    rawStoredMoveToward: null,
  });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let rawStoredMoveToward: string | null = null;
    try {
      const raw = window.localStorage.getItem("pathoro:direction-answers");
      rawStoredMoveToward = raw ? (JSON.parse(raw).moveToward ?? null) : null;
    } catch {
      rawStoredMoveToward = null;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDebug({
      show: process.env.NODE_ENV === "development" || params.get("debugRoute") === "1",
      goalParam: params.get("goal"),
      rawStoredMoveToward,
    });
  }, []);

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

      {debug.show && (
        <div className="mt-3 rounded-2xl border border-amber-400/60 bg-amber-50 px-3.5 py-3 font-mono text-[10.5px] leading-relaxed text-amber-900">
          <p className="font-semibold">DEBUG — Best Next Route (?debugRoute=1)</p>
          <p>commit: {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "(not set — not a Vercel build, or env not exposed)"}</p>
          <p>url goal param: {debug.goalParam ?? "(none)"}</p>
          <p>raw localStorage moveToward: {debug.rawStoredMoveToward ?? "(none stored — using default)"}</p>
          <p>currentGoal (activeGoal passed to BestNextRouteCard): {answers.moveToward || "(empty)"}</p>
          <p>reachable answer: {answers.reachable || "(empty)"}</p>
          <p>selectedRouteId: {selectedRouteId}</p>
          <p>selectedRoute title: {selected.title}</p>
          <p>
            reviewed candidates considered ({matchDebug.reviewedCandidates.length}):{" "}
            {matchDebug.reviewedCandidates.length > 0
              ? matchDebug.reviewedCandidates.map((c) => `"${c.title}" (${c.id})`).join(", ")
              : "none"}
          </p>
          <p>ai candidates considered: {matchDebug.aiCandidateCount}</p>
          <p>
            seed candidates considered ({matchDebug.seedCandidates.length}):{" "}
            {matchDebug.seedCandidates.length > 0
              ? matchDebug.seedCandidates.map((c) => `"${c.title}" (${c.id})`).join(", ")
              : "none"}
          </p>
          <p>forced-fallback id checked: {matchDebug.forcedFallbackId ?? "(no fallback match)"}</p>
          <p>matchedOpportunity: {opportunity ? `"${opportunity.title}" (${opportunity.id}, ${accessPointKind})` : "null"}</p>
          <p>opportunity href: {detailHref ?? "null"}</p>
          <p>nextAction type: {nextActionType}</p>
          <p>top action block rendered: yes ({nextActionType})</p>
        </div>
      )}

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

      {/* REQUIRED action block — always renders one of three branches
          below, right after "Suggested from your answers" and before
          "Why this route" / "Route steps", so the CTA is never pushed
          below route context the user has to scroll past first. */}
      <div className="mt-4 border-t border-line/70 pt-4">
        <span className="block text-[13px] font-semibold text-ink">Your next step</span>

        {showsMatchedOpportunity && opportunity ? (
          <div className="mt-2.5">
            <span className="mb-2 block text-[11px] font-medium text-ink-faint">
              {ACCESS_POINT_HEADING[accessPointKind as "reviewed" | "seed"]}
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
              <div className="shadow-card mt-3.5 rounded-2xl border border-green/40 bg-green-soft/25 px-4 py-3.5">
                <div className="mt-2.5 flex flex-wrap items-center gap-3">
                  <Link
                    href={`${detailHref}?openTake=1`}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-green px-5 py-2.75 text-[13.5px] font-semibold text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50"
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
              </div>
            )}
          </div>
        ) : showsAiCandidate && bestCandidate ? (
          <div className="mt-2.5">
            <span className="mb-2 block text-[11px] font-medium text-ink-faint">
              {ACCESS_POINT_HEADING.ai}
            </span>
            <ScoutCandidateCard candidate={bestCandidate} />
          </div>
        ) : (
          <div className="mt-2.5 rounded-2xl border border-green/40 bg-green-soft/25 px-4 py-4">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-green" strokeWidth={1.75} />
              <span className="text-[13.5px] font-semibold text-ink">
                Pathoro can scout access points for this path.
              </span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
              No reviewed opportunity is available yet. Pathoro can look for real classes,
              events, openings, programs, people, and local access points that fit this route.
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
        )}
      </div>

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
