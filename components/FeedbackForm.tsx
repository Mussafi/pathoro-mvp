"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { FEEDBACK_CATEGORY_LABELS, type FeedbackCategory } from "@/lib/feedbackSchema";

const CATEGORY_ORDER: FeedbackCategory[] = [
  "helpful",
  "confusing",
  "wrong",
  "path_request",
  "trail_marker_interest",
  "other",
];

const MIN_MESSAGE_LENGTH = 4;

/** Shared body of the "Share feedback" flow — used both inside the footer
 * modal and directly on /contact, so there's one form to keep honest
 * rather than two near-duplicates drifting apart. */
export function FeedbackForm({ onSent }: { onSent?: () => void }) {
  const [category, setCategory] = useState<FeedbackCategory>("helpful");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < MIN_MESSAGE_LENGTH) {
      setError("Add a little more detail so Pathoro knows what you mean.");
      return;
    }
    setError(null);
    setStatus("submitting");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: trimmed,
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
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
      onSent?.();
    } catch {
      setError("Something went wrong reaching Pathoro. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <p className="text-[13px] leading-relaxed text-ink-soft">
        Thanks — this goes straight to the person building Pathoro. In this
        alpha, feedback is reviewed manually.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <div>
        <span className="block text-[11px] font-semibold text-ink-faint">What&rsquo;s this about?</span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {CATEGORY_ORDER.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={
                c === category
                  ? "rounded-full border border-green/40 bg-green-soft px-2.5 py-1 text-[10.5px] font-medium text-green outline-none"
                  : "rounded-full border border-line/70 px-2.5 py-1 text-[10.5px] text-ink-faint outline-none transition hover:border-green/40 hover:text-ink-soft focus-visible:ring-2 focus-visible:ring-green/50"
              }
            >
              {FEEDBACK_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="block text-[11px] font-semibold text-ink-faint">Tell us more</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="What felt useful, confusing, or wrong?"
          className="mt-1.5 w-full resize-none rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.5 text-[12.5px] text-ink outline-none placeholder:text-ink-faint/70 focus:border-green/50"
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
        {status === "submitting" ? "Sending…" : "Send feedback"}
      </button>
      <p className="text-[10.5px] leading-snug text-ink-faint">
        Not intended for children under 13 — please don&rsquo;t submit personal information if you are under 13.
      </p>
      <p className="text-[10.5px] leading-snug text-ink-faint">
        By submitting, you agree to Pathoro&rsquo;s{" "}
        <Link href="/terms" className="underline hover:text-ink-soft">Terms</Link> and acknowledge the{" "}
        <Link href="/privacy" className="underline hover:text-ink-soft">Privacy Policy</Link>.
      </p>
    </form>
  );
}
