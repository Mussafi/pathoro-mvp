import { ChevronRight } from "lucide-react";

const steps = [
  { n: 1, title: "Welcome", body: "A calm start. An open path." },
  { n: 2, title: "Orientation", body: "Start with what matters to you." },
  { n: 3, title: "You Are Here", body: "See your landscape. Spot nearby possibility." },
];

export function StepperNav() {
  return (
    <nav className="flex items-center gap-4 px-6 py-3 sm:px-10">
      {steps.map((step, i) => (
        <div key={step.n} className="flex flex-1 items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green text-[12px] font-semibold text-cream">
              {step.n}
            </span>
            <span className="leading-tight">
              <span className="block text-[13px] font-semibold text-ink">
                {step.title}
              </span>
              <span className="block text-[11.5px] text-ink-faint">
                {step.body}
              </span>
            </span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-ink-faint/60 sm:block" />
          )}
        </div>
      ))}
    </nav>
  );
}
