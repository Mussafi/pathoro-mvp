"use client";

import { useEffect, useState } from "react";
import { Bookmark, ChevronDown, ListFilter, Map, SlidersHorizontal, Wand2 } from "lucide-react";
import { RoutePlanningHeader } from "@/components/route/RoutePlanningHeader";
import { TrailMapMilestoneSidebar } from "@/components/trailmap/TrailMapMilestoneSidebar";
import { TrailMapBranchDiagram } from "@/components/trailmap/TrailMapBranchDiagram";
import { TrailMapDetailSidebar } from "@/components/trailmap/TrailMapDetailSidebar";
import { TrailMapNotesPanel } from "@/components/trailmap/TrailMapNotesPanel";
import { PathGuideCard } from "@/components/trailmap/PathGuideCard";
import { RoleDialogueCard } from "@/components/trailmap/RoleDialogueCard";
import { MapConfidenceNotice } from "@/components/trailmap/MapConfidenceNotice";
import { TrailMapComparison } from "@/components/trailmap/TrailMapComparison";
import { TrailMapGoalSelector } from "@/components/trailmap/TrailMapGoalSelector";
import { TrailMapGoalSearch } from "@/components/trailmap/TrailMapGoalSearch";
import { TrailMapGenericShell } from "@/components/trailmap/TrailMapGenericShell";
import { TrailMapLegend } from "@/components/trailmap/TrailMapLegend";
import { trailMapGoals, getTrailMapGoal, type TrailMapGoal, type TrailMapGoalId } from "@/lib/trailMapData";
import { mapGoalToTrailMapGoal } from "@/lib/goalSpecificity";
import { normalizeTrailMapGoal } from "@/lib/trailMapNormalize";

/** Only the original, broadest-appeal goals show as chips — the row stays
 * short and elegant rather than growing with every new goal added.
 * Newer/more specific goals (skilled trades, etc.) stay fully working via
 * direct ?goal= links and the search box, without cluttering this row. */
const EXAMPLE_CHIP_GOAL_IDS: TrailMapGoalId[] = [
  "therapist",
  "vegetarian",
  "resale",
  "nurse",
  "lawyer",
  "doctor",
  "engineer",
  "school-admin",
];

