"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { PathGuideRequestModal } from "@/components/trailmap/PathGuideRequestModal";

/** The opportunity-page equivalent of Trail Map's PathGuideCard — same
 * "who can help the user understand it?" question, but styled as a light
 * card to match the opportunity page rather than Trail Map's dark ink
 * card, and without a curated per-goal GUIDE_CONTENT lookup since an
 * opportunity isn't a Trail Map goal. */
export function FindSomeoneAheadCard({
  opportunityId,
  opportunityTitle,
  opportunityType,
}: {
  opportunityId: string;
  opportunityTitle: string;
  opportunityType: string;
}) {
  const [requestOpen, setRequestOpen] = useState(false);

  return (
    <div className="shadow-card flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-soft">
          <Users className="h-4 w-4 text-green" strokeWidth={1.75} />
        </span>
        <span className="text-[14px] font-semibold text-ink">Who can help you understand this?</span>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
        Someone who&rsquo;s already been through {opportunityType ? opportunityType.toLowerCase() : "this"}{" "}
        can tell you what the listing won&rsquo;t — whether it&rsquo;s worth your time, and what to
        expect going in.
      </p>

      <button
        type="button"
        onClick={() => setRequestOpen(true)}
        className="mt-3.5 flex w-full items-center justify-between gap-2 rounded-full border border-green/40 bg-green-soft px-4 py-2.5 text-left outline-none transition hover:bg-green-soft/70 focus-visible:ring-2 focus-visible:ring-green/50"
      >
        <span className="text-[12.5px] font-semibold text-green">Find someone ahead</span>
        <span className="rounded-full border border-green/40 bg-cream-card px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-green">
          Alpha
        </span>
      </button>

      <p className="mt-3 text-[10px] leading-snug text-ink-faint">
        Path Guides are people ahead on this path. Pathoro distinguishes
        licensed guidance from lived experience.
      </p>

      {requestOpen && (
        <PathGuideRequestModal
          goalId={opportunityId}
          goalTitle={opportunityTitle}
          branchId={opportunityId}
          branchTitle={opportunityTitle}
          defaultGuideType={opportunityType || "someone on this path"}
          onClose={() => setRequestOpen(false)}
        />
      )}
    </div>
  );
}
