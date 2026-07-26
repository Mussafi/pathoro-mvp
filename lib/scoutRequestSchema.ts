export type ScoutRequestStatus = "new" | "reviewed" | "scouted" | "rejected";

export const SCOUT_REQUEST_STATUS_LABELS: Record<ScoutRequestStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  scouted: "Scouted",
  rejected: "Rejected",
};

export const SCOUT_REQUEST_STATUS_COPY: Record<ScoutRequestStatus, string> = {
  new: "Request received.",
  reviewed: "Pathoro has reviewed this path.",
  scouted: "Pathoro has scouted this path. Live opportunities below may match.",
  rejected: "This request could not be completed.",
};

/** A public "want Pathoro to scout this path?" request. Database-backed (v0.15). */
export type ScoutRequest = {
  id: string;
  city: string;
  state: string;
  routeId: string;
  pathGoal: string;
  userContext: string;
  requestedFromPage: string;
  status: ScoutRequestStatus;
  adminNotes: string;
  publicToken: string | null;
  resultSummary: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  respondedAt: string | null;
};

/** The public-safe subset of a ScoutRequest — never includes adminNotes or publicToken. */
export type PublicScoutRequest = Omit<
  ScoutRequest,
  "adminNotes" | "publicToken" | "userContext" | "requestedFromPage"
>;

export function createScoutRequestId(): string {
  return `scout-req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createScoutRequestPublicToken(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
}