export default function TrailMapPage() {
  const [goalId, setGoalId] = useState<TrailMapGoalId>(trailMapGoals[0].id as TrailMapGoalId);
  // Set only when a search/goal param doesn't match a curated template —
  // a generated draft (lib/trailMapGenerator.ts) takes over as the
  // active goal instead of the old empty generic shell.
  const [generatedGoal, setGeneratedGoal] = useState<TrailMapGoal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  // Only set if generation itself fails (network/API error) — the true
  // last-resort fallback, not the everyday "no template" path anymore.
  const [genError, setGenError] = useState<string | null>(null);

  // Every goal — curated or generated — is normalized right before use,
  // so a malformed field (most notably a LucideIcon mangled by the
  // generate API's JSON response) can never crash the render tree.
  const activeGoal: TrailMapGoal = normalizeTrailMapGoal(generatedGoal ?? getTrailMapGoal(goalId));
  const [branchId, setBranchId] = useState(activeGoal.defaultBranchId);

  const selectedBranch = activeGoal.branches.find((b) => b.id === branchId) ?? activeGoal.branches[0];

  async function generateAndSetGoal(text: string) {
    setIsGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/trail-map/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalText: text }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed to generate a starter map.");
      const normalized = normalizeTrailMapGoal(data.goal as TrailMapGoal);
      setGeneratedGoal(normalized);
      setBranchId(normalized.defaultBranchId);
    } catch {
      setGenError(text);
    } finally {
      setIsGenerating(false);
    }
  }

  // Read ?goal= after mount (not during render) so the server-rendered and
  // first client render stay in sync — a matching request-scout param
  // means /route-planning is linking here for a specific goal.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("goal");
    Promise.resolve(requested).then((req) => {
      if (!req) return;
      const direct = trailMapGoals.find((g) => g.id === req);
      if (direct) {
        setGoalId(direct.id as TrailMapGoalId);
        setBranchId(getTrailMapGoal(direct.id as TrailMapGoalId).defaultBranchId);
        return;
      }
      const mapped = mapGoalToTrailMapGoal(req);
      if (mapped) {
        setGoalId(mapped);
        setBranchId(getTrailMapGoal(mapped).defaultBranchId);
      } else {
        generateAndSetGoal(req);
      }
    });
  }, []);

  function handleSelectGoal(id: TrailMapGoalId) {
    setGeneratedGoal(null);
    setGenError(null);
    setGoalId(id);
    setBranchId(getTrailMapGoal(id).defaultBranchId);
  }

  function handleGoalSearch(text: string) {
    const matched = mapGoalToTrailMapGoal(text);
    if (matched) {
      handleSelectGoal(matched);
    } else {
      setGeneratedGoal(null);
      generateAndSetGoal(text);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="border-b border-line/70">
        <RoutePlanningHeader
          mode="trail"
          compassHref={`/route-planning?goal=${encodeURIComponent(activeGoal.pathTitle)}`}
        />
      </div>

      <main className="mx-auto w-full max-w-[1500px] px-6 py-6 sm:px-10">
        <TrailMapGoalSearch onSubmit={handleGoalSearch} />

        <div className="mt-4">
          <TrailMapGoalSelector
            goals={trailMapGoals.filter((g) => EXAMPLE_CHIP_GOAL_IDS.includes(g.id as TrailMapGoalId))}
            selectedGoalId={generatedGoal ? null : goalId}
            onSelect={handleSelectGoal}
          />
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-line/70 bg-cream-field px-4 py-3">
          <Map className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green" strokeWidth={1.75} />
          <p className="text-[11.5px] leading-relaxed text-ink-soft">
            Pathoro maps the path, compares branches, scouts access
            points, and connects you to people ahead.
          </p>
        </div>

        {isGenerating ? (
          <div className="shadow-card mt-6 flex flex-col items-center gap-2 rounded-[26px] border border-line/70 bg-cream-card px-6 py-10 text-center">
            <Wand2 className="h-5 w-5 text-green" strokeWidth={1.75} />
            <p className="text-[13.5px] font-medium text-ink">Generating a starter map…</p>
            <p className="max-w-[360px] text-[12px] leading-relaxed text-ink-faint">
              Pathoro doesn&rsquo;t have a template for this path yet, so it&rsquo;s drafting one from your goal.
            </p>
          </div>
        ) : genError ? (
          <TrailMapGenericShell goalText={genError} />
        ) : (
          <div className="mt-5 grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
            <TrailMapMilestoneSidebar goal={activeGoal} />

            <div className="flex min-w-0 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-[26px] leading-tight text-ink">{activeGoal.pathTitle}</h1>
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
                {activeGoal.subtitle}
              </p>

              <MapConfidenceNotice goal={activeGoal} branch={selectedBranch} />

              <div className="mt-4">
                <TrailMapBranchDiagram goal={activeGoal} selectedBranchId={branchId} onSelect={setBranchId} />
              </div>

              <TrailMapComparison goal={activeGoal} selectedBranchId={branchId} onSelect={setBranchId} />

              <TrailMapLegend />
            </div>

            <div className="flex flex-col gap-4">
              <TrailMapDetailSidebar branch={selectedBranch} />
              <RoleDialogueCard />
              <PathGuideCard goal={activeGoal} branch={selectedBranch} />
              <TrailMapNotesPanel
                goal={activeGoal.id}
                branch={selectedBranch}
                notes={activeGoal.notes}
                notesTotal={activeGoal.notesTotal}
                notesAreExamples={activeGoal.notesAreExamples}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
