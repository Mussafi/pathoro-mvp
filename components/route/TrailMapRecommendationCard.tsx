import Link from "next/link";
import { ArrowRight, Map } from "lucide-react";
import { mapGoalToTrailMapGoal } from "@/lib/goalSpecificity";

export function TrailMapRecommendationCard({ pathGoal }: { pathGoal: string }) {
  const trailMapGoal = mapGoalToTrailMapGoal(pathGoal);
  const href = trailMapGoal ? `/trail-map?goal=${trailMapGoal}` : "/trail-map";

  return (
    <div className="shadow-card mt-4 flex flex-col rounded-[26px] border border-green/40 bg-green-soft/50 px-5 py-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-soft">
          <Map className="h-4 w-4 text-green" strokeWidth={1.75} />
        </span>
        <span className="text-[15px] font-semibold text-ink">
          This path is ready for a Trail Map
        </span>
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
        Your goal is specific enough to map as a journey — with milestones,
        requirements, tradeoffs, access points, and trail markers.
      </p>
      <Link
        href={href}
        className="mt-3 flex w-fit items-center gap-2 rounded-full bg-green px-4 py-2.5 text-[13px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50"
      >
        Open Trail Map
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
