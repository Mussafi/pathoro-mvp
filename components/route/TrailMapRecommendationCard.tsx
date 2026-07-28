import Link from "next/link";
import { ArrowRight, Mountain } from "lucide-react";
import { mapGoalToTrailMapGoal } from "@/lib/goalSpecificity";

export function TrailMapRecommendationCard({ pathGoal }: { pathGoal: string }) {
  const trailMapGoal = mapGoalToTrailMapGoal(pathGoal);
  // A goal that doesn't match a curated template (e.g. "HVAC technician")
  // still deserves to keep its own text — /trail-map's generator can
  // build a real starter map from it. Only fall back to the bare,
  // goal-less link if there's truly no goal text at all.
  const href = trailMapGoal
    ? `/trail-map?goal=${trailMapGoal}`
    : pathGoal.trim()
      ? `/trail-map?goal=${encodeURIComponent(pathGoal.trim())}`
      : "/trail-map";

  return (
    <div className="shadow-card relative mt-4 flex flex-col overflow-hidden rounded-[26px] border border-green/50 bg-ink px-5 py-5">
      <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-green/25 blur-3xl" />
      <div className="relative flex items-center gap-2.5">
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green">
          <span className="absolute -inset-1.5 -z-10 rounded-full bg-green/40 blur-md" />
          <Mountain className="h-4 w-4 text-cream" strokeWidth={1.75} />
        </span>
        <span className="text-[16px] font-semibold text-cream">
          Open the detailed Trail Map
        </span>
      </div>
      <p className="relative mt-2 text-[12.5px] leading-relaxed text-cream/70">
        This goal is specific enough to map as a journey — with milestones,
        requirements, tradeoffs, access points, and trail markers.
      </p>
      <Link
        href={href}
        className="shadow-card relative mt-3.5 flex w-fit items-center gap-2 rounded-full bg-green px-4 py-2.5 text-[13px] font-semibold text-cream outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50"
      >
        Open Trail Map
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
