export type ScoutRequestStatus = "new" | "reviewed" | "scouted" | "rejected";

export const SCOUT_REQUEST_STATUS_LABELS: Record<ScoutRequestStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  scouted: "Scouted",
  rejected: "Rejected",
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
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
};

export function createScoutRequestId(): string {
  return `scout-req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
