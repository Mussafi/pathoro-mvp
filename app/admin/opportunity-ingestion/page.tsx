"use client";

import { useState } from "react";
import { routes } from "@/lib/routes";
import {
  OPPORTUNITY_SOURCE_LABELS,
  OPPORTUNITY_STATUS_LABELS,
  RECOMMENDED_SOURCE_TYPES,
  type EffortLevel,
  type FrictionLevel,
  type OpportunitySourceType,
  type OpportunityStatus,
} from "@/lib/opportunitySchema";

type ExtractedFields = {
  title: string;
  description: string;
  dateLabel: string;
  costLabel: string;
  hostName: string;
  opportunityType: string;
  whoItIsFor: string;
  pathItSupports: string;
  whatItMayOpenNext: string;
  effortLevel: EffortLevel;
  frictionLevel: FrictionLevel;
};

const MOCK_EXTRACTION: ExtractedFields = {
  title: "Sample Extracted Opportunity",
  description:
    "This is a mock extraction preview. Real extraction is not connected yet — nothing was actually read from the pasted URL.",
  dateLabel: "Sat, 10:00 AM",
  costLabel: "Free",
  hostName: "Sample Host Organization",
  opportunityType: "Class / Event",
  whoItIsFor: "Beginners curious about this path",
  pathItSupports: "Change a habit / lifestyle",
  whatItMayOpenNext: "A recurring group or a deeper follow-up",
  effortLevel: "Low",
  frictionLevel: "Low",
};

function suggestRouteId(opportunityType: string): string {
  const type = opportunityType.toLowerCase();
  if (type.includes("person") || type.includes("conversation")) return "people";
  if (type.includes("plan") || type.includes("requirement")) return "requirements";
  if (type.includes("class") || type.includes("event")) return "real-openings";
  if (type.includes("group") || type.includes("community")) return "community";
  if (type.includes("trial")) return "try-it";
  return "real-openings";
}

