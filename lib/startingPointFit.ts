import type { GoalFitLevel } from "@/lib/goalFitLabel";

/**
 * v0.39 "Rank opportunities by starting point fit": goal relevance
 * (lib/goalFitLabel.ts) answers "is this related to what the user
 * wants?" — this answers a different question: "is this reachable from
 * where the user actually is right now?" A volunteer electrician role
 * requiring 3 years of experience can be a perfectly direct goal match
 * and still be the wrong first opportunity for someone who's "curious
 * but unsure." Both axes are shown together, the same way PathoroFit and
 * GoalFit already are.
 */
export type ExperienceLevel = "new" | "some" | "advanced";

/**
 * Maps the *existing* onboarding "Where are you starting from?" answer
 * (lib/direction.ts's directionQuestions — never changed by this file)
 * to a coarse experience level. Free-text answers a user typed
 * themselves fall through to the keyword checks below; anything
 * unrecognized defaults to "new", since treating an unknown starting
 * point as inexperienced is the safer failure mode (it biases toward
 * beginner-friendly opportunities rather than risking a mismatch like
 * the one this feature exists to prevent).
 */
export function mapStartingFromToExperienceLevel(startingFrom: string): ExperienceLevel {
  const s = startingFrom.toLowerCase();

  if (
    /already moving|already training|already credentialed|ready to apply|has experience|some experience|building skills/.test(
      s
    )
  ) {
    return s.includes("already moving") || /already training|already credentialed|ready to apply|has experience/.test(s)
      ? "advanced"
      : "some";
  }
  if (/need a real opportunity/.test(s)) return "some";
  if (
    /curious but unsure|don.t know where to begin|tried before and stopped|need people around me|need structure|no experience|looking for first opportunity/.test(
      s
    )
  ) {
    return "new";
  }
  return "new";
}

export type PrerequisiteSignal = "beginner" | "requires_experience" | "neutral";

const EXPERIENCE_REQUIRED_PATTERN =
  /\b\d+\+?\s*(?:years?|yrs?)\s*(?:of\s*)?experience\b|licensed required|certification required|journeyman required|master electrician|must have experience|prior experience required|commercial experience required/i;

const BEGINNER_FRIENDLY_PATTERN =
  /\bno experience\b|\bbeginner\b|\bhelper\b|\bapprentice\b|\bapprenticeship\b|pre-apprenticeship|\binfo session\b|\bopen house\b|training program|career fair|\bshadow\b|\bintro\b|entry-level|paid training|\blearn\b|\borientation\b/i;

/**
 * Scans a candidate's title/snippet/source text for prerequisite
 * language — see "Fix opportunity action landing and submission" PART 3
 * for the exact keyword lists this implements. If both an "experience
 * required" and a "beginner-friendly" signal are present (e.g. an
 * apprenticeship listing that also mentions "prior experience a plus"),
 * the experience-required signal wins — it's the safer read, and
 * matches this feature's whole point: don't overclaim beginner-friendly.
 */
export function computePrerequisiteSignal(text: string): PrerequisiteSignal {
  if (EXPERIENCE_REQUIRED_PATTERN.test(text)) return "requires_experience";
  if (BEGINNER_FRIENDLY_PATTERN.test(text)) return "beginner";
  return "neutral";
}

export type StartingPointFit =
  | "good_first_step"
  | "beginner_friendly"
  | "requires_training_first"
  | "requires_experience"
  | "advanced_not_first_step"
  | "adjacent_exposure"
  | "poor_fit_from_start";

export const STARTING_POINT_FIT_LABELS: Record<StartingPointFit, string> = {
  good_first_step: "Good first step",
  beginner_friendly: "Beginner-friendly",
  requires_training_first: "Requires training first",
  requires_experience: "Requires experience",
  advanced_not_first_step: "Advanced / not first step",
  adjacent_exposure: "Adjacent exposure",
  poor_fit_from_start: "Poor fit from current start",
};

export const STARTING_POINT_FIT_BADGE_CLASS: Record<StartingPointFit, string> = {
  good_first_step: "border border-green/40 bg-green-soft/70 text-green",
  beginner_friendly: "border border-green/40 bg-green-soft/70 text-green",
  requires_training_first: "border border-line/70 bg-cream-card text-ink-soft",
  requires_experience: "border border-amber-400/40 bg-amber-400/10 text-amber-700",
  advanced_not_first_step: "border border-amber-400/40 bg-amber-400/10 text-amber-700",
  adjacent_exposure: "border border-line/70 bg-cream-card text-ink-soft",
  poor_fit_from_start: "border border-red-400/40 bg-red-400/10 text-red-700",
};

/** Higher first — used to rank candidates so a reachable opportunity
 * beats an advanced one even when both are otherwise strong matches. */
export const STARTING_POINT_FIT_RANK: Record<StartingPointFit, number> = {
  good_first_step: 4,
  beginner_friendly: 3,
  requires_training_first: 2,
  requires_experience: 1,
  adjacent_exposure: 1,
  advanced_not_first_step: 0,
  poor_fit_from_start: -1,
};

/** True for the two labels that mean "don't lead with this as the
 * primary CTA for this user" — see BestNextRouteCard's warning branch. */
export function isPrerequisiteMismatch(fit: StartingPointFit): boolean {
  return fit === "advanced_not_first_step" || fit === "poor_fit_from_start";
}

/**
 * Combines the prerequisite signal found in a candidate's own text with
 * how experienced the user says they are, and how relevant the
 * candidate is to the goal in the first place (lib/goalFitLabel.ts).
 */
export function computeStartingPointFit(
  prerequisiteSignal: PrerequisiteSignal,
  experienceLevel: ExperienceLevel,
  goalFit: GoalFitLevel
): StartingPointFit {
  const weakGoalFit = goalFit === "adjacent" || goalFit === "weak";

  if (experienceLevel === "new" && prerequisiteSignal === "requires_experience") {
    return weakGoalFit ? "poor_fit_from_start" : "advanced_not_first_step";
  }
  if (weakGoalFit) return "adjacent_exposure";
  if (prerequisiteSignal === "beginner") {
    return goalFit === "direct" && experienceLevel === "new" ? "good_first_step" : "beginner_friendly";
  }
  if (prerequisiteSignal === "requires_experience") {
    return experienceLevel === "advanced" && goalFit === "direct" ? "good_first_step" : "requires_experience";
  }
  return "requires_training_first";
}

/**
 * PART 8 — a short, human sentence explaining the fit label, for
 * candidate cards. Distinct from the label itself so the label can stay
 * scannable (a badge) while this carries the actual evidence.
 */
export function getStartingPointFitReason(fit: StartingPointFit, prerequisiteSignal: PrerequisiteSignal): string {
  switch (fit) {
    case "good_first_step":
      return "Good first step — does not appear to require prior experience.";
    case "beginner_friendly":
      return "Beginner-friendly — apprenticeship/info session language.";
    case "requires_training_first":
      return "Unclear prerequisites — worth verifying what this actually requires before relying on it.";
    case "requires_experience":
      return prerequisiteSignal === "requires_experience"
        ? "Requires experience — source mentions prior experience or a license."
        : "May expect some background already — worth double-checking before you commit.";
    case "advanced_not_first_step":
      return "Related, but may be advanced — source mentions required experience or credentials.";
    case "adjacent_exposure":
      return "Adjacent exposure — useful for learning, but not a direct step toward this specific goal.";
    case "poor_fit_from_start":
      return "This may be too advanced from your current starting point, and isn't a close goal match either.";
  }
}
