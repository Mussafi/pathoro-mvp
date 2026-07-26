import { Mountain } from "lucide-react";
import type { TrailMapGoal, MilestoneStatus } from "@/lib/trailMapData";

const DOT_CLASS: Record<MilestoneStatus, string> = {
  done: "border-green bg-green",
  current: "border-green bg-cream-card",
  next: "border-line/70 bg-cream-card",
  future: "border-line/70 bg-cream-card",
};

const LABEL_CLASS: Record<MilestoneStatus, string> = {
  done: "text-ink-soft",
  current: "text-ink",
  next: "text-ink-soft",
  future: "text-ink-faint",
};

const STATUS_DETAIL: Record<MilestoneStatus, string> = {
  done: "Completed",
  current: "In progress",
  next: "Next step",
  future: "Ahead",
};

export function TrailMapMilestoneSidebar({ goal }: { goal: TrailMapGoal }) {
  return (
    <div className="flex flex-col">
      <span className="w-fit rounded-full bg-green-badge px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-cream">
        You are here
      </span>

      <ol className="relative mt-4 flex flex-col gap-5 pl-1">
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-line" aria-hidden="true" />
        {goal.milestones.map((milestone) => (
          <li key={milestone.id} className="relative flex items-start gap-3">
            <span
              className={`relative z-10 mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border-2 ${DOT_CLASS[milestone.status]}`}
            >
              {milestone.status === "current" && (
                <span className="h-2 w-2 rounded-full bg-green" />
              )}
            </span>
            <span className="leading-tight">
              <span className={`block text-[13px] font-medium ${LABEL_CLASS[milestone.status]}`}>
                {milestone.label}
              </span>
              <span className="mt-0.5 block text-[11px] text-ink-faint">
                {milestone.detail ?? STATUS_DETAIL[milestone.status]}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <div className="shadow-card mt-6 flex flex-col rounded-2xl border border-line/70 bg-cream-card px-4 py-4">
        <div className="flex items-center gap-2">
          <Mountain className="h-4 w-4 text-green" strokeWidth={1.75} />
          <span className="text-[13px] font-semibold text-ink">
            {goal.markersReached} / {goal.markersTotal} trail markers reached
          </span>
        </div>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-faint">
          Good progress. New branches unlock as you move further along this
          path.
        </p>
      </div>
    </div>
  );
}
