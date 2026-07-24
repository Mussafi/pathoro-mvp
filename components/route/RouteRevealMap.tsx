"use client";

import { ArrowRight } from "lucide-react";
import { routes } from "@/lib/routes";
import type { DirectionAnswers } from "@/lib/direction";

const VIEW_W = 900;
const VIEW_H = 340;
const CENTER = { x: 90, y: 170 };
const BRANCH_X = 760;
const BRANCH_Y = [20, 100, 170, 240, 320];

function curvePath(y: number) {
  const startX = CENTER.x + 30;
  const startY = CENTER.y;
  const midX = (startX + BRANCH_X) / 2;
  return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${y}, ${BRANCH_X} ${y}`;
}

type RouteRevealMapProps = {
  selectedRouteId: string;
  suggestedRouteId: string;
  onSelectRoute: (routeId: string) => void;
  location: string;
  answers: DirectionAnswers;
};

export function RouteRevealMap({
  selectedRouteId,
  suggestedRouteId,
  onSelectRoute,
}: RouteRevealMapProps) {
  return (
    <div className="shadow-card flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
      <h3 className="font-serif text-[19px] leading-tight text-ink">
        Your routes are opening.
      </h3>
      <p className="mt-1 text-[12.5px] text-ink-faint">
        Pathoro found several ways this could become reachable.
      </p>

      <div
        className="relative mt-4 w-full"
        style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {routes.map((route, i) => {
            const isSuggested = route.id === suggestedRouteId;
            return (
              <g
                key={route.id}
                className="route-reveal-animate"
                style={{ animationDelay: `${120 + i * 70}ms` }}
              >
                <path
                  d={curvePath(BRANCH_Y[i])}
                  fill="none"
                  stroke={isSuggested ? "var(--color-green)" : "var(--color-line)"}
                  strokeWidth={isSuggested ? 2 : 1.25}
                  strokeLinecap="round"
                  strokeOpacity={isSuggested ? 0.9 : 0.55}
                />
              </g>
            );
          })}
        </svg>

        {/* center node */}
        <div
          className="route-reveal-animate absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
          style={{
            left: `${(CENTER.x / VIEW_W) * 100}%`,
            top: `${(CENTER.y / VIEW_H) * 100}%`,
          }}
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-green bg-cream-card">
            <span className="absolute -inset-2 -z-10 rounded-full bg-green/20 blur-md" />
            <span className="h-2.5 w-2.5 rounded-full bg-green" />
          </span>
          <span className="whitespace-nowrap text-[10px] font-semibold text-ink">
            You are here
          </span>
        </div>

        {/* route branch nodes */}
        {routes.map((route, i) => {
          const Icon = route.icon;
          const isSuggested = route.id === suggestedRouteId;
          const isSelected = route.id === selectedRouteId;
          const y = BRANCH_Y[i];
          return (
            <button
              key={route.id}
              type="button"
              onClick={() => onSelectRoute(route.id)}
              className="route-reveal-animate absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 outline-none"
              style={{
                left: `${(BRANCH_X / VIEW_W) * 100}%`,
                top: `${(y / VIEW_H) * 100}%`,
                animationDelay: `${180 + i * 70}ms`,
              }}
            >
              <span
                className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition focus-visible:ring-2 focus-visible:ring-green/50 ${
                  isSuggested
                    ? "border-green bg-green"
                    : "border-line/70 bg-cream-card hover:border-ink-faint/40"
                } ${isSelected ? "ring-2 ring-green/50 ring-offset-2 ring-offset-cream-card" : ""}`}
              >
                {isSuggested && (
                  <span className="absolute -inset-2 -z-10 rounded-full bg-green/25 blur-md" />
                )}
                <Icon
                  className={`h-4 w-4 ${isSuggested ? "text-cream" : "text-ink-soft"}`}
                  strokeWidth={1.75}
                />
              </span>
              <span
                className={`whitespace-nowrap text-[10px] leading-tight ${
                  isSuggested ? "font-semibold text-green" : "text-ink-faint"
                }`}
              >
                {route.title}
              </span>
              {isSuggested && (
                <span className="max-w-[92px] rounded-full bg-green-soft px-2 py-0.5 text-center text-[9px] font-semibold leading-tight text-green">
                  Suggested from your answers
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
        Pathoro opened several routes from your answers. This one is
        surfaced first because it matches what would make the path feel
        reachable.
      </p>

      <a
        href="#route-rows"
        className="mt-3 inline-flex w-fit items-center gap-1 text-[12.5px] font-semibold text-green outline-none transition hover:text-green-dark focus-visible:underline"
      >
        Explore this route
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
