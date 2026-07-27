import "server-only";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import type { PathGuideRequest, PathGuideRequestStatus } from "@/lib/pathGuideRequestSchema";

const TABLE = "path_guide_requests";

type PathGuideRequestRow = {
  id: string;
  goal_id: string | null;
  goal_title: string | null;
  branch_id: string | null;
  branch_title: string | null;
  question: string;
  requested_guide_type: string | null;
  contact_email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

function rowToPathGuideRequest(row: PathGuideRequestRow): PathGuideRequest {
  return {
    id: row.id,
    goalId: row.goal_id ?? "",
    goalTitle: row.goal_title ?? "",
    branchId: row.branch_id ?? "",
    branchTitle: row.branch_title ?? "",
    question: row.question,
    requestedGuideType: row.requested_guide_type ?? "",
    contactEmail: row.contact_email ?? "",
    status: row.status as PathGuideRequestStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Lists all path guide requests, newest first. Admin-only (service role key). */
export async function getPathGuideRequestsAdmin(): Promise<PathGuideRequest[]> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPathGuideRequestsAdmin query failed:", error.message);
    return [];
  }
  if (!data) return [];
  return data.map(rowToPathGuideRequest);
}

/** Updates a path guide request's status. Admin-only. */
export async function updatePathGuideRequestAdmin(
  id: string,
  updates: { status: PathGuideRequestStatus }
): Promise<PathGuideRequest> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    throw new Error(
      "Supabase admin client isn't configured — check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ status: updates.status })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update path guide request.");
  }

  return rowToPathGuideRequest(data);
}