export default function OpportunityIngestionPage() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceType, setSourceType] = useState<OpportunitySourceType>("eventbrite");
  const [city, setCity] = useState("Austin");
  const [extracted, setExtracted] = useState<ExtractedFields | null>(null);
  const [routeId, setRouteId] = useState<string>("real-openings");
  const [status, setStatus] = useState<OpportunityStatus>("needs_review");
  const [approved, setApproved] = useState(false);

  function handleExtract() {
    setExtracted({ ...MOCK_EXTRACTION });
    setRouteId(suggestRouteId(MOCK_EXTRACTION.opportunityType));
    setStatus("needs_review");
    setApproved(false);
  }

  function updateField<K extends keyof ExtractedFields>(key: K, value: ExtractedFields[K]) {
    setExtracted((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const suggestedRoute = extracted
    ? routes.find((r) => r.id === suggestRouteId(extracted.opportunityType))
    : null;
  const selectedRoute = routes.find((r) => r.id === routeId);

  return (
    <div className="min-h-screen bg-cream px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-[720px]">
        <div className="rounded-2xl border border-line/70 bg-cream-field px-4 py-3 text-[12px] text-ink-faint">
          Internal prototype — not linked publicly. No real extraction, no
          database, no auth. Nothing here persists beyond this page load.
        </div>

        <h1 className="mt-6 font-serif text-[26px] leading-tight text-ink">
          Opportunity ingestion (prototype)
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-faint">
          A mock walkthrough of the future review workflow: paste a source,
          get a mock extraction, edit it, and see how it would be reviewed
          before ever reaching the map.
        </p>

        <div className="shadow-card mt-6 flex flex-col gap-4 rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
          <h2 className="text-[15px] font-semibold text-ink">1. Source</h2>

          <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
            <span className="block text-[10.5px] text-ink-faint">
              Source URL
            </span>
            <input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://www.eventbrite.com/e/..."
              className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint/70"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
              <span className="block text-[10.5px] text-ink-faint">
                Source type
              </span>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as OpportunitySourceType)}
                className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none"
              >
                {RECOMMENDED_SOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {OPPORTUNITY_SOURCE_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
              <span className="block text-[10.5px] text-ink-faint">City</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleExtract}
            className="flex items-center justify-center gap-2 rounded-full bg-green py-2.5 text-[13.5px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50"
          >
            Extract opportunity
          </button>
          <p className="text-[11px] text-ink-faint">
            Mock extraction only — this returns canned sample data, not a
            real parse of the URL above.
          </p>
        </div>

        {extracted && (
          <>
            <div className="shadow-card mt-6 flex flex-col gap-3 rounded-[26px] border border-green/30 bg-green-soft/20 px-5 py-5">
              <h2 className="text-[15px] font-semibold text-ink">
                2. Extracted opportunity preview
              </h2>
              <p className="text-[11px] text-ink-faint">
                Preview data · Mock seed · Real ingestion coming soon
              </p>

              <label className="block rounded-2xl border border-line/70 bg-cream-card px-3.5 py-2.25">
                <span className="block text-[10.5px] text-ink-faint">
                  Title
                </span>
                <input
                  value={extracted.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="mt-0.5 w-full bg-transparent text-[13px] font-medium text-ink outline-none"
                />
              </label>

              <label className="block rounded-2xl border border-line/70 bg-cream-card px-3.5 py-2.25">
                <span className="block text-[10.5px] text-ink-faint">
                  Description
                </span>
                <textarea
                  value={extracted.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={2}
                  className="mt-0.5 w-full resize-none bg-transparent text-[13px] text-ink outline-none"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block rounded-2xl border border-line/70 bg-cream-card px-3.5 py-2.25">
                  <span className="block text-[10.5px] text-ink-faint">
                    Date
                  </span>
                  <input
                    value={extracted.dateLabel}
                    onChange={(e) => updateField("dateLabel", e.target.value)}
                    className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none"
                  />
                </label>
                <label className="block rounded-2xl border border-line/70 bg-cream-card px-3.5 py-2.25">
                  <span className="block text-[10.5px] text-ink-faint">
                    Cost
                  </span>
                  <input
                    value={extracted.costLabel}
                    onChange={(e) => updateField("costLabel", e.target.value)}
                    className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none"
                  />
                </label>
              </div>

              <label className="block rounded-2xl border border-line/70 bg-cream-card px-3.5 py-2.25">
                <span className="block text-[10.5px] text-ink-faint">
                  Host name
                </span>
                <input
                  value={extracted.hostName}
                  onChange={(e) => updateField("hostName", e.target.value)}
                  className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none"
                />
              </label>

              <label className="block rounded-2xl border border-line/70 bg-cream-card px-3.5 py-2.25">
                <span className="block text-[10.5px] text-ink-faint">
                  Opportunity type
                </span>
                <input
                  value={extracted.opportunityType}
                  onChange={(e) => updateField("opportunityType", e.target.value)}
                  className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none"
                />
              </label>

              <label className="block rounded-2xl border border-line/70 bg-cream-card px-3.5 py-2.25">
                <span className="block text-[10.5px] text-ink-faint">
                  Who it&rsquo;s for
                </span>
                <input
                  value={extracted.whoItIsFor}
                  onChange={(e) => updateField("whoItIsFor", e.target.value)}
                  className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none"
                />
              </label>

              <label className="block rounded-2xl border border-line/70 bg-cream-card px-3.5 py-2.25">
                <span className="block text-[10.5px] text-ink-faint">
                  What path it supports
                </span>
                <input
                  value={extracted.pathItSupports}
                  onChange={(e) => updateField("pathItSupports", e.target.value)}
                  className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none"
                />
              </label>

              <label className="block rounded-2xl border border-line/70 bg-cream-card px-3.5 py-2.25">
                <span className="block text-[10.5px] text-ink-faint">
                  What it may open next
                </span>
                <input
                  value={extracted.whatItMayOpenNext}
                  onChange={(e) => updateField("whatItMayOpenNext", e.target.value)}
                  className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block rounded-2xl border border-line/70 bg-cream-card px-3.5 py-2.25">
                  <span className="block text-[10.5px] text-ink-faint">
                    Effort level
                  </span>
                  <select
                    value={extracted.effortLevel}
                    onChange={(e) => updateField("effortLevel", e.target.value as EffortLevel)}
                    className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </label>
                <label className="block rounded-2xl border border-line/70 bg-cream-card px-3.5 py-2.25">
                  <span className="block text-[10.5px] text-ink-faint">
                    Friction level
                  </span>
                  <select
                    value={extracted.frictionLevel}
                    onChange={(e) => updateField("frictionLevel", e.target.value as FrictionLevel)}
                    className="mt-0.5 w-full bg-transparent text-[13px] text-ink outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </label>
              </div>

              <p className="text-[11px] text-ink-faint">
                {city ? `${city}` : "City not set"} · {OPPORTUNITY_SOURCE_LABELS[sourceType]}
                {sourceUrl ? ` · ${sourceUrl}` : ""}
              </p>
            </div>

            <div className="shadow-card mt-6 flex flex-col gap-3 rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
              <h2 className="text-[15px] font-semibold text-ink">
                3. Route fit suggestion
              </h2>
              {suggestedRoute && (
                <p className="text-[12.5px] text-ink-soft">
                  Based on the opportunity type, Pathoro suggests{" "}
                  <span className="font-semibold text-green">
                    {suggestedRoute.title}
                  </span>
                  .
                </p>
              )}
              <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
                <span className="block text-[10.5px] text-ink-faint">
                  Route
                </span>
                <select
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  className="mt-0.5 w-full bg-transparent text-[13px] font-medium text-ink outline-none"
                >
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.title}
                    </option>
                  ))}
                </select>
              </label>
              {selectedRoute && routeId !== suggestedRoute?.id && (
                <p className="text-[11px] text-ink-faint">
                  Overridden from the suggested route.
                </p>
              )}
            </div>

            <div className="shadow-card mt-6 flex flex-col gap-3 rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
              <h2 className="text-[15px] font-semibold text-ink">
                4. Review status
              </h2>
              <p className="text-[11.5px] text-ink-faint">
                Every imported opportunity is human-reviewed before it
                becomes live. Status starts at &ldquo;Needs review&rdquo; and
                only a person moves it forward.
              </p>
              <label className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
                <span className="block text-[10.5px] text-ink-faint">
                  Status
                </span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OpportunityStatus)}
                  className="mt-0.5 w-full bg-transparent text-[13px] font-medium text-ink outline-none"
                >
                  {Object.entries(OPPORTUNITY_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => setApproved(true)}
                className="flex items-center justify-center gap-2 rounded-full border border-green/40 bg-green-soft px-4 py-2.5 text-[13.5px] font-medium text-green outline-none transition hover:bg-green-soft/70 focus-visible:ring-2 focus-visible:ring-green/50"
              >
                Approve for map (mock only)
              </button>
              {approved && (
                <p className="text-[11.5px] text-ink-faint">
                  Mock approval recorded on this page only — nothing was
                  saved, and this does not change what appears on{" "}
                  <code>/route-planning</code>.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
