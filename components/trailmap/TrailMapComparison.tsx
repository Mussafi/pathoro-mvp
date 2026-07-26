import { Clock, DollarSign } from "lucide-react";
import { getBranchAccentClasses, getRatingFillCount, type TrailMapGoal } from "@/lib/trailMapData";

export function TrailMapComparison({
  goal,
  selectedBranchId,
  onSelect,
}: {
  goal: TrailMapGoal;
  selectedBranchId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="shadow-card mt-6 rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
      <span className="text-[13px] font-semibold text-ink">Path comparison</span>
      <p className="mt-1 text-[11.5px] text-ink-faint">Compare key factors across paths.</p>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {goal.branches.map((branch) => {
          const isSelected = branch.id === selectedBranchId;
          const accent = getBranchAccentClasses(branch.id);
          const Icon = branch.icon;
          return (
            <button
              key={branch.id}
              type="button"
              onClick={() => onSelect(branch.id)}
              className={`flex w-[196px] shrink-0 flex-col rounded-2xl border-2 px-3.5 py-3 text-left transition ${
                isSelected
                  ? "border-green bg-green/10 shadow-[0_0_0_3px_rgba(84,120,32,0.1)]"
                  : `${accent.cardBorder} ${accent.cardBg} hover:brightness-[0.98]`
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    isSelected ? "bg-green" : accent.bg
                  }`}
                >
                  <Icon
                    className={`h-2.5 w-2.5 ${isSelected ? "text-cream" : accent.text}`}
                    strokeWidth={2.25}
                  />
                </span>
                <span
                  className={`text-[12px] font-semibold leading-tight ${isSelected ? "text-green" : "text-ink"}`}
                >
                  {branch.title}
                </span>
              </div>
              <div className="mt-2.5 flex flex-col gap-1.5">
                <CompareRow icon={Clock} value={branch.factors.typicalTime} />
                <CompareRow icon={DollarSign} value={branch.factors.costFriction} />
                <RatingDots
                  label="AI risk"
                  fill={getRatingFillCount("aiRisk", branch.factors.aiRisk)}
                />
                <RatingDots
                  label="Demand"
                  fill={getRatingFillCount("demand", branch.factors.demand)}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CompareRow({ icon: Icon, value }: { icon: typeof Clock; value: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-ink-faint">
      <Icon className="h-3 w-3 shrink-0" strokeWidth={1.75} />
      {value}
    </span>
  );
}

function RatingDots({ label, fill }: { label: string; fill: number }) {
  const dotColor = fill >= 4 ? "bg-green" : fill === 3 ? "bg-amber-400" : "bg-ink-faint/40";
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-ink-faint">{label}</span>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${i < fill ? dotColor : "bg-line"}`}
          />
        ))}
      </div>
    </div>
  );
}
