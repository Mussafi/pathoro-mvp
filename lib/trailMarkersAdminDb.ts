import "server-only";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { rowToTrailMarker } from "@/lib/trailMarkersDb";
import type { MarkerType, TrailMarker, TrailMarkerStatus } from "@/lib/trailMarkerSchema";

const TABLE = "trail_markers";

/**
 * Inserts a new trail marker using the service role key, which bypasses
 * Row Level Security (anon has no insert policy on this table — see
 * supabase/migrations/002_create_trail_markers.sql). Only ever call this
 * from POST /api/trail-markers, which forces status to 'needs_review'
 * before it reaches here.
 */
export async function insertTrailMarkerAdmin(marker: {
  id: string;
  opportunityId: string | null;
  routeId: string | null;
  markerType: MarkerType;
  body: string;
  displayName: string;
  city: string;
}): Promise<TrailMarker> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    throw new Error(
      "Supabase admin client isn't configured — check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({
      id: marker.id,
      opportunity_id: marker.opportunityId,
      route_id: marker.routeId,
      marker_type: marker.markerType,
      body: marker.body,
      display_name: marker.displayName || null,
      city: marker.city || null,
      status: "needs_review",
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save trail marker.");
  }

  return rowToTrailMarker(data);
}

/** Lists markers awaiting review, oldest first. Admin-only. */
export async function getNeedsReviewTrailMarkers(): Promise<TrailMarker[]> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .eq("status", "needs_review")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getNeedsReviewTrailMarkers query failed:", error.message);
    return [];
  }
  if (!data) return [];
  return data.map(rowToTrailMarker);
}

/** Sets a marker's status (approve/reject). Admin-only. */
export async function setTrailMarkerStatusAdmin(
  id: string,
  status: Extract<TrailMarkerStatus, "live" | "rejected">
): Promise<TrailMarker> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    throw new Error(
      "Supabase admin client isn't configured — check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update trail marker.");
  }

  return rowToTrailMarker(data);
}
