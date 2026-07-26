"use client";

import { useState } from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { SCOUT_REQUEST_STATUS_LABELS, type ScoutRequest, type ScoutRequestStatus } from "@/lib/scoutRequestSchema";

function buildScoutHref(request: ScoutRequest): string {
  const params = new URLSearchParams({
    city: request.city,
    state: request.state,
    routeId: request.routeId,
    pathGoal: request.pathGoal,
  });
  return `/admin/opportunity-scout?${params.toString()}`;
}

export default function ScoutRequestsAdminPage() {
  const [adminToken, setAdminToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<ScoutRequest[] | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  async function handleLoad() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scout-requests", {
        headers: { "x-admin-token": adminToken },
      });
      const data = await res.json();
      if (!data.ok) {
        setError(
          res.status === 401
            ? "Admin token required. This protects scout requests from public use."
            : data.error
        );
        return;
      }
      setRequests(data.requests);
    } catch {
      setError("Something went wrong reaching Pathoro. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: ScoutRequestStatus) {
    setActioningId(id);
    setError(null);
    try {
      const res = await fetch(`/api/scout-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(
          res.status === 401
            ? "Admin token required. This protects scout requests from public use."
            : data.error
        );
        return;
      }
      setRequests((prev) =>
        prev ? prev.map((r) => (r.id === id ? { ...r, status } : r)) : prev
      );
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
            requested paths show up here.
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <Link href="/admin" className="text-[12px] font-semibold text-green underline">
              Admin hub
            </Link>
            <Link
              href="/admin/opportunity-scout"
              className="text-[12px] font-semibold text-green underline"
            >
              Opportunity scout
            </Link>
          </span>
        </div>

        <div className="mt-3 rounded-2xl border border-green/40 bg-green-soft/15 px-4 py-3 text-[11.5px] leading-relaxed text-ink-soft">
          Someone asked Pathoro to look for real-world access points on
          their path. Open a request in the Opportunity Scout to search on
          their behalf, then mark it scouted once you&rsquo;ve found — or
          reject it if there&rsquo;s nothing actionable here.
        </div>

        <h1 className="mt-6 font-serif text-[26px] leading-tight text-ink">
          Scout requests (prototype)
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-faint">
          Requests from the public &ldquo;Want Pathoro to scout this
          path?&rdquo; card on /route-planning.
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
            {loading ? "Loading…" : "Load scout requests"}
          </button>
        </div>

        {error && (
          <div className="shadow-card mt-6 rounded-[26px] border border-red-200 bg-red-50 px-5 py-4 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {requests && requests.length === 0 && (
          <p className="mt-6 text-[13px] text-ink-faint">No scout requests yet.</p>
        )}

        {requests && requests.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            {requests.map((req) => {
              const route = routes.find((r) => r.id === req.routeId);
              return (
                <div
                  key={req.id}
                  className="shadow-card flex flex-col gap-2 rounded-[26px] border border-line/70 bg-cream-card px-5 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[13.5px] font-semibold text-ink">
                      {req.pathGoal || "Untitled path"}
                    </span>
                    <span className="rounded-full border border-green/40 bg-green-soft/60 px-2 py-0.5 text-[10px] font-semibold text-green">
                      {SCOUT_REQUEST_STATUS_LABELS[req.status]}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-ink-faint">
                    {req.city}
                    {req.state ? `, ${req.state}` : ""} ·{" "}
                    {route?.title ?? req.routeId} ·{" "}
                    {new Date(req.createdAt).toLocaleString()}
                  </p>
                  {req.userContext && (
                    <p className="text-[12.5px] leading-relaxed text-ink-soft">
                      {req.userContext}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <Link
                      href={buildScoutHref(req)}
                      className="rounded-full border border-green/40 bg-green-soft px-3 py-1.5 text-[12px] font-medium text-green outline-none transition hover:bg-green-soft/70 focus-visible:ring-2 focus-visible:ring-green/50"
                    >
                      Open in Opportunity Scout
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(req.id, "reviewed")}
                      disabled={actioningId === req.id}
                      className="text-[12px] font-medium text-ink-faint underline disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Mark reviewed
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(req.id, "scouted")}
                      disabled={actioningId === req.id}
                      className="text-[12px] font-medium text-ink-faint underline disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Mark scouted
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(req.id, "rejected")}
                      disabled={actioningId === req.id}
                      className="text-[12px] font-medium text-ink-faint underline disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
