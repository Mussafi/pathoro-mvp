"use client";

import { useState } from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import {
  OPPORTUNITY_SOURCE_LABELS,
  ROUTE_OPPORTUNITY_TYPE_LABELS,
} from "@/lib/opportunitySchema";
import {
  createDiscoveryEntryId,
  unmapOpportunitySourceType,
} from "@/lib/discoveryQueue";
import { useDiscoveryQueue } from "@/lib/useDiscoveryQueue";
import type { ScoutCandidate } from "@/lib/tavily";
import type { ScoutResponse } from "@/app/api/scout-opportunities/route";

const CONFIDENCE_LABELS: Record<ScoutCandidate["confidence"], string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

function buildIngestionHref(candidate: ScoutCandidate, city: string): string {
  const params = new URLSearchParams({
    sourceUrl: candidate.url,
    sourceType: candidate.sourceType,
    city,
  });
  return `/admin/opportunity-ingestion?${params.toString()}`;
}

export default function OpportunityScoutPage() {
  const [adminToken, setAdminToken] = useState("");
  const [city, setCity] = useState("Austin");
  const [state, setState] = useState("TX");
  const [pathGoal, setPathGoal] = useState("become vegetarian");
  const [routeId, setRouteId] = useState("real-openings");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<ScoutCandidate[]>([]);
  const [queriesUsed, setQueriesUsed] = useState<string[]>([]);
  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set());
  const { save: saveDiscoveryEntry } = useDiscoveryQueue();

  async function handleSearch() {
    setLoading(true);
    setError(null);
    setCandidates([]);
    setQueriesUsed([]);

    try {
      const res = await fetch("/api/scout-opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ city, state, pathGoal, routeId, keywords }),
      });
      const data = (await res.json()) as ScoutResponse;

      if (!data.ok) {
        setError(data.error);
        return;
      }
      setCandidates(data.candidates);
      setQueriesUsed(data.queriesUsed);
    } catch {
      setError("Something went wrong reaching the scout service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSaveToDiscoveryQueue(candidate: ScoutCandidate) {
    saveDiscoveryEntry({
      id: createDiscoveryEntryId(),
      city,
      sourceType: unmapOpportunitySourceType(candidate.sourceType),
      sourceUrl: candidate.url,
      keywords,
      notes: candidate.whyThisMayFit,
      status: "new",
      createdAt: new Date().toISOString(),
    });
    setSavedUrls((prev) => new Set(prev).add(candidate.url));
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-[720px]">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/70 bg-cream-field px-4 py-3 text-[12px] text-ink-faint">
          <span>
            Internal prototype — not linked publicly. Search results are
            candidates only; nothing here is saved until it&rsquo;s reviewed
            and approved through ingestion.
          </span>
          <Link
            href="/admin/discovery-queue"
            className="shrink-0 text-[12px] font-semibold text-green underline"
          >
            Discovery queue
          </Link>
        </div>

        <div className="mt-3 rounded-2xl border border-green/40 bg-green-soft/15 px-4 py-3 text-[11.5px] leading-relaxed text-ink-soft">
          AI is not finding events. It is scouting for route-relevant
          opportunity access points.
        </div>

        <h1 className="mt-6 font-serif text-[26px] leading-tight text-ink">
          Opportunity scout (prototype)
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-faint">
          Describe who this is for and Pathoro searches the web for real,
          route-relevant candidates — never Instagram or Facebook, never
          auto-published. Human review still happens in ingestion.
        </p>

        <div className="shadow-card mt-6 flex flex-col gap-4 rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
          <h2 className="text-[15px] font-semibold text-ink">Search</h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
              <span className="block text-[10.5px] text-ink-faint">City</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none"
              />
            </label>
            <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
              <span className="block text-[10.5px] text-ink-faint">State</span>
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none"
              />
            </label>
          </div>

          <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
            <span className="block text-[10.5px] text-ink-faint">
              Path / goal
            </span>
            <input
              value={pathGoal}
              onChange={(e) => setPathGoal(e.target.value)}
              placeholder="become vegetarian"
              className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint/70"
            />
          </label>

          <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
            <span className="block text-[10.5px] text-ink-faint">
              Route type
            </span>
            <select
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              className="mt-0.5 w-full bg-transparent text-[13px] font-medium text-ink outline-none"
            >
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
            <span className="block text-[10.5px] text-ink-faint">
              Keywords (optional)
            </span>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="beginner, cooking"
              className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint/70"
            />
          </label>

          <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
            <span className="block text-[10.5px] text-ink-faint">
              Admin token
            </span>
            <input
              type="password"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="Paste the shared admin token"
              className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint/70"
            />
          </label>

          <button
            type="button"
            onClick={handleSearch}
            disabled={loading || !city.trim() || !pathGoal.trim()}
            className="flex items-center justify-center gap-2 rounded-full bg-green py-2.5 text-[13.5px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Searching…" : "Find opportunities"}
          </button>
        </div>

        {error && (
          <div className="shadow-card mt-6 rounded-[26px] border border-red-200 bg-red-50 px-5 py-4 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {queriesUsed.length > 0 && (
          <p className="mt-4 text-[11px] text-ink-faint">
            Searched: {queriesUsed.join(" · ")}
          </p>
        )}

        {candidates.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            {candidates.map((candidate) => {
              const route = routes.find((r) => r.id === candidate.likelyRouteId);
              const alreadySaved = savedUrls.has(candidate.url);
              return (
                <div
                  key={candidate.url}
                  className="shadow-card flex flex-col gap-2 rounded-[26px] border border-line/70 bg-cream-card px-5 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="text-[13.5px] font-semibold text-ink">
                      {candidate.title}
                    </span>
                    <span className="shrink-0 rounded-full bg-green-soft px-2 py-0.5 text-[10px] font-semibold text-green">
                      {CONFIDENCE_LABELS[candidate.confidence]}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-ink-faint">
                    {candidate.sourceName} · {OPPORTUNITY_SOURCE_LABELS[candidate.sourceType]}
                    {candidate.canonicalSourceLikely ? " · Canonical source likely" : ""}
                  </p>
                  {candidate.snippet && (
                    <p className="text-[12.5px] leading-snug text-ink-soft">
                      {candidate.snippet}
                    </p>
                  )}
                  <p className="text-[11.5px] leading-snug text-ink-faint">
                    <span className="font-semibold text-ink-soft">Why this may fit — </span>
                    {candidate.whyThisMayFit}
                  </p>
                  <p className="text-[11.5px] text-ink-faint">
                    <span className="font-semibold text-ink-soft">Likely route — </span>
                    {route?.title ?? candidate.likelyRouteId} ·{" "}
                    {ROUTE_OPPORTUNITY_TYPE_LABELS[candidate.likelyRouteId] ?? candidate.opportunityType}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <Link
                      href={buildIngestionHref(candidate, city)}
                      className="rounded-full border border-green/40 bg-green-soft px-3 py-1.5 text-[12px] font-medium text-green outline-none transition hover:bg-green-soft/70 focus-visible:ring-2 focus-visible:ring-green/50"
                    >
                      Send to ingestion
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleSaveToDiscoveryQueue(candidate)}
                      disabled={alreadySaved}
                      className="text-[12px] font-medium text-ink-faint underline disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {alreadySaved ? "Saved to discovery queue" : "Save to discovery queue"}
                    </button>
                    <a
                      href={candidate.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[12px] font-medium text-ink-faint underline"
                    >
                      Open source
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
