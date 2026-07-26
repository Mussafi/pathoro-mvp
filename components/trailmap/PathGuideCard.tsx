import { Signpost } from "lucide-react";
import type { TrailMapGoalId } from "@/lib/trailMapData";

/** Goal-specific framing for "who ahead on this path could you talk to" —
 * intentionally not generic "coaching" language. Doctor and school-admin
 * follow the same pattern as the task's worked examples (therapist,
 * nurse, lawyer, engineer, resale, vegetarian). */
const GUIDE_CONTENT: Record<TrailMapGoalId, { cta: string; subtitle: string }> = {
  therapist: {
    cta: "Talk to a licensed counselor",
    subtitle: "Ask what supervision, licensure, and real caseloads actually feel like.",
  },
  nurse: {
    cta: "Talk to an ICU nurse",
    subtitle: "Learn what a real week looks like before choosing this branch.",
  },
  lawyer: {
    cta: "Talk to a practicing attorney",
    subtitle: "Ask what this legal path actually rewards and costs.",
  },
  doctor: {
    cta: "Talk to a practicing physician",
    subtitle: "Ask what residency and this specialty actually demand day to day.",
  },
  engineer: {
    cta: "Talk to an engineer in this field",
    subtitle: "Ask what skills matter before choosing a track.",
  },
  "school-admin": {
    cta: "Talk to a school administrator",
    subtitle: "Ask what changed most once they moved from the classroom.",
  },
  vegetarian: {
    cta: "Talk to someone who made the switch",
    subtitle: "Ask how they made the habit stick in real life.",
  },
  resale: {
    cta: "Talk to a reseller",
    subtitle: "Ask where beginners actually source inventory.",
  },
};

export function PathGuideCard({ goalId }: { goalId: TrailMapGoalId }) {
  const content = GUIDE_CONTENT[goalId];

  return (
    <div className="shadow-card relative flex flex-col overflow-hidden rounded-[26px] border border-green/40 bg-ink px-5 py-5">
      <span className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-green/20 blur-3xl" />
      <div className="relative flex items-center gap-2.5">
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green">
          <span className="absolute -inset-1.5 -z-10 rounded-full bg-green/40 blur-md" />
          <Signpost className="h-4 w-4 text-cream" strokeWidth={1.75} />
        </span>
        <span className="text-[14px] font-semibold text-cream">Need a path guide?</span>
      </div>

      <p className="relative mt-2.5 text-[12px] font-semibold text-cream/90">{content.cta}</p>
      <p className="relative mt-1 text-[11.5px] leading-relaxed text-cream/70">{content.subtitle}</p>

      <button
        type="button"
        disabled
        className="relative mt-3.5 flex w-full cursor-not-allowed items-center justify-between gap-2 rounded-full bg-cream/10 px-4 py-2.5 text-left"
      >
        <span className="text-[12.5px] font-semibold text-cream/60">Find a guide</span>
        <span className="rounded-full bg-cream/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-cream/50">
          Coming soon
        </span>
      </button>

      <p className="relative mt-3 text-[10px] leading-snug text-cream/40">
        Path Guides are people ahead on the path — not generic coaches.
      </p>
    </div>
  );
}
