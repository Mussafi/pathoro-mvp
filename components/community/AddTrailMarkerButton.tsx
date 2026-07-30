"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { TrailMarkerComposer, type TrailMarkerContext } from "@/components/community/TrailMarkerComposer";
import type { MarkerType } from "@/lib/trailMarkerSchema";

/**
 * The trigger for TrailMarkerComposer — every "Leave a trail marker" entry
 * point (v0.40 PART 6) renders this, passing the context it already has
 * (goal, branch, milestone, opportunity, candidate, route) so a marker is
 * never posted without one.
 */
export function AddTrailMarkerButton({
  context,
  fixedMarkerType,
  label = "Leave a trail marker",
  title,
  onSubmitted,
  className,
}: {
  context: TrailMarkerContext;
  fixedMarkerType?: MarkerType;
  label?: string;
  title?: string;
  onSubmitted?: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "flex items-center justify-center gap-1.5 rounded-full border border-line/70 px-4 py-2 text-[12.5px] font-medium text-ink-soft outline-none transition hover:border-green/40 hover:text-ink focus-visible:ring-2 focus-visible:ring-green/50"
        }
      >
        <Flag className="h-3.5 w-3.5" strokeWidth={1.75} />
        {label}
      </button>

      {open && (
        <TrailMarkerComposer
          context={context}
          fixedMarkerType={fixedMarkerType}
          title={title}
          onClose={() => setOpen(false)}
          onSubmitted={onSubmitted}
        />
      )}
    </>
  );
}
