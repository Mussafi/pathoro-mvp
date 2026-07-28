"use client";

import { useState } from "react";
import {
  ArrowRight,
  Brain,
  Clock,
  Compass,
  DollarSign,
  Dumbbell,
  GraduationCap,
  HelpCircle,
  Info,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import type { TrailMapBranch } from "@/lib/trailMapData";
import {
  AI_RESILIENCE_EXPLANATION,
  computeBranchScores,
  getAiRiskWhy,
  getCostWhy,
  getDemandWhy,
  getIncomeWhy,
  isFavorableScore,
  SCORING_DISCLAIMER,
  type ScoreDimension,
} from "@/lib/trailMapScoring";

const FIT_BADGE_CLASS: Record<TrailMapBranch["fit"], string> = {
  "High match": "border-green bg-green/15 text-green shadow-[0_0_0_3px_rgba(84,120,32,0.12)]",
  "Worth exploring": "border-line/70 bg-cream-field text-ink-soft",
  Consider: "border-line/70 bg-cream-field text-ink-faint",
  "Broader stretch": "border-line/70 bg-cream-field text-ink-faint",
};

function scoreClass(dimension: ScoreDimension, score: number): string {
  return isFavorableScore(dimension, score) ? "text-green font-semibold" : "text-ink-soft";
}

export function TrailMapDetailSidebar({ branch }: { branch: TrailMapBranch }) {
  const { factors, branchFactors } = branch;
  const scores = computeBranchScores(branchFactors);
  const [openWhy, setOpenWhy] = useState<ScoreDimension | null>(null);

  function toggleWhy(dimension: ScoreDimension) {
    setOpenWhy((current) => (current === dimension ? null : dimension));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="shadow-card flex flex-col rounded-[26px] border border-line/70 bg-cream-card px-5 py-5">
        <div className="flex items-start justify-between gap-2">
          <span className="font-serif text-[18px] leading-tight text-ink">{branch.title}</span>
        </div>
        <span
          className={`mt-2 flex w-fit items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold ${FIT_BADGE_CLASS[branch.fit]}`}
        >
          {branch.fit === "High match" && <Sparkles className="h-3 w-3" strokeWidth={2} />}
          {branch.fit}
        </span>
        <p className="mt-3 text-[12px] leading-relaxed text-ink-soft">{branch.whyItFits}</p>

        <div className="mt-4 flex flex-col gap-2.5 border-t border-line/70 pt-4">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            <Info className="h-3 w-3" strokeWidth={2} />
            Journey profile
          </span>
          <ProfileRow icon={Clock} label="Typical time" value={factors.typicalTime} />
          <ProfileRow icon={GraduationCap} label="Education" value={factors.education} />
          <ScoreRow
            icon={DollarSign}
            label="Cost / friction"
            dimension="costFriction"
            scoreLabel={scores.costFrictionLabel}
            score={scores.costFrictionScore}
            why={getCostWhy(branchFactors)}
            isOpen={openWhy === "costFriction"}
            onToggle={() => toggleWhy("costFriction")}
          />
          <ScoreRow
            icon={TrendingUp}
            label="Income potential"
            dimension="incomePotential"
            scoreLabel={scores.incomePotentialLabel}
            score={scores.incomePotentialScore}
            why={getIncomeWhy(branchFactors)}
            isOpen={openWhy === "incomePotential"}
            onToggle={() => toggleWhy("incomePotential")}
          />
          <ProfileRow icon={Compass} label="Autonomy" value={scores.autonomyLabel} />
          <ProfileRow icon={Dumbbell} label="Physical intensity" value={scores.physicalIntensityLabel} />
          <ProfileRow icon={Brain} label="Emotional intensity" value={scores.emotionalIntensityLabel} />
          <ScoreRow
            icon={Info}
            label="AI replacement risk"
            dimension="aiRisk"
            scoreLabel={scores.aiRiskLabel}
            score={scores.aiRiskScore}
            why={getAiRiskWhy(branchFactors)}
            isOpen={openWhy === "aiRisk"}
            onToggle={() => toggleWhy("aiRisk")}
          />
          <ScoreRow
            icon={Users}
            label="Demand"
            dimension="demand"
            scoreLabel={scores.demandLabel}
            score={scores.demandScore}
            why={getDemandWhy(branchFactors)}
            isOpen={openWhy === "demand"}
            onToggle={() => toggleWhy("demand")}
          />
        </div>

        <div className="mt-4 flex flex-col gap-1.5 rounded-xl border border-line/70 bg-cream-field px-3 py-2.5 text-[10.5px] leading-relaxed text-ink-faint">
          <p>
            Requirements vary by state, institution, and employer. Pathoro
            should verify details from official sources before treating this
            as guidance.
          </p>
          <p>{SCORING_DISCLAIMER}</p>
          <p>{AI_RESILIENCE_EXPLANATION}</p>
        </div>

        <div className="mt-4 border-t border-line/70 pt-4">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            Common tradeoffs
          </span>
          <ul className="mt-2 flex flex-col gap-1.5">
            {branch.tradeoffs.map((tradeoff) => (
              <li key={tradeoff} className="flex items-start gap-1.5 text-[11.5px] leading-snug text-ink-soft">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                {tradeoff}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 border-t border-line/70 pt-4">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            Next step
          </span>
          <button
            type="button"
            className="mt-2 flex w-full items-center justify-between gap-2 rounded-2xl border border-green/40 bg-green-soft/60 px-3.5 py-3 text-left transition hover:bg-green-soft"
          >
            <span>
              <span className="block text-[12.5px] font-semibold text-ink">
                {branch.nextStep.title}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-ink-soft">
                {branch.nextStep.description}
              </span>
            </span>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green text-cream">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-[12px]">
      <span className="flex items-center gap-1.5 text-ink-faint">
        <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        {label}
      </span>
      <span className={`text-right ${valueClassName ?? "text-ink"}`}>{value}</span>
    </div>
  );
}

/** Like ProfileRow, but for computed scores: adds a small "Why?" affordance
 * that reveals a one-line, factor-driven explanation on click — see
 * lib/trailMapScoring.ts's getXWhy helpers for how each is generated. */
function ScoreRow({
  icon: Icon,
  label,
  dimension,
  scoreLabel,
  score,
  why,
  isOpen,
  onToggle,
}: {
  icon: typeof Clock;
  label: string;
  dimension: ScoreDimension;
  scoreLabel: string;
  score: number;
  why: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2 text-[12px]">
        <span className="flex items-center gap-1.5 text-ink-faint">
          <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          {label}
        </span>
        <span className="flex items-center gap-1">
          <span className={`text-right ${scoreClass(dimension, score)}`}>{scoreLabel}</span>
          <button
            type="button"
            onClick={onToggle}
            aria-label={`Why is ${label.toLowerCase()} ${scoreLabel.toLowerCase()}?`}
            aria-expanded={isOpen}
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-ink-faint outline-none transition hover:text-ink-soft focus-visible:ring-2 focus-visible:ring-green/50"
          >
            <HelpCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </span>
      </div>
      {isOpen && (
        <p className="rounded-lg bg-cream-field px-2.5 py-1.5 text-[10.5px] leading-snug text-ink-faint">
          Why: {why}
        </p>
      )}
    </div>
  );
}
