"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import { routes } from "@/lib/routes";

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

type ExploreOtherRoutesProps = {
  selectedId: string;
  onSelect: (routeId: string) => void;
  expanded: boolean;
  onToggle: () => void;
};

export function ExploreOtherRoutes({
  selectedId,
  onSelect,
  expanded,
  onToggle,
}: ExploreOtherRoutesProps) {
  return (
    <div
      id="explore-other-routes"
      className="shadow-card scroll-mt-6 mt-6 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 outline-none"
      >
        <span>
          <span className="block text-[13.5px] font-semibold text-ink">
            Explore other routes
          </span>
          <span className="mt-0.5 block text-[11.5px] text-ink-faint">
            Compare all five routes side by side.
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink-faint transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="mt-4 flex flex-col gap-4">
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
                onClick={() => onSelect(route.id)}
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
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                      isSelected
                        ? "border-green bg-green"
                        : "border-line/70 bg-cream-card"
                    }`}
                  >
                    <ArrowRight
                      className={`h-3 w-3 ${isSelected ? "text-cream" : "text-ink-faint"}`}
                    />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
