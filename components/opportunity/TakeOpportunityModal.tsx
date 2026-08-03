"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ExternalLink, X } from "lucide-react";
import { TRUST_LABEL_CLASS, type TrustLabel } from "@/lib/trustLabels";
import { OPPORTUNITY_ACTION_TYPE_LABELS, type OpportunityActionType } from "@/lib/opportunityActionSchema";

const ACTION_TYPES: OpportunityActionType[] = [
  "attend_apply_signup",
  "verify_first",
  "find_someone_ahead",
  "similar_access_points",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The real behavior behind "Take this opportunity" (v0.36) — always
 * available regardless of source_url, so the button never degrades to a
 * scroll or a dead end. Submits an opportunity_actions row that an admin
 * reviews manually. Opening the original source (when one exists) is an
 * additional option inside the modal, not a replacement for starting a
 * real Pathoro action.
 */
export function TakeOpportunityModal({
  opportunityId,
  opportunitySlug,
  opportunityTitle,
  goal,
  routeId,
  routeTitle,
  sourceUrl,
  trustLabel,
  opportunityType,
  onClose,
}: {
  opportunityId: string;
  opportunitySlug: string;
  opportunityTitle: string;
  goal: string;
  routeId: string;
  routeTitle: string;
  sourceUrl: string | null;
  trustLabel: TrustLabel;
  opportunityType: string;
  onClose: () => void;
}) {
  const [actionType, setActionType] = useState<OpportunityActionType>("attend_apply_signup");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const isExample = trustLabel === "Example listing";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedEmail = userEmail.trim();
    if (trimmedEmail && !EMAIL_RE.test(trimmedEmail)) {
      setError("That email address doesn't look right.");
      return;
    }
    setError(null);
    setStatus("submitting");
    try {
      const res = await fetch("/api/opportunity-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId,
          opportunityTitle,
          opportunitySlug,
          goal,
          routeId,
          actionType,
          userName: userName.trim(),
          userEmail: trimmedEmail,
          message: message.trim(),
          sourceUrl,
          trustLabel,
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
              {status === "sent" ? "Opportunity step started." : "Take this opportunity"}
            </h3>
            {status !== "sent" && (
              <p className="mt-1 text-[12px] text-ink-faint">
                Pathoro will help you start this next step.
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
              Pathoro saved this as a next step. In this alpha, requests are reviewed manually.
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
          <>
            <div className="mt-4 rounded-2xl border border-line/70 bg-cream-field px-3.5 py-3">
              <span className="block text-[13px] font-semibold text-ink">{opportunityTitle}</span>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink-faint">
                {routeTitle && `${routeTitle} · `}
                {goal || "General opportunity"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${TRUST_LABEL_CLASS[trustLabel]}`}
                >
                  {trustLabel}
                </span>
                {opportunityType && (
                  <span className="rounded-full border border-line/70 px-2 py-0.5 text-[10px] font-medium text-ink-faint">
                    {opportunityType}
                  </span>
                )}
              </div>
              {isExample && (
                <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
                  This is an example access point. Pathoro can help you scout or act on similar
                  real opportunities.
                </p>
              )}
            </div>

            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-full border border-line/70 py-2.5 text-[12.5px] font-medium text-ink outline-none transition hover:border-ink-faint/40 focus-visible:ring-2 focus-visible:ring-green/50"
              >
                Open original source
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
              </a>
            ) : (
              <p className="mt-3 rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.5 text-[11.5px] leading-relaxed text-ink-soft">
                There&rsquo;s no outside source for this one yet. Pathoro can help you scout or
                verify the next step.
              </p>
            )}

            {/* Alpha honesty note (v0.39 "Fix opportunity action landing and
                submission") — this modal only ever writes a Pathoro-side
                request, never an outside signup, so it must never read as
                "you're now registered." */}
            <p className="mt-3 text-[10.5px] leading-relaxed text-ink-faint">
              If this opportunity has an outside source, you may still need to sign up or apply
              there yourself. Pathoro saves your next-step request so you can verify it, act on
              it, or get help from someone ahead — it doesn&rsquo;t sign you up or contact the
              outside organization for you.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5">
              <fieldset>
                <legend className="block text-[11px] font-semibold text-ink-faint">
                  What do you want to do?
                </legend>
                <div className="mt-1.5 flex flex-col gap-1.5">
                  {ACTION_TYPES.map((type) => (
                    <label
                      key={type}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-[12.5px] transition ${
                        actionType === type
                          ? "border-green/50 bg-green-soft/40 text-ink"
                          : "border-line/70 text-ink-soft hover:border-ink-faint/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="actionType"
                        value={type}
                        checked={actionType === type}
                        onChange={() => setActionType(type)}
                        className="h-3.5 w-3.5 accent-green"
                      />
                      {OPPORTUNITY_ACTION_TYPE_LABELS[type]}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className="block text-[11px] font-semibold text-ink-faint">Name (optional)</span>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.5 text-[12.5px] text-ink outline-none placeholder:text-ink-faint/70 focus:border-green/50"
                />
              </label>

              <label className="block">
                <span className="block text-[11px] font-semibold text-ink-faint">
                  Email (optional, so Pathoro can follow up)
                </span>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.5 text-[12.5px] text-ink outline-none placeholder:text-ink-faint/70 focus:border-green/50"
                />
              </label>

              <label className="block">
                <span className="block text-[11px] font-semibold text-ink-faint">
                  Message / question (optional)
                </span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full resize-none rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.5 text-[12.5px] text-ink outline-none placeholder:text-ink-faint/70 focus:border-green/50"
                />
              </label>

              {error && <p className="text-[11.5px] text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-1 rounded-full bg-green py-2.5 text-[13.5px] font-medium text-cream outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? "Starting…" : "Start this next step"}
              </button>
              <p className="text-[10.5px] leading-snug text-ink-faint">
                In this alpha, Pathoro helps you organize the next step and reviews requests
                manually. Not intended for children under 13.
              </p>
              <p className="text-[10.5px] leading-snug text-ink-faint">
                By submitting, you agree to Pathoro&rsquo;s{" "}
                <Link href="/terms" className="underline hover:text-ink-soft">Terms</Link> and acknowledge the{" "}
                <Link href="/privacy" className="underline hover:text-ink-soft">Privacy Policy</Link>.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
