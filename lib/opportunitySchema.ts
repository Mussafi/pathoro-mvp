export type OpportunitySourceType =
  | "eventbrite"
  | "library"
  | "community_center"
  | "parks_rec"
  | "coworking"
  | "university"
  | "newsletter"
  | "volunteer_board"
  | "direct_submission"
  | "mock_seed";

export type OpportunityStatus =
  | "draft"
  | "needs_review"
  | "live"
  | "expired"
  | "preview";

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
};

export const OPPORTUNITY_SOURCE_LABELS: Record<OpportunitySourceType, string> = {
  eventbrite: "Eventbrite",
  library: "Library calendar",
  community_center: "Community center calendar",
  parks_rec: "Parks & recreation",
  coworking: "Coworking / makerspace calendar",
  university: "University public events",
  newsletter: "Local newsletter",
  volunteer_board: "Volunteer board",
  direct_submission: "Direct Pathoro submission",
  mock_seed: "Mock seed data",
};

export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatus, string> = {
  draft: "Draft",
  needs_review: "Needs review",
  live: "Live",
  expired: "Expired",
  preview: "Preview",
};

export const RECOMMENDED_SOURCE_TYPES: OpportunitySourceType[] = [
  "eventbrite",
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
  "real-openings": "Class / Event",
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
