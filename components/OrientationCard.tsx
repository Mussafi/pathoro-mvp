"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Pencil } from "lucide-react";
import { directionQuestions, type DirectionAnswers } from "@/lib/direction";
import { useDirectionAnswers } from "@/lib/useDirectionAnswers";

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export function OrientationCard() {
  const { answers, setAnswers } = useDirectionAnswers();
  const [openKey, setOpenKey] = useState<keyof DirectionAnswers | null>(null);
  const textareaRefs = useRef<Partial<Record<keyof DirectionAnswers, HTMLTextAreaElement>>>({});

  function updateField(key: keyof DirectionAnswers, value: string) {
    setAnswers({ ...answers, [key]: value });
  }

  function focusAnswer(key: keyof DirectionAnswers) {
    setOpenKey(key);
    const el = textareaRefs.current[key];
    if (el) {
      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
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
        Choose a suggestion or write your own.
      </p>
      <p className="mt-1 text-[12px] italic leading-relaxed text-ink-soft">
        You don&rsquo;t need perfect answers. Choose what feels closest —
        Pathoro will help shape the path.
      </p>

      <div className="mt-3.5 flex flex-col gap-2.5">
        {directionQuestions.map((q) => {
          const Icon = q.icon;
          const isOpen = openKey === q.key;
          return (
            <div
              key={q.key}
              className="rounded-2xl border border-line/70 bg-cream-field px-3.5 py-2.5"
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5">
                  <Icon className="h-3 w-3 shrink-0 text-green" strokeWidth={1.75} />
                  <span className="block text-[10.5px] text-ink-faint">
                    {q.question}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => focusAnswer(q.key)}
                    aria-label="Write your own answer"
                    className="rounded-full p-1 text-ink-faint outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-green/50"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenKey(isOpen ? null : q.key)}
                    aria-expanded={isOpen}
                    aria-label="Show suggestions"
                    className="rounded-full p-1 text-ink-faint outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-green/50"
                  >
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </span>
              </div>

              <textarea
                ref={(el) => {
                  if (el) {
                    autoResize(el);
                    textareaRefs.current[q.key] = el;
                  }
                }}
                value={answers[q.key]}
                onChange={(e) => {
                  updateField(q.key, e.target.value);
                  autoResize(e.target);
                }}
                placeholder="Write your own answer…"
                rows={1}
                className="mt-1 w-full resize-none overflow-hidden bg-transparent text-[13px] font-medium leading-snug text-ink outline-none placeholder:font-normal placeholder:text-ink-faint"
              />

              {isOpen && (
                <div className="mt-2 border-t border-line/60 pt-2.5">
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-ink-faint/80">
                    Or choose a suggestion
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {q.options.map((opt) => {
                      const isSelected = answers[q.key] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => updateField(q.key, opt)}
                          className={`rounded-full border px-2.5 py-1 text-left text-[11.5px] leading-snug transition ${
                            isSelected
                              ? "border-green bg-green text-cream"
                              : "border-line/70 bg-cream-card text-ink-soft hover:border-ink-faint/30"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
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
