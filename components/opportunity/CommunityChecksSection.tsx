"use client";

import { ShieldCheck } from "lucide-react";
import { TrailMarkerCard } from "@/components/route/TrailMarkersSection";
import { AddTrailMarkerButton } from "@/components/community/AddTrailMarkerButton";
import { useTrailMarkers } from "@/lib/useTrailMarkers";

const PROMPTS = [
  "Is this real?",
  "Is it still active?",
  "Is it beginner-friendly?",
  "What did someone learn from trying it?",
  "Does it require hidden experience?",
];

/**
 * "Community checks" (v0.40 PART 8) — reuses trail_markers with
 * context_type = opportunity/candidate_opportunity and
 * marker_type = opportunity_check, rather than a separate system. Kept
 * visually and functionally distinct from the general Trail markers
 * section above it: this one is specifically about whether *this*
 * opportunity itself is real/current/beginner-friendly, not general path
 * knowledge.
 */
export function CommunityChecksSection({
  contextType,
  opportunityId,
  candidateId,
  routeId,
  goal,
}: {
  contextType: "opportunity" | "candidate_opportunity";
  opportunityId?: string;
  candidateId?: string;
  routeId: string;
  goal: string;
}) {
  const { markers, loading, refresh } = useTrailMarkers({ opportunityId, candidateId });
  const checks = markers.filter((m) => m.markerType === "opportunity_check");

  return (
    <div className="shadow-card mt-4 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-soft">
            <ShieldCheck className="h-4 w-4 text-green" strokeWidth={1.75} />
          </span>
          <span className="text-[15px] font-semibold text-ink">Community checks</span>
        </div>
        <AddTrailMarkerButton
          context={{ contextType, goal, routeId, opportunityId, candidateId }}
          fixedMarkerType="opportunity_check"
          label="Add a check"
          title="Add a community check"
          onSubmitted={refresh}
        />
      </div>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {PROMPTS.map((prompt) => (
          <li
            key={prompt}
            className="rounded-full border border-line/70 bg-cream-field px-2.5 py-1 text-[10.5px] text-ink-faint"
          >
            {prompt}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-2.5 border-t border-line/70 pt-4">
        {loading ? (
          <p className="text-[12.5px] text-ink-faint">Loading community checks…</p>
        ) : checks.length === 0 ? (
          <p className="text-[12.5px] leading-relaxed text-ink-faint">
            No community checks yet. If you&rsquo;ve tried this, let the next person know what you
            found.
          </p>
        ) : (
          checks.map((marker) => <TrailMarkerCard key={marker.id} marker={marker} />)
        )}
      </div>
    </div>
  );
}
