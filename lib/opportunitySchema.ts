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
