import "server-only";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import type { ScoutRequest, ScoutRequestStatus } from "@/lib/scoutRequestSchema";

const TABLE = "scout_requests";

type ScoutRequestRow = {
  id: string;
  city: string | null;
  state: string | null;
  route_id: string | null;
  path_goal: string | null;
  user_context: string | null;
  requested_from_page: string | null;
  status: string;
  admin_notes: string | null;
  public_token: string | null;
  result_summary: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  responded_at: string | null;
};

function rowToScoutRequest(row: ScoutRequestRow): ScoutRequest {
  return {
    id: row.id,
    city: row.city ?? "",
    state: row.state ?? "",
    routeId: row.route_id ?? "",
    pathGoal: row.path_goal ?? "",
    userContext: row.user_context ?? "",
    requestedFromPage: row.requested_from_page ?? "",
    status: row.status as ScoutRequestStatus,
    adminNotes: row.admin_notes ?? "",
    publicToken: row.public_token,
    resultSummary: row.result_summary ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reviewedAt: row.reviewed_at,
    respondedAt: row.responded_at,
  };
}

/** Lists all scout requests, newest first. Admin-only (service role key). */
export async function getScoutRequestsAdmin(): Promise<ScoutRequest[]> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getScoutRequestsAdmin query failed:", error.message);
    return [];
  }
  if (!data) return [];
  return data.map(rowToScoutRequest);
}

/**
 * Looks up a single scout request by id using the service role key
 * (bypasses RLS). Used by the public result-page API route, which does its
 * own token verification server-side afterward — see
 * app/api/scout-requests/[id]/public/route.ts.
 */
export async function getScoutRequestByIdAdmin(id: string): Promise<ScoutRequest | null> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("id", id).maybeSingle();

  if (error) {
    console.error("getScoutRequestByIdAdmin query failed:", error.message);
    return null;
  }
  if (!data) return null;
  return rowToScoutRequest(data);
}

/** Updates a scout request's status, admin notes, and/or result summary. Admin-only. */
export async function updateScoutRequestAdmin(
  id: string,
  updates: { status?: ScoutRequestStatus; adminNotes?: string; resultSummary?: string }
): Promise<ScoutRequest> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    throw new Error(
      "Supabase admin client isn't configured — check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const patch: {
    status?: ScoutRequestStatus;
    admin_notes?: string;
    result_summary?: string;
    reviewed_at?: string;
    responded_at?: string;
  } = {};
  if (updates.status) {
    patch.status = updates.status;
    patch.reviewed_at = new Date().toISOString();
    if (updates.status === "scouted") {
      patch.responded_at = new Date().toISOString();
    }
  }
  if (updates.adminNotes !== undefined) {
    patch.admin_notes = updates.adminNotes;
  }
  if (updates.resultSummary !== undefined) {
    patch.result_summary = updates.resultSummary;
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update scout request.");
  }

  return rowToScoutRequest(data);
}
