"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

export function TrailMapGoalSearch({ onSubmit }: { onSubmit: (goalText: string) => void }) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <div>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Trail Map</span>
      <p className="mt-0.5 text-[13.5px] font-medium text-ink">What path do you want to map?</p>
      <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-line/70 bg-cream-card px-4 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-ink-faint" strokeWidth={1.75} />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="nurse, lawyer, doctor, engineer, therapist, resale business…"
            className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-full bg-green px-4 py-2.5 text-[12.5px] font-semibold text-cream transition hover:bg-green-dark"
        >
          Map it
        </button>
      </form>
    </div>
  );
}
