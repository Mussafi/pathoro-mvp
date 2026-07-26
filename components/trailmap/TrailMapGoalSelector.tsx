import type { TrailMapGoal, TrailMapGoalId } from "@/lib/trailMapData";

export function TrailMapGoalSelector({
  goals,
  selectedGoalId,
  onSelect,
}: {
  goals: TrailMapGoal[];
  selectedGoalId: TrailMapGoalId;
  onSelect: (id: TrailMapGoalId) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        Demo goal
      </span>
      {goals.map((goal) => {
        const isSelected = goal.id === selectedGoalId;
        return (
          <button
            key={goal.id}
            type="button"
            onClick={() => onSelect(goal.id)}
            className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
              isSelected
                ? "border-green/40 bg-green-soft text-green"
                : "border-line/70 bg-cream-card text-ink-soft hover:border-ink-faint/40"
            }`}
          >
            {goal.label}
          </button>
        );
      })}
    </div>
  );
}
