"use client";

import { useEffect, useState } from "react";
import type { Opportunity } from "@/lib/opportunitySchema";

/**
 * Fetches live, database-backed opportunities from /api/opportunities.
 * Always resolves to an array — on any failure (network error, Supabase
 * misconfigured, etc.) it resolves to `[]` so callers can fall straight
 * through to the localStorage/seed fallback chain without special-casing
 * errors.
 */
export function useLiveOpportunities(): Opportunity[] {
  const [live, setLive] = useState<Opportunity[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/opportunities")
      .then((res) => res.json())
      .then((data: { ok: true; opportunities: Opportunity[] } | { ok: false; error: string }) => {
        if (cancelled) return;
        setLive(data.ok ? data.opportunities : []);
      })
      .catch(() => {
        if (!cancelled) setLive([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return live;
}
