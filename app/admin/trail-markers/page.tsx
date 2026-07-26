"use client";

import { useState } from "react";
import Link from "next/link";
import { MARKER_TYPE_LABELS, type TrailMarker } from "@/lib/trailMarkerSchema";

export default function TrailMarkersAdminPage() {
  const [adminToken, setAdminToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markers, setMarkers] = useState<TrailMarker[] | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  async function handleLoad() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trail-markers?status=needs_review", {
        headers: { "x-admin-token": adminToken },
      });
      const data = await res.json();
      if (!data.ok) {
        setError(
          res.status === 401
            ? "Admin token required. This protects trail marker review from public use."
            : data.error
        );
        return;
      }
      setMarkers(data.markers);
    } catch {
      setError("Something went wrong reaching Pathoro. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(id: string, status: "live" | "rejected") {
    setActioningId(id);
    setError(null);
    try {
      const res = await fetch(`/api/trail-markers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(
          res.status === 401
            ? "Admin token required. This protects trail marker review from public use."
            : data.error
        );
        return;
      }
      setMarkers((prev) => (prev ? prev.filter((m) => m.id !== id) : prev));
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
            Internal prototype — not linked publicly. Review trail markers
            before they appear on any opportunity or route.
          </span>
          <Link
            href="/admin/opportunity-scout"
            className="shrink-0 text-[12px] font-semibold text-green underline"
          >
            Opportunity scout
          </Link>
        </div>

        <div className="mt-3 rounded-2xl border border-green/40 bg-green-soft/15 px-4 py-3 text-[11.5px] leading-relaxed text-ink-soft">
          Trail markers are signs from people who&rsquo;ve walked this path
          already — not comments. Approve markers that add real path
          knowledge; reject anything vague, off-topic, or unhelpful.
        </div>

        <h1 className="mt-6 font-serif text-[26px] leading-tight text-ink">
          Trail marker review (prototype)
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-faint">
          Markers stay hidden until approved here.
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
            {loading ? "Loading…" : "Load markers needing review"}
          </button>
        </div>

        {error && (
          <div className="shadow-card mt-6 rounded-[26px] border border-red-200 bg-red-50 px-5 py-4 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {markers && markers.length === 0 && (
          <p className="mt-6 text-[13px] text-ink-faint">
            Nothing needs review right now.
          </p>
        )}

        {markers && markers.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            {markers.map((marker) => (
              <div
                key={marker.id}
                className="shadow-card flex flex-col gap-2 rounded-[26px] border border-line/70 bg-cream-card px-5 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full border border-green/40 bg-green-soft/60 px-2 py-0.5 text-[10px] font-semibold text-green">
                    {MARKER_TYPE_LABELS[marker.markerType]}
                  </span>
                  <span className="text-[11px] text-ink-faint">
                    {new Date(marker.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-[11.5px] text-ink-faint">
                  {marker.opportunityId && <>Opportunity: {marker.opportunityId}</>}
                  {marker.opportunityId && marker.routeId ? " · " : ""}
                  {marker.routeId && <>Route: {marker.routeId}</>}
                </p>
                <p className="text-[13px] leading-relaxed text-ink">{marker.body}</p>
                <p className="text-[11.5px] text-ink-faint">
                  {marker.displayName || "Anonymous"}
                  {marker.city ? ` · ${marker.city}` : ""}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleReview(marker.id, "live")}
                    disabled={actioningId === marker.id}
                    className="rounded-full border border-green/40 bg-green-soft px-3 py-1.5 text-[12px] font-medium text-green outline-none transition hover:bg-green-soft/70 focus-visible:ring-2 focus-visible:ring-green/50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReview(marker.id, "rejected")}
                    disabled={actioningId === marker.id}
                    className="rounded-full border border-line/70 px-3 py-1.5 text-[12px] font-medium text-ink-faint outline-none transition hover:border-ink-faint/40 disabled:cursor-not-allowed disabled:opacity-60"
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
