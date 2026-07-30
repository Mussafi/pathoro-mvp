/**
 * A second, independent axis from PathoroFit (lib/scoutFit.ts). PathoroFit
 * asks "is this even a specific, actionable page" — a real event page vs.
 * a generic listicle. This asks a different question: "given the exact
 * goal the user typed, is this candidate a direct step toward it, or just
 * in the same general neighborhood?" A candidate can be a perfectly
 * specific, actionable page (high PathoroFit) while still being the wrong
 * thing for this goal — e.g. "Nursing Student Volunteer Austin TX" for a
 * licensed-therapist goal: a real, bookable opportunity, just not a
 * licensure step. See "Fix opportunity action landing and submission"
 * PART 5/6 — kept out of lib/tavily.ts (server-only) so client components
 * can also compute/display it without pulling that module into the
 * client bundle, same reasoning as scoutFit.ts.
 */
export type GoalFitLevel = "direct" | "related" | "adjacent" | "weak";

export const GOAL_FIT_LABELS: Record<GoalFitLevel, string> = {
  direct: "Direct access point",
  related: "Related access point",
  adjacent: "Adjacent opportunity",
  weak: "Weak match",
};

/** Higher first — used both to rank candidates and to order badge tiers. */
export const GOAL_FIT_RANK: Record<GoalFitLevel, number> = {
  direct: 3,
  related: 2,
  adjacent: 1,
  weak: 0,
};

export const GOAL_FIT_COPY: Record<GoalFitLevel, string> = {
  direct: "This looks like a direct step toward this specific goal.",
  related: "Connected to this goal — worth checking that it's the specific step you need.",
  adjacent: "This may build exposure, but it isn't a direct step toward this specific goal.",
  weak: "Pathoro isn't confident this is a close match for this goal.",
};

export const GOAL_FIT_BADGE_CLASS: Record<GoalFitLevel, string> = {
  direct: "border border-green/40 bg-green-soft/70 text-green",
  related: "border border-line/70 bg-cream-card text-ink-soft",
  adjacent: "border border-amber-400/40 bg-amber-400/10 text-amber-700",
  weak: "border border-line/60 bg-cream-card text-ink-faint",
};

type CuratedGoalFit = { goalKeywords: string[]; direct: string[]; adjacent: string[] };

/**
 * Curated direct-vs-adjacent keyword sets for the goals this app treats
 * as first-class demo/example paths (the same set FORCED_SEED_MATCHERS
 * in lib/bestNextRouteMatch.ts covers) — hand-picked because a generic
 * keyword-overlap heuristic alone can't tell "counseling program open
 * house" (direct) from "nursing student volunteer" (adjacent: healthcare,
 * but not a therapy-licensure step) for a goal like "licensed therapist".
 * Any goal not matched here falls through to the generic heuristic below.
 */
const CURATED_GOAL_FIT: CuratedGoalFit[] = [
  {
    goalKeywords: ["therapist", "licensed therapist", "counseling", "counselor", "mental health", "therapy"],
    // Deliberately no bare "therapist"/"therapy"/"licensure" here — those
    // words alone are shared with physical/occupational/speech therapy
    // and countless other licensed professions, which is exactly the
    // kind of false "direct" match this feature exists to avoid.
    direct: [
      "mental health therap",
      "psychotherap",
      "counseling",
      "counselor",
      "lpc",
      "lcsw",
      "lmft",
      " mft",
      "clinical mental health",
      "therapist licensure",
      "therapy licensure",
      "counseling licensure",
      "counseling program",
      "counseling graduate",
    ],
    adjacent: [
      "nursing",
      "nurse",
      "medical volunteer",
      "hospital volunteer",
      "social work",
      "physical therap",
      "occupational therap",
      "speech therap",
      "respiratory therap",
      "massage therap",
      "health professions",
    ],
  },
  {
    goalKeywords: ["hvac"],
    direct: ["hvac", "heating", "cooling", "apprenticeship", "trade school"],
    adjacent: ["electrician", "plumb", "general contractor", "construction"],
  },
  {
    goalKeywords: ["electrician", "electrical"],
    direct: [
      "electrician",
      "electrical apprentice",
      "electrician apprentice",
      "apprenticeship",
      "pre-apprenticeship",
      "ibew",
      "electrical helper",
      "electrical trade school",
    ],
    adjacent: ["plumb", "hvac", "general contractor", "construction", "handyman"],
  },
  {
    goalKeywords: ["wedding photographer", "photographer", "photography"],
    direct: ["wedding photo", "photographer", "photography", "second shooter"],
    adjacent: ["videograph", "event planning", "florist", "wedding venue", "wedding planner"],
  },
  {
    goalKeywords: ["vegetarian", "plant-based", "plant based", "vegan", "cooking"],
    direct: ["vegetarian", "vegan", "plant-based", "plant based", "cooking class"],
    adjacent: ["nutrition", "farmers market", "general cooking"],
  },
];

const STOPWORDS = new Set(["become", "the", "and", "with", "your", "this", "that", "path", "goal"]);

function candidateText(candidate: {
  title: string;
  snippet?: string;
  opportunityType?: string;
  category?: string;
}): string {
  return `${candidate.title} ${candidate.snippet ?? ""} ${candidate.opportunityType ?? ""} ${candidate.category ?? ""}`.toLowerCase();
}

/**
 * Classifies one candidate's fit to a specific goal string. Curated
 * goals use their hand-picked direct/adjacent keyword lists; anything
 * else falls back to counting how many of the goal's own significant
 * words show up in the candidate's text.
 */
export function computeGoalFit(
  candidate: { title: string; snippet?: string; opportunityType?: string; category?: string; pathoroFit?: string },
  goal: string
): GoalFitLevel {
  const g = goal.toLowerCase();
  const text = candidateText(candidate);
  const curated = CURATED_GOAL_FIT.find((c) => c.goalKeywords.some((k) => g.includes(k)));

  if (curated) {
    if (curated.direct.some((k) => text.includes(k))) return "direct";
    if (curated.adjacent.some((k) => text.includes(k))) return "adjacent";
  }

  if (candidate.pathoroFit === "weak_informational") return "weak";

  const goalWords = g.split(/[^a-z]+/).filter((w) => w.length >= 4 && !STOPWORDS.has(w));
  if (goalWords.length === 0) return "related";
  const hits = goalWords.filter((w) => text.includes(w)).length;
  if (hits === 0) return "weak";
  if (hits >= goalWords.length) return "direct";
  return "related";
}
