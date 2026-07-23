"use client";

import { useState } from "react";
import Image from "next/image";
import { Bookmark, ChevronDown, Compass, Mountain, Share2 } from "lucide-react";

export function RoutePlanningHeader() {
  const [mode, setMode] = useState<"compass" | "trail">("trail");

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-10">
      <div
        className="relative h-[46px] w-[220px] shrink-0"
        style={{ aspectRatio: "1378 / 324" }}
      >
        <Image
          src="/images/logo-full.png"
          alt="Pathoro — Find your way."
          fill
          sizes="220px"
          className="object-contain object-left"
          priority
        />
      </div>

      <div className="shadow-card flex shrink-0 gap-1 rounded-2xl border border-line/70 bg-cream-card p-1">
        <button
          type="button"
          onClick={() => setMode("compass")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-left transition ${
            mode === "compass" ? "bg-green-soft" : "hover:bg-cream-field"
          }`}
        >
          <Compass className="h-4 w-4 text-green" strokeWidth={1.75} />
          <span className="leading-tight">
            <span className="block text-[12.5px] font-semibold text-ink">
              Compass Mode
            </span>
            <span className="block text-[11px] text-ink-faint">
              Where am I?
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMode("trail")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-left transition ${
            mode === "trail" ? "bg-green-soft" : "hover:bg-cream-field"
          }`}
        >
          <Mountain className="h-4 w-4 text-green" strokeWidth={1.75} />
          <span className="leading-tight">
            <span className="block text-[12.5px] font-semibold text-ink">
              Trail Mode
            </span>
            <span className="block text-[11px] text-ink-faint">
              Map my path
            </span>
          </span>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-5">
        <button className="flex items-center gap-1.5 text-[13px] font-medium text-ink-soft">
          <Bookmark className="h-4 w-4" strokeWidth={1.75} />
          Save
        </button>
        <button className="flex items-center gap-1.5 text-[13px] font-medium text-ink-soft">
          <Share2 className="h-4 w-4" strokeWidth={1.75} />
          Share
        </button>
        <button className="flex items-center gap-1.5">
          <span className="relative h-8 w-8 overflow-hidden rounded-full border border-line/70">
            <Image
              src="/images/user-avatar.jpg"
              alt="User avatar"
              fill
              sizes="32px"
              className="object-cover"
            />
          </span>
          <ChevronDown className="h-4 w-4 text-ink-faint" />
        </button>
      </div>
    </header>
  );
}
