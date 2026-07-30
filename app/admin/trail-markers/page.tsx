"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CONTEXT_TYPE_LABELS,
  CREDIBILITY_TYPE_LABELS,
  MARKER_TYPE_LABELS,
  type TrailMarker,
} from "@/lib/trailMarkerSchema";

type ViewMode = "pending" | "all";

function MarkerContextLine({ marker }: { marker: TrailMarker }) {
  const parts: string[] = [`Context: ${CONTEXT_TYPE_LABELS[marker.contextType]}`];
  if (marker.goal) parts.push(`Goal: ${marker.goal}`);
  if (marker.routeId) parts.push(`Route: ${marker.routeId}`);
  if (marker.branchId) parts.push(`Branch: ${marker.branchId}`);
  if (marker.milestoneId) parts.push(`Milestone: ${marker.milestoneId}`);
  if (marker.opportunityId) parts.push(`Opportunity: ${marker.opportunityId}`);
  if (marker.candidateId) parts.push(`Candidate: ${marker.candidateId}`);
  return <p className="text-[11.5px] text-ink-faint">{parts.join(" · ")}</p>;
}

export default function TrailMarkersAdminPage() {
  const [adminToken, setAdminToken] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markers, setMarkers] = useState<TrailMarker[] | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  async function handleLoad(mode: ViewMode = viewMode) {
    setViewMode(mode);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trail-markers?status=${mode}`, {
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
      setNotesDraft(
        Object.fromEntries(
          (data.markers as TrailMarker[]).map((m) => [m.id, m.moderationNotes ?? ""])
        )
      );
    } catch {
      setError("Something went wrong reaching Pathoro. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function patchMarker(id: string, body: Record<string, string>) {
    setActioningId(id);
    setError(null);
    try {
      const res = await fetch(`/api/trail-markers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify(body),
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
      if (viewMode === "pending" && body.status && body.status !== "pending") {
        setMarkers((prev) => (prev ? prev.filter((m) => m.id !== id) : prev));
      } else {
        setMarkers((prev) =>
          prev ? prev.map((m) => (m.id === id ? (data.marker as TrailMarker) : m)) : prev
        );
      }
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
            Internal prototype — not linked publicly. Review trail markers
            before they appear on any trail map, opportunity, or route.
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
          Trail markers are signs from people who&rsquo;ve walked this path
          already — not comments. Approve markers that add real path
          knowledge; reject anything vague, off-topic, or unhelpful. A
          submitter writing a credential in their own words (e.g. &ldquo;licensed
          therapist&rdquo;) does not make it verified — set credibility to
          Licensed guide or Verified experience yourself only once you&rsquo;re
          confident it&rsquo;s true.
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
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleLoad("pending")}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-full bg-green px-4 py-2.5 text-[13.5px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && viewMode === "pending" ? "Loading…" : "Load markers needing review"}
            </button>
            <button
              type="button"
              onClick={() => handleLoad("all")}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-full border border-line/70 px-4 py-2.5 text-[13.5px] font-medium text-ink-soft outline-none transition hover:border-ink-faint/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && viewMode === "all" ? "Loading…" : "Load all markers"}
            </button>
          </div>
        </div>

        {error && (
          <div className="shadow-card mt-6 rounded-[26px] border border-red-200 bg-red-50 px-5 py-4 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {markers && markers.length === 0 && (
          <p className="mt-6 text-[13px] text-ink-faint">
            {viewMode === "pending" ? "Nothing needs review right now." : "No trail markers yet."}
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
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full border border-green/40 bg-green-soft/60 px-2 py-0.5 text-[10px] font-semibold text-green">
                      {MARKER_TYPE_LABELS[marker.markerType]}
                    </span>
                    <span className="rounded-full border border-line/70 px-2 py-0.5 text-[10px] font-medium text-ink-faint">
                      {marker.status}
                    </span>
                    <span className="rounded-full border border-line/70 px-2 py-0.5 text-[10px] font-medium text-ink-faint">
                      {CREDIBILITY_TYPE_LABELS[marker.credibilityType]}
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-faint">
                    {new Date(marker.createdAt).toLocaleString()}
                  </span>
                </div>
                <MarkerContextLine marker={marker} />
                <p className="text-[13px] leading-relaxed text-ink">{marker.body}</p>
                <p className="text-[11.5px] text-ink-faint">
                  {marker.authorName || "Anonymous"}
                  {marker.authorRole ? ` · ${marker.authorRole}` : ""}
                  {marker.experienceLabel ? ` · ${marker.experienceLabel}` : ""}
                </p>
                {marker.contactEmail && (
                  <p className="text-[11.5px] text-ink-faint">
                    Submitter email: <span className="text-ink">{marker.contactEmail}</span>
                  </p>
                )}

                <label className="mt-1 block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
                  <span className="block text-[10.5px] text-ink-faint">Moderation notes (admin-only)</span>
                  <textarea
                    value={notesDraft[marker.id] ?? ""}
                    onChange={(e) =>
                      setNotesDraft((prev) => ({ ...prev, [marker.id]: e.target.value }))
                    }
                    rows={2}
                    className="mt-0.5 w-full resize-none bg-transparent text-[12.5px] text-ink outline-none"
                  />
                </label>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => patchMarker(marker.id, { status: "approved" })}
                    disabled={actioningId === marker.id}
                    className="rounded-full border border-green/40 bg-green-soft px-3 py-1.5 text-[12px] font-medium text-green outline-none transition hover:bg-green-soft/70 focus-visible:ring-2 focus-visible:ring-green/50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => patchMarker(marker.id, { status: "rejected" })}
                    disabled={actioningId === marker.id}
                    className="rounded-full border border-line/70 px-3 py-1.5 text-[12px] font-medium text-ink-faint outline-none transition hover:border-ink-faint/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => patchMarker(marker.id, { status: "archived" })}
                    disabled={actioningId === marker.id}
                    className="rounded-full border border-line/70 px-3 py-1.5 text-[12px] font-medium text-ink-faint outline-none transition hover:border-ink-faint/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Archive
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      patchMarker(marker.id, { moderationNotes: notesDraft[marker.id] ?? "" })
                    }
                    disabled={actioningId === marker.id}
                    className="rounded-full border border-line/70 px-3 py-1.5 text-[12px] font-medium text-ink-soft outline-none transition hover:border-ink-faint/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Save notes
                  </button>
                  <span className="mx-1 text-[11px] text-ink-faint">Credibility:</span>
                  <button
                    type="button"
                    onClick={() => patchMarker(marker.id, { credibilityType: "verified_experience" })}
                    disabled={actioningId === marker.id}
                    className="rounded-full border border-line/70 px-3 py-1.5 text-[12px] font-medium text-ink-soft outline-none transition hover:border-ink-faint/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Verified experience
                  </button>
                  <button
                    type="button"
                    onClick={() => patchMarker(marker.id, { credibilityType: "licensed_guide" })}
                    disabled={actioningId === marker.id}
                    className="rounded-full border border-line/70 px-3 py-1.5 text-[12px] font-medium text-ink-soft outline-none transition hover:border-ink-faint/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Licensed guide
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
