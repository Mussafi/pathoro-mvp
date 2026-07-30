import "server-only";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { rowToTrailMarker } from "@/lib/trailMarkersDb";
import { computeInitialCredibilityType } from "@/lib/trailMarkerCredibility";
import type { ContextType, CredibilityType, MarkerType, TrailMarker } from "@/lib/trailMarkerSchema";

const TABLE = "trail_markers";

/**
 * Inserts a new trail marker using the service role key, which bypasses
 * Row Level Security (anon has no insert policy on this table — see
 * supabase/migrations/002_create_trail_markers.sql /
 * 008_extend_trail_markers_community_layer.sql). Only ever call this from
 * POST /api/trail-markers, which forces status to 'pending' and computes
 * credibility_type server-side before it reaches here — a public
 * submitter can never set either directly (v0.40 PART 3/10).
 */
export async function insertTrailMarkerAdmin(marker: {
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
  contactEmail: string;
}): Promise<TrailMarker> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    throw new Error(
      "Supabase admin client isn't configured — check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const credibilityType: CredibilityType = computeInitialCredibilityType({
    authorRole: marker.authorRole,
    experienceLabel: marker.experienceLabel,
  });

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({
      id: marker.id,
      context_type: marker.contextType,
      goal: marker.goal || null,
      route_id: marker.routeId,
      trail_goal: marker.trailGoal,
      branch_id: marker.branchId,
      milestone_id: marker.milestoneId,
      opportunity_id: marker.opportunityId,
      candidate_id: marker.candidateId,
      marker_type: marker.markerType,
      body: marker.body,
      author_name: marker.authorName || null,
      author_role: marker.authorRole || null,
      experience_label: marker.experienceLabel || null,
      credibility_type: credibilityType,
      contact_email: marker.contactEmail || null,
      status: "pending",
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save trail marker.");
  }

  return rowToTrailMarker(data);
}

/** Lists markers awaiting review, oldest first. Admin-only — includes
 * contact_email and moderation_notes, which the public db layer never
 * selects. */
export async function getPendingTrailMarkers(): Promise<TrailMarker[]> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getPendingTrailMarkers query failed:", error.message);
    return [];
  }
  if (!data) return [];
  return data.map(rowToTrailMarker);
}

/** Lists every marker regardless of status, newest first — used by the
 * admin moderation page's "all markers" view so approved/rejected/archived
 * history stays visible, not just the pending queue. Admin-only. */
export async function getAllTrailMarkersAdmin(): Promise<TrailMarker[]> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllTrailMarkersAdmin query failed:", error.message);
    return [];
  }
  if (!data) return [];
  return data.map(rowToTrailMarker);
}

/** Moderation update: status transition (approve/reject/archive),
 * optional moderation notes, optional credibility upgrade. Admin-only —
 * this is the only path that can ever set credibility_type to
 * 'verified_experience' or 'licensed_guide' (v0.40 PART 10). */
export async function moderateTrailMarkerAdmin(
  id: string,
  changes: {
    status?: "approved" | "rejected" | "archived" | "pending";
    moderationNotes?: string;
    credibilityType?: CredibilityType;
  }
): Promise<TrailMarker> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    throw new Error(
      "Supabase admin client isn't configured — check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const update: Record<string, string> = {};
  if (changes.status) update.status = changes.status;
  if (changes.moderationNotes !== undefined) update.moderation_notes = changes.moderationNotes;
  if (changes.credibilityType) update.credibility_type = changes.credibilityType;

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update trail marker.");
  }

  return rowToTrailMarker(data);
}
