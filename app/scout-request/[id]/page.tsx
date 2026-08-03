"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Compass, Sparkles, Star } from "lucide-react";
import { TopoLines } from "@/components/TopoLines";
import { RoutePlanningHeader } from "@/components/route/RoutePlanningHeader";
import { OpportunityTile } from "@/components/route/OpportunityTile";
import { ScoutCandidateCard } from "@/components/ScoutCandidateCard";
import { SiteFooter } from "@/components/SiteFooter";
import { routes } from "@/lib/routes";
import {
  SCOUT_REQUEST_STATUS_COPY,
  SCOUT_REQUEST_STATUS_LABELS,
  type PublicScoutRequest,
} from "@/lib/scoutRequestSchema";
import type { Opportunity } from "@/lib/opportunitySchema";
import type { ScoutCandidateRecord } from "@/lib/scoutCandidatesDb";

type FetchState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | {
      kind: "ready";
      request: PublicScoutRequest;
      opportunities: Opportunity[];
      candidates: ScoutCandidateRecord[];
    };

export default function ScoutRequestResultPage() {
  const params = useParams<{ id: string }>();
  return <ScoutRequestResultContent key={params.id} id={params.id} />;
}

function ScoutRequestResultContent({ id }: { id: string }) {
  const [state, setState] = useState<FetchState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    const token = new URLSearchParams(window.location.search).get("token");

    type FetchResult =
      | {
          ok: true;
          request: PublicScoutRequest;
          opportunities: Opportunity[];
          candidates: ScoutCandidateRecord[];
        }
      | { ok: false; error: string };

    const request: Promise<FetchResult> = token
      ? fetch(`/api/scout-requests/${id}/public?token=${encodeURIComponent(token)}`).then((res) =>
          res.json()
        )
      : Promise.resolve({ ok: false, error: "This link is missing its access token." });

    request
      .then((data) => {
        if (cancelled) return;
        if (!data.ok) {
          setState({ kind: "error", message: data.error });
          return;
        }
        setState({
          kind: "ready",
          request: data.request,
          opportunities: data.opportunities,
          candidates: data.candidates,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setState({ kind: "error", message: "Something went wrong loading this request." });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const route = state.kind === "ready" ? routes.find((r) => r.id === state.request.routeId) : null;

  return (
    <div className="relative min-h-screen">
      <TopoLines
        className="pointer-events-none absolute inset-0 h-full w-full text-ink"
        count={20}
        opacityRange={[0.015, 0.035]}
      />
      <div className="relative border-b border-line/70">
        <RoutePlanningHeader />
      </div>

      <main className="relative mx-auto w-full max-w-[640px] px-6 py-8 sm:px-10">
        <Link
          href="/route-planning"
          className="flex items-center gap-1.5 text-[13px] font-medium text-ink-soft outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-green/50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to route planning
        </Link>

        {state.kind === "loading" && (
          <div className="shadow-card mt-4 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-6 py-6">
            <p className="text-[13px] text-ink-faint">Loading your scout request…</p>
          </div>
        )}

        {state.kind === "error" && (
          <div className="shadow-card mt-4 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-6 py-6">
            <h1 className="font-serif text-[19px] leading-tight text-ink">
              Scout request not found
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              {state.message} Double check the link, or request a scout again from
              route planning.
            </p>
            <Link
              href="/route-planning"
              className="mt-5 flex items-center justify-center gap-2 rounded-full bg-green py-2.5 text-[13.5px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50"
            >
              Back to route planning
            </Link>
          </div>
        )}

        {state.kind === "ready" && (
          <div className="shadow-card mt-4 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-6 py-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-soft">
                <Compass className="h-4 w-4 text-green" strokeWidth={1.75} />
              </span>
              <span className="text-[15px] font-semibold text-ink">Scout request</span>
            </div>
            <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-green">
              Pathoro is scouting for real-world access points — not just
              events.
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
              Looking for people, places, resources, and openings that match
              this route.
            </p>

            <div className="mt-4 flex flex-col gap-4 border-t border-line/70 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-fit rounded-full border border-green/40 bg-green-soft px-2.5 py-0.5 text-[10.5px] font-semibold text-green">
                  {SCOUT_REQUEST_STATUS_LABELS[state.request.status]}
                </span>
                <span className="text-[12.5px] text-ink-soft">
                  {SCOUT_REQUEST_STATUS_COPY[state.request.status]}
                </span>
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-ink-faint">
                  Path / goal
                </span>
                <p className="mt-0.5 text-[13px] leading-relaxed text-ink">
                  {state.request.pathGoal}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] font-semibold text-ink-faint">
                    City
                  </span>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink">
                    {state.request.city}
                    {state.request.state ? `, ${state.request.state}` : ""}
                  </p>
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-ink-faint">
                    Route
                  </span>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink">
                    {route?.title ?? state.request.routeId}
                  </p>
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-ink-faint">
                  Requested
                </span>
                <p className="mt-0.5 text-[13px] leading-relaxed text-ink">
                  {new Date(state.request.createdAt).toLocaleString()}
                </p>
              </div>

              {state.request.resultSummary && (
                <div>
                  <span className="block text-[11px] font-semibold text-ink-faint">
                    From Pathoro
                  </span>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink">
                    {state.request.resultSummary}
                  </p>
                </div>
              )}
            </div>

            {state.opportunities.length > 0 && (
              <div className="mt-5 flex flex-col gap-3 border-t border-line/70 pt-5">
                <span className="text-[13px] font-semibold text-ink">
                  Live opportunities for this route
                </span>
                {state.opportunities.map((opportunity) => (
                  <OpportunityTile
                    key={opportunity.id}
                    opportunity={opportunity}
                    location={state.request.city}
                  />
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 border-t border-line/70 pt-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green" strokeWidth={1.75} />
                <span className="text-[13px] font-semibold text-ink">
                  AI-found candidates
                </span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-ink-faint">
                Pathoro already went looking and found these — real pages
                that may be worth a look, not guaranteed recommendations.
                Unreviewed, ranked strongest first.
              </p>

              {state.candidates.length === 0 ? (
                <p className="rounded-2xl border border-line/70 bg-cream-field px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-faint">
                  Pathoro is still looking. Refresh this page shortly.
                </p>
              ) : (
                <>
                  {/* Candidates arrive sorted strongest-fit-first, so the
                      first one is always the best current lead. */}
                  <div>
                    <span className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-green">
                      <Star className="h-3 w-3 fill-green text-green" />
                      Best current lead
                    </span>
                    <ScoutCandidateCard candidate={state.candidates[0]} goal={state.request.pathGoal} />
                  </div>
                  {state.candidates.length > 1 && (
                    <div className="flex flex-col gap-2.5">
                      <span className="text-[11.5px] font-semibold text-ink-soft">
                        Other AI-found candidates
                      </span>
                      {state.candidates.slice(1).map((candidate) => (
                        <ScoutCandidateCard key={candidate.id} candidate={candidate} goal={state.request.pathGoal} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <p className="mt-5 text-[11px] text-ink-faint">
              Save this link to check back — this page updates as Pathoro
              reviews your request.
            </p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
