import { BadgeCheck, Heart, MapPin } from "lucide-react";
import { getBranchAccentClasses, type TrailMapBranch, type TrailNote } from "@/lib/trailMapData";
import { TrailMarkerCard } from "@/components/route/TrailMarkersSection";
import { AddTrailMarkerButton } from "@/components/community/AddTrailMarkerButton";
import { useTrailMarkers } from "@/lib/useTrailMarkers";
import { isPathoroStarterNote } from "@/lib/trailMarkerSchema";

/** Detects the note's flavor from its own leading phrase so each note can
 * carry a small tag — "hidden friction," "better first step," "opened
 * doors" — the same shorthand people ahead actually use, not a generic
 * comment label. Only used for the static example notes below — real
 * markers already carry a real marker_type, rendered via TrailMarkerCard. */
function getNoteTag(body: string): string | null {
  const lower = body.toLowerCase();
  if (lower.startsWith("warning")) return "Warning from someone ahead";
  if (lower.startsWith("hidden friction")) return "Hidden friction";
  if (lower.startsWith("better first step")) return "Better first step";
  if (lower.includes("opened doors")) return "What opened doors";
  if (lower.startsWith("what this required")) return "What this required";
  if (lower.startsWith("ask about") || lower.startsWith("ask ")) return "What this required";
  return null;
}

export function TrailMapNotesPanel({
  goal,
  branch,
  notes,
  notesTotal,
  notesAreExamples,
}: {
  /** Trail map goal id (TrailMapGoal.id) — the community-layer `goal`
   * filter used together with branch.id to find real trail markers for
   * this exact branch (v0.40 PART 7). */
  goal: string;
  branch: TrailMapBranch;
  notes: TrailNote[];
  notesTotal: number;
  /** True on generated starter maps — these are illustrative, not real
   * user-submitted notes, so the panel says so rather than implying
   * social proof Pathoro doesn't have yet. */
  notesAreExamples?: boolean;
}) {
  const forBranch = notes.filter((n) => n.branchId === branch.id);
  const accent = getBranchAccentClasses(branch.id);
  const { markers: realMarkers, loading, refresh } = useTrailMarkers({ goal, branchId: branch.id });

  // Real approved markers always come first. Static examples only fill in
  // when there's nothing real yet — once at least one real marker exists,
  // examples stop showing (v0.40 PART 7).
  const showExamples = realMarkers.length === 0;
  // v0.42 "Truth, Trust, and Alpha Readiness": Pathoro's own starter notes
  // (see lib/trailMarkerSchema.ts) count as "real" for display purposes,
  // but the intro copy must never blur them into "notes from people ahead"
  // — that would imply a real person submitted them.
  const hasStarterNotes = realMarkers.some(isPathoroStarterNote);
  const hasRealUserNotes = realMarkers.some((m) => !isPathoroStarterNote(m));

  return (
    <div className="shadow-card flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          <MapPin className="h-4 w-4 text-green" strokeWidth={1.75} />
          Trail notes ({realMarkers.length > 0 ? realMarkers.length : notesTotal})
        </span>
        <AddTrailMarkerButton
          context={{ contextType: "branch", goal, branchId: branch.id, trailGoal: goal }}
          label={realMarkers.length === 0 ? "Leave the first real trail marker" : "Leave a trail marker"}
          className="text-[11px] font-medium text-green outline-none transition hover:underline"
          onSubmitted={refresh}
        />
      </div>
      {showExamples && (
        <span className="mt-1.5 inline-block w-fit rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-amber-700">
          Example trail notes
        </span>
      )}
      <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
        {showExamples
          ? notesAreExamples
            ? "Illustrative examples of the kind of notes people ahead often leave — not real user-submitted notes yet. Trail notes are attached to the path — not a feed."
            : "No real trail markers here yet, so these are illustrative examples of the kind of notes people ahead often leave. Trail notes are attached to the path — not a feed."
          : hasStarterNotes && hasRealUserNotes
            ? "Starter notes and notes from people ahead of you — attached to this path, not a feed."
            : hasStarterNotes
              ? "Pathoro starter notes appear first during alpha. As people contribute, real trail markers from people ahead will replace and improve them."
              : "Notes from people ahead of you on this exact path — hidden friction, better first steps, what opened doors, or a warning worth knowing. Trail notes are attached to the path — not a feed."}
      </p>
      {!showExamples && (
        <p className="mt-1 text-[10px] leading-snug text-ink-faint/80">
          Submitted markers are reviewed before they appear here. Approved markers are community
          context, not guaranteed facts.
        </p>
      )}

      <div className="mt-3 flex flex-col gap-2.5">
        {loading ? (
          <p className="rounded-2xl border border-line/70 bg-cream-field px-3.5 py-3 text-[12px] leading-relaxed text-ink-faint">
            Loading trail markers…
          </p>
        ) : realMarkers.length > 0 ? (
          realMarkers.map((marker) => <TrailMarkerCard key={marker.id} marker={marker} />)
        ) : forBranch.length === 0 ? (
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

      <p className="mt-3 text-[10px] leading-relaxed text-ink-faint/80">
        In alpha, Pathoro combines source-backed scouting, starter notes, and moderated community
        markers. Review sources before acting.
      </p>
    </div>
  );
}
