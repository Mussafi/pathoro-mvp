import Link from "next/link";
import { Map as MapIcon, Mountain } from "lucide-react";
import type { Opportunity } from "@/lib/opportunitySchema";
import type { Route } from "@/lib/routes";
import { getNextActionSummary } from "@/lib/opportunityNarrative";
import { FindSomeoneAheadCard } from "@/components/opportunity/FindSomeoneAheadCard";
import { RoleDialogueCard } from "@/components/trailmap/RoleDialogueCard";

/**
 * Right column of the rich opportunity detail layout (v0.34 Part 5) —
 * route context plus "who can help you understand it?" (Path Guide) and
 * the Role/Opportunity Dialogue concept card, restoring the original
 * third page's GuidancePanel structure dynamically.
 */
export function OpportunityGuidancePanel({
  opportunity,
  route,
  routePlanningHref,
  trailHref,
}: {
  opportunity: Opportunity;
  route: Route | null | undefined;
  routePlanningHref: string;
  trailHref: string;
}) {
  return (
    <aside className="flex flex-col gap-5">
      {route && (
        <div className="shadow-card rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
          <span className="text-[15px] font-semibold text-ink">Route context</span>
          <p className="mt-2 text-[13.5px] font-semibold text-ink">{route.title}</p>
          <p className="text-[12px] leading-relaxed text-ink-faint">{route.why}</p>

          <Link
            href={routePlanningHref}
            className="shadow-card mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-line/70 bg-cream-card py-2.5 text-[13px] font-medium text-ink transition hover:border-ink-faint/40"
          >
            View full route
            <MapIcon className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.75} />
          </Link>
          <Link
            href={trailHref}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-line/70 bg-cream-card py-2.5 text-[13px] font-medium text-ink transition hover:border-ink-faint/40"
          >
            View Trail Map
            <Mountain className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.75} />
          </Link>
        </div>
      )}

      <div className="shadow-card rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
        <span className="text-[11px] font-semibold tracking-wide text-ink-faint">
          YOUR NEXT STEPS
        </span>
        <ol className="mt-3 flex flex-col gap-4">
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green text-[12px] font-semibold text-cream">
              1
            </span>
            <span className="text-[12.5px] leading-relaxed text-ink-soft">
              {getNextActionSummary(opportunity)}
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#e7c9a3] text-[12px] font-semibold text-ink-soft">
              2
            </span>
            <span className="text-[12.5px] leading-relaxed text-ink-soft">
              Ask someone who&rsquo;s done this before you commit — see &ldquo;Find someone
              ahead&rdquo; below.
            </span>
          </li>
        </ol>
      </div>

      <FindSomeoneAheadCard
        opportunityId={opportunity.id}
        opportunityTitle={opportunity.title}
        opportunityType={opportunity.opportunityType}
      />
      <RoleDialogueCard />
    </aside>
  );
}
