"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import {
  COMMUNITY_MARKER_TYPES,
  MARKER_TYPE_LABELS,
  TRAIL_MARKER_BODY_MAX_LENGTH,
  TRAIL_MARKER_BODY_MIN_LENGTH,
  isValidMarkerBody,
  type CommunityMarkerType,
  type ContextType,
  type MarkerType,
} from "@/lib/trailMarkerSchema";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type TrailMarkerContext = {
  contextType: ContextType;
  goal?: string;
  routeId?: string;
  trailGoal?: string;
  branchId?: string;
  milestoneId?: string;
  opportunityId?: string;
  candidateId?: string;
};

/**
 * The one shared "leave a trail marker" form (v0.40 PART 5) — every entry
 * point (Trail Map, opportunity page, candidate page) renders this same
 * component with different context, rather than each place growing its
 * own posting box. `fixedMarkerType` skips the type picker entirely for
 * the opportunity "Community checks" flow (PART 8), which always submits
 * marker_type = opportunity_check and never lets someone pick a different
 * type from that entry point.
 */
export function TrailMarkerComposer({
  context,
  fixedMarkerType,
  title,
  onClose,
  onSubmitted,
}: {
  context: TrailMarkerContext;
  fixedMarkerType?: MarkerType;
  title?: string;
  onClose: () => void;
  onSubmitted?: () => void;
}) {
  const [markerType, setMarkerType] = useState<CommunityMarkerType>(
    (fixedMarkerType as CommunityMarkerType) ?? COMMUNITY_MARKER_TYPES[0]
  );
  const [body, setBody] = useState("");
  const [experienceLabel, setExperienceLabel] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidMarkerBody(body)) {
      setError(
        `Say a bit more — between ${TRAIL_MARKER_BODY_MIN_LENGTH} and ${TRAIL_MARKER_BODY_MAX_LENGTH} characters.`
      );
      return;
    }
    const trimmedEmail = contactEmail.trim();
    if (trimmedEmail && !EMAIL_RE.test(trimmedEmail)) {
      setError("That email address doesn't look right.");
      return;
    }
    setError(null);
    setStatus("submitting");
    try {
      const res = await fetch("/api/trail-markers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contextType: context.contextType,
          goal: context.goal ?? "",
          routeId: context.routeId ?? "",
          trailGoal: context.trailGoal ?? "",
          branchId: context.branchId ?? "",
          milestoneId: context.milestoneId ?? "",
          opportunityId: context.opportunityId ?? "",
          candidateId: context.candidateId ?? "",
          markerType: fixedMarkerType ?? markerType,
          body,
          authorName,
          experienceLabel,
          contactEmail: trimmedEmail,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      setStatus("sent");
      onSubmitted?.();
    } catch {
      setError("Something went wrong reaching Pathoro. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="shadow-card max-h-full w-full max-w-[480px] overflow-y-auto rounded-[26px] border border-line/70 bg-cream-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-[19px] leading-tight text-ink">
              {status === "sent" ? "Trail marker submitted for review." : title ?? "Leave a trail marker"}
            </h3>
            {status !== "sent" && (
              <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
                Share something that would help someone behind you on this path.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-ink-faint outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-green/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {status === "sent" ? (
          <div className="mt-4">
            <p className="text-[13px] leading-relaxed text-ink-soft">
              Thanks — Pathoro will review this before it appears on the path.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-full bg-green py-2.5 text-[13.5px] font-medium text-cream outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5">
            {!fixedMarkerType && (
              <fieldset>
                <legend className="block text-[11px] font-semibold text-ink-faint">
                  What kind of marker is this?
                </legend>
                <div className="mt-1.5 flex flex-col gap-1.5">
                  {COMMUNITY_MARKER_TYPES.map((type) => (
                    <label
                      key={type}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-[12.5px] transition ${
                        markerType === type
                          ? "border-green/50 bg-green-soft/40 text-ink"
                          : "border-line/70 text-ink-soft hover:border-ink-faint/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="markerType"
                        value={type}
                        checked={markerType === type}
                        onChange={() => setMarkerType(type)}
                        className="h-3.5 w-3.5 accent-green"
                      />
                      {MARKER_TYPE_LABELS[type]}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <label className="block">
              <span className="block text-[11px] font-semibold text-ink-faint">
                What should someone know?
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={TRAIL_MARKER_BODY_MAX_LENGTH}
                required
                className="mt-1.5 w-full resize-none rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.5 text-[12.5px] text-ink outline-none placeholder:text-ink-faint/70 focus:border-green/50"
              />
            </label>

            <label className="block">
              <span className="block text-[11px] font-semibold text-ink-faint">
                Your experience/context (optional)
              </span>
              <input
                type="text"
                value={experienceLabel}
                onChange={(e) => setExperienceLabel(e.target.value)}
                placeholder="Example: apprentice electrician, 2 years in trade"
                className="mt-1.5 w-full rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.5 text-[12.5px] text-ink outline-none placeholder:text-ink-faint/70 focus:border-green/50"
              />
            </label>

            <label className="block">
              <span className="block text-[11px] font-semibold text-ink-faint">Name (optional)</span>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.5 text-[12.5px] text-ink outline-none placeholder:text-ink-faint/70 focus:border-green/50"
              />
            </label>

            <label className="block">
              <span className="block text-[11px] font-semibold text-ink-faint">Email (optional)</span>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.5 text-[12.5px] text-ink outline-none placeholder:text-ink-faint/70 focus:border-green/50"
              />
              <span className="mt-1 block text-[10.5px] leading-snug text-ink-faint">
                Only used if Pathoro needs to verify or follow up.
              </span>
            </label>

            {error && <p className="text-[11.5px] text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-1 rounded-full bg-green py-2.5 text-[13.5px] font-medium text-cream outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "submitting" ? "Submitting…" : "Submit trail marker"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
