import type { OpportunitySourceType } from "@/lib/opportunitySchema";

/**
 * Discovery is the step before ingestion: a human (or later, an assisted
 * process) notices a possible local opportunity signal and logs it here.
 * Nothing here is extracted, reviewed, or published automatically — every
 * entry is just a lead until someone sends it to /admin/opportunity-ingestion
 * and runs it through the real review flow.
 *
 * Local-only prototype (localStorage), matching the pattern in
 * lib/reviewedOpportunities.ts. Not synced to Supabase — this is a planning
 * shell, not a source of truth.
 */

export type DiscoverySourceType =
  | "organizer_website"
  | "eventbrite"
  | "luma"
  | "library_calendar"
  | "volunteer_board"
  | "reddit_subreddit"
  | "instagram_signal"
  | "newsletter_rss"
  | "user_submitted_link";

export const DISCOVERY_SOURCE_TYPE_LABELS: Record<DiscoverySourceType, string> = {
  organizer_website: "Organizer website",
  eventbrite: "Eventbrite",
  luma: "Luma",
  library_calendar: "Library calendar",
  volunteer_board: "Volunteer board",
  reddit_subreddit: "Reddit local subreddit",
  instagram_signal: "Instagram signal",
  newsletter_rss: "Newsletter / RSS",
  user_submitted_link: "User-submitted link",
};

export type DiscoveryStatus = "new" | "reviewed" | "extracted" | "rejected";

export const DISCOVERY_STATUS_LABELS: Record<DiscoveryStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  extracted: "Extracted",
  rejected: "Rejected",
};

export type DiscoveryEntry = {
  id: string;
  city: string;
  sourceType: DiscoverySourceType;
  sourceUrl: string;
  keywords: string;
  status: DiscoveryStatus;
  notes: string;
  createdAt: string;
};

const STORAGE_KEY = "pathoro.discoveryQueue.v1";

export function loadDiscoveryQueue(): DiscoveryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DiscoveryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(list: DiscoveryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function saveDiscoveryEntry(entry: DiscoveryEntry): DiscoveryEntry[] {
  const current = loadDiscoveryQueue();
  const next = [...current.filter((e) => e.id !== entry.id), entry];
  persist(next);
  return next;
}

export function deleteDiscoveryEntry(id: string): DiscoveryEntry[] {
  const next = loadDiscoveryQueue().filter((e) => e.id !== id);
  persist(next);
  return next;
}

export function clearDiscoveryQueue(): DiscoveryEntry[] {
  persist([]);
  return [];
}

export function createDiscoveryEntryId(): string {
  return `discovery-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Best-effort mapping to the ingestion pipeline's OpportunitySourceType, used
 * when a discovery entry is sent to /admin/opportunity-ingestion. Discovery
 * source types are broader than ingestion source types (they include pure
 * signal sources like Instagram/Reddit that are never themselves extracted
 * from — see docs/V0.9-DISCOVERY-SOURCES.md).
 */
export function mapDiscoverySourceType(source: DiscoverySourceType): OpportunitySourceType {
  switch (source) {
    case "eventbrite":
      return "eventbrite";
    case "luma":
      return "luma";
    case "library_calendar":
      return "library";
    case "volunteer_board":
      return "volunteer_board";
    case "newsletter_rss":
      return "newsletter";
    case "reddit_subreddit":
      return "reddit_signal";
    case "organizer_website":
    case "instagram_signal":
    case "user_submitted_link":
      return "direct_submission";
  }
}

/** Reverse of mapDiscoverySourceType, used when saving a scout candidate into the queue. */
export function unmapOpportunitySourceType(source: OpportunitySourceType): DiscoverySourceType {
  switch (source) {
    case "eventbrite":
      return "eventbrite";
    case "luma":
      return "luma";
    case "library":
      return "library_calendar";
    case "volunteer_board":
      return "volunteer_board";
    case "newsletter":
      return "newsletter_rss";
    case "reddit_signal":
      return "reddit_subreddit";
    case "community_center":
    case "parks_rec":
    case "coworking":
    case "university":
    case "direct_submission":
    case "mock_seed":
      return "organizer_website";
  }
}
