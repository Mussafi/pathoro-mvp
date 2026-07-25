import "server-only";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { opportunityToRow, rowToOpportunity } from "@/lib/opportunitiesDb";
import type { Opportunity } from "@/lib/opportunitySchema";

const TABLE = "opportunities";

/**
 * Upserts an opportunity using the service role key, which bypasses Row
 * Level Security. Only ever call this from server-side API routes that
 * have already verified the request is from an authorized admin.
 */
export async function upsertOpportunityAdmin(opportunity: Opportunity): Promise<Opportunity> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    throw new Error(
      "Supabase admin client isn't configured — check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .upsert(opportunityToRow(opportunity), { onConflict: "id" })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save opportunity to the database.");
  }

  return rowToOpportunity(data);
}
