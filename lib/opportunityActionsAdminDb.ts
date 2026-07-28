import "server-only";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import type { OpportunityAction, OpportunityActionStatus } from "@/lib/opportunityActionSchema";

const TABLE = "opportunity_actions";

type OpportunityActionRow = {
  id: string;
  opportunity_id: string | null;
  opportunity_title: string;
  opportunity_slug: string | null;
  goal: string | null;
  route_id: string | null;
  action_type: string;
  user_name: string | null;
  user_email: string | null;
  message: string | null;
  source_url: string | null;
  trust_label: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

function rowToOpportunityAction(row: OpportunityActionRow): OpportunityAction {
  return {
    id: row.id,
    opportunityId: row.opportunity_id ?? "",
    opportunityTitle: row.opportunity_title,
    opportunitySlug: row.opportunity_slug ?? "",
    goal: row.goal ?? "",
    routeId: row.route_id ?? "",
    actionType: row.action_type as OpportunityAction["actionType"],
    userName: row.user_name ?? "",
    userEmail: row.user_email ?? "",
    message: row.message ?? "",
    sourceUrl: row.source_url,
    trustLabel: row.trust_label ?? "",
    status: row.status as OpportunityActionStatus,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Lists all opportunity actions, newest first. Admin-only (service role key). */
export async function getOpportunityActionsAdmin(): Promise<OpportunityAction[]> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getOpportunityActionsAdmin query failed:", error.message);
    return [];
  }
  if (!data) return [];
  return data.map(rowToOpportunityAction);
}

/** Updates an opportunity action's status. Admin-only. */
export async function updateOpportunityActionAdmin(
  id: string,
  updates: { status: OpportunityActionStatus }
): Promise<OpportunityAction> {
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
    throw new Error(error?.message ?? "Failed to update opportunity action.");
  }

  return rowToOpportunityAction(data);
}
