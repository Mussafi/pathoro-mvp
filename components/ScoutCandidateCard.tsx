import { ExternalLink } from "lucide-react";
import {
  FIT_BADGE_CLASS,
  FIT_CARD_CLASS,
  PATHORO_FIT_LABELS,
  SCOUT_CONFIDENCE_LABELS,
  shortenSnippet,
  type PathoroFit,
} from "@/lib/scoutFit";
import { GOAL_FIT_BADGE_CLASS, GOAL_FIT_COPY, GOAL_FIT_LABELS, computeGoalFit } from "@/lib/goalFitLabel";
import {
  STARTING_POINT_FIT_BADGE_CLASS,
  STARTING_POINT_FIT_LABELS,
  computePrerequisiteSignal,
  computeStartingPointFit,
  getStartingPointFitReason,
  mapStartingFromToExperienceLevel,
} from "@/lib/startingPointFit";
import type { ScoutCandidateRecord } from "@/lib/scoutCandidatesDb";

/**
 * Shared AI-found-candidate card — used on the public scout result page and
 * on route-planning's "AI-found access points" section, so both surfaces
 * downplay weak results and format the fit narrative identically.
 */
export function ScoutCandidateCard({
  candidate,
  goal,
  startingFrom,
}: {
  candidate: ScoutCandidateRecord;
  goal?: string;
  /** The onboarding "Where are you starting from?" answer — see
   * lib/startingPointFit.ts. Optional: some surfaces (the public scout
   * result page, which has no access to the requester's onboarding
   * answers) simply don't show the starting-point fit badge/reason. */
  startingFrom?: string;
}) {
  const fit = (candidate.pathoroFit as PathoroFit) || "maybe_useful";
  const showNarrative = fit === "strong_opportunity" || fit === "maybe_useful";
  // Goal fit (direct/related/adjacent/weak — see lib/goalFitLabel.ts) is a
  // second, independent axis from PathoroFit: a candidate can be a
  // perfectly specific, actionable page and still be the wrong thing for
  // this exact goal (see "Fix opportunity action landing and submission"
  // PART 5). Only shown when a goal is actually known.
  const goalFit = goal ? computeGoalFit(candidate, goal) : null;
  // Starting-point fit (v0.39 "Rank opportunities by starting point
  // fit") is a third axis: is this reachable from where the user is,
  // not just related to what they want. Needs both a goal (to compute
  // goalFit) and a starting-position answer.
  const prerequisiteSignal = computePrerequisiteSignal(`${candidate.title} ${candidate.snippet}`);
  const startingPointFit =
    goalFit && startingFrom
      ? computeStartingPointFit(prerequisiteSignal, mapStartingFromToExperienceLevel(startingFrom), goalFit)
      : null;

  return (
    <div className={`rounded-2xl border px-3.5 py-3 ${FIT_CARD_CLASS[fit] ?? FIT_CARD_CLASS.maybe_useful}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="text-[13px] font-semibold text-ink">{candidate.title}</span>
        <span className="flex shrink-0 flex-wrap justify-end gap-1.5">
          {goalFit && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${GOAL_FIT_BADGE_CLASS[goalFit]}`}>
              {GOAL_FIT_LABELS[goalFit]}
            </span>
          )}
          {startingPointFit && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STARTING_POINT_FIT_BADGE_CLASS[startingPointFit]}`}
            >
              {STARTING_POINT_FIT_LABELS[startingPointFit]}
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${FIT_BADGE_CLASS[fit] ?? FIT_BADGE_CLASS.maybe_useful}`}
          >
            {PATHORO_FIT_LABELS[fit] ?? candidate.pathoroFit}
          </span>
          <span className="rounded-full bg-cream-card px-2 py-0.5 text-[10px] font-semibold text-ink-faint">
            {SCOUT_CONFIDENCE_LABELS[candidate.confidence] ?? candidate.confidence}
          </span>
        </span>
      </div>
      <p className="mt-1 text-[11px] text-ink-faint">{candidate.sourceName}</p>
      {candidate.snippet && (
        <p className="mt-1.5 text-[12px] leading-snug text-ink-soft">{shortenSnippet(candidate.snippet)}</p>
      )}
      {startingPointFit ? (
        <p className="mt-1.5 text-[11px] leading-snug text-ink-faint">
          <span className="font-semibold text-ink-soft">{STARTING_POINT_FIT_LABELS[startingPointFit]} — </span>
          {getStartingPointFitReason(startingPointFit, prerequisiteSignal)}
        </p>
      ) : (
        goalFit &&
        (goalFit === "adjacent" || goalFit === "weak") && (
          <p className="mt-1.5 text-[11px] leading-snug text-ink-faint">
            <span className="font-semibold text-ink-soft">{GOAL_FIT_LABELS[goalFit]} — </span>
            {GOAL_FIT_COPY[goalFit]}
          </p>
        )
      )}
      {showNarrative && (
        <>
          {candidate.whyThisMayFit && (
            <p className="mt-1.5 text-[11px] leading-snug text-ink-faint">
              <span className="font-semibold text-ink-soft">Why this may fit — </span>
              {candidate.whyThisMayFit}
            </p>
          )}
          {candidate.leverageHint && (
            <p className="mt-1 text-[11px] leading-snug text-ink-faint">
              <span className="font-semibold text-ink-soft">What leverage it may create — </span>
              {candidate.leverageHint}
            </p>
          )}
          {candidate.suggestedNextStep && (
            <p className="mt-1 text-[11px] leading-snug text-ink-faint">
              <span className="font-semibold text-ink-soft">Suggested next step — </span>
              {candidate.suggestedNextStep}
            </p>
          )}
        </>
      )}
      <a
        href={candidate.url}
        target="_blank"
        rel="noreferrer"
        className="mt-2 flex w-fit items-center gap-1 text-[11.5px] font-medium text-green underline"
      >
        Open source
        <ExternalLink className="h-3 w-3" strokeWidth={2} />
      </a>
    </div>
  );
}
