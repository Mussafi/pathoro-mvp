import { ClipboardList, Compass, Footprints, MapPinned, Users } from "lucide-react";

const SHELL_STEPS = [
  { icon: Compass, label: "Clarify the path" },
  { icon: ClipboardList, label: "Understand requirements" },
  { icon: Users, label: "Find people ahead" },
  { icon: MapPinned, label: "Find access points" },
  { icon: Footprints, label: "Take first real-world step" },
];

export function TrailMapGenericShell({ goalText }: { goalText: string }) {
  return (
    <div className="shadow-card mt-6 rounded-[26px] border border-line/70 bg-cream-card px-6 py-8">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        &ldquo;{goalText}&rdquo;
      </span>
      <h2 className="mt-1 font-serif text-[22px] leading-tight text-ink">Trail Map starting point</h2>
      <p className="mt-2 max-w-[560px] text-[13px] leading-relaxed text-ink-soft">
        Pathoro does not have a full map for this path yet, but it can begin by mapping
        milestones, requirements, access points, and trail markers.
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        {SHELL_STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.label}
              className="flex items-center gap-3 rounded-2xl border border-line/70 bg-cream-field px-4 py-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-green/40 bg-green-soft/60 text-[11px] font-semibold text-green">
                {i + 1}
              </span>
              <Icon className="h-4 w-4 shrink-0 text-green" strokeWidth={1.75} />
              <span className="text-[13px] font-medium text-ink">{step.label}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-5 rounded-xl border border-line/70 bg-cream-field px-3.5 py-2.5 text-[11px] leading-relaxed text-ink-faint">
        Requirements vary by state, institution, and employer. Pathoro should verify
        details from official sources before treating this as guidance.
      </p>
    </div>
  );
}
