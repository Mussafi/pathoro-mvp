"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_STATUS_LABELS,
  type Feedback,
  type FeedbackStatus,
} from "@/lib/feedbackSchema";

export default function FeedbackAdminPage() {
  const [adminToken, setAdminToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback[] | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  async function handleLoad() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        headers: { "x-admin-token": adminToken },
      });
      const data = await res.json();
      if (!data.ok) {
        setError(
          res.status === 401
            ? "Admin token required. This protects feedback from public use."
            : data.error
        );
        return;
      }
      setFeedback(data.feedback);
    } catch {
      setError("Something went wrong reaching Pathoro. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: FeedbackStatus) {
    setActioningId(id);
    setError(null);
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(
          res.status === 401
            ? "Admin token required. This protects feedback from public use."
            : data.error
        );
        return;
      }
      setFeedback((prev) => (prev ? prev.map((f) => (f.id === id ? { ...f, status } : f)) : prev));
    } catch {
      setError("Something went wrong reaching Pathoro. Please try again.");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-[720px]">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/70 bg-cream-field px-4 py-3 text-[12px] text-ink-faint">
          <span>
            Internal prototype — not linked publicly. Real users&rsquo;
            feedback from the footer and /contact shows up here.
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <Link href="/admin" className="text-[12px] font-semibold text-green underline">
              Admin hub
            </Link>
          </span>
        </div>

        <h1 className="mt-6 font-serif text-[26px] leading-tight text-ink">
          Feedback (prototype)
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-faint">
          What people said helped, confused them, or was wrong.
        </p>

        <div className="shadow-card mt-6 flex flex-col gap-3 rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
          <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
            <span className="block text-[10.5px] text-ink-faint">Admin token</span>
            <input
              type="password"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="Paste the shared admin token"
              className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint/70"
            />
            <span className="mt-1 block text-[10.5px] leading-snug text-ink-faint">
              Use the ADMIN_TOKEN from your local .env.local / Vercel
              environment variables.
            </span>
          </label>
          <button
            type="button"
            onClick={handleLoad}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-full bg-green py-2.5 text-[13.5px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loading…" : "Load feedback"}
          </button>
        </div>

        {error && (
          <div className="shadow-card mt-6 rounded-[26px] border border-red-200 bg-red-50 px-5 py-4 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {feedback && feedback.length === 0 && (
          <p className="mt-6 text-[13px] text-ink-faint">No feedback yet.</p>
        )}

        {feedback && feedback.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            {feedback.map((f) => (
              <div
                key={f.id}
                className="shadow-card flex flex-col gap-2 rounded-[26px] border border-line/70 bg-cream-card px-5 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full border border-green/40 bg-green-soft/60 px-2 py-0.5 text-[10px] font-semibold text-green">
                    {FEEDBACK_CATEGORY_LABELS[f.category]}
                  </span>
                  <span className="rounded-full border border-line/70 px-2 py-0.5 text-[10px] font-medium text-ink-faint">
                    {FEEDBACK_STATUS_LABELS[f.status]}
                  </span>
                </div>
                <p className="text-[11.5px] text-ink-faint">{new Date(f.createdAt).toLocaleString()}</p>
                <p className="text-[13px] leading-relaxed text-ink">&ldquo;{f.message}&rdquo;</p>
                {f.pageUrl && (
                  <p className="truncate text-[11.5px] text-ink-soft">
                    <span className="font-semibold text-ink-faint">From: </span>
                    {f.pageUrl}
                  </p>
                )}
                {f.contactEmail && (
                  <p className="text-[11.5px] text-ink-soft">
                    <span className="font-semibold text-ink-faint">Contact: </span>
                    {f.contactEmail}
                  </p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(f.id, "reviewed")}
                    disabled={actioningId === f.id}
                    className="rounded-full border border-green/40 bg-green-soft px-3 py-1.5 text-[12px] font-medium text-green outline-none transition hover:bg-green-soft/70 focus-visible:ring-2 focus-visible:ring-green/50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Mark reviewed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(f.id, "archived")}
                    disabled={actioningId === f.id}
                    className="text-[12px] font-medium text-ink-faint underline disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
