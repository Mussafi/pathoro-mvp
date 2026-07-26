"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import { createScoutRequestId, saveScoutRequest } from "@/lib/scoutRequests";

export function ScoutRequestCard({
  routeId,
  pathGoal,
  city,
}: {
  routeId: string;
  pathGoal: string;
  city: string;
}) {
  const [requested, setRequested] = useState(false);

  function handleRequest() {
    saveScoutRequest({
      id: createScoutRequestId(),
      routeId,
      pathGoal,
      city,
      createdAt: new Date().toISOString(),
    });
    setRequested(true);
  }

  return (
    <div className="shadow-card mt-6 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-soft">
          <Compass className="h-4 w-4 text-green" strokeWidth={1.75} />
        </span>
        <span className="text-[15px] font-semibold text-ink">
          Want Pathoro to scout this path?
        </span>
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
        Pathoro can look for real-world access points, hidden opportunities,
        people, places, resources, and openings that match this route.
      </p>
      {requested ? (
        <p className="mt-3 rounded-2xl border border-green/40 bg-green-soft/50 px-3.5 py-3 text-[12.5px] leading-relaxed text-green">
          Scout request noted for this alpha.
        </p>
      ) : (
        <button
          type="button"
          onClick={handleRequest}
          className="mt-3 flex items-center justify-center gap-2 rounded-full bg-green py-2.5 text-[13.5px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50"
        >
          Request scout
        </button>
      )}
    </div>
  );
}
