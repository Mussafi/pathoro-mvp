export type PathGuideRequestStatus = "new" | "reviewed" | "matched" | "rejected";

export const PATH_GUIDE_REQUEST_STATUS_LABELS: Record<PathGuideRequestStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  matched: "Matched",
  rejected: "Rejected",
};

/** A public "Find a guide" request from the Path Guide card on /trail-map.
 * Database-backed (v0.26). Guide matching itself is manual in this alpha —
 * this table just captures what a requester is asking for. */
export type PathGuideRequest = {
  id: string;
  goalId: string;
  goalTitle: string;
  branchId: string;
  branchTitle: string;
  question: string;
  requestedGuideType: string;
  contactEmail: string;
  status: PathGuideRequestStatus;
  createdAt: string;
  updatedAt: string;
};

export function createPathGuideRequestId(): string {
  return `guide-req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
