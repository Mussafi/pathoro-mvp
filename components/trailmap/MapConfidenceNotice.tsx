import { AlertTriangle, FilePlus, MapPinned, MessageCircle, ShieldCheck, Users, Wand2 } from "lucide-react";
import { isLikelyRegulatedPath, type TrailMapGoal } from "@/lib/trailMapData";

/** Product-architecture placeholders for how a generated draft should
 * invite verification over time (scouting, sourcing, people, trail
 * markers, dialogue) — intentionally inert, not wired to real actions
 * yet. See docs/V0.30-DYNAMIC-TRAIL-MAPS.md. */
const VERIFICATION_CTAS = [
  { icon: MapPinned, label: "Scout access points" },
  { icon: ShieldCheck, label: "Verify requirements" },
  { icon: Users, label: "Find someone ahead" },
  { icon: FilePlus, label: "Add trail marker" },
  { icon: MessageCircle, label: "Start role dialogue" },
];

export function MapConfidenceNotice({ goal }: { goal: TrailMapGoal }) {
  if (goal.confidence !== "generated_starter") return null;
  const regulated = isLikelyRegulatedPath(goal);

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
      {regulated && (
        <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-amber-800">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={2} />
          Licensing requirements vary by state, institution, employer, and
          governing body. Treat this as a starting map, not official
          guidance.
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {VERIFICATION_CTAS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="flex items-center gap-1 rounded-full border border-line/70 bg-cream-card px-2.5 py-1 text-[10.5px] font-medium text-ink-faint"
          >
            <Icon className="h-3 w-3 shrink-0" strokeWidth={1.75} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
