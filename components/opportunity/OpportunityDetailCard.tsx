"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Opportunity } from "@/lib/opportunitySchema";
import type { Route } from "@/lib/routes";
import {
  getNextActionSummary,
  getRelatedGoalText,
  getWhatAccessThisCreates,
  getWhyThisAppeared,
  isLikelyConsumerActivity,
} from "@/lib/opportunityNarrative";
import { getHiddenRequirementsNote, TRUST_LABEL_CLASS, type TrustLabel } from "@/lib/trustLabels";
import { TakeOpportunityModal } from "@/components/opportunity/TakeOpportunityModal";

const EFFORT_POSITION: Record<string, number> = { Low: 18, Medium: 50, High: 82 };
const TRUST_DOT_COUNT: Record<Opportunity["trustLevel"], number> = { Low: 2, Medium: 3, High: 5 };

/** Real photography only exists for the one opportunity it was actually
 * shot for. This is a small data lookup, not special-cased rendering —
 * OpportunityImageCard below treats every id identically and falls back
 * to an honest illustrative placeholder for everything not in this map,
 * so adding a real photo for any future opportunity is just adding a row. */
const OPPORTUNITY_IMAGE_BY_ID: Record<string, string> = {
  "plant-based-cooking-class": "/images/cooking-class-hero.jpg",
};

