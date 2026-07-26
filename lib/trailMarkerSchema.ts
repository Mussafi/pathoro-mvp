export type MarkerType =
  | "practical_tip"
  | "hidden_requirement"
  | "access_advice"
  | "what_it_opened"
  | "warning_or_friction"
  | "bridge_person_or_group"
  | "better_first_step"
  | "cheaper_alternative"
  | "opportunity_quality";

export const MARKER_TYPE_LABELS: Record<MarkerType, string> = {
  practical_tip: "Practical tip",
  hidden_requirement: "Hidden requirement",
  access_advice: "Access advice",
  what_it_opened: "What this opened",
  warning_or_friction: "Warning / friction",
  bridge_person_or_group: "Bridge person or group",
  better_first_step: "Better first step",
  cheaper_alternative: "Cheaper alternative",
  opportunity_quality: "Real opportunity or consumer activity?",
};

export const MARKER_TYPES = Object.keys(MARKER_TYPE_LABELS) as MarkerType[];

export type TrailMarkerStatus = "needs_review" | "live" | "rejected";

export const TRAIL_MARKER_STATUS_LABELS: Record<TrailMarkerStatus, string> = {
  needs_review: "Needs review",
  live: "Live",
  rejected: "Rejected",
};

/** A structured "sign from someone who's walked this path" — not a comment. */
export type TrailMarker = {
  id: string;
  opportunityId: string | null;
  routeId: string | null;
  markerType: MarkerType;
  body: string;
  displayName: string;
  city: string;
  status: TrailMarkerStatus;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
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

export function isMarkerType(value: unknown): value is MarkerType {
  return typeof value === "string" && (MARKER_TYPES as string[]).includes(value);
}

export function createTrailMarkerId(): string {
  return `trail-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
