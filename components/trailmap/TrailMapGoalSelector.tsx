import type { TrailMapGoal, TrailMapGoalId } from "@/lib/trailMapData";

export function TrailMapGoalSelector({
  goals,
  selectedGoalId,
  onSelect,
}: {
  goals: TrailMapGoal[];
  selectedGoalId: TrailMapGoalId | null;
  onSelect: (id: TrailMapGoalId) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10.5px] font-medium uppercase tracking-wide text-ink-faint/80">
        Example maps
      </span>
      {goals.map((goal) => {
        const isSelected = goal.id === selectedGoalId;
        return (
          <button
            key={goal.id}
            type="button"
            onClick={() => onSelect(goal.id as TrailMapGoalId)}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
              isSelected
                ? "border-green/40 bg-green-soft text-green"
                : "border-line/60 bg-cream-card/70 text-ink-faint hover:border-ink-faint/40 hover:text-ink-soft"
            }`}
          >
            {goal.label}
          </button>
        );
      })}
    </div>
  );
}
