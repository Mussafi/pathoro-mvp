import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { createScoutRequestPublicToken, type ScoutRequestStatus } from "@/lib/scoutRequestSchema";

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

/**
 * Inserts a scout request using the public anon client, under Row Level
 * Security (anon may only insert with status = 'new' — see
 * supabase/migrations/003_create_scout_requests.sql). This is the one
 * place in the app where a public write goes straight to Supabase without
 * a service-role-gated API doing the write on the client's behalf.
 *
 * Generates the public_token server-side (in this function, before the
 * insert) rather than trusting a client-supplied value — the RLS insert
 * policy doesn't restrict which columns anon can set, so this is the only
 * real guarantee that a request's token is actually random.
 */
export async function insertScoutRequest(request: {
  id: string;
  city: string;
  state: string;
  routeId: string;
  pathGoal: string;
  userContext: string;
  requestedFromPage: string;
}): Promise<{ publicToken: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase isn't configured.");
  }

  const publicToken = createScoutRequestPublicToken();

  const row: Omit<
    ScoutRequestRow,
    "created_at" | "updated_at" | "reviewed_at" | "responded_at" | "admin_notes" | "result_summary"
  > = {
    id: request.id,
    city: request.city || null,
    state: request.state || null,
    route_id: request.routeId || null,
    path_goal: request.pathGoal || null,
    user_context: request.userContext || null,
    requested_from_page: request.requestedFromPage || null,
    status: "new" satisfies ScoutRequestStatus,
    public_token: publicToken,
  };

  const { error } = await supabase.from(TABLE).insert(row);
  if (error) {
    throw new Error(error.message);
  }

  return { publicToken };
}
