"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import {
  OPPORTUNITY_CATEGORY_LABELS,
  OPPORTUNITY_SOURCE_LABELS,
  ROUTE_OPPORTUNITY_TYPE_LABELS,
} from "@/lib/opportunitySchema";
import {
  createDiscoveryEntryId,
  unmapOpportunitySourceType,
} from "@/lib/discoveryQueue";
import { useDiscoveryQueue } from "@/lib/useDiscoveryQueue";
import type { ScoutCandidate, ScoutMode } from "@/lib/tavily";
import { PATHORO_FIT_LABELS, SCOUT_CONFIDENCE_LABELS } from "@/lib/scoutFit";
import type { ScoutResponse } from "@/app/api/scout-opportunities/route";

const CONFIDENCE_LABELS: Record<ScoutCandidate["confidence"], string> = SCOUT_CONFIDENCE_LABELS as Record<
  ScoutCandidate["confidence"],
  string
>;

const FIT_BADGE_CLASS: Record<ScoutCandidate["pathoroFit"], string> = {
  strong_opportunity: "border border-green/40 bg-green-soft/60 text-green",
  maybe_useful: "border border-line/70 bg-cream-field text-ink-soft",
  consumer_activity: "border border-line/70 text-ink-faint",
  weak_informational: "border border-red-200 bg-red-50 text-red-700",
};

const SCOUT_MODE_OPTIONS: { value: ScoutMode; label: string; description: string }[] = [
  {
    value: "route",
    label: "Route-relevant opportunities",
    description: "Route-type-biased search, with a light dose of higher-agency queries.",
  },
  {
    value: "hidden",
    label: "Hidden opportunity / leverage scout",
    description: "Resale, flea markets, grants, apprenticeships, supplier gaps — not classes.",
  },
  {
    value: "gateway",
    label: "Gateway community scout",
    description: "Chambers of commerce, cultural associations, trade meetups, bridges in.",
  },
];

