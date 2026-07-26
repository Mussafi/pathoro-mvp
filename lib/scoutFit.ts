/**
 * Client-safe home for the PathoroFit type/labels — kept out of
 * lib/tavily.ts (which is `server-only`) so the admin scout page can import
 * the label map at runtime without pulling the Tavily module into the
 * client bundle.
 *
 * Pathoro-fit is a separate axis from `opportunityCategory`. Category asks
 * "what kind of opportunity is this substantively" (consumer activity vs.
 * access point, etc); fit asks "is this even a specific, actionable page at
 * all" (a real event/program page vs. a Yelp list or generic browse page).
 * Combining the two is what lets a real cooking-class signup page rank
 * above a "10 Best Restaurants" listicle even though neither is a
 * high-agency opportunity.
 */
export type PathoroFit = "strong_opportunity" | "maybe_useful" | "consumer_activity" | "weak_informational";

export const PATHORO_FIT_LABELS: Record<PathoroFit, string> = {
  strong_opportunity: "Strong opportunity",
  maybe_useful: "Maybe useful",
  consumer_activity: "Consumer activity",
  weak_informational: "Mostly informational",
};

/** Higher-fit tiers first — shared by lib/tavily.ts's candidate sort and
 * anywhere else that needs to show the strongest candidates first. */
export const PATHORO_FIT_RANK: Record<PathoroFit, number> = {
  strong_opportunity: 3,
  maybe_useful: 2,
  consumer_activity: 1,
  weak_informational: 0,
};

/**
 * Shared card/badge styling so every surface that renders a scout
 * candidate (public scout result page, route-planning's AI-found section)
 * downplays weak/consumer-only results the same way — see "Improve
 * weak-result handling" in the v0.18 task notes.
 */
export const FIT_CARD_CLASS: Record<PathoroFit, string> = {
  strong_opportunity: "border-green/40 bg-green-soft/30 shadow-[0_0_0_1px_rgba(84,120,32,0.06)]",
  maybe_useful: "border-line/70 bg-cream-field",
  consumer_activity: "border-line/70 bg-cream-field",
  weak_informational: "border-line/50 bg-cream-field/50 opacity-70",
};

export const FIT_BADGE_CLASS: Record<PathoroFit, string> = {
  strong_opportunity: "border border-green/40 bg-green-soft/70 text-green",
  maybe_useful: "border border-line/70 bg-cream-card text-ink-soft",
  consumer_activity: "border border-line/70 bg-cream-card text-ink-faint",
  weak_informational: "border border-line/60 bg-cream-card text-ink-faint",
};

export const SCOUT_CONFIDENCE_LABELS: Record<string, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

const CANDIDATE_SNIPPET_MAX_LENGTH = 140;

/** Client-side snippet truncation for scannability — snippets are already
 * capped server-side, but shorter still reads better in a dense card list. */
export function shortenSnippet(snippet: string): string {
  if (snippet.length <= CANDIDATE_SNIPPET_MAX_LENGTH) return snippet;
  const truncated = snippet.slice(0, CANDIDATE_SNIPPET_MAX_LENGTH);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > CANDIDATE_SNIPPET_MAX_LENGTH * 0.6 ? truncated.slice(0, lastSpace) : truncated).trim() + "…";
}
