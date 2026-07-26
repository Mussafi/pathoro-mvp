"use client";

import { useEffect, useState } from "react";
import { loadLatestScoutRequest } from "@/lib/latestScoutRequest";
import type { ScoutCandidateRecord } from "@/lib/scoutCandidatesDb";

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

/**
 * Surfaces the AI-found candidates from the user's most recent scout
 * request, but only when it still matches the path they're currently
 * looking at (same city/route/goal) — otherwise a stale request for a
 * different goal would show irrelevant candidates.
 */
export function useLatestScoutCandidates(params: {
  city: string;
  routeId: string;
  pathGoal: string;
}): { candidates: ScoutCandidateRecord[]; resultUrl: string | null } {
  const [candidates, setCandidates] = useState<ScoutCandidateRecord[]>([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const latest = loadLatestScoutRequest();
    const matches =
      latest &&
      normalize(latest.city) === normalize(params.city) &&
      latest.routeId === params.routeId &&
      normalize(latest.pathGoal) === normalize(params.pathGoal);

    type FetchResult =
      | { ok: true; candidates: ScoutCandidateRecord[] }
      | { ok: false; error: string };

    const request: Promise<FetchResult> =
      matches && latest
        ? fetch(`/api/scout-requests/${latest.id}/public?token=${encodeURIComponent(latest.token)}`)
            .then((res) => res.json())
            .catch(() => ({ ok: false, error: "Request failed." }) as FetchResult)
        : Promise.resolve({ ok: false, error: "No matching scout request." });

    request.then((data) => {
      if (cancelled) return;
      if (data.ok) {
        setCandidates(data.candidates);
        setResultUrl(latest!.resultUrl);
      } else {
        setCandidates([]);
        setResultUrl(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [params.city, params.routeId, params.pathGoal]);

  return { candidates, resultUrl };
}
