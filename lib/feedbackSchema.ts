export type FeedbackCategory =
  | "helpful"
  | "confusing"
  | "wrong"
  | "path_request"
  | "trail_marker_interest"
  | "other";

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  helpful: "This helped",
  confusing: "This confused me",
  wrong: "This result was wrong",
  path_request: "I want this path added",
  trail_marker_interest: "I want to leave a trail marker",
  other: "Something else",
};

export type FeedbackStatus = "new" | "reviewed" | "archived";

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  archived: "Archived",
};

/** A public "Share feedback" submission — footer link + /contact page.
 * Database-backed (v0.43), same admin-reviewed-only pattern as path guide
 * and scout requests. */
export type Feedback = {
  id: string;
  category: FeedbackCategory;
  message: string;
  pageUrl: string;
  contactEmail: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
};

export function createFeedbackId(): string {
  return `feedback-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
