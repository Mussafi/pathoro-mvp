"use client";

import { useState } from "react";
import { Megaphone, X } from "lucide-react";

const previewFields = [
  "What are you offering?",
  "Who is it for?",
  "What path does it support?",
  "What could it open next?",
];

export function PostOpportunityCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="shadow-card mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[26px] border border-line/70 bg-cream-card px-6 py-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-soft">
            <Megaphone className="h-4 w-4 text-green" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-ink">
              Have an opportunity to offer?
            </p>
            <p className="mt-0.5 text-[12.5px] text-ink-faint">
              Help someone find their next step.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-full border border-green/40 bg-green-soft px-4 py-2 text-[12.5px] font-medium text-green outline-none transition hover:bg-green-soft/70 focus-visible:ring-2 focus-visible:ring-green/50"
        >
          Preview opportunity
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="shadow-card w-full max-w-[440px] rounded-[26px] border border-line/70 bg-cream-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-serif text-[19px] leading-tight text-ink">
                Post an opportunity
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 text-ink-faint outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-green/50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-soft">
              Opportunity posting is coming soon. Pathoro will help people,
              groups, mentors, teachers, businesses, and communities place
              opportunities where they become meaningful and reachable.
            </p>

            <div className="mt-4 flex flex-col gap-2.5">
              {previewFields.map((field) => (
                <label
                  key={field}
                  className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25"
                >
                  <span className="block text-[10.5px] text-ink-faint">
                    {field}
                  </span>
                  <input
                    disabled
                    placeholder="Coming soon"
                    className="mt-0.5 w-full bg-transparent text-[13px] text-ink-faint outline-none placeholder:text-ink-faint/70"
                  />
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-green py-2.5 text-[13.5px] font-medium text-cream shadow-sm outline-none transition hover:bg-green-dark focus-visible:ring-2 focus-visible:ring-green/50"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
