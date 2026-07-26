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
