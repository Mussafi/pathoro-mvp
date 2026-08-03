"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";

const PROMPT_EXAMPLES = [
  "What should I know before paying for a program?",
  "What surprised you about this path?",
  "What first step was actually useful?",
  "What would you avoid if starting again?",
];

const MIN_QUESTION_LENGTH = 8;

/** Plain-string props rather than full TrailMapGoal/TrailMapBranch
 * objects, so this modal works for any "ask someone ahead" flow — a
 * Trail Map branch or an opportunity detail page — without either
 * caller having to fake the other's shape. The API only ever stored
 * goalId/goalTitle/branchId/branchTitle text anyway (see
 * lib/pathGuideRequestSchema.ts). */
export function PathGuideRequestModal({
  goalId,
  goalTitle,
  branchId,
  branchTitle,
  defaultGuideType,
  onClose,
}: {
  goalId: string;
  goalTitle: string;
  branchId: string;
  branchTitle: string;
  defaultGuideType: string;
  onClose: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [guideType, setGuideType] = useState(defaultGuideType);
  const [contactEmail, setContactEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (trimmed.length < MIN_QUESTION_LENGTH) {
      setError("Add a little more detail to your question.");
      return;
    }
    setError(null);
    setStatus("submitting");
    try {
      const res = await fetch("/api/path-guide-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId,
          goalTitle,
          branchId,
          branchTitle,
          question: trimmed,
          requestedGuideType: guideType.trim(),
          contactEmail: contactEmail.trim(),
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      setStatus("sent");
    } catch {
      setError("Something went wrong reaching Pathoro. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onClick={onClose}
    >
      <div
        className="shadow-card w-full max-w-[440px] rounded-[26px] border border-line/70 bg-cream-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-[19px] leading-tight text-ink">
              {status === "sent" ? "Path guide request sent." : "Request a path guide"}
            </h3>
            {status !== "sent" && (
              <p className="mt-1 text-[12px] text-ink-faint">
                {branchTitle} · {goalTitle}
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
              Pathoro will look for someone with direct experience on this
              path. In this alpha, guide matching is reviewed manually.
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
            <div>
              <label className="block text-[11px] font-semibold text-ink-faint">
                What would you want to ask someone ahead on this path?
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                placeholder="What should I know before paying for a program?"
                className="mt-1.5 w-full resize-none rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.5 text-[12.5px] text-ink outline-none placeholder:text-ink-faint/70 focus:border-green/50"
              />
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {PROMPT_EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setQuestion(example)}
                    className="rounded-full border border-line/70 px-2.5 py-1 text-[10.5px] text-ink-faint outline-none transition hover:border-green/40 hover:text-ink-soft focus-visible:ring-2 focus-visible:ring-green/50"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="block text-[11px] font-semibold text-ink-faint">
                What kind of person would be helpful?
              </span>
              <input
                type="text"
                value={guideType}
                onChange={(e) => setGuideType(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.5 text-[12.5px] text-ink outline-none placeholder:text-ink-faint/70 focus:border-green/50"
              />
            </label>

            <label className="block">
              <span className="block text-[11px] font-semibold text-ink-faint">
                Email (optional, so Pathoro can follow up)
              </span>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.5 text-[12.5px] text-ink outline-none placeholder:text-ink-faint/70 focus:border-green/50"
              />
            </label>

            {error && <p className="text-[11.5px] text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-1 rounded-full bg-green py-2.5 text-[13.5px] font-medium text-cream outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "submitting" ? "Sending…" : "Send request"}
            </button>
            <p className="text-[10.5px] leading-snug text-ink-faint">
              Not intended for children under 13 — please don&rsquo;t submit personal information if you are under 13.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
