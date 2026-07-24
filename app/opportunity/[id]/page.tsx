"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import { TopoLines } from "@/components/TopoLines";
import { RoutePlanningHeader } from "@/components/route/RoutePlanningHeader";
import { routes } from "@/lib/routes";
import { mergeWithSeed } from "@/lib/reviewedOpportunities";
import { useReviewedOpportunities } from "@/lib/useReviewedOpportunities";
import { OPPORTUNITY_STATUS_LABELS } from "@/lib/opportunitySchema";

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const { reviewed } = useReviewedOpportunities();
  const opportunity = mergeWithSeed(reviewed).find((o) => o.id === params.id);
  const route = opportunity ? routes.find((r) => r.id === opportunity.routeId) : null;

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

        {opportunity ? (
          <div className="shadow-card mt-4 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-6 py-6">
            <span className="w-fit rounded-full border border-line/70 px-2 py-0.5 text-[10px] font-medium text-ink-faint">
              {OPPORTUNITY_STATUS_LABELS[opportunity.status]}
            </span>
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

            <div className="mt-5 flex flex-col gap-3 border-t border-line/70 pt-5">
              {route && (
                <div>
                  <span className="block text-[11px] font-semibold text-ink-faint">
                    Route fit
                  </span>
                  <span className="mt-0.5 block text-[13px] text-ink">{route.title}</span>
                </div>
              )}
              {opportunity.pathItSupports && (
                <div>
                  <span className="block text-[11px] font-semibold text-ink-faint">
                    Why this appeared
                  </span>
                  <span className="mt-0.5 block text-[13px] text-ink">
                    Supports: {opportunity.pathItSupports}
                    {opportunity.whoItIsFor ? ` · For: ${opportunity.whoItIsFor}` : ""}
                  </span>
                </div>
              )}
              {opportunity.whatItMayOpenNext && (
                <div>
                  <span className="block text-[11px] font-semibold text-ink-faint">
                    What it may open next
                  </span>
                  <span className="mt-0.5 block text-[13px] text-ink">
                    {opportunity.whatItMayOpenNext}
                  </span>
                </div>
              )}
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
              Local prototype only — reviewed opportunities are stored in
              this browser&rsquo;s localStorage, not a database.
            </p>
          </div>
        ) : (
          <div className="shadow-card mt-4 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-6 py-6">
            <h1 className="font-serif text-[19px] leading-tight text-ink">
              Opportunity not found
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              This opportunity was saved locally in another browser/session
              or is no longer available.
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
