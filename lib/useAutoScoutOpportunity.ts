"use client";

import { useEffect, useState } from "react";
import { loadLatestScoutRequest, saveLatestScoutRequest } from "@/lib/latestScoutRequest";
import type { ScoutCandidateRecord } from "@/lib/scoutCandidatesDb";

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

export type AutoScoutStatus = "idle" | "checking" | "scouting" | "done" | "error";

export type AutoScoutState = {
  candidates: ScoutCandidateRecord[];
  resultUrl: string | null;
  status: AutoScoutStatus;
};

const IDLE: AutoScoutState = { candidates: [], resultUrl: null, status: "idle" };

/**
 * Best Next Route's real-opportunity pipeline (v0.38 "Surface real
 * opportunity results"): before ever falling back to an example seed,
 * check whether a scout request already exists for this exact
 * city/route/goal — and if not, silently run one through the same
 * POST /api/scout-requests flow the "Request scout" button already uses,
 * so a user sees a real, source-backed candidate without having to ask
 * for one first. Reuses that endpoint rather than duplicating the Tavily
 * call + scout_candidates write it already does.
 *
 * `enabled` should only be true once the caller knows no reviewed/live
 * Supabase opportunity exists for this route — a real DB-backed
 * opportunity always outranks a live search, so there's no reason to
 * spend an API call checking.
 */
export function useAutoScoutOpportunity(params: {
  enabled: boolean;
  city: string;
  state?: string;
  routeId: string;
  pathGoal: string;
  startingFrom?: string;
}): AutoScoutState {
  const [state, setState] = useState<AutoScoutState>(IDLE);
  const { enabled, city, state: stateAbbr, routeId, pathGoal, startingFrom } = params;

  useEffect(() => {
    if (!enabled || !city.trim() || !routeId.trim() || !pathGoal.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(IDLE);
      return;
    }

    let cancelled = false;
    setState({ candidates: [], resultUrl: null, status: "checking" });

    type PublicResult =
      | { ok: true; candidates: ScoutCandidateRecord[] }
      | { ok: false; error: string };

    async function fetchPublicCandidates(id: string, token: string): Promise<PublicResult> {
      try {
        const res = await fetch(`/api/scout-requests/${id}/public?token=${encodeURIComponent(token)}`);
        return await res.json();
      } catch {
        return { ok: false, error: "Request failed." };
      }
    }

    async function run() {
      const latest = loadLatestScoutRequest();
      const matchesExisting =
        latest &&
        normalize(latest.city) === normalize(city) &&
        latest.routeId === routeId &&
        normalize(latest.pathGoal) === normalize(pathGoal);

      if (matchesExisting && latest) {
        const existing = await fetchPublicCandidates(latest.id, latest.token);
        if (cancelled) return;
        if (existing.ok && existing.candidates.length > 0) {
          setState({ candidates: existing.candidates, resultUrl: latest.resultUrl, status: "done" });
          return;
        }
        // Existing request had no candidates yet (e.g. Tavily was down when
        // it first ran) — fall through and try a fresh scout below rather
        // than getting stuck on a dead request forever.
      }

      if (cancelled) return;
      setState({ candidates: [], resultUrl: null, status: "scouting" });

      try {
        const res = await fetch("/api/scout-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city,
            state: stateAbbr,
            routeId,
            pathGoal,
            startingFrom,
            requestedFromPage: "/route-planning (auto-scout)",
          }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!data.ok || !data.id || !data.publicToken) {
          setState({ candidates: [], resultUrl: null, status: "error" });
          return;
        }

        saveLatestScoutRequest({
          id: data.id,
          token: data.publicToken,
          resultUrl: data.resultUrl ?? "",
          city,
          state: stateAbbr ?? "",
          routeId,
          pathGoal,
        });

        const fresh = await fetchPublicCandidates(data.id, data.publicToken);
        if (cancelled) return;
        setState({
          candidates: fresh.ok ? fresh.candidates : [],
          resultUrl: data.resultUrl ?? null,
          status: "done",
        });
      } catch {
        if (!cancelled) setState({ candidates: [], resultUrl: null, status: "error" });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [enabled, city, stateAbbr, routeId, pathGoal, startingFrom]);

  return state;
}
