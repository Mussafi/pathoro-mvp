"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Info,
  Leaf,
  Lock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { opportunity } from "@/lib/opportunity";

export function OpportunityMain() {
  const [saved, setSaved] = useState(false);
  const [starred, setStarred] = useState(true);
  const [taken, setTaken] = useState(false);
  const [noteIndex, setNoteIndex] = useState(0);

  const note = opportunity.notes[noteIndex];

  return (
    <div className="shadow-card flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-6 py-6">
      <Link
        href="/route-planning"
        className="flex w-fit items-center gap-1.5 text-[13px] font-medium text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to opportunities
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-[26px] leading-tight text-ink">
          {opportunity.title}
        </h1>
        <button
          onClick={() => setStarred((s) => !s)}
          aria-label="Toggle favorite"
          className="text-green transition hover:scale-110"
        >
          <Star className={`h-5 w-5 ${starred ? "fill-green" : ""}`} strokeWidth={1.75} />
        </button>
        <span className="inline-flex items-center rounded-full bg-green-badge px-3 py-1 text-[11.5px] font-semibold text-cream">
          Best next opportunity
        </span>
      </div>

      <p className="mt-1.5 max-w-[560px] text-[13.5px] leading-relaxed text-ink-soft">
        {opportunity.subtitle}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {opportunity.badges.map((badge) => (
          <span
            key={badge}
            className="rounded-full border border-line/70 px-3 py-1 text-[12px] text-ink-soft"
          >
            {badge}
          </span>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)_240px]">
        {/* why / clarify */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green" strokeWidth={1.75} />
              <span className="text-[13.5px] font-semibold text-ink">
                Why this opportunity appeared
              </span>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
              You chose <span className="font-semibold text-ink">{opportunity.whyAppeared.chosen}</span>.{" "}
              {opportunity.whyAppeared.body}
            </p>
          </div>

          <div className="border-t border-line/70 pt-5">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green" strokeWidth={1.75} />
              <span className="text-[13.5px] font-semibold text-ink">
                What this may clarify
              </span>
            </div>
            <ul className="mt-2 flex flex-col gap-2">
              {opportunity.mayClarify.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[12.5px] text-ink-soft">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green" strokeWidth={1.75} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* hero image + location */}
        <div className="shadow-card overflow-hidden rounded-2xl border border-line/70">
          <div className="relative h-[280px] w-full">
            <Image
              src="/images/cooking-class-hero.jpg"
              alt="A group of friends preparing a plant-based meal together"
              fill
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 bg-cream-card px-4 py-3">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-faint" />
              <span>
                <span className="block text-[12.5px] font-semibold text-ink">
                  {opportunity.location.name}
                </span>
                <span className="block text-[11.5px] text-ink-faint">
                  {opportunity.location.address}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-right">
              <span>
                <span className="block text-[11px] text-ink-faint">Hosted by</span>
                <span className="block text-[12px] font-medium text-ink">
                  {opportunity.location.hostedBy}
                </span>
              </span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-soft">
                <Leaf className="h-3.5 w-3.5 text-green" strokeWidth={1.75} />
              </span>
            </div>
          </div>
        </div>

        {/* effort / open next / tradeoffs */}
        <div className="shadow-card flex flex-col gap-5 rounded-2xl border border-line/70 bg-cream-field/40 px-4 py-4">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green" strokeWidth={1.75} />
              <span className="text-[13px] font-semibold text-ink">Effort level</span>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <div className="relative h-1.5 flex-1 rounded-full bg-gradient-to-r from-[#c17f2a] via-line to-line">
                <span className="absolute left-[18%] top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cream-card bg-green" />
              </div>
              <span className="text-[12px] font-medium text-ink-soft">
                {opportunity.effort.level}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] text-ink-faint">{opportunity.effort.duration}</p>
          </div>

          <div className="border-t border-line/70 pt-4">
            <div className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-[#c17f2a]" strokeWidth={1.75} />
              <span className="text-[13px] font-semibold text-ink">
                What this may open next
              </span>
            </div>
            <ul className="mt-2 flex flex-col gap-1.5">
              {opportunity.mayOpenNext.map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-[12px] text-ink-soft">
                  <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-ink-faint" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-line/70 pt-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green" strokeWidth={1.75} />
              <span className="text-[13px] font-semibold text-ink">
                Tradeoffs to consider
              </span>
            </div>
            <ul className="mt-2 flex flex-col gap-1.5">
              {opportunity.tradeoffs.map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-[12px] text-ink-soft">
                  <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-ink-faint" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* trust / notes / related */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="shadow-card rounded-2xl border border-line/70 px-4 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green" strokeWidth={1.75} />
            <span className="text-[13px] font-semibold text-ink">Trust &amp; source</span>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[12px] text-ink-faint">High trust</span>
            <span className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${
                    i < opportunity.trust.level ? "bg-green" : "bg-line"
                  }`}
                />
              ))}
            </span>
          </div>
          <p className="mt-2 text-[12px] text-ink-faint">
            Source: <span className="text-ink">{opportunity.trust.source}</span>
            <br />
            Verified by {opportunity.trust.verifiedBy} members
          </p>
          <p className="mt-2 flex items-center gap-1 text-[11px] text-ink-faint">
            Last confirmed: {opportunity.trust.lastConfirmed}
            <Info className="h-3 w-3" />
          </p>
        </div>

        <div className="shadow-card rounded-2xl border border-line/70 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-green" strokeWidth={1.75} />
              <span className="text-[13px] font-semibold text-ink">Real notes from people</span>
            </div>
            <button className="text-[11.5px] font-medium text-ink-soft transition hover:text-ink">
              View all ({opportunity.notesTotal})
            </button>
          </div>
          <p className="mt-3 text-[12.5px] italic leading-relaxed text-ink">
            &ldquo;{note.quote}&rdquo;
          </p>
          <p className="mt-2 text-[12px] text-ink-faint">— {note.author}</p>
          <div className="mt-3 flex gap-1.5">
            {opportunity.notes.map((_, i) => (
              <button
                key={i}
                onClick={() => setNoteIndex(i)}
                aria-label={`Show note ${i + 1}`}
                className={`h-1.5 w-1.5 rounded-full transition ${
                  i === noteIndex ? "bg-green" : "bg-line"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="shadow-card rounded-2xl border border-line/70 px-4 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-green" strokeWidth={1.75} />
            <span className="text-[13px] font-semibold text-ink">Related openings</span>
          </div>
          <ul className="mt-2.5 flex flex-col gap-2.5">
            {opportunity.relatedOpenings.map((item) => (
              <li key={item.title} className="flex items-center justify-between gap-2">
                <span className="text-[12.5px] text-ink">{item.title}</span>
                <span
                  className={`shrink-0 text-[11.5px] font-medium ${
                    item.effort === "Low" ? "text-green" : "text-[#c17f2a]"
                  }`}
                >
                  {item.effort} effort
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => setTaken(true)}
          disabled={taken}
          className="shadow-sm flex items-center justify-center gap-2 rounded-full bg-green px-6 py-3 text-[13.5px] font-medium text-cream transition hover:bg-green-dark disabled:opacity-70"
        >
          {taken ? (
            <>
              Added to your journey
              <CheckCircle2 className="h-4 w-4" />
            </>
          ) : (
            <>
              Take this opportunity
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
        <button
          onClick={() => setSaved((s) => !s)}
          className="flex items-center justify-center gap-2 rounded-full border border-line/70 px-6 py-3 text-[13.5px] font-medium text-ink transition hover:border-ink-faint/40"
        >
          {saved ? "Saved" : "Save for later"}
          <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-ink text-ink" : ""}`} />
        </button>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-faint">
        <Lock className="h-3 w-3" />
        We&rsquo;ll add this to your journey and help you take the next step.
      </p>
    </div>
  );
}
