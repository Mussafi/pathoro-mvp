import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { ContextType, CredibilityType, MarkerType, TrailMarker, TrailMarkerStatus } from "@/lib/trailMarkerSchema";

const TABLE = "trail_markers";

// Columns safe to expose publicly — deliberately excludes contact_email
// and moderation_notes, which are admin-only (v0.40 PART 2/9). Listed
// explicitly rather than `select("*")` so a future admin-only column
// added to the table doesn't leak here by accident.
const PUBLIC_COLUMNS = [
  "id",
  "context_type",
  "goal",
  "route_id",
  "trail_goal",
  "branch_id",
  "milestone_id",
  "opportunity_id",
  "candidate_id",
  "marker_type",
  "body",
  "author_name",
  "author_role",
  "experience_label",
  "credibility_type",
  "status",
  "helpful_count",
  "created_at",
  "updated_at",
].join(", ");

type TrailMarkerRow = {
  id: string;
  context_type: string | null;
  goal: string | null;
  route_id: string | null;
  trail_goal: string | null;
  branch_id: string | null;
  milestone_id: string | null;
  opportunity_id: string | null;
  candidate_id: string | null;
  marker_type: string;
  body: string;
  author_name: string | null;
  author_role: string | null;
  experience_label: string | null;
  credibility_type: string | null;
  contact_email?: string | null;
  status: string;
  helpful_count: number | null;
  moderation_notes?: string | null;
  created_at: string;
  updated_at: string;
};

export function rowToTrailMarker(row: TrailMarkerRow): TrailMarker {
  return {
    id: row.id,
    contextType: (row.context_type as ContextType) ?? "route",
    goal: row.goal ?? "",
    routeId: row.route_id,
    trailGoal: row.trail_goal,
    branchId: row.branch_id,
    milestoneId: row.milestone_id,
    opportunityId: row.opportunity_id,
    candidateId: row.candidate_id,
    markerType: row.marker_type as MarkerType,
    body: row.body,
    authorName: row.author_name ?? "",
    authorRole: row.author_role ?? "",
    experienceLabel: row.experience_label ?? "",
    credibilityType: (row.credibility_type as CredibilityType) ?? "peer",
    contactEmail: row.contact_email,
    status: row.status as TrailMarkerStatus,
    helpfulCount: row.helpful_count ?? 0,
    moderationNotes: row.moderation_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type TrailMarkerFilters = {
  goal?: string;
  branchId?: string;
  milestoneId?: string;
  opportunityId?: string;
  candidateId?: string;
  routeId?: string;
  contextType?: ContextType;
};

function hasAnyFilter(filters: TrailMarkerFilters): boolean {
  return Boolean(
    filters.goal ||
      filters.branchId ||
      filters.milestoneId ||
      filters.opportunityId ||
      filters.candidateId ||
      filters.routeId ||
      filters.contextType
  );
}

/**
 * Reads approved trail markers using the public anon client. Subject to
 * Row Level Security (`status = 'approved'` only, see migration 008) as
 * the real backstop; the explicit `.eq("status", "approved")` below is
 * defense in depth. Requires at least one context filter — a marker is
 * always attached to something, so there's no "all markers" query.
 */
export async function getApprovedTrailMarkers(filters: TrailMarkerFilters): Promise<TrailMarker[]> {
  if (!isSupabaseConfigured() || !supabase || !hasAnyFilter(filters)) return [];

  let query = supabase.from(TABLE).select(PUBLIC_COLUMNS).eq("status", "approved");
  if (filters.goal) query = query.eq("goal", filters.goal);
  if (filters.branchId) query = query.eq("branch_id", filters.branchId);
  if (filters.milestoneId) query = query.eq("milestone_id", filters.milestoneId);
  if (filters.opportunityId) query = query.eq("opportunity_id", filters.opportunityId);
  if (filters.candidateId) query = query.eq("candidate_id", filters.candidateId);
  if (filters.routeId) query = query.eq("route_id", filters.routeId);
  if (filters.contextType) query = query.eq("context_type", filters.contextType);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    console.error("getApprovedTrailMarkers query failed:", error.message);
    return [];
  }
  if (!data) return [];
  return (data as unknown as TrailMarkerRow[]).map(rowToTrailMarker);
}
