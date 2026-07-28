/**
 * Pure copy-generation helpers shared by the admin review UI, route-planning
 * cards, and the opportunity detail page. Every string here is computed from
 * fields that already exist on Opportunity/IngestionDraft — no new schema.
 *
 * The point: Pathoro isn't saving events, it's saving real-world access
 * points along a path. These functions turn the same underlying fields into
 * that framing everywhere an opportunity is shown.
 */

export type NarrativeInput = {
  title: string;
  description: string;
  whoItIsFor: string;
  pathItSupports: string;
  whatItMayOpenNext: string;
  opportunityType: string;
  hostName: string;
  locationLabel: string;
  dateLabel: string;
  costLabel: string;
  sourceUrl: string | null;
};

/** The goal text to carry into /route-planning or /trail-map from an
 * opportunity page (v0.34 "View full route" / "View Trail Map" CTAs) —
 * pathItSupports is already exactly this ("Become vegetarian", "Become
 * an HVAC technician", ...) for every opportunity; title is the only
 * sane fallback for a record missing it. */
export function getRelatedGoalText(input: Pick<NarrativeInput, "pathItSupports" | "title">): string {
  return input.pathItSupports.trim() || input.title.trim();
}

/** Why this opportunity surfaced for this person, on this route. */
export function getWhyThisAppeared(input: NarrativeInput): string {
  const { pathItSupports, whoItIsFor } = input;
  if (pathItSupports && whoItIsFor) {
    return `It supports ${pathItSupports.toLowerCase()} — and it's built for ${whoItIsFor.toLowerCase()}.`;
  }
  if (pathItSupports) {
    return `It supports ${pathItSupports.toLowerCase()}.`;
  }
  if (whoItIsFor) {
    return `It's for ${whoItIsFor.toLowerCase()}.`;
  }
  return "It's a path-supporting opportunity for your selected route.";
}

/** What real-world access this opportunity concretely creates. */
export function getWhatAccessThisCreates(input: NarrativeInput): string {
  const { opportunityType, hostName, locationLabel, description } = input;
  const parts: string[] = [];
  if (opportunityType) parts.push(opportunityType);
  if (hostName) parts.push(`with ${hostName}`);
  if (locationLabel) parts.push(`in ${locationLabel}`);
  if (parts.length > 0) {
    return `A real-world access point: ${parts.join(" ")}.`;
  }
  return description || "A real-world access point along this route.";
}

/** The concrete next action someone would take to use this opportunity. */
export function getNextActionSummary(input: NarrativeInput): string {
  const { dateLabel, costLabel, sourceUrl } = input;
  const bits = [dateLabel, costLabel].filter(Boolean);
  if (bits.length > 0) {
    return `Show up: ${bits.join(" · ")}.`;
  }
  if (sourceUrl) {
    return "Open the original source to take the next step.";
  }
  return "Reach out to take the next step.";
}

/**
 * A short label for "Your next steps" step 1, derived from
 * opportunityType — not hardcoded per opportunity id, so it reads right
 * for any opportunity of that type rather than only the three named
 * examples (v0.35 Part 4). Falls through to a generic label for any
 * type this doesn't recognize.
 */
export function getImmediateStepLabel(input: Pick<NarrativeInput, "opportunityType">): string {
  const type = input.opportunityType.toLowerCase();
  if (type.includes("info session")) return "Check info session details";
  if (type.includes("assistant") || type.includes("role")) return "Review assistant opportunity";
  if (type.includes("class") || type.includes("opening")) return "View class options";
  if (type.includes("group") || type.includes("community")) return "View group details";
  if (type.includes("person") || type.includes("conversation")) return "Learn more about this connection";
  if (type.includes("planning") || type.includes("requirement")) return "Review requirements";
  if (type.includes("trial")) return "Preview this trial";
  return "Review this opportunity";
}

const CONSUMER_ACTIVITY_TERMS = /\b(class|workshop|lesson|session|course|ticket|screening)\b/i;
const ACCESS_TERMS =
  /\b(mentor|apprentice|grant|market|vendor|program|sourcing|supplier|business|network|community|founder|coworking|trade|export|import|resale|arbitrage)\b/i;

/**
 * Opportunity, not consumption — a light transparency signal, not a gate.
 * Approved opportunities can still be shown even when flagged; this just
 * tells the user honestly what kind of thing they're looking at.
 */
export function isLikelyConsumerActivity(input: NarrativeInput): boolean {
  const text = `${input.opportunityType} ${input.title}`.toLowerCase();
  if (ACCESS_TERMS.test(text)) return false;
  return CONSUMER_ACTIVITY_TERMS.test(text);
}