function OpportunityImageCard({ opportunity, route }: { opportunity: Opportunity; route: Route | null | undefined }) {
  const realImage = OPPORTUNITY_IMAGE_BY_ID[opportunity.id];
  const RouteIcon = route?.icon;

  return (
    <div className="shadow-card mt-5 overflow-hidden rounded-2xl border border-line/70">
      {realImage ? (
        <div className="relative h-[220px] w-full">
          <Image
            src={realImage}
            alt={opportunity.title}
            fill
            sizes="(min-width: 1024px) 700px, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-[220px] w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-green-soft to-cream-field">
          {RouteIcon && <RouteIcon className="h-9 w-9 text-green" strokeWidth={1.5} />}
          <span className="px-6 text-center text-[11px] leading-relaxed text-ink-faint">
            Illustrative only — not a photo of this specific opportunity
          </span>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-cream-card px-4 py-3">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-faint" strokeWidth={1.75} />
          <span>
            <span className="block text-[12.5px] font-semibold text-ink">
              {opportunity.locationLabel || "Location TBD"}
            </span>
            {opportunity.hostName && (
              <span className="block text-[11.5px] text-ink-faint">{opportunity.hostName}</span>
            )}
          </span>
        </div>
        <span>
          <span className="block text-right text-[11px] text-ink-faint">Source</span>
          <span className="block text-[12px] font-medium text-ink">{opportunity.sourceName}</span>
        </span>
      </div>
    </div>
  );
}

/**
 * Center column of the rich opportunity detail layout (v0.34 Part 5) —
 * restores the original third-page's card structure (effort level, what
 * this may open next, tradeoffs, trust & source, related openings)
 * dynamically from whatever Opportunity was resolved, instead of the
 * flatter single-column write-up it had been reduced to.
 */
export function OpportunityDetailCard({
  opportunity,
  route,
  trustLabel,
  relatedOpenings,
  scoutHref,
}: {
  opportunity: Opportunity;
  route: Route | null | undefined;
  trustLabel: TrustLabel;
  relatedOpenings: Opportunity[];
  scoutHref: string;
}) {
  const [saved, setSaved] = useState(false);
  // Lets an external "Take this opportunity" link (e.g. Best Next Route's
  // access-point card) land here with the action already focused, instead
  // of just linking to the page and leaving the user to find the button.
  // Lazy-initialized (not an effect) so there's no flash of the closed
  // modal before it opens — window is undefined during SSR, so this
  // always reads false there and picks up the real value on first client render.
  const [takeModalOpen, setTakeModalOpen] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("openTake") === "1"
  );
  const consumerActivity = isLikelyConsumerActivity(opportunity);
  const hiddenRequirements = getHiddenRequirementsNote(opportunity);

  return (
    <div className="shadow-card flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-6 py-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${TRUST_LABEL_CLASS[trustLabel]}`}>
          {trustLabel}
        </span>
        {opportunity.opportunityType && (
          <span className="rounded-full border border-line/70 px-2 py-0.5 text-[10px] font-medium text-ink-faint">
            {opportunity.opportunityType}
          </span>
        )}
        {route && (
          <span className="rounded-full border border-green/40 bg-green-soft px-2 py-0.5 text-[10px] font-medium text-green">
            Route stop on {route.title}
          </span>
        )}
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            consumerActivity
              ? "border border-line/70 text-ink-faint"
              : "border border-green/40 bg-green-soft/60 text-green"
          }`}
        >
          {consumerActivity ? "Consumer activity" : "Real opportunity"}
        </span>
      </div>

      <h1 className="mt-2.5 font-serif text-[25px] leading-tight text-ink">{opportunity.title}</h1>
      <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-ink-faint">
        <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        {opportunity.sourceName} · {opportunity.locationLabel || "Location TBD"}
        {opportunity.dateLabel ? ` · ${opportunity.dateLabel}` : ""}
        {opportunity.costLabel ? ` · ${opportunity.costLabel}` : ""}
      </p>
      {opportunity.description && (
        <p className="mt-4 text-[13.5px] leading-relaxed text-ink-soft">{opportunity.description}</p>
      )}

      <OpportunityImageCard opportunity={opportunity} route={route} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green" strokeWidth={1.75} />
              <span className="text-[13.5px] font-semibold text-ink">
                Is this reachable from where you are?
              </span>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
              {getWhyThisAppeared(opportunity)}
            </p>
          </div>
          <div className="border-t border-line/70 pt-5">
            <div className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-green" strokeWidth={1.75} />
              <span className="text-[13.5px] font-semibold text-ink">What path this opens</span>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
              {getWhatAccessThisCreates(opportunity)}
            </p>
          </div>
        </div>

        <div className="shadow-card flex flex-col gap-5 rounded-2xl border border-line/70 bg-cream-field/40 px-4 py-4">
          <div>
            <span className="text-[13px] font-semibold text-ink">Effort level</span>
            <div className="mt-2.5 flex items-center gap-2">
              <div className="relative h-1.5 flex-1 rounded-full bg-line/70">
                <span
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cream-card bg-green"
                  style={{ left: `${EFFORT_POSITION[opportunity.effortLevel]}%` }}
                />
              </div>
              <span className="text-[12px] font-medium text-ink-soft">{opportunity.effortLevel}</span>
            </div>
            <p className="mt-1.5 text-[12px] text-ink-faint">Friction: {opportunity.frictionLevel}</p>
          </div>

          {opportunity.whatItMayOpenNext && (
            <div className="border-t border-line/70 pt-4">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-amber-700" strokeWidth={1.75} />
                <span className="text-[13px] font-semibold text-ink">What this may open next</span>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
                {opportunity.whatItMayOpenNext}
              </p>
            </div>
          )}

          <div className="border-t border-line/70 pt-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green" strokeWidth={1.75} />
              <span className="text-[13px] font-semibold text-ink">Tradeoffs to consider</span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">{hiddenRequirements}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="shadow-card rounded-2xl border border-line/70 px-4 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green" strokeWidth={1.75} />
            <span className="text-[13px] font-semibold text-ink">Trust &amp; source</span>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[12px] text-ink-faint">{opportunity.trustLevel} trust</span>
            <span className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${
                    i < TRUST_DOT_COUNT[opportunity.trustLevel] ? "bg-green" : "bg-line"
                  }`}
                />
              ))}
            </span>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-ink-faint">
            Source: <span className="text-ink">{opportunity.sourceName}</span>
          </p>
        </div>

        <div className="shadow-card rounded-2xl border border-line/70 px-4 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-green" strokeWidth={1.75} />
            <span className="text-[13px] font-semibold text-ink">Related openings</span>
          </div>
          {relatedOpenings.length > 0 ? (
            <ul className="mt-2.5 flex flex-col gap-2.5">
              {relatedOpenings.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2">
                  <Link
                    href={`/opportunity/${item.id}`}
                    className="text-[12.5px] text-ink underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-green/50"
                  >
                    {item.title}
                  </Link>
                  <span
                    className={`shrink-0 text-[11.5px] font-medium ${
                      item.effortLevel === "Low" ? "text-green" : "text-amber-700"
                    }`}
                  >
                    {item.effortLevel} effort
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2.5 text-[12px] text-ink-faint">
              No other example openings on this route yet.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setTakeModalOpen(true)}
          className="flex items-center justify-center gap-1.5 rounded-full bg-green px-6 py-3 text-[13.5px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50"
        >
          Take this opportunity
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => setSaved((s) => !s)}
          className="flex items-center justify-center gap-1.5 rounded-full border border-line/70 px-5 py-3 text-[13.5px] font-medium text-ink outline-none transition hover:border-ink-faint/40 focus-visible:ring-2 focus-visible:ring-green/50"
        >
          {saved ? "Saved" : "Save for later"}
          <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-ink text-ink" : ""}`} strokeWidth={1.75} />
        </button>
        <Link
          href={scoutHref}
          className="text-[12.5px] font-medium text-ink-soft underline-offset-2 outline-none transition hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-green/50"
        >
          Scout similar access points
        </Link>
      </div>
      <p className="mt-3 text-[11px] leading-snug text-ink-faint">
        In this alpha, Pathoro helps you organize the next step and reviews requests manually.{" "}
        {getNextActionSummary(opportunity)}
      </p>

      {takeModalOpen && (
        <TakeOpportunityModal
          opportunityId={opportunity.id}
          opportunitySlug={opportunity.id}
          opportunityTitle={opportunity.title}
          goal={getRelatedGoalText(opportunity)}
          routeId={opportunity.routeId}
          routeTitle={route?.title ?? ""}
          sourceUrl={opportunity.sourceUrl}
          trustLabel={trustLabel}
          opportunityType={opportunity.opportunityType}
          onClose={() => setTakeModalOpen(false)}
        />
      )}
    </div>
  );
}
