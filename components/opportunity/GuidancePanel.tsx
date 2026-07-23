"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  Calendar,
  ExternalLink,
  Map,
  MapPinned,
  Pencil,
} from "lucide-react";
import { nextSteps, routeContext, trailNote } from "@/lib/opportunity";

function NextStepButton({
  step,
}: {
  step: (typeof nextSteps)[number];
}) {
  const [done, setDone] = useState(false);
  const Icon = step.action === "Reflect after" ? Bookmark : ExternalLink;

  return (
    <button
      onClick={() => setDone(true)}
      className={`flex items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-medium transition ${
        step.style === "primary"
          ? "bg-green text-cream hover:bg-green-dark"
          : "border border-line/70 text-ink hover:border-ink-faint/40"
      } ${done ? "opacity-70" : ""}`}
    >
      {done ? "Noted ✓" : step.action}
      {!done && <Icon className="h-3.5 w-3.5" />}
    </button>
  );
}

export function GuidancePanel() {
  return (
    <aside className="flex flex-col gap-5">
      <div className="shadow-card rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
        <span className="text-[15px] font-semibold text-ink">Route context</span>
        <p className="mt-2 text-[13.5px] font-semibold text-ink">{routeContext.title}</p>
        <p className="text-[12px] text-ink-faint">{routeContext.summary}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col items-center gap-1.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line/70">
              <Map className="h-4 w-4 text-ink-faint" strokeWidth={1.75} />
            </span>
            <span className="max-w-[70px] text-center text-[10.5px] leading-tight text-ink-faint">
              {routeContext.before}
            </span>
          </div>
          <span className="mb-6 text-ink-faint">→</span>
          <div className="flex flex-col items-center gap-1.5">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-soft ring-1 ring-green/30">
              <Calendar className="h-6 w-6 text-green" strokeWidth={1.75} />
            </span>
            <span className="max-w-[100px] text-center text-[11px] font-semibold leading-tight text-ink">
              {routeContext.current}
            </span>
          </div>
          <span className="mb-6 text-ink-faint">→</span>
          <div className="flex flex-col items-center gap-1.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line/70">
              <MapPinned className="h-4 w-4 text-ink-faint" strokeWidth={1.75} />
            </span>
            <span className="max-w-[70px] text-center text-[10.5px] leading-tight text-ink-faint">
              {routeContext.next}
            </span>
          </div>
        </div>

        <p className="mt-4 text-center text-[12px] text-ink-faint">{routeContext.note}</p>

        <Link
          href="/route-planning"
          className="shadow-card mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-line/70 bg-cream-card py-2.5 text-[13px] font-medium text-ink transition hover:border-ink-faint/40"
        >
          View full route
          <Map className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.75} />
        </Link>
      </div>

      <div className="shadow-card rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
        <span className="text-[11px] font-semibold tracking-wide text-ink-faint">
          YOUR NEXT STEPS
        </span>

        <ol className="mt-3 flex flex-col">
          {nextSteps.map((step, i) => (
            <li key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
              {i < nextSteps.length - 1 && (
                <span className="absolute left-[13px] top-7 h-full w-px bg-line" />
              )}
              <span
                className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${
                  step.style === "primary"
                    ? "bg-green text-cream"
                    : "border-2 border-[#e7c9a3] text-ink-soft"
                }`}
              >
                {step.number}
              </span>
              <div className="flex-1">
                <span className="block text-[13.5px] font-semibold text-ink">
                  {step.title}
                </span>
                <span className="block text-[12px] leading-relaxed text-ink-faint">
                  {step.body}
                </span>
                <div className="mt-2.5">
                  <NextStepButton step={step} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="shadow-card rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wide text-ink-faint">
            TRAIL NOTES (YOU)
          </span>
          <button className="flex items-center gap-1 text-[12px] font-medium text-ink-soft transition hover:text-ink">
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        </div>
        <div className="mt-3 flex gap-3">
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-line/70">
            <Image
              src="/images/user-avatar.jpg"
              alt="Your avatar"
              fill
              sizes="36px"
              className="object-cover"
            />
          </span>
          <div>
            <p className="text-[12.5px] leading-relaxed text-ink">{trailNote.body}</p>
            <p className="mt-1.5 text-[11px] text-ink-faint">{trailNote.addedOn}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
