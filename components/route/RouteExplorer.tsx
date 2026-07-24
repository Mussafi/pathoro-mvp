"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Footprints,
  Heart,
  ListFilter,
  Lock,
  MapPin,
  MapPinned,
  Route as RouteIcon,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { routes } from "@/lib/routes";
import { getRouteSuggestionReason, mapReachableToRouteId } from "@/lib/direction";
import { getOpportunitiesForRoute } from "@/lib/opportunities";
import { useDirectionAnswers } from "@/lib/useDirectionAnswers";

function Connector({ active }: { active: boolean }) {
  return (
    <div className="relative h-4 w-6 shrink-0">
      <span
        className={`absolute left-0 right-0 top-1/2 h-[1.5px] -translate-y-1/2 ${
          active ? "bg-green" : "bg-[#ddd3bc]"
        }`}
      />
      <span
        className={`absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] bg-cream-card ${
          active ? "border-green" : "border-[#c9bea1]"
        }`}
      />
    </div>
  );
}

type RouteExplorerProps = {
  selectedId: string;
  onSelect: (routeId: string) => void;
};

export function RouteExplorer({ selectedId, onSelect }: RouteExplorerProps) {
  const { answers } = useDirectionAnswers();
  const [panelOpen, setPanelOpen] = useState(true);
  const selected = routes.find((r) => r.id === selectedId) ?? routes[0];
  const mappedRouteId = mapReachableToRouteId(answers.reachable);
  const isSuggested = selectedId === mappedRouteId;
  const suggestionReason = getRouteSuggestionReason(answers.reachable);
  const routeOpportunities = getOpportunitiesForRoute(selectedId);
  const firstOpportunity = routeOpportunities[0];

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      {/* route list */}
      <div className="shadow-card flex min-w-0 flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[13.5px] text-ink-soft">
              Five routes to make this opportunity physically reachable.
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11.5px] text-ink-faint">
              <MapPin className="h-3 w-3 shrink-0 text-green" strokeWidth={1.75} />
              People, groups, and places near {answers.location} can help make it real.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="shadow-card flex items-center gap-1.5 rounded-xl border border-line/70 bg-cream-card px-3 py-2 text-[12.5px] font-medium text-ink-soft">
              <ListFilter className="h-3.5 w-3.5" strokeWidth={1.75} />
              Legend
            </button>
            <button className="shadow-card flex items-center gap-1.5 rounded-xl border border-line/70 bg-cream-card px-3 py-2 text-[12.5px] font-medium text-ink-soft">
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
              Filter
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {routes.map((route) => {
            const isSelected = route.id === selectedId;
            const Icon = route.icon;
            const toneBg = route.tone === "sage" ? "bg-green-soft" : "bg-[#f1e9d6]";
            const toneText = route.tone === "sage" ? "text-green" : "text-[#8a6d3b]";
            const toneHalo = route.tone === "sage" ? "bg-green/10" : "bg-[#8a6d3b]/10";
            return (
              <button
                key={route.id}
                type="button"
                onClick={() => {
                  onSelect(route.id);
                  setPanelOpen(true);
                }}
                className={`flex flex-col gap-4 rounded-2xl border px-4 py-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-green/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-card sm:flex-row sm:items-center ${
                  isSelected
                    ? "border-green/50 bg-green-soft/40 shadow-[0_0_0_3px_rgba(84,120,32,0.08)]"
                    : "border-line/70 bg-cream-card hover:border-ink-faint/30"
                }`}
              >
                <div className="flex items-center gap-3 sm:w-[196px] sm:shrink-0">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                    <span
                      className={`absolute -inset-1.5 rounded-full ${
                        isSelected ? "bg-green/10" : toneHalo
                      }`}
                    />
                    <span
                      className={`relative flex h-11 w-11 items-center justify-center rounded-full ${
                        isSelected ? "bg-green" : toneBg
                      }`}
                    >
                      <Icon
                        className={`h-4.5 w-4.5 ${isSelected ? "text-cream" : toneText}`}
                        strokeWidth={1.75}
                      />
                    </span>
                  </div>
                  <span>
                    <span className="block text-[13.5px] font-semibold text-ink">
                      {route.title}
                    </span>
                    <span className="block text-[11.5px] leading-snug text-ink-faint">
                      {route.summary}
                    </span>
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 items-center">
                  <Connector active={isSelected} />
                  {route.steps.map((step, i) => (
                    <div key={i} className="contents">
                      <span
                        className={`min-w-0 flex-1 whitespace-normal rounded-xl border px-2.5 py-2 text-[11.5px] leading-snug text-ink ${
                          isSelected
                            ? "border-green/40 bg-cream-card"
                            : "border-line/70 bg-cream-field"
                        }`}
                      >
                        {step.label}
                      </span>
                      <Connector active={isSelected} />
                    </div>
                  ))}
                  <span
                    className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                      isSelected
                        ? "border-green bg-green"
                        : "border-line/70 bg-cream-card"
                    }`}
                  >
                    {isSelected && isSuggested && (
                      <span className="absolute -inset-1.5 -z-10 rounded-full bg-green/25 blur-[8px]" />
                    )}
                    {isSelected ? (
                      <Star className="h-3.5 w-3.5 fill-cream text-cream" />
                    ) : (
                      <ArrowRight className="h-3 w-3 text-ink-faint" />
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* best route detail panel */}
      {panelOpen ? (
        <aside className="shadow-card flex h-fit min-w-0 flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-soft">
                <Star className="h-4 w-4 fill-green text-green" />
              </span>
              <span className="text-[15px] font-semibold text-ink">
                Best next route
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              aria-label="Close"
              className="text-ink-faint outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-green/50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <span className="mt-4 inline-flex w-fit items-center rounded-full bg-green-soft px-3 py-1 text-[11px] font-semibold text-green">
            Recommended
          </span>

          {isSuggested && (
            <div className="relative mt-3 overflow-hidden rounded-2xl border border-green/45 bg-green-soft/60 px-3.5 py-3 shadow-[0_0_0_3px_rgba(84,120,32,0.06)]">
              <div className="flex items-start gap-2.5">
                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-green/25 blur-[7px]" />
                  <Sparkles className="relative h-4 w-4 text-green" strokeWidth={1.75} />
                </span>
                <span>
                  <span className="block text-[12px] font-semibold text-green">
                    Suggested from your answers
                  </span>
                  <span className="mt-0.5 block text-[12px] font-medium leading-relaxed text-ink">
                    Pathoro used your answer to choose this route first.
                  </span>
                  <span className="mt-1 block text-[11.5px] leading-snug text-ink-soft">
                    {suggestionReason}
                  </span>
                </span>
              </div>
            </div>
          )}

          {firstOpportunity && (
            <div className="mt-3 rounded-2xl border border-line/70 bg-cream-field px-3.5 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-soft">
                  <MapPinned className="h-3.5 w-3.5 text-green" strokeWidth={1.75} />
                </span>
                <span className="text-[12px] font-semibold text-ink">
                  Local opportunities surfaced
                </span>
              </div>
              <p className="mt-1.5 text-[12.5px] font-medium leading-snug text-ink">
                {firstOpportunity.title}
              </p>
              <a
                href="#route-opportunities"
                className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-green outline-none transition hover:text-green-dark focus-visible:underline"
              >
                View route opportunities
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          )}

          <h3 className="mt-3 text-[15.5px] font-semibold text-ink">
            {selected.title}
          </h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
            {selected.description}
          </p>

          <div className="mt-4 flex items-start gap-2.5 border-t border-line/70 pt-4">
            <Heart className="mt-0.5 h-4 w-4 shrink-0 text-green" strokeWidth={1.75} />
            <span>
              <span className="block text-[13px] font-semibold text-ink">
                Why this route
              </span>
              <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-soft">
                {selected.why}
              </span>
            </span>
          </div>

          <div className="mt-4 flex items-start gap-2.5 border-t border-line/70 pt-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green" strokeWidth={1.75} />
            <span>
              <span className="block text-[13px] font-semibold text-ink">
                What it makes room for
              </span>
              <span className="mt-0.5 block text-[12.5px] font-semibold text-ink">
                {answers.makeRoomFor}
              </span>
            </span>
          </div>

          <div className="mt-4 flex items-start gap-2.5 border-t border-line/70 pt-4">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green" strokeWidth={1.75} />
            <span>
              <span className="block text-[13px] font-semibold text-ink">
                Starting from
              </span>
              <span className="block text-[12px] leading-relaxed text-ink-soft">
                {answers.startingFrom}
              </span>
            </span>
          </div>

          <div className="mt-4 flex items-start gap-2.5 border-t border-line/70 pt-4">
            <RouteIcon className="mt-0.5 h-4 w-4 shrink-0 text-green" strokeWidth={1.75} />
            <span>
              <span className="block text-[13px] font-semibold text-ink">
                What would help
              </span>
              <span className="block text-[12px] leading-relaxed text-ink-soft">
                {answers.reachable}
              </span>
            </span>
          </div>

          <div className="mt-4 flex items-start gap-2.5 border-t border-line/70 pt-4">
            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-green" strokeWidth={1.75} />
            <span>
              <span className="block text-[13px] font-semibold text-ink">
                Your next step
              </span>
              <span className="mt-0.5 block text-[12.5px] font-semibold text-ink">
                {selected.nextStepTitle}
              </span>
              <span className="block text-[12px] leading-relaxed text-ink-soft">
                {selected.nextStepBody}
              </span>
            </span>
          </div>

          <div className="mt-4 flex items-start gap-2.5 border-t border-line/70 pt-4">
            <Footprints className="mt-0.5 h-4 w-4 shrink-0 text-green" strokeWidth={1.75} />
            <span>
              <span className="block text-[13px] font-semibold text-ink">
                What you said you&rsquo;d try first
              </span>
              <span className="block text-[12px] leading-relaxed text-ink-soft">
                {answers.tryFirst}
              </span>
            </span>
          </div>

          <Link
            href="/opportunity/plant-based-cooking-class"
            className="mt-5 flex items-center justify-center gap-2 rounded-full bg-green py-2.75 text-[13.5px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50 focus-visible:ring-offset-2"
          >
            Take this step
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button className="mt-2 flex items-center justify-center gap-2 rounded-full border border-line/70 py-2.75 text-[13.5px] font-medium text-ink outline-none transition hover:border-ink-faint/40 focus-visible:ring-2 focus-visible:ring-green/50 focus-visible:ring-offset-2">
            Explore other routes
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-snug text-ink-faint">
            <Lock className="mt-0.5 h-3 w-3 shrink-0" />
            Your progress is private and only visible to you.
          </p>
        </aside>
      ) : null}
    </div>
  );
}
