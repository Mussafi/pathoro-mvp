"use client";

import { useState } from "react";
import { Signpost } from "lucide-react";
import type { GuideBadge, PathGuideRecommendation, TrailMapBranch, TrailMapGoal, TrailMapGoalId } from "@/lib/trailMapData";
import { PathGuideRequestModal } from "@/components/trailmap/PathGuideRequestModal";

const GUIDE_BADGE_CLASS: Record<GuideBadge, string> = {
  "Licensed guide": "border-green/50 bg-green/20 text-green",
  "Verified experience": "border-cream/30 bg-cream/10 text-cream/70",
  "Peer trail marker": "border-cream/25 bg-cream/5 text-cream/55",
  "Credential not verified": "border-amber-400/40 bg-amber-400/10 text-amber-200",
};

/** Goal-specific framing for "who ahead on this path could you talk to" —
 * intentionally not generic "coaching" language, and not a generic
 * "health and lifestyle coach" default either. For paths that touch
 * professional, clinical, legal, medical, or licensure-related questions,
 * the recommended guide is a licensed/credentialed person; for habit or
 * practical-experience paths, it's someone with verified lived
 * experience — and where a licensed domain overlaps (nutrition, finance),
 * `note` points to the right kind of professional instead of implying
 * the Path Guide can give that advice. */
const DEFAULT_GUIDE_CONTENT: PathGuideRecommendation = {
  cta: "Talk to someone on this path",
  subtitle: "Ask what this role actually requires day to day.",
  badge: "Peer trail marker",
};

const GUIDE_CONTENT: Record<TrailMapGoalId, PathGuideRecommendation> = {
  therapist: {
    cta: "Talk to a licensed therapist",
    subtitle: "Ask what supervision, licensure, and real caseloads actually feel like.",
    badge: "Licensed guide",
  },
  nurse: {
    cta: "Talk to a registered nurse",
    subtitle: "Learn what a real week looks like before choosing this branch.",
    badge: "Licensed guide",
  },
  lawyer: {
    cta: "Talk to a practicing attorney",
    subtitle: "Ask what this legal path actually rewards and costs.",
    badge: "Licensed guide",
    note: "This is lived-path perspective, not legal advice.",
  },
  doctor: {
    cta: "Talk to a physician or resident",
    subtitle: "Ask what residency and this specialty actually demand day to day.",
    badge: "Licensed guide",
    note: "This is lived-path perspective, not medical advice.",
  },
  engineer: {
    cta: "Talk to an engineer in this field",
    subtitle: "Ask what skills matter before choosing a track.",
    badge: "Verified experience",
  },
  "school-admin": {
    cta: "Talk to a school administrator",
    subtitle: "Ask what changed most once they moved from the classroom.",
    badge: "Licensed guide",
  },
  vegetarian: {
    cta: "Talk to someone who made the switch",
    subtitle: "Ask how they made the habit stick in real life.",
    badge: "Verified experience",
    note: "For nutrition or medical dietary questions, look for a registered dietitian or licensed clinician.",
  },
  resale: {
    cta: "Talk to an experienced reseller",
    subtitle: "Ask where beginners actually source inventory.",
    badge: "Verified experience",
    note: "For financial or tax advice, look for a licensed financial professional.",
  },
  plumber: {
    cta: "Talk to a licensed plumber",
    subtitle: "Ask what apprenticeship, licensing, tools, and day-to-day work actually require.",
    badge: "Licensed guide",
  },
  electrician: {
    cta: "Talk to a licensed electrician",
    subtitle: "Ask what apprenticeship, licensing, safety, and real job sites actually feel like.",
    badge: "Licensed guide",
  },
};

export function PathGuideCard({ goal, branch }: { goal: TrailMapGoal; branch: TrailMapBranch }) {
  const content = goal.pathGuide ?? GUIDE_CONTENT[goal.id as TrailMapGoalId] ?? DEFAULT_GUIDE_CONTENT;
  const [requestOpen, setRequestOpen] = useState(false);

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

      <div className="relative mt-2.5 flex items-center gap-1.5">
        <span className="text-[12px] font-semibold text-cream/90">{content.cta}</span>
        <span
          className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-wide ${GUIDE_BADGE_CLASS[content.badge]}`}
        >
          {content.badge}
        </span>
      </div>
      <p className="relative mt-1 text-[11.5px] leading-relaxed text-cream/70">{content.subtitle}</p>
      {content.note && (
        <p className="relative mt-1.5 text-[10.5px] leading-snug text-cream/45">{content.note}</p>
      )}

      <button
        type="button"
        onClick={() => setRequestOpen(true)}
        className="relative mt-3.5 flex w-full items-center justify-between gap-2 rounded-full bg-cream/10 px-4 py-2.5 text-left outline-none transition hover:bg-cream/15 focus-visible:ring-2 focus-visible:ring-green/50"
      >
        <span className="text-[12.5px] font-semibold text-cream">Find a guide</span>
        <span className="rounded-full bg-cream/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-cream/60">
          Alpha
        </span>
      </button>

      <p className="relative mt-3 text-[10px] leading-snug text-cream/40">
        Path Guides are people ahead on this path. Pathoro distinguishes
        licensed guidance from lived experience.
      </p>

      {requestOpen && (
        <PathGuideRequestModal
          goal={goal}
          branch={branch}
          defaultGuideType={content.cta.replace(/^Talk to /i, "")}
          onClose={() => setRequestOpen(false)}
        />
      )}
    </div>
  );
}
