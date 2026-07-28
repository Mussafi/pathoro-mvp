import type { TrailMapGoalId } from "@/lib/trailMapData";

export type GoalSpecificity = "broad" | "concentrated";

/**
 * Goals naming a specific role, credential, or niche — these are clear
 * enough to map as an actual journey (milestones, requirements,
 * tradeoffs), not just point toward a route type. Checked before
 * BROAD_PATTERNS since a concentrated goal can still contain a broad-ish
 * word (e.g. "start a small business" isn't vague the way "make more
 * money" is).
 */
const CONCENTRATED_PATTERNS =
  /\b(therapist|counselor|counsellor|therapy|school administrator|principal|education administrator|administrator|nurse|registered nurse|\brn\b|nursing|lawyer|attorney|law school|legal career|doctor|physician|medical school|med school|software engineer|mechanical engineer|civil engineer|electrical engineer|robotics engineer|engineer|real estate investor|real estate agent|resale|resell(?:ing|er)?|ebay|flea market|arbitrage|thrift|import[\s/-]?export|sourcing|vegetarian|vegan|plant[\s-]?based|small business|robotics|technician|electrician|plumber|accountant|paralegal|social worker|physician assistant|nurse practitioner|dental hygienist|real estate)\b/i;

/** Broad, early-stage goals — still finding direction, best served by the
 * Orientation Map's "which route do I need?" framing. */
const BROAD_PATTERNS =
  /\b(build wealth|get healthier|healthier|find community|find opportunit(?:y|ies)|change my life|make more money|feel less stuck|be happier|get unstuck|figure (?:things|it) out|improve my life|find (?:my )?purpose|be(?:come)? successful|get in shape|better life)\b/i;

/** Simple keyword-based classifier — see docs/MVP-LOCKED-PRINCIPLES.md's
 * "the longer someone is in the forest, the more detailed a map they
 * need." A concentrated match wins over a broad one if a goal happens to
 * contain both. */
export function classifyGoalSpecificity(goalText: string): GoalSpecificity {
  if (CONCENTRATED_PATTERNS.test(goalText)) return "concentrated";
  if (BROAD_PATTERNS.test(goalText)) return "broad";
  return "broad";
}

/** Maps free-text user goals to one of the Trail Map's mock demo goals.
 * Returns null when nothing matches closely enough — callers should fall
 * back to a generic /trail-map link rather than guessing. */
export function mapGoalToTrailMapGoal(goalText: string): TrailMapGoalId | null {
  const text = goalText.toLowerCase();
  // "physical therapist assistant" etc. is a distinct, lower-barrier
  // support role, not the same path as becoming a licensed
  // therapist/counselor — let it fall through to the generator instead
  // of being swallowed by the curated therapist template.
  if (/therapist|counselor|counsellor|therapy/.test(text) && !/assistant/.test(text)) return "therapist";
  if (/vegetarian|vegan|plant[\s-]?based/.test(text)) return "vegetarian";
  if (/resale|resell|ebay|flea market|arbitrage|thrift|vendor market|build wealth through selling/.test(text)) {
    return "resale";
  }
  if (/nurse|registered nurse|\brn\b|nursing/.test(text)) return "nurse";
  if (/lawyer|attorney|law school|legal career/.test(text)) return "lawyer";
  if (/doctor|physician|medical school|med school/.test(text)) return "doctor";
  if (
    /software engineer|mechanical engineer|electrical engineer|civil engineer|robotics engineer|engineer|engineering/.test(
      text
    )
  ) {
    return "engineer";
  }
  if (/school administrator|principal|education administrator/.test(text)) return "school-admin";
  if (/plumber|plumbing/.test(text)) return "plumber";
  if (/electrician|electrical apprentice|electrical trade/.test(text)) return "electrician";
  return null;
}

/** Answers to "what would make this more reachable?" that signal the user
 * wants an actual structured, step-by-step journey rather than a single
 * suggested route — a second, independent trigger for recommending the
 * Trail Map alongside goal specificity. */
const STRUCTURED_PATH_ANSWERS =
  /breakdown of requirements|map what i need|requirements|step-by-step path/i;

export function wantsStructuredPath(reachableAnswer: string): boolean {
  return STRUCTURED_PATH_ANSWERS.test(reachableAnswer);
}

/** Combines both triggers from the v0.20 task: goal specificity OR an
 * explicit ask for a requirements-style breakdown. */
export function shouldRecommendTrailMap(goalText: string, reachableAnswer: string): boolean {
  return classifyGoalSpecificity(goalText) === "concentrated" || wantsStructuredPath(reachableAnswer);
}
