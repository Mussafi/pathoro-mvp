/** Centralized scoring for Trail Map branches. Every branch stores raw
 * 0-5 factor inputs (see BranchFactors); everything the UI displays —
 * AI replacement risk, demand, income, autonomy, cost, etc. — is computed
 * from those inputs here rather than hand-typed per branch. This is a
 * transparent Pathoro heuristic for prototype purposes, not official
 * labor-market or licensing data.
 *
 * AI risk naming: the underlying score answers "how automatable/
 * replaceable does this path look" (higher = riskier). The sidebar shows
 * that directly as "AI replacement risk" (Very Low = good). The
 * comparison-card dot strip shows the same score inverted as "AI
 * resilience" so more dots always reads as more favorable — a 5-dot row
 * labeled "AI exposure" previously read as "highly exposed," which is
 * backwards from what a low-risk score is meant to communicate. */

export type BranchFactors = {
  /** How much of the work is routine, repeatable cognitive tasks. */
  routineCognitiveWork: number;
  /** How well existing AI/automation tools already fit this work. */
  automationToolFit: number;
  /** How much of the work can be done remotely, digital-only. */
  remoteDigitalWork: number;
  /** How much clients/patients/employers need to trust a human specifically. */
  humanTrustNeed: number;
  /** How much licensing/regulation gates entry to this work. */
  regulationBarrier: number;
  /** How much the work requires being physically present. */
  physicalPresenceNeed: number;
  /** How much the work depends on human emotional/ethical judgment calls. */
  emotionalJudgmentNeed: number;
  /** Overall market demand for this path. */
  marketDemand: number;
  /** Ceiling on income potential once experienced. */
  incomeUpside: number;
  /** How much independence/control the path allows. */
  autonomyPotential: number;
  /** Upfront cost in money/time to get started. */
  upfrontCost: number;
  /** How long it takes to reach a working credential. */
  timeToCredential: number;
  /** Emotional demands of the day-to-day work. */
  emotionalLoad: number;
  /** How much the path depends on / builds relationship capital. */
  relationshipLeverage: number;
  /** How much this path opens doors to other opportunities. */
  opportunityLeverage: number;
};

export type ScoreLabel = "Very Low" | "Low" | "Medium" | "High" | "Very High";

export type ScoreDimension =
  | "aiRisk"
  | "demand"
  | "incomePotential"
  | "autonomy"
  | "costFriction"
  | "emotionalIntensity"
  | "timeFriction"
  | "relationshipLeverage"
  | "opportunityLeverage";

export type TrailMapComputedScores = {
  /** Higher = more automatable/replaceable. Display as "AI replacement
   * risk" (direct) in the sidebar, or invert via getScoreFillCount for
   * the "AI resilience" comparison-card dots. */
  aiRiskScore: number;
  aiRiskLabel: ScoreLabel;
  demandScore: number;
  demandLabel: ScoreLabel;
  incomePotentialScore: number;
  incomePotentialLabel: ScoreLabel;
  autonomyScore: number;
  autonomyLabel: ScoreLabel;
  costFrictionScore: number;
  costFrictionLabel: ScoreLabel;
  emotionalIntensityScore: number;
  emotionalIntensityLabel: ScoreLabel;
  timeFrictionScore: number;
  timeFrictionLabel: ScoreLabel;
  relationshipLeverageScore: number;
  relationshipLeverageLabel: ScoreLabel;
  opportunityLeverageScore: number;
  opportunityLeverageLabel: ScoreLabel;
  /** Directly from physicalPresenceNeed — how hands-on/physically demanding
   * the day-to-day work is. Not favorable/unfavorable either way (unlike
   * the reversed dimensions), so it's shown as a plain profile fact. */
  physicalIntensityScore: number;
  physicalIntensityLabel: ScoreLabel;
};

export const SCORING_DISCLAIMER =
  "These scores are Pathoro estimates for comparison, not official labor-market or licensing data.";

export const AI_RESILIENCE_EXPLANATION =
  "AI resilience reflects how protected this path appears from automation based on human trust, licensure, physical presence, judgment, and relationship-heavy work.";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

/** 0-5 factor input -> 0-1 fraction. */
function frac(v: number): number {
  return v / 5;
}

/** 0-5 factor input -> 0-100 score, linear. */
function scale(v: number): number {
  return clamp((v / 5) * 100);
}

export function scoreToLabel(score: number): ScoreLabel {
  if (score < 20) return "Very Low";
  if (score < 40) return "Low";
  if (score < 60) return "Medium";
  if (score < 80) return "High";
  return "Very High";
}

/** AI replacement risk heuristic — the only multi-factor formula here.
 * Trust, regulation, physical presence, and emotional judgment lower
 * risk; routine cognitive work, automation-tool fit, and remote/
 * digital-only work raise it. Weighted around a neutral midpoint of 50
 * so a branch with all-medium factors lands near "Medium". */
export function computeAiRiskScore(f: BranchFactors): number {
  const raw =
    frac(f.routineCognitiveWork) * 25 +
    frac(f.automationToolFit) * 25 +
    frac(f.remoteDigitalWork) * 15 -
    frac(f.humanTrustNeed) * 20 -
    frac(f.regulationBarrier) * 15 -
    frac(f.physicalPresenceNeed) * 15 -
    frac(f.emotionalJudgmentNeed) * 10;
  return clamp(50 + raw);
}

