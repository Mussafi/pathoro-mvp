/** What a user says they want to do when they click "Take this opportunity"
 * (v0.36) — Pathoro's core action loop, independent of whether the
 * opportunity has a source_url. Every /opportunity/[id] page offers all
 * four, regardless of trust level or example/live status. */
export type OpportunityActionType =
  | "attend_apply_signup"
  | "verify_first"
  | "find_someone_ahead"
  | "similar_access_points";

export const OPPORTUNITY_ACTION_TYPE_LABELS: Record<OpportunityActionType, string> = {
  attend_apply_signup: "I want to attend / apply / sign up",
  verify_first: "I want Pathoro to help me verify it first",
  find_someone_ahead: "I want to find someone ahead before committing",
  similar_access_points: "I want similar access points",
};

export type OpportunityActionStatus = "new" | "reviewing" | "contacted" | "completed" | "archived";

export const OPPORTUNITY_ACTION_STATUS_LABELS: Record<OpportunityActionStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  contacted: "Contacted",
  completed: "Completed",
  archived: "Archived",
};

/** A "Take this opportunity" request, database-backed (v0.36). Always
 * available on every opportunity page — this is Pathoro's real action,
 * not just a link out. Manually reviewed in this alpha. */
export type OpportunityAction = {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  opportunitySlug: string;
  goal: string;
  routeId: string;
  actionType: OpportunityActionType;
  userName: string;
  userEmail: string;
  message: string;
  sourceUrl: string | null;
  trustLabel: string;
  status: OpportunityActionStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};
