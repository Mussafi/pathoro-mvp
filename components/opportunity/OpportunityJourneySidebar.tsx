import Link from "next/link";
import { ArrowRight, Mountain, Route as RouteIcon, Target } from "lucide-react";
import type { Route } from "@/lib/routes";

/**
 * Left column of the rich opportunity detail layout (v0.34 Part 5) — the
 * "where does this sit in my journey" context: the goal this opportunity
 * supports, the route it's a stop on, and that route's real steps (not a
 * fabricated per-opportunity progress bar — Pathoro doesn't track real
 * completion state at this granularity yet).
 */
export function OpportunityJourneySidebar({
  relatedGoal,
  route,
  trailHref,
  routePlanningHref,
}: {
  relatedGoal: string;
  route: Route | null | undefined;
  trailHref: string;
  routePlanningHref: string;
}) {
  return (
    <aside className="flex flex-col gap-5">
      <div className="shadow-card rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
        <span className="text-[11px] font-semibold tracking-wide text-ink-faint">
          YOUR GOAL
        </span>
        <div className="mt-2 flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-green/40">
            <Target className="h-4 w-4 text-green" strokeWidth={1.75} />
          </span>
          <span className="text-[13.5px] font-semibold leading-tight text-ink">
            {relatedGoal}
          </span>
        </div>
        <Link
          href={trailHref}
          className="shadow-card mt-3.5 flex w-full items-center justify-center gap-2 rounded-full bg-green py-2.5 text-[12.5px] font-semibold text-cream transition hover:bg-green-dark"
        >
          View Trail Map
          <Mountain className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
      </div>

      {route && (
        <div className="shadow-card rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
          <span className="text-[11px] font-semibold tracking-wide text-ink-faint">
            ROUTE STEPS
          </span>
          <p className="mt-1.5 text-[13.5px] font-semibold text-ink">{route.title}</p>

          <ol className="mt-3 flex flex-col gap-2.5">
            {route.steps.map((step, i) => (
              <li key={step.label} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-soft text-[10px] font-semibold text-green">
                  {i + 1}
                </span>
                <span className="text-[12.5px] leading-snug text-ink-soft">{step.label}</span>
              </li>
            ))}
          </ol>

          <Link
            href={routePlanningHref}
            className="shadow-card mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-line/70 bg-cream-card py-2.5 text-[12.5px] font-medium text-ink transition hover:border-ink-faint/40"
          >
            View full route
            <RouteIcon className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.75} />
          </Link>
        </div>
      )}

      <Link
        href={routePlanningHref + "#scout-request"}
        className="flex items-center justify-center gap-1.5 text-[12px] font-medium text-ink-soft underline outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-green/50"
      >
        Scout similar access points
        <ArrowRight className="h-3 w-3" />
      </Link>
    </aside>
  );
}
