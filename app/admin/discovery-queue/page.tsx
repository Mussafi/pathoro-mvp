"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DISCOVERY_SOURCE_TYPE_LABELS,
  DISCOVERY_STATUS_LABELS,
  createDiscoveryEntryId,
  mapDiscoverySourceType,
  type DiscoveryEntry,
  type DiscoverySourceType,
  type DiscoveryStatus,
} from "@/lib/discoveryQueue";
import { useDiscoveryQueue } from "@/lib/useDiscoveryQueue";

const SOURCE_TYPE_OPTIONS = Object.keys(DISCOVERY_SOURCE_TYPE_LABELS) as DiscoverySourceType[];
const STATUS_OPTIONS = Object.keys(DISCOVERY_STATUS_LABELS) as DiscoveryStatus[];

function buildIngestionHref(entry: DiscoveryEntry): string {
  const params = new URLSearchParams({
    sourceUrl: entry.sourceUrl,
    sourceType: mapDiscoverySourceType(entry.sourceType),
    city: entry.city,
  });
  return `/admin/opportunity-ingestion?${params.toString()}`;
}

export default function DiscoveryQueuePage() {
  const { entries, save, remove, clear } = useDiscoveryQueue();

  const [city, setCity] = useState("Austin");
  const [sourceType, setSourceType] = useState<DiscoverySourceType>("organizer_website");
  const [sourceUrl, setSourceUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [notes, setNotes] = useState("");

  function handleAdd() {
    if (!sourceUrl.trim()) return;
    save({
      id: createDiscoveryEntryId(),
      city: city.trim(),
      sourceType,
      sourceUrl: sourceUrl.trim(),
      keywords: keywords.trim(),
      notes: notes.trim(),
      status: "new",
      createdAt: new Date().toISOString(),
    });
    setSourceUrl("");
    setKeywords("");
    setNotes("");
  }

  function handleStatusChange(entry: DiscoveryEntry, status: DiscoveryStatus) {
    save({ ...entry, status });
  }

  function handleSendToIngestion(entry: DiscoveryEntry) {
    if (entry.status === "new") {
      save({ ...entry, status: "reviewed" });
    }
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-[720px]">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/70 bg-cream-field px-4 py-3 text-[12px] text-ink-faint">
          <span>
            Internal prototype — not linked publicly. Discovery leads are
            stored in this browser only, not Supabase.
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <Link
              href="/admin/opportunity-scout"
              className="text-[12px] font-semibold text-green underline"
            >
              Opportunity scout
            </Link>
            <Link
              href="/admin/opportunity-ingestion"
              className="text-[12px] font-semibold text-green underline"
            >
              Opportunity ingestion
            </Link>
          </span>
        </div>

        <div className="mt-3 rounded-2xl border border-green/40 bg-green-soft/15 px-4 py-3 text-[11.5px] leading-relaxed text-ink-soft">
          Discovery sources are clues. Pathoro looks for real-world access
          points, resolves canonical sources where possible, then creates
          reviewed opportunity drafts.
        </div>

        <h1 className="mt-6 font-serif text-[26px] leading-tight text-ink">
          Discovery queue (prototype)
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-faint">
          Log a lead on where a real-world opportunity might be found. No
          scraping, no automated crawling — this is the human workflow shell
          for finding candidates before they ever reach ingestion.
        </p>

        <div className="shadow-card mt-6 flex flex-col gap-4 rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
          <h2 className="text-[15px] font-semibold text-ink">New discovery lead</h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
              <span className="block text-[10.5px] text-ink-faint">City</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Austin"
                className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint/70"
              />
            </label>

            <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
              <span className="block text-[10.5px] text-ink-faint">
                Source type
              </span>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as DiscoverySourceType)}
                className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none"
              >
                {SOURCE_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {DISCOVERY_SOURCE_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
            <span className="block text-[10.5px] text-ink-faint">
              Source URL
            </span>
            <input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint/70"
            />
          </label>

          <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
            <span className="block text-[10.5px] text-ink-faint">
              Keywords / path tags
            </span>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="beginner, community, ceramics"
              className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint/70"
            />
          </label>

          <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
            <span className="block text-[10.5px] text-ink-faint">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Why this looks like a real-world access point"
              className="mt-0.5 w-full resize-none bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint/70"
            />
          </label>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!sourceUrl.trim()}
            className="flex items-center justify-center gap-2 rounded-full bg-green py-2.5 text-[13.5px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add to discovery queue
          </button>
        </div>

        <div className="shadow-card mt-6 flex flex-col gap-3 rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-ink">
              Discovery queue
            </h2>
            {entries.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="text-[12px] font-semibold text-ink-faint underline"
              >
                Clear queue
              </button>
            )}
          </div>

          {entries.length === 0 ? (
            <p className="text-[12.5px] text-ink-faint">
              No discovery leads yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-col gap-2 rounded-2xl border border-line/70 bg-cream-field px-3.5 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="block text-[10.5px] font-semibold text-green">
                        {DISCOVERY_SOURCE_TYPE_LABELS[entry.sourceType]} ·{" "}
                        {entry.city || "City not set"}
                      </span>
                      <a
                        href={entry.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 block break-all text-[12.5px] font-medium text-ink underline"
                      >
                        {entry.sourceUrl}
                      </a>
                    </div>
                    <select
                      value={entry.status}
                      onChange={(e) =>
                        handleStatusChange(entry, e.target.value as DiscoveryStatus)
                      }
                      className="shrink-0 rounded-full border border-line/70 bg-cream-card px-2.5 py-1 text-[11px] font-medium text-ink outline-none"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {DISCOVERY_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {entry.keywords && (
                    <p className="text-[11.5px] text-ink-faint">
                      Keywords: {entry.keywords}
                    </p>
                  )}
                  {entry.notes && (
                    <p className="text-[12px] leading-snug text-ink-soft">
                      {entry.notes}
                    </p>
                  )}

                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <Link
                      href={buildIngestionHref(entry)}
                      onClick={() => handleSendToIngestion(entry)}
                      className="rounded-full border border-green/40 bg-green-soft px-3 py-1.5 text-[12px] font-medium text-green outline-none transition hover:bg-green-soft/70 focus-visible:ring-2 focus-visible:ring-green/50"
                    >
                      Send to ingestion
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(entry.id)}
                      className="text-[12px] font-medium text-ink-faint underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
