"use client";

import { useEffect, useState } from "react";
import { Bookmark, ChevronDown, ListFilter, Map, SlidersHorizontal } from "lucide-react";
import { RoutePlanningHeader } from "@/components/route/RoutePlanningHeader";
import { TrailMapMilestoneSidebar } from "@/components/trailmap/TrailMapMilestoneSidebar";
import { TrailMapBranchDiagram } from "@/components/trailmap/TrailMapBranchDiagram";
import { TrailMapDetailSidebar } from "@/components/trailmap/TrailMapDetailSidebar";
import { TrailMapNotesPanel } from "@/components/trailmap/TrailMapNotesPanel";
import { PathGuideCard } from "@/components/trailmap/PathGuideCard";
import { TrailMapComparison } from "@/components/trailmap/TrailMapComparison";
import { TrailMapGoalSelector } from "@/components/trailmap/TrailMapGoalSelector";
import { TrailMapGoalSearch } from "@/components/trailmap/TrailMapGoalSearch";
import { TrailMapGenericShell } from "@/components/trailmap/TrailMapGenericShell";
import { TrailMapLegend } from "@/components/trailmap/TrailMapLegend";
import { trailMapGoals, getTrailMapGoal, type TrailMapGoalId } from "@/lib/trailMapData";
import { mapGoalToTrailMapGoal } from "@/lib/goalSpecificity";

export default function TrailMapPage() {
  const [goalId, setGoalId] = useState<TrailMapGoalId>(trailMapGoals[0].id);
  const [unmatchedGoal, setUnmatchedGoal] = useState<string | null>(null);
  const goal = getTrailMapGoal(goalId);
  const [branchId, setBranchId] = useState(goal.defaultBranchId);

  const selectedBranch = goal.branches.find((b) => b.id === branchId) ?? goal.branches[0];

  // Read ?goal= after mount (not during render) so the server-rendered and
  // first client render stay in sync — a matching request-scout param
  // means /route-planning is linking here for a specific goal.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("goal");
    Promise.resolve(requested).then((req) => {
      if (!req) return;
      const direct = trailMapGoals.find((g) => g.id === req);
      if (direct) {
        setGoalId(direct.id);
        setBranchId(getTrailMapGoal(direct.id).defaultBranchId);
        return;
      }
      const mapped = mapGoalToTrailMapGoal(req);
      if (mapped) {
        setGoalId(mapped);
        setBranchId(getTrailMapGoal(mapped).defaultBranchId);
      } else {
        setUnmatchedGoal(req);
      }
    });
  }, []);

  function handleSelectGoal(id: TrailMapGoalId) {
    setUnmatchedGoal(null);
    setGoalId(id);
    setBranchId(getTrailMapGoal(id).defaultBranchId);
  }

  function handleGoalSearch(text: string) {
    const matched = mapGoalToTrailMapGoal(text);
    if (matched) {
      handleSelectGoal(matched);
    } else {
      setUnmatchedGoal(text);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="border-b border-line/70">
        <RoutePlanningHeader mode="trail" compassHref="/route-planning" />
      </div>

      <main className="mx-auto w-full max-w-[1500px] px-6 py-6 sm:px-10">
        <TrailMapGoalSearch onSubmit={handleGoalSearch} />

        <div className="mt-4">
          <TrailMapGoalSelector
            goals={trailMapGoals}
            selectedGoalId={unmatchedGoal ? null : goalId}
            onSelect={handleSelectGoal}
          />
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-line/70 bg-cream-field px-4 py-3">
          <Map className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green" strokeWidth={1.75} />
          <p className="text-[11.5px] leading-relaxed text-ink-soft">
            Pathoro does not just search for pages. It maps the path,
            compares branches, scouts access points, and connects you to
            trail markers and people ahead.
          </p>
        </div>

        {unmatchedGoal ? (
          <TrailMapGenericShell goalText={unmatchedGoal} />
        ) : (
          <div className="mt-5 grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
            <TrailMapMilestoneSidebar goal={goal} />

            <div className="flex min-w-0 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-[26px] leading-tight text-ink">{goal.pathTitle}</h1>
                  <button
                    type="button"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line/70 text-ink-faint transition hover:border-ink-faint/40 hover:text-ink"
                    aria-label="Save this path"
                  >
                    <Bookmark className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-full border border-line/70 bg-cream-card px-3 py-1.5 text-[11.5px] font-medium text-ink-soft transition hover:border-ink-faint/40"
                  >
                    <ListFilter className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Legend
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-full border border-line/70 bg-cream-card px-3 py-1.5 text-[11.5px] font-medium text-ink-soft transition hover:border-ink-faint/40"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Filter
                    <ChevronDown className="h-3 w-3" strokeWidth={2} />
                  </button>
                </div>
              </div>
              <p className="mt-1.5 max-w-[560px] text-[13px] leading-relaxed text-ink-soft">
                {goal.subtitle}
              </p>

              <div className="mt-4">
                <TrailMapBranchDiagram goal={goal} selectedBranchId={branchId} onSelect={setBranchId} />
              </div>

              <TrailMapComparison goal={goal} selectedBranchId={branchId} onSelect={setBranchId} />

              <TrailMapLegend />
            </div>

            <div className="flex flex-col gap-4">
              <TrailMapDetailSidebar branch={selectedBranch} />
              <PathGuideCard goal={goal} branch={selectedBranch} />
              <TrailMapNotesPanel branch={selectedBranch} notes={goal.notes} notesTotal={goal.notesTotal} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
