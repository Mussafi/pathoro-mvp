"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { FeedbackForm } from "@/components/FeedbackForm";

export function FeedbackButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        Share feedback
      </button>
      {open && <FeedbackModal onClose={() => setOpen(false)} />}
    </>
  );
}

function FeedbackModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onClick={onClose}
    >
      <div
        className="shadow-card w-full max-w-[440px] rounded-[26px] border border-line/70 bg-cream-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-[19px] leading-tight text-ink">Share feedback</h3>
            <p className="mt-1 text-[12px] text-ink-faint">
              This helped, this confused me, this was wrong, or a path you want added.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-ink-faint outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-green/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          <FeedbackForm />
        </div>
      </div>
    </div>
  );
}
