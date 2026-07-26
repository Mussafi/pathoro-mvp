import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { ScoutRequestStatus } from "@/lib/scoutRequestSchema";

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
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
};

/**
 * Inserts a scout request using the public anon client, under Row Level
 * Security (anon may only insert with status = 'new' — see
 * supabase/migrations/003_create_scout_requests.sql). This is the one
 * place in the app where a public write goes straight to Supabase without
 * a service-role-gated API doing the write on the client's behalf.
 */
export async function insertScoutRequest(request: {
  id: string;
  city: string;
  state: string;
  routeId: string;
  pathGoal: string;
  userContext: string;
  requestedFromPage: string;
}): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase isn't configured.");
  }

  const row: Omit<ScoutRequestRow, "created_at" | "updated_at" | "reviewed_at" | "admin_notes"> = {
    id: request.id,
    city: request.city || null,
    state: request.state || null,
    route_id: request.routeId || null,
    path_goal: request.pathGoal || null,
    user_context: request.userContext || null,
    requested_from_page: request.requestedFromPage || null,
    status: "new" satisfies ScoutRequestStatus,
  };

  const { error } = await supabase.from(TABLE).insert(row);
  if (error) {
    throw new Error(error.message);
  }
}
