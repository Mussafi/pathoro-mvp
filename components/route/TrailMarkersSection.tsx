"use client";

import { Flag } from "lucide-react";
import {
  getCredibilityBadgeLabel,
  isPathoroStarterNote,
  MARKER_TYPE_LABELS,
  type TrailMarker,
} from "@/lib/trailMarkerSchema";
import { useTrailMarkers } from "@/lib/useTrailMarkers";
import { AddTrailMarkerButton } from "@/components/community/AddTrailMarkerButton";

export function TrailMarkerCard({ marker }: { marker: TrailMarker }) {
  const context = marker.experienceLabel || marker.authorRole;
  const isStarterNote = isPathoroStarterNote(marker);
  return (
    <div className="rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full border border-green/30 bg-green-soft/60 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-green">
          {MARKER_TYPE_LABELS[marker.markerType]}
        </span>
        <span
          className={
            isStarterNote
              ? "rounded-full border border-green/40 bg-green-soft/40 px-2 py-0.5 text-[9.5px] font-medium text-green"
              : "rounded-full border border-line/70 px-2 py-0.5 text-[9.5px] font-medium text-ink-faint"
          }
        >
          {getCredibilityBadgeLabel(marker)}
        </span>
      </div>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink">{marker.body}</p>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="text-[10.5px] text-ink-faint">
          {marker.authorName || "Someone who walked this path"}
          {context ? ` · ${context}` : ""}
        </p>
        {marker.helpfulCount > 0 && (
          <span className="shrink-0 text-[10px] text-ink-faint/80">
            {marker.helpfulCount} found this helpful
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Real trail markers for an opportunity or candidate opportunity — shared
 * by both /opportunity/[id] and /opportunity/candidate/[id] (v0.40 PART
 * 6.2) so there's one list-and-compose surface, not two near-duplicates.
 */
export function TrailMarkersSection({
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

  return (
    <div className="shadow-card mt-4 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-soft">
            <Flag className="h-4 w-4 text-green" strokeWidth={1.75} />
          </span>
          <span className="text-[15px] font-semibold text-ink">Trail markers</span>
        </div>
        <AddTrailMarkerButton
          context={{ contextType, goal, routeId, opportunityId, candidateId }}
          onSubmitted={refresh}
        />
      </div>
      <p className="mt-1.5 text-[12px] leading-relaxed text-ink-faint">
        Signs from people who&rsquo;ve walked this path — not a comment section.
      </p>

      <div className="mt-4 flex flex-col gap-2.5 border-t border-line/70 pt-4">
        {loading ? (
          <p className="text-[12.5px] text-ink-faint">Loading trail markers…</p>
        ) : markers.length === 0 ? (
          <p className="text-[12.5px] leading-relaxed text-ink-faint">
            No trail markers yet. Be the first to leave context for the next person.
          </p>
        ) : (
          markers.map((marker) => <TrailMarkerCard key={marker.id} marker={marker} />)
        )}
      </div>
    </div>
  );
}