export function computeBranchScores(f: BranchFactors): TrailMapComputedScores {
  const aiRiskScore = computeAiRiskScore(f);
  const demandScore = scale(f.marketDemand);
  const incomePotentialScore = scale(f.incomeUpside);
  const autonomyScore = scale(f.autonomyPotential);
  const costFrictionScore = scale(f.upfrontCost);
  const emotionalIntensityScore = scale(f.emotionalLoad);
  const timeFrictionScore = scale(f.timeToCredential);
  const relationshipLeverageScore = scale(f.relationshipLeverage);
  const opportunityLeverageScore = scale(f.opportunityLeverage);
  const physicalIntensityScore = scale(f.physicalPresenceNeed);

  return {
    aiRiskScore,
    aiRiskLabel: scoreToLabel(aiRiskScore),
    demandScore,
    demandLabel: scoreToLabel(demandScore),
    incomePotentialScore,
    incomePotentialLabel: scoreToLabel(incomePotentialScore),
    autonomyScore,
    autonomyLabel: scoreToLabel(autonomyScore),
    costFrictionScore,
    costFrictionLabel: scoreToLabel(costFrictionScore),
    emotionalIntensityScore,
    emotionalIntensityLabel: scoreToLabel(emotionalIntensityScore),
    timeFrictionScore,
    timeFrictionLabel: scoreToLabel(timeFrictionScore),
    relationshipLeverageScore,
    relationshipLeverageLabel: scoreToLabel(relationshipLeverageScore),
    opportunityLeverageScore,
    opportunityLeverageLabel: scoreToLabel(opportunityLeverageScore),
    physicalIntensityScore,
    physicalIntensityLabel: scoreToLabel(physicalIntensityScore),
  };
}

/** Dimensions where a LOWER score is more favorable (e.g. less AI
 * replacement risk, less cost friction). Everything else favors higher. */
const REVERSED_DIMENSIONS: ScoreDimension[] = [
  "aiRisk",
  "costFriction",
  "emotionalIntensity",
  "timeFriction",
];

export function isFavorableScore(dimension: ScoreDimension, score: number): boolean {
  const reversed = REVERSED_DIMENSIONS.includes(dimension);
  return reversed ? score < 40 : score >= 60;
}

const LABEL_ORDER: ScoreLabel[] = ["Very Low", "Low", "Medium", "High", "Very High"];

/** 1-5 fill count for a dot-strip, oriented so a higher fill always means
 * "more favorable" for that dimension. */
export function getScoreFillCount(dimension: ScoreDimension, label: ScoreLabel): number {
  const index = LABEL_ORDER.indexOf(label);
  if (index === -1) return 0;
  const reversed = REVERSED_DIMENSIONS.includes(dimension);
  return reversed ? LABEL_ORDER.length - index : index + 1;
}

/** Short, transparent "why" explanations for the sidebar's info affordance.
 * Built from whichever input factors actually drove the score, not a
 * fixed script, so the explanation stays honest per branch. */
export function getAiRiskWhy(f: BranchFactors): string {
  const lowering: string[] = [];
  const raising: string[] = [];
  if (f.humanTrustNeed >= 4) lowering.push("high human trust");
  if (f.regulationBarrier >= 4) lowering.push("licensing or regulation");
  if (f.physicalPresenceNeed >= 4) lowering.push("in-person, hands-on work");
  if (f.emotionalJudgmentNeed >= 4) lowering.push("emotional judgment calls");
  if (f.routineCognitiveWork >= 3) raising.push("routine cognitive work");
  if (f.automationToolFit >= 3) raising.push("a strong fit for existing automation tools");
  if (f.remoteDigitalWork >= 3) raising.push("remote, digital-only work");

  if (lowering.length === 0 && raising.length === 0) {
    return "A mix of routine and judgment-based work keeps this near the middle.";
  }
  const parts: string[] = [];
  if (lowering.length > 0) {
    parts.push(
      `${lowering.join(" and ")} lower${lowering.length === 1 ? "s" : ""} replacement risk`
    );
  }
  if (raising.length > 0) {
    parts.push(`${raising.join(" and ")} raise${raising.length === 1 ? "s" : ""} it`);
  }
  return parts.join(", while ") + ".";
}

export function getDemandWhy(f: BranchFactors): string {
  if (f.marketDemand >= 4) return "Consistently strong hiring need across most regions.";
  if (f.marketDemand >= 3) return "Steady need, though it can vary by region and employer.";
  return "Narrower or more localized demand than most paths here.";
}

export function getIncomeWhy(f: BranchFactors): string {
  if (f.incomeUpside >= 4) return "Strong ceiling once experienced, though it takes time to reach.";
  if (f.incomeUpside >= 3) return "Solid, middle-of-the-road earning potential.";
  return "Modest ceiling compared to other paths here.";
}

export function getCostWhy(f: BranchFactors): string {
  if (f.upfrontCost >= 4) return "Significant upfront investment in credentials, tools, or setup.";
  if (f.upfrontCost >= 2) return "Some real upfront cost, but manageable relative to other paths.";
  return "Low barrier to entry — little upfront investment required.";
}
