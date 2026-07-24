"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { getOpportunitiesForRoute, type RouteOpportunity } from "@/lib/opportunities";
import { useDirectionAnswers } from "@/lib/useDirectionAnswers";

function OpportunityTile({
  opportunity,
  location,
}: {
  opportunity: RouteOpportunity;
  location: string;
}) {
  const isClickable = Boolean(opportunity.href);
  const className =
    "flex flex-col rounded-2xl border border-line/70 bg-cream-field px-3.5 py-3.5 text-left transition" +
    (isClickable ? " hover:border-green/40 hover:bg-cream-card" : "");

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="block text-[13px] font-semibold text-ink">
          {opportunity.title}
        </span>
        {isClickable ? (
          <span className="shrink-0 rounded-full bg-green-soft px-2 py-0.5 text-[10px] font-semibold text-green">
            Open
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-line/70 px-2 py-0.5 text-[10px] font-medium text-ink-faint">
            Preview
          </span>
        )}
      </div>
      <span className="mt-1 block text-[11px] font-medium text-ink-faint">
        {opportunity.type}
      </span>
      <p className="mt-1.5 text-[12px] leading-snug text-ink-soft">
        {opportunity.purpose}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-line/70 bg-cream-card px-2 py-0.5 text-[10.5px] text-ink-faint">
          Near {location}
        </span>
        {opportunity.effortTags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-line/70 bg-cream-card px-2 py-0.5 text-[10.5px] text-ink-faint"
          >
            {tag}
          </span>
        ))}
      </div>
    </>
  );

  if (isClickable) {
    return (
      <Link href={opportunity.href!} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

function ComingSoonTile() {
  return (
    <div className="flex flex-col rounded-2xl border border-dashed border-line/70 bg-cream-field/60 px-3.5 py-3.5 text-left">
      <div className="flex items-start justify-between gap-2">
        <span className="block text-[13px] font-semibold text-ink-soft">
          More openings for this route
        </span>
        <span className="flex shrink-0 items-center gap-1 rounded-full border border-line/70 px-2 py-0.5 text-[10px] font-medium text-ink-faint">
          <Clock className="h-2.5 w-2.5" strokeWidth={1.75} />
          Coming soon
        </span>
      </div>
      <p className="mt-1.5 text-[12px] leading-snug text-ink-faint">
        Pathoro is adding more local openings for this route.
      </p>
    </div>
  );
}

export function OpportunitiesFromRoute({ routeId }: { routeId: string }) {
  const { answers } = useDirectionAnswers();
  const opportunities = getOpportunitiesForRoute(routeId);

  return (
    <div className="shadow-card mt-6 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
      <h3 className="text-[15px] font-semibold text-ink">
        Opportunities from this route
      </h3>
      <p className="mt-0.5 text-[12px] text-ink-faint">
        Local openings that match this route, near {answers.location}.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {opportunities.map((opportunity) => (
          <OpportunityTile
            key={opportunity.id}
            opportunity={opportunity}
            location={answers.location}
          />
        ))}
        <ComingSoonTile />
      </div>
    </div>
  );
}
