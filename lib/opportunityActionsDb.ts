import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { OpportunityActionType } from "@/lib/opportunityActionSchema";

const TABLE = "opportunity_actions";

/**
 * Inserts an opportunity action using the public anon client, under Row
 * Level Security (anon may only insert with status = 'new' — see
 * supabase/migrations/007_create_opportunity_actions.sql). Same pattern as
 * lib/pathGuideRequestsDb.ts: the API route runs this server-side, but
 * still through the anon key, so RLS is what actually enforces the
 * "public can only ever create a new, unreviewed action" guarantee.
 */
export async function insertOpportunityAction(action: {
  opportunityId: string;
  opportunityTitle: string;
  opportunitySlug: string;
  goal: string;
  routeId: string;
  actionType: OpportunityActionType;
  userName: string;
  userEmail: string;
  message: string;
  sourceUrl: string | null;
  trustLabel: string;
}): Promise<{ id: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase isn't configured.");
  }

  const row = {
    opportunity_id: action.opportunityId || null,
    opportunity_title: action.opportunityTitle,
    opportunity_slug: action.opportunitySlug || null,
    goal: action.goal || null,
    route_id: action.routeId || null,
    action_type: action.actionType,
    user_name: action.userName || null,
    user_email: action.userEmail || null,
    message: action.message || null,
    source_url: action.sourceUrl,
    trust_label: action.trustLabel || null,
    status: "new",
  };

  const { data, error } = await supabase.from(TABLE).insert(row).select("id").single();
  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save opportunity action.");
  }

  return { id: data.id as string };
}
