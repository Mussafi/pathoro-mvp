"use client";

import { Sparkles } from "lucide-react";
import { ScoutCandidateCard } from "@/components/ScoutCandidateCard";
import { useLatestScoutCandidates } from "@/lib/useLatestScoutCandidates";

const MAX_SHOWN = 3;

/**
 * Surfaces the latest matching scout request's AI-found candidates directly
 * on route-planning, so a user doesn't have to leave the page to see what
 * Pathoro found for their path. Renders nothing if there's no matching
 * request or it has no candidates yet.
 */
export function AiFoundAccessPoints({
  city,
  routeId,
  pathGoal,
}: {
  city: string;
  routeId: string;
  pathGoal: string;
}) {
  const { candidates } = useLatestScoutCandidates({ city, routeId, pathGoal });
  const visible = candidates.filter((c) => c.status !== "dismissed").slice(0, MAX_SHOWN);

  if (visible.length === 0) return null;

  return (
    <div className="shadow-card mt-6 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-soft">
          <Sparkles className="h-4 w-4 text-green" strokeWidth={1.75} />
        </span>
        <span className="text-[15px] font-semibold text-ink">AI-found access points</span>
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
        Pathoro found these possible access points for this path. They are
        unreviewed candidates, not guaranteed recommendations.
      </p>
      <div className="mt-3 flex flex-col gap-2.5">
        {visible.map((candidate) => (
          <ScoutCandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </div>
    </div>
  );
}
