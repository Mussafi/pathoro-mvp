import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { MarkerType, TrailMarker, TrailMarkerStatus } from "@/lib/trailMarkerSchema";

const TABLE = "trail_markers";

type TrailMarkerRow = {
  id: string;
  opportunity_id: string | null;
  route_id: string | null;
  marker_type: string;
  body: string;
  display_name: string | null;
  city: string | null;
  status: string;
  helpful_count: number | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
};

export function rowToTrailMarker(row: TrailMarkerRow): TrailMarker {
  return {
    id: row.id,
    opportunityId: row.opportunity_id,
    routeId: row.route_id,
    markerType: row.marker_type as MarkerType,
    body: row.body,
    displayName: row.display_name ?? "",
    city: row.city ?? "",
    status: row.status as TrailMarkerStatus,
    helpfulCount: row.helpful_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reviewedAt: row.reviewed_at,
  };
}

/**
 * Reads live trail markers using the public anon client. Subject to Row
 * Level Security (`status = 'live'` only) as the real backstop; the
 * explicit `.eq("status", "live")` below is defense in depth.
 */
export async function getLiveTrailMarkers(filters: {
  opportunityId?: string;
  routeId?: string;
}): Promise<TrailMarker[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  let query = supabase.from(TABLE).select("*").eq("status", "live");
  if (filters.opportunityId) query = query.eq("opportunity_id", filters.opportunityId);
  if (filters.routeId) query = query.eq("route_id", filters.routeId);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    console.error("getLiveTrailMarkers query failed:", error.message);
    return [];
  }
  if (!data) return [];
  return (data as TrailMarkerRow[]).map(rowToTrailMarker);
}
