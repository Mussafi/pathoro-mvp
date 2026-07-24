"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Route as RouteIcon, X } from "lucide-react";
import {
  OPPORTUNITY_STATUS_LABELS,
  getOpportunityDetailHref,
  type Opportunity,
} from "@/lib/opportunitySchema";

function getDisplayTags(opportunity: Opportunity): string[] {
  const tags: string[] = [];
  if (opportunity.frictionLevel === "Low") {
    tags.push("Beginner-friendly");
  }
  if (opportunity.effortLevel === "Low") {
    tags.push("Low effort");
  }
  if (opportunity.effortLevel === "Low" && opportunity.frictionLevel === "Low") {
    tags.push("Good first step");
  }
  return tags;
}

export function OpportunityTile({
  opportunity,
  location,
}: {
  opportunity: Opportunity;
  location: string;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const detailHref = getOpportunityDetailHref(opportunity);
  const isClickable = Boolean(detailHref);
  const tags = getDisplayTags(opportunity);
  const isMockSeed = opportunity.sourceType === "mock_seed";
  const className =
    "flex w-full flex-col rounded-2xl border border-l-[3px] border-line/70 border-l-green/50 bg-cream-field px-3.5 py-3.5 text-left transition" +
    (isClickable ? " hover:border-green/40 hover:border-l-green hover:bg-cream-card" : " hover:border-green/30 hover:bg-cream-card");

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="block text-[13px] font-semibold text-ink">
          {opportunity.title}
        </span>
        {isClickable ? (
          <span className="shrink-0 rounded-full bg-green-soft px-2 py-0.5 text-[10px] font-semibold text-green">
            Open
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-line/70 px-2 py-0.5 text-[10px] font-medium text-ink-faint">
            {OPPORTUNITY_STATUS_LABELS[opportunity.status]}
          </span>
        )}
      </div>
      <span className="mt-1 flex items-center gap-1 text-[10.5px] font-semibold text-green">
        <RouteIcon className="h-2.5 w-2.5" strokeWidth={2} />
        From your selected route
      </span>
      <span className="mt-1 block text-[11px] font-medium text-ink-faint">
        {opportunity.opportunityType}
      </span>
      <p className="mt-1.5 text-[12px] leading-snug text-ink-soft">
        {opportunity.description}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-line/70 bg-cream-card px-2 py-0.5 text-[10.5px] text-ink-faint">
          Near {location}
        </span>
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-line/70 bg-cream-card px-2 py-0.5 text-[10.5px] text-ink-faint"
          >
            {tag}
          </span>
        ))}
      </div>
      {isMockSeed && (
        <p className="mt-2 text-[10px] text-ink-faint/80">
          Preview data · Mock seed · Real ingestion coming soon
        </p>
      )}
    </>
  );

  return (
    <>
      {isClickable ? (
        <Link href={detailHref!} className={className}>
          {content}
        </Link>
      ) : (
        <button type="button" onClick={() => setPreviewOpen(true)} className={className}>
          {content}
        </button>
      )}

      {previewOpen && (
        <OpportunityPreviewModal opportunity={opportunity} onClose={() => setPreviewOpen(false)} />
      )}
    </>
  );
}

function OpportunityPreviewModal({
  opportunity,
  onClose,
}: {
  opportunity: Opportunity;
  onClose: () => void;
}) {
  const detailHref = getOpportunityDetailHref(opportunity);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onClick={onClose}
    >
      <div
        className="shadow-card w-full max-w-[440px] rounded-[26px] border border-line/70 bg-cream-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="rounded-full border border-line/70 px-2 py-0.5 text-[10px] font-medium text-ink-faint">
              {OPPORTUNITY_STATUS_LABELS[opportunity.status]}
            </span>
            <h3 className="mt-2 font-serif text-[19px] leading-tight text-ink">
              {opportunity.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-ink-faint outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-green/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-1.5 text-[12px] text-ink-faint">
          {opportunity.sourceName} · {opportunity.locationLabel || "Location TBD"}
          {opportunity.dateLabel ? ` · ${opportunity.dateLabel}` : ""}
        </p>

        {opportunity.description && (
          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
            {opportunity.description}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-2.5">
          {opportunity.whoItIsFor && (
            <div className="rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
              <span className="block text-[10.5px] text-ink-faint">Who it&rsquo;s for</span>
              <span className="mt-0.5 block text-[12.5px] text-ink">{opportunity.whoItIsFor}</span>
            </div>
          )}
          {opportunity.pathItSupports && (
            <div className="rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
              <span className="block text-[10.5px] text-ink-faint">Path it supports</span>
              <span className="mt-0.5 block text-[12.5px] text-ink">{opportunity.pathItSupports}</span>
            </div>
          )}
          {opportunity.whatItMayOpenNext && (
            <div className="rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
              <span className="block text-[10.5px] text-ink-faint">What it may open next</span>
              <span className="mt-0.5 block text-[12.5px] text-ink">{opportunity.whatItMayOpenNext}</span>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {opportunity.sourceUrl && (
            <a
              href={opportunity.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-1.5 rounded-full border border-green/40 bg-green-soft py-2.5 text-[13px] font-medium text-green outline-none transition hover:bg-green-soft/70 focus-visible:ring-2 focus-visible:ring-green/50"
            >
              Open original source
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
            </a>
          )}
          {detailHref ? (
            <Link
              href={detailHref}
              className="flex w-full items-center justify-center rounded-full bg-green py-2.5 text-[13.5px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50"
            >
              View detail page
            </Link>
          ) : (
            <p className="text-center text-[11.5px] text-ink-faint">Detail page coming soon</p>
          )}
        </div>
      </div>
    </div>
  );
}
