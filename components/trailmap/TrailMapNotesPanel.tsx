import { BadgeCheck, Heart, MessageCircle } from "lucide-react";
import type { TrailMapBranch, TrailNote } from "@/lib/trailMapData";

export function TrailMapNotesPanel({
  branch,
  notes,
  notesTotal,
}: {
  branch: TrailMapBranch;
  notes: TrailNote[];
  notesTotal: number;
}) {
  const forBranch = notes.filter((n) => n.branchId === branch.id);

  return (
    <div className="shadow-card flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          <MessageCircle className="h-4 w-4 text-green" strokeWidth={1.75} />
          Trail notes ({notesTotal})
        </span>
        <span className="text-[11px] font-medium text-green">View all</span>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
        Contextual notes from people ahead on this exact path — not generic
        comments.
      </p>

      <div className="mt-3 flex flex-col gap-2.5">
        {forBranch.length === 0 ? (
          <p className="rounded-2xl border border-line/70 bg-cream-field px-3.5 py-3 text-[12px] leading-relaxed text-ink-faint">
            No trail notes for this path yet. Be the first to leave one once
            you&rsquo;ve walked it.
          </p>
        ) : (
          forBranch.map((note) => (
            <div key={note.id} className="rounded-2xl border border-line/70 bg-cream-field px-3.5 py-3">
              <p className="text-[12px] leading-snug text-ink">&ldquo;{note.body}&rdquo;</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 text-[11px] text-ink-faint">
                  — {note.author}, {note.role}
                  {note.verified && (
                    <BadgeCheck className="h-3 w-3 text-green" strokeWidth={2} />
                  )}
                </span>
                <span className="flex items-center gap-1 text-[10.5px] text-ink-faint">
                  <Heart className="h-3 w-3" strokeWidth={1.75} />
                  {note.likes}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
