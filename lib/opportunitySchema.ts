export type OpportunitySourceType =
  | "eventbrite"
  | "luma"
  | "library"
  | "community_center"
  | "parks_rec"
  | "coworking"
  | "university"
  | "newsletter"
  | "volunteer_board"
  | "direct_submission"
  | "reddit_signal"
  | "mock_seed";

export type OpportunityStatus =
  | "draft"
  | "needs_review"
  | "live"
  | "expired"
  | "preview"
  | "rejected";

export type EffortLevel = "Low" | "Medium" | "High";
export type FrictionLevel = "Low" | "Medium" | "High";
export type TrustLevel = "Low" | "Medium" | "High";

export type Opportunity = {
  id: string;
  title: string;
  sourceUrl: string | null;
  sourceName: string;
  sourceType: OpportunitySourceType;
  city: string;
  state: string;
  locationLabel: string;
  dateLabel: string;
  costLabel: string;
  hostName: string;
  description: string;
  routeId: string;
  opportunityType: string;
  whoItIsFor: string;
  pathItSupports: string;
  whatItMayOpenNext: string;
  effortLevel: EffortLevel;
  frictionLevel: FrictionLevel;
  trustLevel: TrustLevel;
  status: OpportunityStatus;
  /** Internal Pathoro detail page, only set once a real detail page exists. */
  href?: string;
  /**
   * Seed/mock opportunities only — if set, this seed should only be shown
   * when the user's pathGoal text contains one of these words. Keeps demo
   * data from appearing on unrelated goals (a vegetarian cooking class
   * showing up for "build wealth"). Reviewed/live/candidate opportunities
   * are never filtered this way — only seed data needs it since real data
   * is inherently already goal-relevant.
   */
  relevanceKeywords?: string[];
};

export const OPPORTUNITY_SOURCE_LABELS: Record<OpportunitySourceType, string> = {
  eventbrite: "Eventbrite",
  luma: "Luma",
  library: "Library calendar",
  community_center: "Community center calendar",
  parks_rec: "Parks & recreation",
  coworking: "Coworking / makerspace calendar",
  university: "University public events",
  newsletter: "Local newsletter",
  volunteer_board: "Volunteer board",
  direct_submission: "Direct Pathoro submission",
  reddit_signal: "Reddit local signal",
  mock_seed: "Mock seed data",
};

/**
 * "Opportunity, not consumption" plus "Gateway Communities" — what kind of
 * opportunity a scout candidate looks like, independent of route/source
 * fit. Scout-response-only classification (see
 * docs/V0.11-AI-OPPORTUNITY-SCOUT.md); not a field on the persisted
 * Opportunity type and not sent to Supabase. The gateway-community values
 * are structure-based (institution types), never identity-based — see
 * docs/MVP-LOCKED-PRINCIPLES.md#gateway-communities. resale_arbitrage and
 * small_business_opening (v0.12) are split out of the broader
 * income_generating/ownership_path values so a flea-market resale lead and
 * a small-business-grant lead don't get flattened into the same label.
 */
export type OpportunityCategory =
  | "consumer_activity"
  | "skill_building"
  | "income_generating"
  | "access_point"
  | "ownership_path"
  | "proximity_builder"
  | "credential_step"
  | "community_entry"
  | "compounding_opportunity"
  | "gateway_community"
  | "bridge_person"
  | "place_based_network"
  | "diaspora_route"
  | "trade_access_point"
  | "relationship_path"
  | "resale_arbitrage"
  | "small_business_opening";

export const OPPORTUNITY_CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  consumer_activity: "Consumer activity",
  skill_building: "Skill-building",
  income_generating: "Income-generating",
  access_point: "Access point",
  ownership_path: "Ownership path",
  proximity_builder: "Proximity builder",
  credential_step: "Credential step",
  community_entry: "Community entry",
  compounding_opportunity: "Compounding opportunity",
  gateway_community: "Gateway community",
  bridge_person: "Bridge person",
  place_based_network: "Place-based network",
  diaspora_route: "Diaspora route",
  resale_arbitrage: "Resale / arbitrage",
  small_business_opening: "Small business opening",
  trade_access_point: "Trade access point",
  relationship_path: "Relationship path",
};

export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatus, string> = {
  draft: "Draft",
  needs_review: "Needs review",
  live: "Live",
  expired: "Expired",
  preview: "Preview",
  rejected: "Rejected",
};

export const RECOMMENDED_SOURCE_TYPES: OpportunitySourceType[] = [
  "eventbrite",
  "luma",
  "library",
  "community_center",
  "parks_rec",
  "coworking",
  "university",
  "newsletter",
  "volunteer_board",
  "direct_submission",
];

/** Maps a suggested routeId to a human-readable opportunity type label. */
export const ROUTE_OPPORTUNITY_TYPE_LABELS: Record<string, string> = {
  "real-openings": "Class / Opening",
  community: "Group / Community",
  people: "Person / Conversation",
  requirements: "Planning / Requirements",
  "try-it": "Small Trial",
};

/**
 * Simple keyword-based route fit suggestion, shared between the ingestion
 * API route (server) and the admin prototype UI (client) so both agree on
 * the same rules.
 */
export function suggestRouteIdFromText(text: string): string {
  const t = text.toLowerCase();
  if (/\b(class|workshop|event|opening)\b/.test(t)) return "real-openings";
  if (/\b(group|community|meetup)\b/.test(t)) return "community";
  if (/\b(mentor|person|talk|shadow)\b/.test(t)) return "people";
  if (/\b(checklist|requirements?|certification|setup)\b/.test(t)) return "requirements";
  if (/\b(trial|challenge|test|beginner)\b/.test(t)) return "try-it";
  return "real-openings";
}

/** Request body for POST /api/ingest-opportunity. */
export type IngestionRequestBody = {
  sourceUrl: string;
  sourceType: OpportunitySourceType;
  city: string;
};

/** A draft opportunity extracted from a URL, awaiting human review. */
export type IngestionDraft = {
  title: string;
  description: string;
  dateLabel: string;
  costLabel: string;
  hostName: string;
  opportunityType: string;
  whoItIsFor: string;
  pathItSupports: string;
  whatItMayOpenNext: string;
  effortLevel: EffortLevel;
  frictionLevel: FrictionLevel;
  trustLevel: TrustLevel;
  suggestedRouteId: string;
  sourceUrl: string;
  sourceType: OpportunitySourceType;
  city: string;
  locationLabel: string;
};

export type IngestionResponse =
  | { ok: true; draft: IngestionDraft; warnings: string[] }
  | { ok: false; error: string };

/**
 * Returns the internal detail page URL for an opportunity, or undefined if
 * it isn't live yet (in which case it should open a preview instead of
 * navigating anywhere).
 */
export function getOpportunityDetailHref(opportunity: Opportunity): string | undefined {
  if (opportunity.status !== "live") return undefined;
  return opportunity.href ?? `/opportunity/${opportunity.id}`;
}
