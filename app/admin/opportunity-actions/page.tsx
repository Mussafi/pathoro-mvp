"use client";

import { useState } from "react";
import Link from "next/link";
import {
  OPPORTUNITY_ACTION_STATUS_LABELS,
  OPPORTUNITY_ACTION_TYPE_LABELS,
  type OpportunityAction,
  type OpportunityActionStatus,
} from "@/lib/opportunityActionSchema";

const STATUS_OPTIONS: OpportunityActionStatus[] = [
  "new",
  "reviewing",
  "contacted",
  "completed",
  "archived",
];

export default function OpportunityActionsAdminPage() {
  const [adminToken, setAdminToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actions, setActions] = useState<OpportunityAction[] | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  async function handleLoad() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/opportunity-actions", {
        headers: { "x-admin-token": adminToken },
      });
      const data = await res.json();
      if (!data.ok) {
        setError(
          res.status === 401
            ? "Admin token required. This protects opportunity actions from public use."
            : data.error
        );
        return;
      }
      setActions(data.actions);
    } catch {
      setError("Something went wrong reaching Pathoro. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: OpportunityActionStatus) {
    setActioningId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/opportunity-actions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(
          res.status === 401
            ? "Admin token required. This protects opportunity actions from public use."
            : data.error
        );
        return;
      }
      setActions((prev) => (prev ? prev.map((a) => (a.id === id ? { ...a, status } : a)) : prev));
    } catch {
      setError("Something went wrong reaching Pathoro. Please try again.");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-[760px]">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/70 bg-cream-field px-4 py-3 text-[12px] text-ink-faint">
          <span>
            Internal prototype — not linked publicly. Real users&rsquo; &ldquo;Take this
            opportunity&rdquo; requests show up here.
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <Link href="/admin" className="text-[12px] font-semibold text-green underline">
              Admin hub
            </Link>
            <Link href="/route-planning" className="text-[12px] font-semibold text-green underline">
              Route Planning
            </Link>
          </span>
        </div>

        <div className="mt-3 rounded-2xl border border-green/40 bg-green-soft/15 px-4 py-3 text-[11.5px] leading-relaxed text-ink-soft">
          Every &ldquo;Take this opportunity&rdquo; click on a /opportunity/[id] page ends
          up here — regardless of whether the opportunity has a source link. Review what
          someone wants to do, follow up if they left an email, and move the status along
          as you act on it.
        </div>

        <h1 className="mt-6 font-serif text-[26px] leading-tight text-ink">
          Opportunity actions (prototype)
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-faint">
          Requests from the &ldquo;Take this opportunity&rdquo; button on opportunity detail
          pages.
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
              Use the ADMIN_TOKEN from your local .env.local / Vercel environment variables.
            </span>
          </label>
          <button
            type="button"
            onClick={handleLoad}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-full bg-green py-2.5 text-[13.5px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loading…" : "Load opportunity actions"}
          </button>
        </div>

        {error && (
          <div className="shadow-card mt-6 rounded-[26px] border border-red-200 bg-red-50 px-5 py-4 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {actions && actions.length === 0 && (
          <p className="mt-6 text-[13px] text-ink-faint">No opportunity actions yet.</p>
        )}

        {actions && actions.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            {actions.map((action) => (
              <div
                key={action.id}
                className="shadow-card flex flex-col gap-2 rounded-[26px] border border-line/70 bg-cream-card px-5 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[13.5px] font-semibold text-ink">
                    {action.opportunitySlug ? (
                      <Link
                        href={`/opportunity/${action.opportunitySlug}`}
                        className="underline-offset-2 hover:underline"
                      >
                        {action.opportunityTitle}
                      </Link>
                    ) : (
                      action.opportunityTitle
                    )}
                  </span>
                  <span className="rounded-full border border-green/40 bg-green-soft/60 px-2 py-0.5 text-[10px] font-semibold text-green">
                    {OPPORTUNITY_ACTION_STATUS_LABELS[action.status]}
                  </span>
                </div>
                <p className="text-[11.5px] text-ink-faint">
                  {action.goal || "No goal recorded"}
                  {action.trustLabel ? ` · ${action.trustLabel}` : ""} ·{" "}
                  {new Date(action.createdAt).toLocaleString()}
                </p>
                <p className="text-[13px] leading-relaxed text-ink">
                  <span className="font-semibold text-ink-faint">Wants to: </span>
                  {OPPORTUNITY_ACTION_TYPE_LABELS[action.actionType]}
                </p>
                {action.message && (
                  <p className="text-[13px] leading-relaxed text-ink-soft">
                    &ldquo;{action.message}&rdquo;
                  </p>
                )}
                {(action.userName || action.userEmail) && (
                  <p className="text-[11.5px] text-ink-soft">
                    <span className="font-semibold text-ink-faint">From: </span>
                    {action.userName || "—"}
                    {action.userEmail ? ` · ${action.userEmail}` : ""}
                  </p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleStatusChange(action.id, option)}
                      disabled={actioningId === action.id || action.status === option}
                      className={`rounded-full border px-3 py-1.5 text-[12px] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-green/50 disabled:cursor-not-allowed ${
                        action.status === option
                          ? "border-green/40 bg-green-soft text-green"
                          : "border-line/70 text-ink-faint hover:border-ink-faint/40 disabled:opacity-60"
                      }`}
                    >
                      {OPPORTUNITY_ACTION_STATUS_LABELS[option]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
