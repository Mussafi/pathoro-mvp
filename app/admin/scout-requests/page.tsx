"use client";

import { useState } from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { SCOUT_REQUEST_STATUS_LABELS, type ScoutRequest, type ScoutRequestStatus } from "@/lib/scoutRequestSchema";
import type { ScoutCandidateRecord, ScoutCandidateStatus } from "@/lib/scoutCandidatesDb";
import { PATHORO_FIT_LABELS, type PathoroFit } from "@/lib/scoutFit";

type ScoutRequestWithCandidates = ScoutRequest & { candidates: ScoutCandidateRecord[] };

const CANDIDATE_STATUS_LABELS: Record<ScoutCandidateStatus, string> = {
  candidate: "New candidate",
  sent_to_ingestion: "Sent to ingestion",
  dismissed: "Dismissed",
  promoted: "Promoted",
};

function buildScoutHref(request: ScoutRequest): string {
  const params = new URLSearchParams({
    city: request.city,
    state: request.state,
    routeId: request.routeId,
    pathGoal: request.pathGoal,
  });
  return `/admin/opportunity-scout?${params.toString()}`;
}

function buildPublicResultUrl(request: ScoutRequest): string | null {
  if (!request.publicToken) return null;
  return `/scout-request/${request.id}?token=${request.publicToken}`;
}

function buildIngestionHref(candidate: ScoutCandidateRecord, city: string): string {
  const params = new URLSearchParams({
    sourceUrl: candidate.url,
    sourceType: candidate.sourceType,
    city,
  });
  return `/admin/opportunity-ingestion?${params.toString()}`;
}

export default function ScoutRequestsAdminPage() {
  const [adminToken, setAdminToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<ScoutRequestWithCandidates[] | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [summaryDrafts, setSummaryDrafts] = useState<Record<string, string>>({});
  const [savingSummaryId, setSavingSummaryId] = useState<string | null>(null);
  const [actioningCandidateId, setActioningCandidateId] = useState<string | null>(null);

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
      setSummaryDrafts(
        Object.fromEntries(
          (data.requests as ScoutRequestWithCandidates[]).map((r) => [r.id, r.resultSummary])
        )
      );
    } catch {
      setError("Something went wrong reaching Pathoro. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCandidateStatusChange(
    candidateId: string,
    requestId: string,
    status: ScoutCandidateStatus
  ) {
    setActioningCandidateId(candidateId);
    setError(null);
    try {
      const res = await fetch(`/api/scout-candidates/${candidateId}`, {
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
        prev
          ? prev.map((r) =>
              r.id === requestId
                ? {
                    ...r,
                    candidates: r.candidates.map((c) =>
                      c.id === candidateId ? { ...c, status } : c
                    ),
                  }
                : r
            )
          : prev
      );
    } catch {
      setError("Something went wrong reaching Pathoro. Please try again.");
    } finally {
      setActioningCandidateId(null);
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

  async function handleSaveSummary(id: string) {
    setSavingSummaryId(id);
    setError(null);
    try {
      const res = await fetch(`/api/scout-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ resultSummary: summaryDrafts[id] ?? "" }),
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
        prev
          ? prev.map((r) => (r.id === id ? { ...r, resultSummary: data.request.resultSummary } : r))
          : prev
      );
    } catch {
      setError("Something went wrong reaching Pathoro. Please try again.");
    } finally {
      setSavingSummaryId(null);
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
                  {buildPublicResultUrl(req) && (
                    <a
                      href={buildPublicResultUrl(req)!}
                      target="_blank"
                      rel="noreferrer"
                      className="w-fit text-[11.5px] font-medium text-green underline"
                    >
                      Public result link
                    </a>
                  )}
                  <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
                    <span className="block text-[10.5px] text-ink-faint">
                      Result summary (shown to the requester)
                    </span>
                    <textarea
                      value={summaryDrafts[req.id] ?? ""}
                      onChange={(e) =>
                        setSummaryDrafts((prev) => ({ ...prev, [req.id]: e.target.value }))
                      }
                      rows={2}
                      placeholder="What did the scout find? A short note for the requester."
                      className="mt-0.5 w-full resize-none bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-faint/70"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveSummary(req.id)}
                      disabled={savingSummaryId === req.id}
                      className="mt-1.5 text-[11.5px] font-medium text-green underline disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingSummaryId === req.id ? "Saving…" : "Save summary"}
                    </button>
                  </label>

                  {req.candidates.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] font-semibold text-ink-faint">
                        AI-found candidates ({req.candidates.length})
                      </span>
                      {req.candidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <span className="text-[12.5px] font-semibold text-ink">
                              {candidate.title}
                            </span>
                            <span className="flex shrink-0 flex-wrap justify-end gap-1.5">
                              <span className="rounded-full border border-green/40 bg-green-soft/60 px-2 py-0.5 text-[10px] font-semibold text-green">
                                {PATHORO_FIT_LABELS[candidate.pathoroFit as PathoroFit] ??
                                  candidate.pathoroFit}
                              </span>
                              {candidate.status !== "candidate" && (
                                <span className="rounded-full border border-line/70 px-2 py-0.5 text-[10px] font-medium text-ink-faint">
                                  {CANDIDATE_STATUS_LABELS[candidate.status]}
                                </span>
                              )}
                            </span>
                          </div>
                          {candidate.snippet && (
                            <p className="mt-1 text-[11.5px] leading-snug text-ink-soft">
                              {candidate.snippet}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            <Link
                              href={buildIngestionHref(candidate, req.city)}
                              onClick={() =>
                                handleCandidateStatusChange(candidate.id, req.id, "sent_to_ingestion")
                              }
                              className="text-[11.5px] font-medium text-green underline"
                            >
                              Send to ingestion
                            </Link>
                            <button
                              type="button"
                              onClick={() =>
                                handleCandidateStatusChange(candidate.id, req.id, "promoted")
                              }
                              disabled={actioningCandidateId === candidate.id}
                              className="text-[11.5px] font-medium text-ink-faint underline disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Mark promoted
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleCandidateStatusChange(candidate.id, req.id, "dismissed")
                              }
                              disabled={actioningCandidateId === candidate.id}
                              className="text-[11.5px] font-medium text-ink-faint underline disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Dismiss
                            </button>
                            <a
                              href={candidate.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11.5px] font-medium text-ink-faint underline"
                            >
                              Open source
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
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
