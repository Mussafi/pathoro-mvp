"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { TopoLines } from "@/components/TopoLines";
import { RoutePlanningHeader } from "@/components/route/RoutePlanningHeader";
import { TrailMapMilestoneSidebar } from "@/components/trailmap/TrailMapMilestoneSidebar";
import { TrailMapBranchDiagram } from "@/components/trailmap/TrailMapBranchDiagram";
import { TrailMapDetailSidebar } from "@/components/trailmap/TrailMapDetailSidebar";
import { TrailMapNotesPanel } from "@/components/trailmap/TrailMapNotesPanel";
import { TrailMapComparison } from "@/components/trailmap/TrailMapComparison";
import { TrailMapGoalSelector } from "@/components/trailmap/TrailMapGoalSelector";
import { TrailMapLegend } from "@/components/trailmap/TrailMapLegend";
import { trailMapGoals, getTrailMapGoal, type TrailMapGoalId } from "@/lib/trailMapData";

export default function TrailMapPage() {
  const [goalId, setGoalId] = useState<TrailMapGoalId>(trailMapGoals[0].id);
  const goal = getTrailMapGoal(goalId);
  const [branchId, setBranchId] = useState(goal.defaultBranchId);

  const selectedBranch = goal.branches.find((b) => b.id === branchId) ?? goal.branches[0];

  // Read ?goal= after mount (not during render) so the server-rendered and
  // first client render stay in sync — a matching request-scout param
  // means /route-planning is linking here for a specific goal.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("goal");
    const matched = trailMapGoals.find((g) => g.id === requested);
    Promise.resolve(matched).then((match) => {
      if (match) {
        setGoalId(match.id);
        setBranchId(getTrailMapGoal(match.id).defaultBranchId);
      }
    });
  }, []);

  function handleSelectGoal(id: TrailMapGoalId) {
    setGoalId(id);
    setBranchId(getTrailMapGoal(id).defaultBranchId);
  }

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

      <div className="relative border-b border-line/70 bg-cream-field/60 px-6 py-2.5 text-center text-[11.5px] text-ink-faint sm:px-10">
        Prototype — the Advanced Trail Map. Not linked from the main product
        flow yet.
      </div>

      <main className="relative mx-auto w-full max-w-[1500px] px-6 py-6 sm:px-10">
        <TrailMapGoalSelector goals={trailMapGoals} selectedGoalId={goalId} onSelect={handleSelectGoal} />

        <div className="mt-5 grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <TrailMapMilestoneSidebar goal={goal} />

          <div className="flex min-w-0 flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-serif text-[26px] leading-tight text-ink">{goal.pathTitle}</h1>
                <p className="mt-1.5 max-w-[560px] text-[13px] leading-relaxed text-ink-soft">
                  {goal.subtitle}
                </p>
              </div>
              <button
                type="button"
                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line/70 text-ink-faint transition hover:border-ink-faint/40 hover:text-ink"
                aria-label="Save this path"
              >
                <Bookmark className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>

            <div className="mt-4">
              <TrailMapBranchDiagram goal={goal} selectedBranchId={branchId} onSelect={setBranchId} />
            </div>

            <TrailMapComparison goal={goal} selectedBranchId={branchId} onSelect={setBranchId} />

            <TrailMapLegend />
          </div>

          <div className="flex flex-col gap-4">
            <TrailMapDetailSidebar branch={selectedBranch} />
            <TrailMapNotesPanel branch={selectedBranch} notes={goal.notes} notesTotal={goal.notesTotal} />
          </div>
        </div>
      </main>
    </div>
  );
}