// "Opportunity, not consumption" — consumer_activity gets a muted badge,
// every higher-agency category gets the same accent as confidence, a small
// visual nudge without hiding anything.
const CATEGORY_BADGE_CLASS: Record<ScoutCandidate["opportunityCategory"], string> =
  Object.fromEntries(
    Object.keys(OPPORTUNITY_CATEGORY_LABELS).map((category) => [
      category,
      category === "consumer_activity"
        ? "border border-line/70 text-ink-faint"
        : "border border-green/40 bg-green-soft/60 text-green",
    ])
  ) as Record<ScoutCandidate["opportunityCategory"], string>;

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
  const [scoutMode, setScoutMode] = useState<ScoutMode>("route");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<ScoutCandidate[]>([]);
  const [queriesUsed, setQueriesUsed] = useState<string[]>([]);
  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set());
  const { save: saveDiscoveryEntry } = useDiscoveryQueue();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefillCity = params.get("city");
    if (!prefillCity) return;

    // Syncing initial form state from the URL (an external system) after
    // mount, not deriving it from props/state — avoids an SSR/client
    // hydration mismatch on these controlled inputs. Matches the pattern
    // in app/admin/opportunity-ingestion/page.tsx.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCity(prefillCity);
    const prefillState = params.get("state");
    if (prefillState) setState(prefillState);
    const prefillRouteId = params.get("routeId");
    if (prefillRouteId) setRouteId(prefillRouteId);
    const prefillPathGoal = params.get("pathGoal");
    if (prefillPathGoal) setPathGoal(prefillPathGoal);
  }, []);

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
        body: JSON.stringify({ city, state, pathGoal, routeId, keywords, scoutMode }),
      });
      const data = (await res.json()) as ScoutResponse;

      if (!data.ok) {
        setError(
          res.status === 401
            ? "Admin token required. This protects the scout from public use."
            : data.error
        );
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
          <span className="flex shrink-0 items-center gap-3">
            <Link href="/admin" className="text-[12px] font-semibold text-green underline">
              Admin hub
            </Link>
            <Link
              href="/admin/discovery-queue"
              className="text-[12px] font-semibold text-green underline"
            >
              Discovery queue
            </Link>
            <Link
              href="/admin/trail-markers"
              className="text-[12px] font-semibold text-green underline"
            >
              Trail markers
            </Link>
          </span>
        </div>

        <div className="mt-3 rounded-2xl border border-green/40 bg-green-soft/15 px-4 py-3 text-[11.5px] leading-relaxed text-ink-soft">
          AI is not finding events. It is scouting for route-relevant
          opportunity access points. Opportunity, not consumption: a class
          you pay to attend is not automatically better than a flea market
          vendor slot, a grant, or an apprenticeship — search results
          include both, labeled, so you can judge which one actually opens
          something for this person. The modern opportunity problem is not
          just finding events — it&rsquo;s finding hidden, underpriced, or
          overlooked access points that can help someone change their
          position. Pick the hidden opportunity mode below to search
          directly for those.
        </div>

        <div className="mt-3 rounded-2xl border border-green/40 bg-green-soft/15 px-4 py-3 text-[11.5px] leading-relaxed text-ink-soft">
          For goals about trade, sourcing, or entering a new community, the
          scout also looks for gateway communities — chambers of commerce,
          cultural associations, trade meetups, and similar bridges into a
          wider network. This responds only to what you type here; it never
          infers who someone is. Every opportunity found this way should
          still be legitimate and community-respecting — a way in, not a way
          to extract.
        </div>

        <div className="mt-3 rounded-2xl border border-line/70 bg-cream-field px-4 py-3 text-[11.5px] leading-relaxed text-ink-faint">
          Public scout requests now run automatically — see{" "}
          <Link href="/admin/scout-requests" className="font-semibold text-green underline">
            Scout requests
          </Link>
          . This page is for manual scouting, re-scouting a request, and
          deeper searches.
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

          <div>
            <span className="block text-[10.5px] text-ink-faint">
              Scout mode
            </span>
            <div className="mt-1.5 flex flex-col gap-2">
              {SCOUT_MODE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setScoutMode(option.value)}
                  className={`rounded-2xl border px-3.5 py-2.5 text-left transition ${
                    scoutMode === option.value
                      ? "border-green/50 bg-green-soft/60"
                      : "border-line/70 bg-cream-field hover:border-green/30"
                  }`}
                >
                  <span className="block text-[12.5px] font-semibold text-ink">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-ink-faint">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

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
            <span className="mt-1 block text-[10.5px] leading-snug text-ink-faint">
              Use the ADMIN_TOKEN from your local .env.local / Vercel
              environment variables.
            </span>
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
                    <span className="flex shrink-0 flex-wrap justify-end gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${FIT_BADGE_CLASS[candidate.pathoroFit]}`}
                      >
                        {PATHORO_FIT_LABELS[candidate.pathoroFit]}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_BADGE_CLASS[candidate.opportunityCategory]}`}
                      >
                        {OPPORTUNITY_CATEGORY_LABELS[candidate.opportunityCategory]}
                      </span>
                      <span className="rounded-full bg-green-soft px-2 py-0.5 text-[10px] font-semibold text-green">
                        {CONFIDENCE_LABELS[candidate.confidence]}
                      </span>
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
                  <p
                    className={`text-[11px] font-semibold ${
                      candidate.pathoroFit === "weak_informational"
                        ? "text-red-700"
                        : candidate.pathoroFit === "consumer_activity"
                          ? "text-ink-faint"
                          : "text-green"
                    }`}
                  >
                    {candidate.fitReason}
                  </p>
                  <p className="text-[11.5px] leading-snug text-ink-faint">
                    <span className="font-semibold text-ink-soft">
                      Why this may be a real opportunity —{" "}
                    </span>
                    {candidate.whyThisMayFit}
                  </p>
                  <p className="text-[11.5px] leading-snug text-ink-faint">
                    <span className="font-semibold text-ink-soft">What leverage it may create — </span>
                    {candidate.leverageHint}
                  </p>
                  <p className="text-[11.5px] leading-snug text-ink-faint">
                    <span className="font-semibold text-ink-soft">What next step it suggests — </span>
                    {candidate.suggestedNextStep}
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
