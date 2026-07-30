"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { TopoLines } from "@/components/TopoLines";
import { RoutePlanningHeader } from "@/components/route/RoutePlanningHeader";
import { TrailMarkersSection } from "@/components/route/TrailMarkersSection";
import { OpportunityJourneySidebar } from "@/components/opportunity/OpportunityJourneySidebar";
import { OpportunityDetailCard } from "@/components/opportunity/OpportunityDetailCard";
import { OpportunityGuidancePanel } from "@/components/opportunity/OpportunityGuidancePanel";
import { routes } from "@/lib/routes";
import { routeOpportunities } from "@/lib/opportunities";
import { useReviewedOpportunities } from "@/lib/useReviewedOpportunities";
import type { Opportunity } from "@/lib/opportunitySchema";
import { getRelatedGoalText } from "@/lib/opportunityNarrative";
import { computeTrustLabel } from "@/lib/trustLabels";
import { mapGoalToTrailMapGoal } from "@/lib/goalSpecificity";
import { useScrollTopOnMount } from "@/lib/useScrollTopOnMount";

/**
 * Dynamic opportunity detail page — renders any opportunity by id/slug
 * from Supabase (falling back to seed data, then a local dev fallback),
 * not just /opportunity/plant-based-cooking-class. The rich three-column
 * layout (journey sidebar, detail card, guidance panel — v0.34 Part 5)
 * is fully data-driven from whichever Opportunity resolves, and every
 * cross-page link carries the opportunity's related goal (pathItSupports)
 * so Route Planning and the Trail Map pick up the right context.
 */
export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  // Keyed by id so React remounts (and resets fetch state) on navigation
  // between two different opportunity detail pages, instead of needing to
  // reset state imperatively inside an effect.
  return <OpportunityDetailContent key={params.id} id={params.id} />;
}

function OpportunityDetailContent({ id }: { id: string }) {
  const { reviewed } = useReviewedOpportunities();
  const [dbOpportunity, setDbOpportunity] = useState<Opportunity | null>(null);
  const [dbLoading, setDbLoading] = useState(true);

  // See lib/useScrollTopOnMount.ts — landing here mid-scroll (e.g. from a
  // Link deep in Best Next Route's action block) could otherwise leave
  // the browser stranded partway down a smooth-scroll animation instead
  // of at the top.
  useScrollTopOnMount();

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/opportunities/${id}`)
      .then((res) => res.json())
      .then((data: { ok: true; opportunity: Opportunity } | { ok: false; error: string }) => {
        if (cancelled) return;
        setDbOpportunity(data.ok ? data.opportunity : null);
      })
      .catch(() => {
        if (!cancelled) setDbOpportunity(null);
      })
      .finally(() => {
        if (!cancelled) setDbLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const seedOpportunity = routeOpportunities.find((o) => o.id === id);
  const localOpportunity = reviewed.find((o) => o.id === id);

  // Priority: database (live) -> seed data -> localStorage dev fallback.
  // Wait for the database fetch to settle before falling through, so a
  // slow network doesn't briefly flash "not found" for a real DB opportunity.
  const opportunity = dbOpportunity ?? seedOpportunity ?? (dbLoading ? undefined : localOpportunity);
  const stillResolving = dbLoading && !seedOpportunity;
  const route = opportunity ? routes.find((r) => r.id === opportunity.routeId) : null;
  const trustLabel = opportunity ? computeTrustLabel(opportunity) : null;

  const relatedGoal = opportunity ? getRelatedGoalText(opportunity) : "";
  const routePlanningHref = relatedGoal ? `/route-planning?goal=${encodeURIComponent(relatedGoal)}` : "/route-planning";
  const trailMapGoalId = relatedGoal ? mapGoalToTrailMapGoal(relatedGoal) : null;
  const trailHref = trailMapGoalId
    ? `/trail-map?goal=${trailMapGoalId}`
    : relatedGoal
      ? `/trail-map?goal=${encodeURIComponent(relatedGoal)}`
      : "/trail-map";
  const scoutHref = `${routePlanningHref}#scout-request`;

  const relatedOpenings = opportunity
    ? routeOpportunities
        .filter((o) => o.routeId === opportunity.routeId && o.id !== opportunity.id)
        .slice(0, 3)
    : [];

  return (
    <div className="relative min-h-screen">
      <TopoLines
        className="pointer-events-none absolute inset-0 h-full w-full text-ink"
        count={20}
        opacityRange={[0.015, 0.035]}
      />
      <div className="relative border-b border-line/70">
        <RoutePlanningHeader mode="compass" compassHref={routePlanningHref} trailHref={trailHref} />
      </div>

      <main className="relative mx-auto w-full max-w-[1500px] px-6 py-6 sm:px-10">
        <Link
          href="/route-planning"
          className="flex w-fit items-center gap-1.5 text-[13px] font-medium text-ink-soft outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-green/50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to route planning
        </Link>

        {stillResolving ? (
          <div className="shadow-card mt-4 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-6 py-6">
            <p className="text-[13px] text-ink-faint">Loading opportunity…</p>
          </div>
        ) : opportunity && trustLabel ? (
          <>
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-line/70 bg-cream-field px-4 py-3">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green" strokeWidth={1.75} />
              <p className="text-[11.5px] leading-relaxed text-ink-soft">
                Pathoro doesn&rsquo;t just list this — it helps you tell whether
                it&rsquo;s real, reachable from where you are, and worth your time.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
              <OpportunityJourneySidebar
                relatedGoal={relatedGoal}
                route={route}
                trailHref={trailHref}
                routePlanningHref={routePlanningHref}
              />

              <div className="flex min-w-0 flex-col gap-6">
                <OpportunityDetailCard
                  opportunity={opportunity}
                  route={route}
                  trustLabel={trustLabel}
                  relatedOpenings={relatedOpenings}
                  scoutHref={scoutHref}
                />
                <TrailMarkersSection
                  opportunityId={opportunity.id}
                  routeId={opportunity.routeId}
                  city={opportunity.city}
                />
              </div>

              <OpportunityGuidancePanel
                opportunity={opportunity}
                route={route}
                routePlanningHref={routePlanningHref}
                trailHref={trailHref}
              />
            </div>

            <p className="mt-4 text-[11px] text-ink-faint">
              {dbOpportunity
                ? "Saved to the database."
                : seedOpportunity
                  ? "Example opportunity — illustrative, not a live database record."
                  : "This access point isn't saved to Pathoro's database yet — it's stored locally in this browser."}
            </p>
          </>
        ) : (
          <div className="shadow-card mt-4 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-6 py-6">
            <h1 className="font-serif text-[19px] leading-tight text-ink">
              Opportunity not found
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              This opportunity was saved locally in another browser/session,
              never existed, or is no longer available.
            </p>
            <Link
              href="/route-planning"
              className="mt-5 flex items-center justify-center gap-2 rounded-full bg-green py-2.5 text-[13.5px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50"
            >
              Back to route planning
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
