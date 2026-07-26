import { Clock, DollarSign, TrendingUp, Users } from "lucide-react";
import { isFavorableRating, type TrailMapGoal } from "@/lib/trailMapData";

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
          return (
            <button
              key={branch.id}
              type="button"
              onClick={() => onSelect(branch.id)}
              className={`flex w-[190px] shrink-0 flex-col rounded-2xl border px-3.5 py-3 text-left transition ${
                isSelected
                  ? "border-green/50 bg-green-soft/40"
                  : "border-line/70 bg-cream-field hover:border-ink-faint/40"
              }`}
            >
              <span className={`text-[12px] font-semibold leading-tight ${isSelected ? "text-green" : "text-ink"}`}>
                {branch.title}
              </span>
              <div className="mt-2 flex flex-col gap-1.5">
                <CompareRow icon={Clock} value={branch.factors.typicalTime} />
                <CompareRow icon={DollarSign} value={branch.factors.costFriction} />
                <CompareRow
                  icon={TrendingUp}
                  value={`AI risk: ${branch.factors.aiRisk}`}
                  favorable={isFavorableRating("aiRisk", branch.factors.aiRisk)}
                />
                <CompareRow
                  icon={Users}
                  value={`Demand: ${branch.factors.demand}`}
                  favorable={isFavorableRating("demand", branch.factors.demand)}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CompareRow({
  icon: Icon,
  value,
  favorable,
}: {
  icon: typeof Clock;
  value: string;
  favorable?: boolean;
}) {
  return (
    <span
      className={`flex items-center gap-1.5 text-[11px] ${favorable ? "font-medium text-green" : "text-ink-faint"}`}
    >
      <Icon className="h-3 w-3 shrink-0" strokeWidth={1.75} />
      {value}
    </span>
  );
}
