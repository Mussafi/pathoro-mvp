"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export function ScoutRequestCard({
  routeId,
  pathGoal,
  city,
  state,
  userContext,
}: {
  routeId: string;
  pathGoal: string;
  city: string;
  state?: string;
  userContext?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  async function handleRequest() {
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/scout-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          state,
          routeId,
          pathGoal,
          userContext,
          requestedFromPage: "/route-planning",
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setResultUrl(data.resultUrl ?? null);
      setStatus("sent");
    } catch {
      setError("Pathoro couldn't reach the server. Please try again in a moment.");
      setStatus("error");
    }
  }

  return (
    <div className="shadow-card mt-6 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-soft">
          <Compass className="h-4 w-4 text-green" strokeWidth={1.75} />
        </span>
        <span className="text-[15px] font-semibold text-ink">
          Want Pathoro to scout this path?
        </span>
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
        Pathoro can look for real-world access points, hidden opportunities,
        people, places, resources, and openings that match this route.
      </p>
      {status === "sent" ? (
        <div className="mt-3 flex flex-col gap-2.5 rounded-2xl border border-green/40 bg-green-soft/50 px-3.5 py-3">
          <div>
            <p className="text-[12.5px] font-semibold leading-relaxed text-green">
              Scout request sent.
            </p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-green">
              Save this link to check results.
            </p>
          </div>
          {resultUrl && (
            <Link
              href={resultUrl}
              className="flex w-fit items-center gap-1.5 rounded-full bg-green px-3.5 py-2 text-[12.5px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50"
            >
              View scout request
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <>
          {status === "error" && error && (
            <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-3 text-[12px] leading-relaxed text-red-700">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleRequest}
            disabled={status === "sending"}
            className="mt-3 flex items-center justify-center gap-2 rounded-full bg-green py-2.5 text-[13.5px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Request scout"}
          </button>
        </>
      )}
    </div>
  );
}
