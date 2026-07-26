"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import {
  MARKER_TYPE_LABELS,
  MARKER_TYPES,
  TRAIL_MARKER_BODY_MAX_LENGTH,
  TRAIL_MARKER_BODY_MIN_LENGTH,
  isValidMarkerBody,
  type MarkerType,
  type TrailMarker,
} from "@/lib/trailMarkerSchema";
import { useTrailMarkers } from "@/lib/useTrailMarkers";

function groupByType(markers: TrailMarker[]): Partial<Record<MarkerType, TrailMarker[]>> {
  const groups: Partial<Record<MarkerType, TrailMarker[]>> = {};
  for (const marker of markers) {
    (groups[marker.markerType] ??= []).push(marker);
  }
  return groups;
}

export function TrailMarkersSection({
  opportunityId,
  routeId,
  city,
}: {
  opportunityId: string;
  routeId: string;
  city: string;
}) {
  const { markers, loading, refresh } = useTrailMarkers({ opportunityId });
  const [markerType, setMarkerType] = useState<MarkerType>("practical_tip");
  const [body, setBody] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const grouped = groupByType(markers);
  const groupOrder = MARKER_TYPES.filter((type) => grouped[type]?.length);

  async function handleSubmit() {
    if (!isValidMarkerBody(body)) {
      setSubmitError(
        `Say a bit more — between ${TRAIL_MARKER_BODY_MIN_LENGTH} and ${TRAIL_MARKER_BODY_MAX_LENGTH} characters.`
      );
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/trail-markers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, routeId, markerType, body, displayName, city }),
      });
      const data = await res.json();
      if (!data.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
      setBody("");
      setDisplayName("");
      refresh();
    } catch {
      setSubmitError("Something went wrong reaching Pathoro. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="shadow-card mt-4 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-6 py-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-soft">
          <Flag className="h-4 w-4 text-green" strokeWidth={1.75} />
        </span>
        <span className="text-[15px] font-semibold text-ink">Trail markers</span>
      </div>
      <p className="mt-1.5 text-[12px] leading-relaxed text-ink-faint">
        Notes from people who know this path — practical context, hidden
        friction, and what this could open next.
      </p>

      <div className="mt-4 flex flex-col gap-4 border-t border-line/70 pt-4">
        {loading ? (
          <p className="text-[12.5px] text-ink-faint">Loading trail markers…</p>
        ) : groupOrder.length === 0 ? (
          <p className="text-[12.5px] leading-relaxed text-ink-faint">
            No trail markers yet. Be the first to leave context for the next
            person.
          </p>
        ) : (
          groupOrder.map((type) => (
            <div key={type}>
              <span className="block text-[11px] font-semibold text-ink-faint">
                {MARKER_TYPE_LABELS[type]}
              </span>
              <div className="mt-1.5 flex flex-col gap-2">
                {grouped[type]!.map((marker) => (
                  <div
                    key={marker.id}
                    className="rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.5"
                  >
                    <p className="text-[12.5px] leading-relaxed text-ink">{marker.body}</p>
                    <p className="mt-1 text-[10.5px] text-ink-faint">
                      {marker.displayName || "Someone who walked this path"}
                      {marker.city ? ` · ${marker.city}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-line/70 pt-5">
        <span className="text-[13px] font-semibold text-ink">Leave a trail marker</span>
        {submitted ? (
          <p className="rounded-2xl border border-green/40 bg-green-soft/50 px-3.5 py-3 text-[12.5px] leading-relaxed text-green">
            Submitted for review. Trail markers appear after review.
          </p>
        ) : (
          <>
            <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
              <span className="block text-[10.5px] text-ink-faint">Type of note</span>
              <select
                value={markerType}
                onChange={(e) => setMarkerType(e.target.value as MarkerType)}
                className="mt-0.5 w-full bg-transparent text-[13px] font-medium text-ink outline-none"
              >
                {MARKER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {MARKER_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
              <span className="block text-[10.5px] text-ink-faint">
                What would help the next person?
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                maxLength={TRAIL_MARKER_BODY_MAX_LENGTH}
                placeholder="Share practical context, hidden friction, or what this opened for you."
                className="mt-0.5 w-full resize-none bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint/70"
              />
            </label>
            <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
              <span className="block text-[10.5px] text-ink-faint">
                Display name (optional)
              </span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Left blank, this stays anonymous"
                className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint/70"
              />
            </label>
            {submitError && (
              <p className="text-[12px] text-red-700">{submitError}</p>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-full bg-green py-2.5 text-[13.5px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Leave a trail marker"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
