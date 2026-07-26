"use client";

import { getBranchAccentClasses, type TrailMapGoal } from "@/lib/trailMapData";

const VIEW_W = 900;
const MARGIN_Y = 95;
const LANE_GAP = 82;
const CENTER_X = 45;
const ICON_X = 130;
const LANE_START_X = 260;
const NODE_XS = [430, 600, 770];
const LAST_X = NODE_XS[NODE_XS.length - 1] + 35;

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
  const selectedIndex = Math.max(
    branches.findIndex((b) => b.id === selectedBranchId),
    0
  );
  const selectedBranch = branches[selectedIndex];

  return (
    <div className="overflow-x-auto rounded-[26px] bg-cream-card px-2 pb-6 pt-20">
      <div className="relative w-full min-w-[660px]" style={{ aspectRatio: `${VIEW_W} / ${height}` }}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${height}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          {branches.map((branch, i) => {
            const isSelected = branch.id === selectedBranchId;
            const y = laneY(i);
            return (
              <g key={branch.id}>
                {isSelected && (
                  <path
                    d={lanePath(centerY, y)}
                    fill="none"
                    stroke="var(--color-green)"
                    strokeWidth={8}
                    strokeLinecap="round"
                    opacity={0.28}
                    style={{ filter: "blur(3px)" }}
                  />
                )}
                <path
                  d={lanePath(centerY, y)}
                  fill="none"
                  stroke={isSelected ? "var(--color-green)" : "var(--color-line)"}
                  strokeWidth={isSelected ? 2.5 : 1.25}
                  strokeDasharray={isSelected ? undefined : "4 5"}
                  strokeLinecap="round"
                />
                {NODE_XS.map((nx, ni) => {
                  const isLast = ni === NODE_XS.length - 1;
                  const r = isSelected && isLast ? 7 : isSelected ? 5 : 4.5;
                  return (
                    <circle
                      key={ni}
                      cx={nx}
                      cy={y}
                      r={r}
                      fill={isSelected && isLast ? "var(--color-green)" : "var(--color-cream-card)"}
                      stroke={isSelected ? "var(--color-green)" : "var(--color-line)"}
                      strokeWidth={isSelected ? 2 : 1.5}
                    />
                  );
                })}
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
          const accent = getBranchAccentClasses(branch.id);
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
                className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition focus-visible:ring-2 focus-visible:ring-green/50 ${
                  isSelected
                    ? "border-green bg-green"
                    : `${accent.border} ${accent.bg} hover:brightness-95`
                }`}
              >
                {isSelected && (
                  <span className="absolute -inset-2 -z-10 rounded-full bg-green/30 blur-md" />
                )}
                <Icon
                  className={`h-3.5 w-3.5 ${isSelected ? "text-cream" : accent.text}`}
                  strokeWidth={2}
                />
              </span>
              <span
                className={`w-[128px] text-[10.5px] leading-tight ${
                  isSelected ? "font-semibold text-green" : "text-ink-soft"
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
          const isUpper = y < centerY;
          const labelAbove = isSelected && isUpper;
          return branch.nodes.map((node, ni) => (
            <div
              key={node.id}
              className="absolute w-[138px] -translate-x-1/2 text-center text-[9.5px] leading-[1.2]"
              style={{
                left: `${(NODE_XS[ni] / VIEW_W) * 100}%`,
                top: `${(y / height) * 100}%`,
                transform: labelAbove ? "translate(-50%, calc(-100% - 14px))" : "translate(-50%, 12px)",
              }}
            >
              <span className={isSelected ? "font-semibold text-ink" : "text-ink-faint"}>
                {node.label}
              </span>
            </div>
          ));
        })}

        {selectedBranch &&
          (() => {
            const y = laneY(selectedIndex);
            const isUpper = y < centerY;
            return (
              <div
                className="absolute w-[220px] rounded-2xl border border-green/40 bg-ink px-3.5 py-3 shadow-lg"
                style={{
                  left: `${(ICON_X / VIEW_W) * 100}%`,
                  top: `${(y / height) * 100}%`,
                  transform: isUpper
                    ? "translate(-8%, calc(-100% - 22px))"
                    : "translate(-8%, 22px)",
                }}
              >
                <span className="text-[12px] font-semibold text-cream">{selectedBranch.title}</span>
                <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-cream/70">
                  {selectedBranch.whyItFits}
                </p>
              </div>
            );
          })()}
      </div>
    </div>
  );
}
