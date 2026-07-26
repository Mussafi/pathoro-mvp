"use client";

import type { TrailMapGoal } from "@/lib/trailMapData";

const VIEW_W = 900;
const MARGIN_Y = 60;
const LANE_GAP = 78;
const CENTER_X = 45;
const ICON_X = 120;
const LANE_START_X = 250;
const NODE_XS = [420, 590, 760];
const LAST_X = NODE_XS[NODE_XS.length - 1] + 40;

function laneY(index: number): number {
  return MARGIN_Y + index * LANE_GAP;
}

function viewHeight(count: number): number {
  return MARGIN_Y * 2 + Math.max(count - 1, 0) * LANE_GAP;
}

// Same curve technique as RouteRevealMap: a cubic bezier from the shared
// center point out to where the branch's lane begins, then a straight line
// through the lane's milestone nodes.
function lanePath(centerY: number, y: number): string {
  const startX = CENTER_X + 20;
  const midX = (startX + LANE_START_X) / 2;
  return `M ${startX} ${centerY} C ${midX} ${centerY}, ${midX} ${y}, ${LANE_START_X} ${y} L ${LAST_X} ${y}`;
}

export function TrailMapBranchDiagram({
  goal,
  selectedBranchId,
  onSelect,
}: {
  goal: TrailMapGoal;
  selectedBranchId: string;
  onSelect: (id: string) => void;
}) {
  const branches = goal.branches;
  const height = viewHeight(branches.length);
  const centerY = height / 2;

  return (
    <div className="shadow-card overflow-x-auto rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
      <div className="relative w-full min-w-[620px]" style={{ aspectRatio: `${VIEW_W} / ${height}` }}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${height}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {branches.map((branch, i) => {
            const isSelected = branch.id === selectedBranchId;
            const y = laneY(i);
            return (
              <g key={branch.id}>
                <path
                  d={lanePath(centerY, y)}
                  fill="none"
                  stroke={isSelected ? "var(--color-green)" : "var(--color-line)"}
                  strokeWidth={isSelected ? 2.5 : 1.25}
                  strokeDasharray={isSelected ? undefined : "4 5"}
                  strokeLinecap="round"
                />
                {NODE_XS.map((nx, ni) => (
                  <circle
                    key={ni}
                    cx={nx}
                    cy={y}
                    r={isSelected ? 6 : 5}
                    fill={isSelected ? "var(--color-green)" : "var(--color-cream-card)"}
                    stroke={isSelected ? "var(--color-cream-card)" : "var(--color-line)"}
                    strokeWidth={isSelected ? 2 : 1.5}
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {/* center "you are here" node */}
        <div
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
          style={{ left: `${(CENTER_X / VIEW_W) * 100}%`, top: `${(centerY / height) * 100}%` }}
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-green bg-cream-card">
            <span className="absolute -inset-2 -z-10 rounded-full bg-green/20 blur-md" />
            <span className="h-2.5 w-2.5 rounded-full bg-green" />
          </span>
          <span className="whitespace-nowrap text-[9.5px] font-semibold text-ink">You are here</span>
        </div>

        {branches.map((branch, i) => {
          const Icon = branch.icon;
          const isSelected = branch.id === selectedBranchId;
          const y = laneY(i);
          return (
            <button
              key={branch.id}
              type="button"
              onClick={() => onSelect(branch.id)}
              className="absolute flex -translate-y-1/2 items-center gap-1.5 text-left outline-none"
              style={{
                left: `${(ICON_X / VIEW_W) * 100}%`,
                top: `${(y / height) * 100}%`,
              }}
            >
              <span
                className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition focus-visible:ring-2 focus-visible:ring-green/50 ${
                  isSelected
                    ? "border-green bg-green"
                    : "border-line/70 bg-cream-card hover:border-ink-faint/40"
                }`}
              >
                {isSelected && (
                  <span className="absolute -inset-1.5 -z-10 rounded-full bg-green/25 blur-md" />
                )}
                <Icon
                  className={`h-3 w-3 ${isSelected ? "text-cream" : "text-ink-soft"}`}
                  strokeWidth={1.75}
                />
              </span>
              <span
                className={`w-[132px] text-[10.5px] leading-tight ${
                  isSelected ? "font-semibold text-green" : "text-ink-faint"
                }`}
              >
                {branch.title}
              </span>
            </button>
          );
        })}

        {branches.map((branch, i) => {
          const isSelected = branch.id === selectedBranchId;
          const y = laneY(i);
          return branch.nodes.map((node, ni) => (
            <div
              key={node.id}
              className="absolute w-[140px] -translate-x-1/2 text-center text-[9.5px] leading-[1.2]"
              style={{
                left: `${(NODE_XS[ni] / VIEW_W) * 100}%`,
                top: `${(y / height) * 100 + 8.5}%`,
              }}
            >
              <span className={isSelected ? "font-semibold text-ink" : "text-ink-faint"}>
                {node.label}
              </span>
            </div>
          ));
        })}
      </div>
    </div>
  );
}
