import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Leaf, Map } from "lucide-react";
import { goal, pathSteps, progress } from "@/lib/opportunity";

export function ProgressRail() {
  return (
    <aside className="flex flex-col gap-5">
      <div className="shadow-card rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
        <span className="text-[11px] font-semibold tracking-wide text-ink-faint">
          YOUR PATH
        </span>

        <ol className="mt-3 flex flex-col">
          {pathSteps.map((step, i) => (
            <li key={step.title} className="relative flex gap-3 pb-4 last:pb-0">
              {i < pathSteps.length - 1 && (
                <span
                  className={`absolute left-[9px] top-6 h-full w-px ${
                    step.status === "done" ? "bg-green/40" : "bg-line"
                  }`}
                />
              )}
              <span className="relative z-10 mt-0.5 shrink-0">
                {step.status === "done" ? (
                  <CheckCircle2 className="h-5 w-5 text-green" strokeWidth={1.75} />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-green">
                    <span className="h-2 w-2 rounded-full bg-green" />
                  </span>
                )}
              </span>
              <div
                className={`-mt-1 flex-1 rounded-xl px-2 py-1 ${
                  step.status === "current" ? "bg-green-soft/60" : ""
                }`}
              >
                <span className="block text-[13.5px] font-semibold text-ink">
                  {step.title}
                </span>
                <span className="block text-[12px] leading-snug text-ink-faint">
                  {step.body}
                </span>
              </div>
            </li>
          ))}
        </ol>

        <Link
          href="/"
          className="shadow-card mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-line/70 bg-cream-card py-2.5 text-[13px] font-medium text-ink transition hover:border-ink-faint/40"
        >
          Review your map
          <Map className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.75} />
        </Link>
      </div>

      <div className="shadow-card overflow-hidden rounded-[26px] border border-line/70 bg-cream-card">
        <div className="flex items-center justify-between px-5 pt-5">
          <span className="text-[11px] font-semibold tracking-wide text-ink-faint">
            YOUR GOAL
          </span>
        </div>
        <div className="flex items-center justify-between px-5 pt-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-green/40">
              <Leaf className="h-4 w-4 text-green" strokeWidth={1.75} />
            </span>
            <span className="text-[13.5px] font-semibold leading-tight text-ink">
              {goal.label}
            </span>
          </div>
          <button className="shadow-card shrink-0 rounded-full border border-line/70 px-3 py-1.5 text-[12px] font-medium text-ink transition hover:border-ink-faint/40">
            Edit
          </button>
        </div>
        <div className="relative mt-4 h-[150px] w-full">
          <Image
            src="/images/route-sidebar-photo.jpg"
            alt="A hiker on a winding path through misty mountains"
            fill
            sizes="260px"
            className="object-cover"
          />
        </div>
        <p className="px-5 py-3 text-center text-[12px] text-ink-faint">
          {goal.caption}
        </p>
      </div>

      <div className="shadow-card rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
        <span className="text-[11px] font-semibold tracking-wide text-ink-faint">
          PROGRESS SO FAR
        </span>
        <p className="mt-2 font-serif text-[28px] leading-none text-green">
          {progress.completed} / {progress.total}
        </p>
        <p className="mt-1 text-[12.5px] text-ink-faint">Steps completed</p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line/70">
          <div
            className="h-full rounded-full bg-green"
            style={{ width: `${(progress.completed / progress.total) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
          {progress.note}
        </p>
      </div>
    </aside>
  );
}
