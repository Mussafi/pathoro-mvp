"use client";

import { RoutePlanningHeader } from "@/components/route/RoutePlanningHeader";
import { useDirectionAnswers } from "@/lib/useDirectionAnswers";
import { mapGoalToTrailMapGoal } from "@/lib/goalSpecificity";

/** Compass Mode is always the active mode on /route-planning; Trail Mode
 * links to the Trail Map for whichever goal best matches, so switching
 * modes doesn't drop the user onto an unrelated demo goal. */
export function RoutePlanningHeaderWithGoal() {
  const { answers } = useDirectionAnswers();
  const trailMapGoal = mapGoalToTrailMapGoal(answers.moveToward);
  // Same fallback as TrailMapRecommendationCard: a non-curated goal
  // (e.g. "HVAC technician") should still carry its own text into the
  // Trail Map's generator rather than losing it to a bare /trail-map link.
  const trailHref = trailMapGoal
    ? `/trail-map?goal=${trailMapGoal}`
    : answers.moveToward.trim()
      ? `/trail-map?goal=${encodeURIComponent(answers.moveToward.trim())}`
      : "/trail-map";

  return <RoutePlanningHeader mode="compass" trailHref={trailHref} />;
}
