"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import { TopoLines } from "@/components/TopoLines";
import { RoutePlanningHeader } from "@/components/route/RoutePlanningHeader";
import { TrailMarkersSection } from "@/components/route/TrailMarkersSection";
import { RoleDialogueCard } from "@/components/trailmap/RoleDialogueCard";
import { FindSomeoneAheadCard } from "@/components/opportunity/FindSomeoneAheadCard";
import { routes } from "@/lib/routes";
import { routeOpportunities } from "@/lib/opportunities";
import { useReviewedOpportunities } from "@/lib/useReviewedOpportunities";
import type { Opportunity } from "@/lib/opportunitySchema";
import {
  getNextActionSummary,
  getWhatAccessThisCreates,
  getWhyThisAppeared,
} from "@/lib/opportunityNarrative";
import { computeTrustLabel, getHiddenRequirementsNote, TRUST_LABEL_CLASS } from "@/lib/trustLabels";

/**
 * Dynamic opportunity detail page — renders any opportunity by id/slug
 * from Supabase (falling back to seed data, then a local dev fallback),
 * not just /opportunity/plant-based-cooking-class. Content is organized
 * around the "Opportunity Dialogue" questions (v0.32): is this real, is
 * it reachable, what does it open, what's hidden, who can help, what's
 * the next move — rather than reading like a generic event listing.
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

        {stillResolving ? (
          <div className="shadow-card mt-4 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-6 py-6">
            <p className="text-[13px] text-ink-faint">Loading opportunity…</p>
          </div>
        ) : opportunity ? (
          <>
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-line/70 bg-cream-field px-4 py-3">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green" strokeWidth={1.75} />
              <p className="text-[11.5px] leading-relaxed text-ink-soft">
                Pathoro doesn&rsquo;t just list this — it helps you tell whether
                it&rsquo;s real, reachable from where you are, and worth your time.
              </p>
            </div>

            <div className="shadow-card mt-4 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-6 py-6">
              <div className="flex flex-wrap items-center gap-2">
                {trustLabel && (
                  <span
                    className={`w-fit rounded-full border px-2 py-0.5 text-[10px] font-medium ${TRUST_LABEL_CLASS[trustLabel]}`}
                  >
                    {trustLabel}
                  </span>
                )}
                {opportunity.opportunityType && (
                  <span className="w-fit rounded-full border border-line/70 px-2 py-0.5 text-[10px] font-medium text-ink-faint">
                    {opportunity.opportunityType}
                  </span>
                )}
                {route && (
                  <span className="w-fit rounded-full border border-green/40 bg-green-soft px-2 py-0.5 text-[10px] font-medium text-green">
                    Route stop on {route.title}
                  </span>
                )}
              </div>
              <h1 className="mt-2.5 font-serif text-[24px] leading-tight text-ink">
                {opportunity.title}
              </h1>
              <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-ink-faint">
                <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                {opportunity.sourceName} · {opportunity.locationLabel || "Location TBD"}
                {opportunity.dateLabel ? ` · ${opportunity.dateLabel}` : ""}
                {opportunity.costLabel ? ` · ${opportunity.costLabel}` : ""}
              </p>

              {opportunity.description && (
                <p className="mt-4 text-[13.5px] leading-relaxed text-ink-soft">
                  {opportunity.description}
                </p>
              )}

              <div className="mt-5 flex flex-col gap-4 border-t border-line/70 pt-5">
                <div>
                  <span className="block text-[11px] font-semibold text-ink-faint">
                    Is this reachable from where you are?
                  </span>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink">
                    {getWhyThisAppeared(opportunity)}
                  </p>
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-ink-faint">
                    What path this opens
                  </span>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink">
                    {getWhatAccessThisCreates(opportunity)}
                    {opportunity.whatItMayOpenNext ? ` It could also open: ${opportunity.whatItMayOpenNext.toLowerCase()}.` : ""}
                  </p>
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-ink-faint">
                    What hidden requirements matter
                  </span>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink">
                    {getHiddenRequirementsNote(opportunity)}
                  </p>
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-ink-faint">
                    What to do next
                  </span>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink">
                    {getNextActionSummary(opportunity)}
                  </p>
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-ink-faint">
                    Source &amp; trust
                  </span>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[13px] leading-relaxed text-ink">
                    {opportunity.sourceName}
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                        opportunity.trustLevel === "High"
                          ? "border-green/40 bg-green-soft text-green"
                          : opportunity.trustLevel === "Medium"
                            ? "border-line/70 text-ink-soft"
                            : "border-line/70 text-ink-faint"
                      }`}
                    >
                      {opportunity.trustLevel} trust
                    </span>
                  </p>
                </div>
              </div>

              {opportunity.sourceUrl && (
                <a
                  href={opportunity.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 flex items-center justify-center gap-1.5 rounded-full bg-green py-2.75 text-[13.5px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50"
                >
                  Open original source
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                </a>
              )}

              <p className="mt-4 text-[11px] text-ink-faint">
                {dbOpportunity
                  ? "Saved to the database."
                  : seedOpportunity
                    ? "Example opportunity — illustrative, not a live database record."
                    : "This access point isn't saved to Pathoro's database yet — it's stored locally in this browser."}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <FindSomeoneAheadCard
                opportunityId={opportunity.id}
                opportunityTitle={opportunity.title}
                opportunityType={opportunity.opportunityType}
              />
              <RoleDialogueCard />
            </div>

            <TrailMarkersSection
              opportunityId={opportunity.id}
              routeId={opportunity.routeId}
              city={opportunity.city}
            />
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
