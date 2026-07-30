// Legacy (v0.13) marker types — kept valid forever (see migration 008),
// still shown correctly wherever an old marker is displayed, but no longer
// offered in the v0.40 community-layer composer.
export type LegacyMarkerType =
  | "practical_tip"
  | "hidden_requirement"
  | "access_advice"
  | "what_it_opened"
  | "warning_or_friction"
  | "bridge_person_or_group"
  | "cheaper_alternative"
  | "opportunity_quality";

// v0.40 "Community Layer Foundation" marker types — what
// TrailMarkerComposer actually offers. `opportunity_check` is the one
// exception: it's never in the composer's own type picker, it's set
// programmatically by the opportunity "Community checks" section (see
// components/opportunity/CommunityChecksSection.tsx).
export type CommunityMarkerType =
  | "better_first_step"
  | "hidden_friction"
  | "warning"
  | "what_opened_doors"
  | "what_required"
  | "useful_resource"
  | "direct_experience"
  | "opportunity_check";

export type MarkerType = LegacyMarkerType | CommunityMarkerType;

export const MARKER_TYPE_LABELS: Record<MarkerType, string> = {
  // legacy
  practical_tip: "Practical tip",
  hidden_requirement: "Hidden requirement",
  access_advice: "Access advice",
  what_it_opened: "What this opened",
  warning_or_friction: "Warning / friction",
  bridge_person_or_group: "Bridge person or group",
  cheaper_alternative: "Cheaper alternative",
  opportunity_quality: "Real opportunity or consumer activity?",
  // v0.40 community layer
  better_first_step: "Better first step",
  hidden_friction: "Hidden friction",
  warning: "Warning",
  what_opened_doors: "What opened doors",
  what_required: "What this required",
  useful_resource: "Useful resource",
  direct_experience: "I've been through this",
  opportunity_check: "Opportunity check",
};

export const MARKER_TYPES = Object.keys(MARKER_TYPE_LABELS) as MarkerType[];

/** The ordered picklist TrailMarkerComposer shows — matches v0.40 PART 5
 * exactly. `opportunity_check` is deliberately excluded; it's only ever
 * set via the fixedMarkerType prop from the opportunity community-checks
 * entry point, never chosen freely. */
export const COMMUNITY_MARKER_TYPES: CommunityMarkerType[] = [
  "better_first_step",
  "hidden_friction",
  "warning",
  "what_opened_doors",
  "what_required",
  "useful_resource",
  "direct_experience",
];

export function isMarkerType(value: unknown): value is MarkerType {
  return typeof value === "string" && (MARKER_TYPES as string[]).includes(value);
}

export type TrailMarkerStatus = "pending" | "approved" | "rejected" | "archived";

export const TRAIL_MARKER_STATUS_LABELS: Record<TrailMarkerStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  archived: "Archived",
};

export function isTrailMarkerStatus(value: unknown): value is TrailMarkerStatus {
  return (
    value === "pending" || value === "approved" || value === "rejected" || value === "archived"
  );
}

/** Where a marker attaches — every marker must carry one of these, never
 * posted context-free. See docs/MVP-LOCKED-PRINCIPLES.md#trail-markers-not-comments. */
export type ContextType =
  | "trail_map"
  | "branch"
  | "milestone"
  | "opportunity"
  | "candidate_opportunity"
  | "route";

export const CONTEXT_TYPE_LABELS: Record<ContextType, string> = {
  trail_map: "Trail map",
  branch: "Branch",
  milestone: "Milestone",
  opportunity: "Opportunity",
  candidate_opportunity: "Candidate opportunity",
  route: "Route",
};

export function isContextType(value: unknown): value is ContextType {
  return (
    value === "trail_map" ||
    value === "branch" ||
    value === "milestone" ||
    value === "opportunity" ||
    value === "candidate_opportunity" ||
    value === "route"
  );
}

/** How much weight a marker's context/experience claim should carry.
 * `verified_experience` and `licensed_guide` are admin-only upgrades — a
 * public submitter can never set either directly (see
 * lib/trailMarkerCredibility.ts). */
export type CredibilityType =
  | "peer"
  | "verified_experience"
  | "licensed_guide"
  | "credential_not_verified";

export const CREDIBILITY_TYPE_LABELS: Record<CredibilityType, string> = {
  peer: "Peer marker",
  verified_experience: "Verified experience",
  licensed_guide: "Licensed guide",
  credential_not_verified: "Credential not verified",
};

export function isCredibilityType(value: unknown): value is CredibilityType {
  return (
    value === "peer" ||
    value === "verified_experience" ||
    value === "licensed_guide" ||
    value === "credential_not_verified"
  );
}

/** A structured "sign from someone who's walked this path" — not a
 * comment. `contactEmail` and `moderationNotes` are admin-only; the public
 * read path never selects those columns in the first place (see
 * lib/trailMarkersDb.ts), so they're optional/undefined on anything that
 * reached the client through the public API. */
export type TrailMarker = {
  id: string;
  contextType: ContextType;
  goal: string;
  routeId: string | null;
  trailGoal: string | null;
  branchId: string | null;
  milestoneId: string | null;
  opportunityId: string | null;
  candidateId: string | null;
  markerType: MarkerType;
  body: string;
  authorName: string;
  authorRole: string;
  experienceLabel: string;
  credibilityType: CredibilityType;
  contactEmail?: string | null;
  status: TrailMarkerStatus;
  helpfulCount: number;
  moderationNotes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const TRAIL_MARKER_BODY_MIN_LENGTH = 10;
export const TRAIL_MARKER_BODY_MAX_LENGTH = 600;

export function isValidMarkerBody(body: string): boolean {
  const trimmed = body.trim();
  return (
    trimmed.length >= TRAIL_MARKER_BODY_MIN_LENGTH &&
    trimmed.length <= TRAIL_MARKER_BODY_MAX_LENGTH
  );
}

export const TRAIL_MARKER_EXPERIENCE_LABEL_MAX_LENGTH = 120;
export const TRAIL_MARKER_AUTHOR_NAME_MAX_LENGTH = 80;

export function createTrailMarkerId(): string {
  return `trail-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
