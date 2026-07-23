"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  ClipboardList,
  Pencil,
  Sprout,
  TrendingUp,
  Users,
} from "lucide-react";

type Option = {
  id: string;
  icon: typeof Briefcase;
  title: string;
  body: string;
};

const options: Option[] = [
  {
    id: "career",
    icon: Briefcase,
    title: "Start a new career",
    body: "Explore new fields and roles",
  },
  {
    id: "habit",
    icon: Sprout,
    title: "Change a habit / lifestyle",
    body: "Build better routines and wellbeing",
  },
  {
    id: "grow",
    icon: TrendingUp,
    title: "Grow in my current path",
    body: "Level up skills and impact",
  },
  {
    id: "community",
    icon: Users,
    title: "Find community",
    body: "Connect and belong",
  },
  {
    id: "project",
    icon: ClipboardList,
    title: "Start a project",
    body: "Turn an idea into something real",
  },
];

export function OrientationCard() {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(["career", "habit", "grow"])
  );
  const [routeFocus, setRouteFocus] = useState("Better health / longevity");
  const [ownOpportunity, setOwnOpportunity] = useState("");

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div
      id="orientation"
      className="shadow-card scroll-mt-6 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5"
    >
      <h2 className="font-serif text-[21px] leading-[1.22] text-ink">
        What should this route
        <br />
        make room for?
      </h2>
      <p className="mt-1.5 text-[12.5px] text-ink-faint">
        Choose what matters most right now.
      </p>

      <label className="mt-3.5 block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
        <span className="block text-[10.5px] text-ink-faint">
          What should this route make room for?
        </span>
        <span className="mt-0.5 flex items-center justify-between gap-2">
          <input
            value={routeFocus}
            onChange={(e) => setRouteFocus(e.target.value)}
            className="w-full bg-transparent text-[13.5px] font-medium text-ink outline-none"
          />
          <Pencil className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
        </span>
      </label>

      <p className="mt-3.5 text-[12px] text-ink-faint">Pick all that apply.</p>

      <div className="mt-2 flex flex-col gap-1.5">
        {options.map((opt) => {
          const isOn = selected.has(opt.id);
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={`flex items-center gap-2.5 rounded-[16px] border px-2.75 py-2 text-left transition ${
                isOn
                  ? "border-green/45 bg-green-soft/70"
                  : "border-line/70 bg-cream-card hover:border-ink-faint/30"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  isOn ? "bg-green" : "bg-cream-field"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${isOn ? "text-cream" : "text-ink-soft"}`}
                  strokeWidth={1.75}
                />
              </span>
              <span className="flex-1">
                <span className="block text-[13px] font-semibold text-ink">
                  {opt.title}
                </span>
                <span className="block text-[11.5px] text-ink-faint">
                  {opt.body}
                </span>
              </span>
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  isOn
                    ? "border-green bg-green text-cream"
                    : "border-line bg-transparent"
                }`}
              >
                {isOn && (
                  <svg viewBox="0 0 12 12" className="h-2 w-2" fill="none">
                    <path
                      d="M2.5 6.2 L5 8.7 L9.5 3.3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3.5 text-[12px] text-ink-faint">Or write your own</p>
      <label className="mt-1.5 flex items-center justify-between gap-2 rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25">
        <input
          value={ownOpportunity}
          onChange={(e) => setOwnOpportunity(e.target.value)}
          placeholder="Name your own opportunity…"
          className="w-full bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-faint"
        />
        <Pencil className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
      </label>

      <Link
        href="/route-planning"
        className="mt-4 flex items-center justify-center gap-2 rounded-full bg-green py-2.5 text-[13.5px] font-medium text-cream shadow-sm transition hover:bg-green-dark"
      >
        Continue to Landscape
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
      <p className="mt-2 text-center text-[11.5px] text-ink-faint">
        You can adjust anytime.
      </p>
    </div>
  );
}
