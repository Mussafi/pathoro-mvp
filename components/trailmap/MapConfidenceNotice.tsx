"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, FilePlus, MapPinned, MessageCircle, ShieldCheck, Users, Wand2 } from "lucide-react";
import type { TrailMapBranch, TrailMapGoal } from "@/lib/trailMapData";
import { loadDirectionAnswers, saveDirectionAnswers } from "@/lib/direction";
import { PathGuideRequestModal } from "@/components/trailmap/PathGuideRequestModal";

export function MapConfidenceNotice({ goal, branch }: { goal: TrailMapGoal; branch: TrailMapBranch }) {
  const [guideOpen, setGuideOpen] = useState(false);
  const router = useRouter();

  if (goal.confidence !== "generated_starter") return null;

  function handleScout() {
    // Carries the generated goal into the compass-mode scout flow by
    // updating the same DirectionAnswers state /route-planning already
    // reads (lib/direction.ts) — reusing existing state rather than
    // building a parallel prefill mechanism.
    saveDirectionAnswers({ ...loadDirectionAnswers(), moveToward: goal.pathTitle });
    router.push("/route-planning");
  }

  return (
    <div className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3.5">
      <div className="flex items-center gap-1.5">
        <Wand2 className="h-3.5 w-3.5 shrink-0 text-amber-700" strokeWidth={1.75} />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
          Generated starter map
        </span>
      </div>
      <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">
        Pathoro created this first-pass map from your goal. Requirements
        and details should be verified from official sources.
      </p>
      {goal.disclaimer && (
        <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-amber-800">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={2} />
          {goal.disclaimer}
        </p>
      )}

      <div className="mt-3 border-t border-amber-400/30 pt-3">
        <span className="text-[10.5px] font-semibold uppercase tracking-wide text-amber-700">
          Strengthen this map
        </span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={handleScout}
            className="flex items-center gap-1 rounded-full border border-green/40 bg-cream-card px-2.5 py-1 text-[10.5px] font-medium text-green outline-none transition hover:border-green/60 focus-visible:ring-2 focus-visible:ring-green/50"
          >
            <MapPinned className="h-3 w-3 shrink-0" strokeWidth={1.75} />
            Scout access points
          </button>
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="flex items-center gap-1 rounded-full border border-green/40 bg-cream-card px-2.5 py-1 text-[10.5px] font-medium text-green outline-none transition hover:border-green/60 focus-visible:ring-2 focus-visible:ring-green/50"
          >
            <Users className="h-3 w-3 shrink-0" strokeWidth={1.75} />
            Find someone ahead
          </button>
          <span
            title="Coming soon — Pathoro doesn't verify official requirements yet. Use Find someone ahead in the meantime."
            className="flex cursor-not-allowed items-center gap-1 rounded-full border border-line/70 bg-cream-card px-2.5 py-1 text-[10.5px] font-medium text-ink-faint opacity-70"
          >
            <ShieldCheck className="h-3 w-3 shrink-0" strokeWidth={1.75} />
            Verify requirements
          </span>
          <span
            title="Coming soon — trail markers aren't open for generated maps yet."
            className="flex cursor-not-allowed items-center gap-1 rounded-full border border-line/70 bg-cream-card px-2.5 py-1 text-[10.5px] font-medium text-ink-faint opacity-70"
          >
            <FilePlus className="h-3 w-3 shrink-0" strokeWidth={1.75} />
            Add trail marker
          </span>
          <span
            title="Coming soon — Role Dialogue is a concept preview, not a live feature yet."
            className="flex cursor-not-allowed items-center gap-1 rounded-full border border-line/70 bg-cream-card px-2.5 py-1 text-[10.5px] font-medium text-ink-faint opacity-70"
          >
            <MessageCircle className="h-3 w-3 shrink-0" strokeWidth={1.75} />
            Start role dialogue
          </span>
        </div>
      </div>

      {goal.exampleOpportunity && (
        <div className="mt-3 border-t border-amber-400/30 pt-3">
          <span className="text-[10.5px] font-semibold uppercase tracking-wide text-amber-700">
            Example access point
          </span>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-faint">
            Illustrative only — not scouted for your area yet.
          </p>
          <Link
            href={`/opportunity/${goal.exampleOpportunity.slug}#opportunity-content`}
            className="mt-1.5 flex w-fit items-center gap-1 rounded-full border border-line/70 bg-cream-card px-2.5 py-1 text-[10.5px] font-medium text-ink-soft outline-none transition hover:border-ink-faint/40 focus-visible:ring-2 focus-visible:ring-green/50"
          >
            {goal.exampleOpportunity.title}
            <ArrowRight className="h-3 w-3 shrink-0" strokeWidth={1.75} />
          </Link>
        </div>
      )}

      {guideOpen && (
        <PathGuideRequestModal
          goalId={goal.id}
          goalTitle={goal.pathTitle}
          branchId={branch.id}
          branchTitle={branch.title}
          defaultGuideType={(goal.pathGuide?.cta ?? "someone on this path").replace(/^Talk to /i, "")}
          onClose={() => setGuideOpen(false)}
        />
      )}
    </div>
  );
}
