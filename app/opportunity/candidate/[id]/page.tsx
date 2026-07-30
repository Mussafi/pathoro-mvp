"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, ExternalLink, TriangleAlert } from "lucide-react";
import { TopoLines } from "@/components/TopoLines";
import { RoutePlanningHeader } from "@/components/route/RoutePlanningHeader";
import { TakeOpportunityModal } from "@/components/opportunity/TakeOpportunityModal";
import { FindSomeoneAheadCard } from "@/components/opportunity/FindSomeoneAheadCard";
import { routes } from "@/lib/routes";
import { TRUST_LABEL_CLASS, CANDIDATE_TRUST_LABEL } from "@/lib/trustLabels";
import { GOAL_FIT_BADGE_CLASS, GOAL_FIT_COPY, GOAL_FIT_LABELS, computeGoalFit } from "@/lib/goalFitLabel";
import type { ScoutCandidateRecord } from "@/lib/scoutCandidatesDb";

/**
 * Detail page for a not-yet-promoted scout candidate — the "Take this
 * opportunity" destination for BestNextRouteCard's real (source-backed)
 * results, so a real candidate gets a real internal page instead of only
 * an external link or a card fragment (see v0.38 "Surface real
 * opportunity results"). Once an admin promotes a candidate it becomes a
 * real Opportunity and gets its own /opportunity/[id] page instead — this
 * route is only ever for the unreviewed, pre-promotion state.
 */
export default function CandidateDetailPage() {
  const params = useParams<{ id: string }>();
  return <CandidateDetailContent key={params.id} id={params.id} />;
}

type CandidateResponse =
  | { ok: true; candidate: ScoutCandidateRecord; routeId: string; pathGoal: string; city: string }
  | { ok: false; error: string };

function CandidateDetailContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const [data, setData] = useState<CandidateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [takeOpen, setTakeOpen] = useState(searchParams.get("openTake") === "1");

  // See the matching comment in app/opportunity/[id]/page.tsx — same fix,
  // same reason: don't inherit whatever scroll offset the previous page
  // (usually Best Next Route, well down the page) was at.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/scout-candidates/${id}`)
      .then((res) => res.json())
      .then((result: CandidateResponse) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setData({ ok: false, error: "Something went wrong." });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const route = data?.ok ? routes.find((r) => r.id === data.routeId) : undefined;
  const scoutHref = data?.ok
    ? `/route-planning?goal=${encodeURIComponent(data.pathGoal)}#scout-request`
    : "/route-planning#scout-request";
  const goalFit = data?.ok && data.pathGoal ? computeGoalFit(data.candidate, data.pathGoal) : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream">
      <TopoLines />
      <div className="relative">
        <RoutePlanningHeader />
        <main className="mx-auto max-w-[720px] px-6 pb-16 sm:px-10">
          <Link
            href={data?.ok ? `/route-planning?goal=${encodeURIComponent(data.pathGoal)}` : "/route-planning"}
            className="flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-ink-soft outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-green/50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to route planning
          </Link>

          {loading && (
            <p className="mt-8 text-[13px] text-ink-faint">Loading this candidate…</p>
          )}

          {!loading && (!data || !data.ok) && (
            <div className="shadow-card mt-6 rounded-[26px] border border-line/70 bg-cream-card px-5 py-6">
              <p className="text-[14px] font-semibold text-ink">This candidate isn&rsquo;t available anymore.</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
                It may have been reviewed and removed, or the link is out of date.
              </p>
              <Link
                href="/route-planning"
                className="mt-3.5 flex w-fit items-center gap-1.5 rounded-full bg-green px-4 py-2 text-[12.5px] font-medium text-cream shadow-sm transition hover:bg-green-dark"
              >
                Back to route planning
              </Link>
            </div>
          )}

          {!loading && data?.ok && (
            <div className="mt-6 flex flex-col gap-5">
              <div className="shadow-card flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-6">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium ${TRUST_LABEL_CLASS[CANDIDATE_TRUST_LABEL]}`}
                  >
                    {CANDIDATE_TRUST_LABEL}
                  </span>
                  {goalFit && (
                    <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-medium ${GOAL_FIT_BADGE_CLASS[goalFit]}`}>
                      {GOAL_FIT_LABELS[goalFit]}
                    </span>
                  )}
                  {data.candidate.opportunityType && (
                    <span className="rounded-full border border-line/70 px-2.5 py-0.5 text-[10.5px] font-medium text-ink-faint">
                      {data.candidate.opportunityType}
                    </span>
                  )}
                </div>
                {goalFit && (goalFit === "adjacent" || goalFit === "weak") && (
                  <p className="mt-2 text-[11.5px] leading-relaxed text-ink-faint">
                    <span className="font-semibold text-ink-soft">{GOAL_FIT_LABELS[goalFit]} — </span>
                    {GOAL_FIT_COPY[goalFit]}
                  </p>
                )}

                <h1 className="mt-3 font-serif text-[22px] leading-tight text-ink">
                  {data.candidate.title}
                </h1>
                <p className="mt-1 text-[12.5px] text-ink-faint">
                  {data.candidate.sourceName}
                  {route ? ` · ${route.title}` : ""}
                  {data.pathGoal ? ` · ${data.pathGoal}` : ""}
                </p>

                {data.candidate.snippet && (
                  <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                    {data.candidate.snippet}
                  </p>
                )}

                {data.candidate.whyThisMayFit && (
                  <p className="mt-3 text-[12px] leading-relaxed text-ink-faint">
                    <span className="font-semibold text-ink-soft">Why Pathoro thinks this fits — </span>
                    {data.candidate.whyThisMayFit}
                  </p>
                )}

                <div className="mt-3.5 flex items-start gap-2 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-3.5 py-3 text-amber-800">
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                  <p className="text-[11.5px] leading-relaxed">
                    Pathoro found this from a real source but hasn&rsquo;t reviewed it. Review the
                    source before acting on it.
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTakeOpen(true)}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-green px-5 py-2.5 text-[13.5px] font-semibold text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50"
                  >
                    Take this opportunity
                  </button>
                  <a
                    href={data.candidate.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft underline-offset-2 outline-none transition hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-green/50"
                  >
                    View source
                    <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                  </a>
                  <Link
                    href={scoutHref}
                    className="text-[12.5px] font-medium text-ink-soft underline-offset-2 outline-none transition hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-green/50"
                  >
                    Scout similar access points
                  </Link>
                </div>
              </div>

              <FindSomeoneAheadCard
                opportunityId={data.candidate.id}
                opportunityTitle={data.candidate.title}
                opportunityType={data.candidate.opportunityType}
              />
            </div>
          )}
        </main>
      </div>

      {takeOpen && data?.ok && (
        <TakeOpportunityModal
          opportunityId={data.candidate.id}
          opportunitySlug={data.candidate.id}
          opportunityTitle={data.candidate.title}
          goal={data.pathGoal}
          routeId={data.routeId}
          routeTitle={route?.title ?? ""}
          sourceUrl={data.candidate.url}
          trustLabel={CANDIDATE_TRUST_LABEL}
          opportunityType={data.candidate.opportunityType}
          onClose={() => setTakeOpen(false)}
        />
      )}
    </div>
  );
}
