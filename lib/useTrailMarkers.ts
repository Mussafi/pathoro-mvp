"use client";

import { useEffect, useState } from "react";
import type { TrailMarker } from "@/lib/trailMarkerSchema";

/** Fetches live trail markers for an opportunity and/or route. Client-only. */
export function useTrailMarkers(filters: { opportunityId?: string; routeId?: string }) {
  const { opportunityId, routeId } = filters;
  const [markers, setMarkers] = useState<TrailMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams();
    if (opportunityId) params.set("opportunityId", opportunityId);
    if (routeId) params.set("routeId", routeId);

    const request: Promise<{ ok: true; markers: TrailMarker[] } | { ok: false; error: string }> =
      opportunityId || routeId
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
  }, [opportunityId, routeId, refreshIndex]);

  function refresh() {
    setRefreshIndex((i) => i + 1);
  }

  return { markers, loading, refresh } as const;
}
