"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PATH_GUIDE_REQUEST_STATUS_LABELS,
  type PathGuideRequest,
  type PathGuideRequestStatus,
} from "@/lib/pathGuideRequestSchema";

export default function PathGuideRequestsAdminPage() {
  const [adminToken, setAdminToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<PathGuideRequest[] | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  async function handleLoad() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/path-guide-requests", {
        headers: { "x-admin-token": adminToken },
      });
      const data = await res.json();
      if (!data.ok) {
        setError(
          res.status === 401
            ? "Admin token required. This protects path guide requests from public use."
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

  async function handleStatusChange(id: string, status: PathGuideRequestStatus) {
    setActioningId(id);
    setError(null);
    try {
      const res = await fetch(`/api/path-guide-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(
          res.status === 401
            ? "Admin token required. This protects path guide requests from public use."
            : data.error
        );
        return;
      }
      setRequests((prev) => (prev ? prev.map((r) => (r.id === id ? { ...r, status } : r)) : prev));
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
            path guide requests show up here.
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <Link href="/admin" className="text-[12px] font-semibold text-green underline">
              Admin hub
            </Link>
            <Link href="/trail-map" className="text-[12px] font-semibold text-green underline">
              Trail Map
            </Link>
          </span>
        </div>

        <div className="mt-3 rounded-2xl border border-green/40 bg-green-soft/15 px-4 py-3 text-[11.5px] leading-relaxed text-ink-soft">
          Path Guides are people ahead on the path — not generic coaches.
          Guide matching is manual in this alpha: read what someone wants
          to ask, find a person with direct experience, and mark the
          request matched once you&rsquo;ve connected them (or reject it
          if there&rsquo;s nothing Pathoro can do here).
        </div>

        <h1 className="mt-6 font-serif text-[26px] leading-tight text-ink">
          Path guide requests (prototype)
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-faint">
          Requests from the &ldquo;Need a path guide?&rdquo; card on
          /trail-map.
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
            {loading ? "Loading…" : "Load path guide requests"}
          </button>
        </div>

        {error && (
          <div className="shadow-card mt-6 rounded-[26px] border border-red-200 bg-red-50 px-5 py-4 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {requests && requests.length === 0 && (
          <p className="mt-6 text-[13px] text-ink-faint">No path guide requests yet.</p>
        )}

        {requests && requests.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="shadow-card flex flex-col gap-2 rounded-[26px] border border-line/70 bg-cream-card px-5 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[13.5px] font-semibold text-ink">
                    {req.branchTitle || req.goalTitle || "Untitled path"}
                  </span>
                  <span className="rounded-full border border-green/40 bg-green-soft/60 px-2 py-0.5 text-[10px] font-semibold text-green">
                    {PATH_GUIDE_REQUEST_STATUS_LABELS[req.status]}
                  </span>
                </div>
                <p className="text-[11.5px] text-ink-faint">
                  {req.goalTitle}
                  {req.branchTitle ? ` · ${req.branchTitle}` : ""} ·{" "}
                  {new Date(req.createdAt).toLocaleString()}
                </p>
                <p className="text-[13px] leading-relaxed text-ink">&ldquo;{req.question}&rdquo;</p>
                {req.requestedGuideType && (
                  <p className="text-[11.5px] text-ink-soft">
                    <span className="font-semibold text-ink-faint">Looking for: </span>
                    {req.requestedGuideType}
                  </p>
                )}
                {req.contactEmail && (
                  <p className="text-[11.5px] text-ink-soft">
                    <span className="font-semibold text-ink-faint">Contact: </span>
                    {req.contactEmail}
                  </p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-3">
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
                    onClick={() => handleStatusChange(req.id, "matched")}
                    disabled={actioningId === req.id}
                    className="rounded-full border border-green/40 bg-green-soft px-3 py-1.5 text-[12px] font-medium text-green outline-none transition hover:bg-green-soft/70 focus-visible:ring-2 focus-visible:ring-green/50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Mark matched
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
