import Image from "next/image";
import { Leaf } from "lucide-react";
import { opportunityContext } from "@/lib/routes";

export function PathSidebar() {
  return (
    <aside className="shadow-card flex flex-col overflow-hidden rounded-[26px] border border-line/70 bg-cream-card">
      <div className="px-5 pt-5">
        <span className="text-[11px] font-semibold tracking-wide text-ink-faint">
          YOUR PATH
        </span>

        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-green bg-green" />
          <span className="h-px w-6 shrink-0 bg-green" />
          <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-line" />
          <span className="h-px w-6 shrink-0 bg-line" />
          <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-line" />
        </div>
        <span className="mt-1.5 block text-[12.5px] font-medium text-green">
          {opportunityContext.stepLabel}
        </span>

        <h1 className="mt-3 font-serif text-[26px] leading-[1.18] text-ink">
          {opportunityContext.title}
        </h1>

        <p className="mt-3 text-[13px] font-medium text-ink-faint">
          {opportunityContext.goalLabel}
        </p>
        <p className="font-serif text-[17px] leading-tight text-green">
          {opportunityContext.goal}
        </p>

        <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-soft">
          {opportunityContext.description}
        </p>

        <div className="mt-4 rounded-2xl border border-line/70 bg-cream-field px-4 py-3.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-green/40">
            <Leaf className="h-4 w-4 text-green" strokeWidth={1.75} />
          </span>
          <p className="mt-2 text-[13px] font-semibold leading-tight text-ink">
            A path toward
            <br />
            your next best self
          </p>
          <p className="mt-1 text-[12px] leading-snug text-ink-faint">
            Every small shift makes your future self more likely.
          </p>
        </div>
      </div>

      <div className="relative mt-5 min-h-[220px] flex-1">
        <Image
          src="/images/route-sidebar-photo.jpg"
          alt="A hiker on a glowing winding trail through misty mountains"
          fill
          sizes="300px"
          className="object-cover object-bottom"
          priority
        />
      </div>
    </aside>
  );
}
