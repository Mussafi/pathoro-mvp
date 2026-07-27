import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { PathGuideRequestStatus } from "@/lib/pathGuideRequestSchema";

const TABLE = "path_guide_requests";

/**
 * Inserts a path guide request using the public anon client, under Row
 * Level Security (anon may only insert with status = 'new' — see
 * supabase/migrations/006_create_path_guide_requests.sql). This is the
 * one place a public write goes straight to Supabase without a
 * service-role-gated API doing the write on the client's behalf.
 */
export async function insertPathGuideRequest(request: {
  id: string;
  goalId: string;
  goalTitle: string;
  branchId: string;
  branchTitle: string;
  question: string;
  requestedGuideType: string;
  contactEmail: string;
}): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase isn't configured.");
  }

  const row = {
    id: request.id,
    goal_id: request.goalId || null,
    goal_title: request.goalTitle || null,
    branch_id: request.branchId || null,
    branch_title: request.branchTitle || null,
    question: request.question,
    requested_guide_type: request.requestedGuideType || null,
    contact_email: request.contactEmail || null,
    status: "new" satisfies PathGuideRequestStatus,
  };

  const { error } = await supabase.from(TABLE).insert(row);
  if (error) {
    throw new Error(error.message);
  }
}
