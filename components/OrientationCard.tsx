"use client";

import Link from "next/link";
import { ArrowRight, Pencil } from "lucide-react";
import { directionQuestions } from "@/lib/direction";
import { useDirectionAnswers } from "@/lib/useDirectionAnswers";

export function OrientationCard() {
  const { answers, setAnswers } = useDirectionAnswers();

  function updateField(key: keyof typeof answers, value: string) {
    setAnswers({ ...answers, [key]: value });
  }

  return (
    <div
      id="orientation"
      className="shadow-card scroll-mt-6 flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5"
    >
      <h2 className="font-serif text-[21px] leading-[1.22] text-ink">
        Find your
        <br />
        direction.
      </h2>
      <p className="mt-1.5 text-[12.5px] text-ink-faint">
        Five small questions to map your path. Sensible defaults are filled
        in — edit anytime.
      </p>

      <div className="mt-3.5 flex flex-col gap-2.5">
        {directionQuestions.map((q) => {
          const Icon = q.icon;
          return (
            <label
              key={q.key}
              className="block rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.25"
            >
              <span className="flex items-center gap-1.5">
                <Icon className="h-3 w-3 shrink-0 text-green" strokeWidth={1.75} />
                <span className="block text-[10.5px] text-ink-faint">
                  {q.question}
                </span>
              </span>
              <span className="mt-0.5 flex items-center justify-between gap-2">
                <input
                  value={answers[q.key]}
                  onChange={(e) => updateField(q.key, e.target.value)}
                  className="w-full bg-transparent text-[13px] font-medium text-ink outline-none"
                />
                <Pencil className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
              </span>
            </label>
          );
        })}
      </div>

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
