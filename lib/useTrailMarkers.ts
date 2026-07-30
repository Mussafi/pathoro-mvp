"use client";

import { useEffect, useState } from "react";
import type { ContextType, TrailMarker } from "@/lib/trailMarkerSchema";

export type TrailMarkerHookFilters = {
  goal?: string;
  branchId?: string;
  milestoneId?: string;
  opportunityId?: string;
  candidateId?: string;
  routeId?: string;
  contextType?: ContextType;
};

function hasAnyFilter(filters: TrailMarkerHookFilters): boolean {
  return Boolean(
    filters.goal ||
      filters.branchId ||
      filters.milestoneId ||
      filters.opportunityId ||
      filters.candidateId ||
      filters.routeId ||
      filters.contextType
  );
}

/** Fetches approved trail markers matching the given context. Client-only. */
export function useTrailMarkers(filters: TrailMarkerHookFilters) {
  const { goal, branchId, milestoneId, opportunityId, candidateId, routeId, contextType } = filters;
  const [markers, setMarkers] = useState<TrailMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams();
    if (goal) params.set("goal", goal);
    if (branchId) params.set("branchId", branchId);
    if (milestoneId) params.set("milestoneId", milestoneId);
    if (opportunityId) params.set("opportunityId", opportunityId);
    if (candidateId) params.set("candidateId", candidateId);
    if (routeId) params.set("routeId", routeId);
    if (contextType) params.set("contextType", contextType);

    const request: Promise<{ ok: true; markers: TrailMarker[] } | { ok: false; error: string }> =
      hasAnyFilter(filters)
        ? fetch(`/api/trail-markers?${params.toString()}`).then((res) => res.json())
        : Promise.resolve({ ok: true, markers: [] });

    request
      .then((data) => {
        if (cancelled) return;
        setMarkers(data.ok ? data.markers : []);
      })
      .catch(() => {
        if (!cancelled) setMarkers([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal, branchId, milestoneId, opportunityId, candidateId, routeId, contextType, refreshIndex]);

  function refresh() {
    setRefreshIndex((i) => i + 1);
  }

  return { markers, loading, refresh } as const;
}
