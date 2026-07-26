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
  const trailHref = trailMapGoal ? `/trail-map?goal=${trailMapGoal}` : "/trail-map";

  return <RoutePlanningHeader mode="compass" trailHref={trailHref} />;
}
