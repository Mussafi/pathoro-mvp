"use client";

import { ArrowRight } from "lucide-react";
import { routes } from "@/lib/routes";
import type { DirectionAnswers } from "@/lib/direction";

const VIEW_W = 900;
const VIEW_H = 290;
const CENTER = { x: 90, y: 145 };
const BRANCH_X = 740;
const BRANCH_Y = [17, 85, 145, 205, 273];
const MARKER_T = [0.32, 0.62, 0.88];

function curveControlPoints(y: number) {
  const startX = CENTER.x + 30;
  const startY = CENTER.y;
  const midX = (startX + BRANCH_X) / 2;
  return {
    p0: { x: startX, y: startY },
    p1: { x: midX, y: startY },
    p2: { x: midX, y },
    p3: { x: BRANCH_X, y },
  };
}

function curvePath(y: number) {
  const { p0, p1, p2, p3 } = curveControlPoints(y);
  return `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
}

function cubicPoint(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
) {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  };
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
  answers,
}: RouteRevealMapProps) {
  const suggestedRoute = routes.find((r) => r.id === suggestedRouteId);
  const selectedIndex = routes.findIndex((r) => r.id === selectedRouteId);
  const selectedRoute = routes[selectedIndex];
  const selectedControlPoints =
    selectedIndex >= 0 ? curveControlPoints(BRANCH_Y[selectedIndex]) : null;

  const personalSentence = suggestedRoute
    ? `You said “${answers.reachable}” would make this more reachable, so Pathoro opened ${suggestedRoute.title} first.`
    : "Pathoro opened several routes from your answers.";

  return (
    <div className="shadow-card flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
      <h3 className="font-serif text-[19px] leading-tight text-ink">
        Your routes are opening.
      </h3>
      <p className="mt-1 text-[12.5px] text-ink-faint">
        Pathoro found several ways this could become reachable.
      </p>

      <div
        className="relative mt-3 w-full"
        style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {routes.map((route, i) => {
            const isSelected = route.id === selectedRouteId;
            return (
              <g
                key={route.id}
                className="route-reveal-animate"
                style={{ animationDelay: `${120 + i * 70}ms` }}
              >
                <path
                  d={curvePath(BRANCH_Y[i])}
                  fill="none"
                  stroke={isSelected ? "var(--color-green)" : "var(--color-line)"}
                  strokeWidth={isSelected ? 2.25 : 1.25}
                  strokeLinecap="round"
                  strokeOpacity={isSelected ? 0.9 : 0.55}
                />
              </g>
            );
          })}

          {/* subtle step markers along the selected route's path */}
          {selectedControlPoints &&
            selectedRoute &&
            MARKER_T.map((t, i) => {
              const { x, y } = cubicPoint(
                t,
                selectedControlPoints.p0,
                selectedControlPoints.p1,
                selectedControlPoints.p2,
                selectedControlPoints.p3
              );
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={4}
                  fill="var(--color-cream-card)"
                  stroke="var(--color-green)"
                  strokeWidth={1.5}
                  className="route-reveal-animate"
                  style={{ animationDelay: `${400 + i * 90}ms` }}
                />
              );
            })}
        </svg>

        {/* step labels for the selected route */}
        {selectedControlPoints &&
          selectedRoute &&
          MARKER_T.map((t, i) => {
            const { x, y } = cubicPoint(
              t,
              selectedControlPoints.p0,
              selectedControlPoints.p1,
              selectedControlPoints.p2,
              selectedControlPoints.p3
            );
            return (
              <div
                key={i}
                className="route-reveal-animate absolute w-[76px] -translate-x-1/2 text-center text-[8px] leading-[1.15] text-ink-soft"
                style={{
                  left: `${(x / VIEW_W) * 100}%`,
                  top: `${(y / VIEW_H) * 100}%`,
                  transform: "translate(-50%, 6px)",
                  animationDelay: `${400 + i * 90}ms`,
                }}
              >
                {selectedRoute.steps[i]?.label}
              </div>
            );
          })}

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
            <div
              key={route.id}
              className="route-reveal-animate absolute flex flex-col items-start"
              style={{
                left: `${(BRANCH_X / VIEW_W) * 100}%`,
                top: `${(y / VIEW_H) * 100}%`,
                transform: "translateY(-50%)",
                animationDelay: `${180 + i * 70}ms`,
              }}
            >
              <button
                type="button"
                onClick={() => onSelectRoute(route.id)}
                className="flex items-center gap-2 outline-none"
              >
                <span
                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition focus-visible:ring-2 focus-visible:ring-green/50 ${
                    isSelected
                      ? "border-green bg-green"
                      : "border-line/70 bg-cream-card hover:border-ink-faint/40"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute -inset-2 -z-10 rounded-full bg-green/25 blur-md" />
                  )}
                  <Icon
                    className={`h-3.5 w-3.5 ${isSelected ? "text-cream" : "text-ink-soft"}`}
                    strokeWidth={1.75}
                  />
                </span>
                <span
                  className={`whitespace-nowrap text-[10.5px] leading-tight ${
                    isSelected ? "font-semibold text-green" : "text-ink-faint"
                  }`}
                >
                  {route.title}
                </span>
              </button>
              {isSuggested && (
                <span className="ml-11 mt-1 max-w-[120px] rounded-full bg-green-soft px-2 py-0.5 text-[9px] font-semibold leading-tight text-green">
                  Suggested from your answers
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">{personalSentence}</p>

      <a
        href="#best-next-route"
        className="mt-3 inline-flex w-fit items-center gap-1 text-[12.5px] font-semibold text-green outline-none transition hover:text-green-dark focus-visible:underline"
      >
        Explore this route
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
