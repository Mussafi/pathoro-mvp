"use client";

import { ArrowRight } from "lucide-react";
import { routes } from "@/lib/routes";
import type { DirectionAnswers } from "@/lib/direction";

const VIEW_W = 900;
// Taller than the original 290 — 5 lanes need real vertical room between
// them for a 3-line label to sit above/below its own lane without
// reaching into a neighboring lane's curve, which is still transitioning
// (not yet flat) through most of this x-range. See docs/route-reveal notes
// in the label placement block below.
const VIEW_H = 380;
const CENTER = { x: 90, y: 190 };
const BRANCH_X = 740;
const BRANCH_Y = [30, 118, 190, 262, 350];
// Every route's path curves out from center, then — past this x — travels
// in a straight horizontal line at its own BRANCH_Y out to the branch node.
// Step markers/labels sit on that straight run, so their y is always
// exactly the row's own y (no bezier interpolation needed for them, no
// risk of drifting toward a neighboring row). See MARKER_XS below.
const LANE_START_X = 460;
// Fixed marker columns, independent of route — evenly spaced along the
// straight lane, purely decorative texture (the actual step text lives in
// one stacked block, not spread across these).
const MARKER_XS = [560, 650, 720];
// All 3 steps for the selected route are rendered as a single stacked
// block at one x position, not 3 separate floating labels spread along
// the lane. A 3-column spread kept colliding with whichever neighboring
// lane's curve was still transitioning through that x-range — collapsing
// to one anchor point removes that collision surface entirely, and reads
// just as clearly as a short numbered list next to the destination.
const LABEL_X = 640;
const LABEL_OFFSET_PERCENT = 10;

function curveControlPoints(y: number, endX: number) {
  const startX = CENTER.x + 30;
  const startY = CENTER.y;
  const midX = (startX + endX) / 2;
  return {
    p0: { x: startX, y: startY },
    p1: { x: midX, y: startY },
    p2: { x: midX, y },
    p3: { x: endX, y },
  };
}

// Unselected routes keep the original pure bezier all the way to the
// branch node — it only sits at its own BRANCH_Y right near the very end,
// so it never lingers across the x-range where a *different* selected
// route's labels are floating.
function fullCurvePath(y: number) {
  const { p0, p1, p2, p3 } = curveControlPoints(y, BRANCH_X);
  return `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
}

// The selected route's path curves out, then — past LANE_START_X — runs
// straight at its own BRANCH_Y, so step markers/labels can sit on it at
// fixed, evenly-spaced x columns instead of bunched bezier points.
function selectedLanePath(y: number) {
  const { p0, p1, p2, p3 } = curveControlPoints(y, LANE_START_X);
  return `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y} L ${BRANCH_X} ${y}`;
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
  const isSuggested = selectedRouteId === suggestedRouteId;

  const personalSentence = !selectedRoute
    ? "Pathoro opened several routes from your answers."
    : isSuggested
      ? `You said “${answers.reachable}” would make this more reachable, so Pathoro opened ${selectedRoute.title} first.`
      : `You're exploring ${selectedRoute.title}. Based on “${answers.reachable},” Pathoro originally suggested ${suggestedRoute?.title ?? "a different route"} first.`;

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
                  d={isSelected ? selectedLanePath(BRANCH_Y[i]) : fullCurvePath(BRANCH_Y[i])}
                  fill="none"
                  stroke={isSelected ? "var(--color-green)" : "var(--color-line)"}
                  strokeWidth={isSelected ? 2.25 : 1.25}
                  strokeLinecap="round"
                  strokeOpacity={isSelected ? 0.9 : 0.18}
                />
              </g>
            );
          })}

          {/* subtle step markers along the selected route's straight lane */}
          {selectedRoute &&
            MARKER_XS.map((x, i) => (
              <circle
                key={i}
                cx={x}
                cy={BRANCH_Y[selectedIndex]}
                r={4}
                fill="var(--color-cream-card)"
                stroke="var(--color-green)"
                strokeWidth={1.5}
                className="route-reveal-animate"
                style={{ animationDelay: `${400 + i * 90}ms` }}
              />
            ))}
        </svg>

        {/* step list for the selected route — one small stacked block,
            offset above or below the straight lane depending on whether
            this route branches above or below center, so it never sits on
            top of the stroke. */}
        {selectedRoute &&
          (() => {
            const y = BRANCH_Y[selectedIndex];
            const isUpperRoute = y < CENTER.y;
            const verticalSign = isUpperRoute ? -1 : 1;
            const labelTransform = isUpperRoute ? "translate(-50%, -100%)" : "translate(-50%, 0)";
            return (
              <div
                className="route-reveal-animate absolute w-[192px] text-left"
                style={{
                  left: `${(LABEL_X / VIEW_W) * 100}%`,
                  top: `${(y / VIEW_H) * 100 + verticalSign * LABEL_OFFSET_PERCENT}%`,
                  transform: labelTransform,
                  animationDelay: "400ms",
                }}
              >
                {selectedRoute.steps.map((step, i) => (
                  <p
                    key={i}
                    className="flex items-baseline gap-1.5 text-[9.5px] font-semibold leading-[1.25] text-ink"
                  >
                    <span className="text-green">{i + 1}.</span>
                    {step.label}
                  </p>
                ))}
              </div>
            );
          })()}

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
