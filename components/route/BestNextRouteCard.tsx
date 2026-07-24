"use client";

import Link from "next/link";
import { ArrowRight, Clock, Heart, Lock, Sparkles, Star } from "lucide-react";
import { routes } from "@/lib/routes";
import { getOpportunityDetailHref } from "@/lib/opportunitySchema";
import { mergeWithSeed, filterForRoute } from "@/lib/reviewedOpportunities";
import { useReviewedOpportunities } from "@/lib/useReviewedOpportunities";
import type { DirectionAnswers } from "@/lib/direction";
import { OpportunityTile } from "@/components/route/OpportunityTile";

type BestNextRouteCardProps = {
  selectedRouteId: string;
  suggestedRouteId: string;
  answers: DirectionAnswers;
  onExploreOthers: () => void;
};

export function BestNextRouteCard({
  selectedRouteId,
  suggestedRouteId,
  answers,
  onExploreOthers,
}: BestNextRouteCardProps) {
  const selected = routes.find((r) => r.id === selectedRouteId) ?? routes[0];
  const isSuggested = selectedRouteId === suggestedRouteId;
  const { reviewed } = useReviewedOpportunities();
  const opportunitiesForRoute = filterForRoute(mergeWithSeed(reviewed), selectedRouteId, answers.location);
  const opportunity = opportunitiesForRoute[0];
  const moreCount = Math.max(opportunitiesForRoute.length - 1, 0);
  const detailHref = opportunity ? getOpportunityDetailHref(opportunity) : undefined;

  const personalSentence = `You said “${answers.reachable}” would make this more reachable, so Pathoro opened ${selected.title} first.`;

  return (
    <div
      id="best-next-route"
      className="shadow-card scroll-mt-6 mt-6 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-soft">
          <Star className="h-4 w-4 fill-green text-green" />
        </span>
        <span className="text-[15px] font-semibold text-ink">Best next route</span>
      </div>

      <h3 className="mt-3 text-[17px] font-semibold text-ink">{selected.title}</h3>

      {isSuggested && (
        <div className="relative mt-2.5 overflow-hidden rounded-2xl border border-green/45 bg-green-soft/60 px-3.5 py-3 shadow-[0_0_0_3px_rgba(84,120,32,0.06)]">
          <div className="flex items-start gap-2.5">
            <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-green/25 blur-[7px]" />
              <Sparkles className="relative h-4 w-4 text-green" strokeWidth={1.75} />
            </span>
            <span>
              <span className="block text-[12px] font-semibold text-green">
                Suggested from your answers
              </span>
              <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-soft">
                {personalSentence}
              </span>
            </span>
          </div>
        </div>
      )}

      <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
        {selected.description}
      </p>

      <div className="mt-4 flex items-start gap-2.5 border-t border-line/70 pt-4">
        <Heart className="mt-0.5 h-4 w-4 shrink-0 text-green" strokeWidth={1.75} />
        <span>
          <span className="block text-[13px] font-semibold text-ink">
            Why this route
          </span>
          <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-soft">
            {selected.why}
          </span>
        </span>
      </div>

      <div className="mt-4 border-t border-line/70 pt-4">
        <span className="block text-[13px] font-semibold text-ink">Route steps</span>
        <ol className="mt-2 flex flex-col gap-2">
          {selected.steps.map((step, i) => (
            <li key={i} className="flex items-center gap-2.5 text-[12.5px] text-ink-soft">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-soft text-[10px] font-semibold text-green">
                {i + 1}
              </span>
              {step.label}
            </li>
          ))}
        </ol>
      </div>

      {opportunity && (
        <div className="mt-4 border-t border-line/70 pt-4">
          <span className="mb-2 block text-[13px] font-semibold text-ink">
            Local opportunity
          </span>
          <OpportunityTile opportunity={opportunity} location={answers.location} />
          {moreCount > 0 && (
            <p className="mt-2 text-[11px] text-ink-faint">
              +{moreCount} more local {moreCount === 1 ? "opportunity" : "opportunities"} for this route
            </p>
          )}
        </div>
      )}

      {detailHref ? (
        <Link
          href={detailHref}
          className="mt-5 flex items-center justify-center gap-2 rounded-full bg-green py-2.75 text-[13.5px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50 focus-visible:ring-offset-2"
        >
          Take this step
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <>
          <button
            type="button"
            disabled
            className="mt-5 flex cursor-not-allowed items-center justify-center gap-2 rounded-full border border-line/70 bg-cream-field py-2.75 text-[13.5px] font-medium text-ink-faint"
          >
            <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
            Opportunity preview coming soon
          </button>
          <Link
            href="/opportunity/plant-based-cooking-class"
            className="mt-2 flex items-center justify-center gap-2 rounded-full border border-line/70 py-2.75 text-[13.5px] font-medium text-ink outline-none transition hover:border-ink-faint/40 focus-visible:ring-2 focus-visible:ring-green/50 focus-visible:ring-offset-2"
          >
            View sample opportunity detail
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </>
      )}
      <button
        type="button"
        onClick={onExploreOthers}
        className="mt-2 flex items-center justify-center gap-2 rounded-full border border-line/70 py-2.75 text-[13.5px] font-medium text-ink outline-none transition hover:border-ink-faint/40 focus-visible:ring-2 focus-visible:ring-green/50 focus-visible:ring-offset-2"
      >
        Explore other routes
        <ArrowRight className="h-3.5 w-3.5" />
      </button>

      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-snug text-ink-faint">
        <Lock className="mt-0.5 h-3 w-3 shrink-0" />
        Your progress is private and only visible to you.
      </p>
    </div>
  );
}
