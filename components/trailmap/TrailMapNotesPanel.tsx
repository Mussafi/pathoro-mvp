import { BadgeCheck, Heart, MapPin } from "lucide-react";
import { getBranchAccentClasses, type TrailMapBranch, type TrailNote } from "@/lib/trailMapData";

/** Detects the note's flavor from its own leading phrase so each note can
 * carry a small tag — "hidden friction," "better first step," "opened
 * doors" — the same shorthand people ahead actually use, not a generic
 * comment label. */
function getNoteTag(body: string): string | null {
  const lower = body.toLowerCase();
  if (lower.startsWith("warning")) return "Warning from someone ahead";
  if (lower.startsWith("hidden friction")) return "Hidden friction";
  if (lower.startsWith("better first step")) return "Better first step";
  if (lower.includes("opened doors")) return "What opened doors";
  if (lower.startsWith("ask about") || lower.startsWith("ask ")) return "What this required";
  return null;
}

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
  const accent = getBranchAccentClasses(branch.id);

  return (
    <div className="shadow-card flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          <MapPin className="h-4 w-4 text-green" strokeWidth={1.75} />
          Trail notes ({notesTotal})
        </span>
        <span className="text-[11px] font-medium text-green">View all</span>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
        Notes from people ahead of you on this exact path — hidden
        friction, better first steps, what opened doors, or a warning
        worth knowing. Trail notes are attached to the path — not a feed.
      </p>

      <div className="mt-3 flex flex-col gap-2.5">
        {forBranch.length === 0 ? (
          <p className="rounded-2xl border border-line/70 bg-cream-field px-3.5 py-3 text-[12px] leading-relaxed text-ink-faint">
            No trail markers on this path yet. Be the first to leave one once
            you&rsquo;ve walked it.
          </p>
        ) : (
          forBranch.map((note) => {
            const tag = getNoteTag(note.body);
            return (
              <div key={note.id} className="rounded-2xl border border-line/70 bg-cream-field px-3.5 py-3">
                <div className="flex items-start gap-2.5">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${accent.bg} ${accent.text}`}
                  >
                    {note.author.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    {tag && (
                      <span className="mb-1 inline-block rounded-full border border-green/30 bg-green-soft/60 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-green">
                        {tag}
                      </span>
                    )}
                    <p className="text-[12px] leading-snug text-ink">&ldquo;{note.body}&rdquo;</p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
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
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
