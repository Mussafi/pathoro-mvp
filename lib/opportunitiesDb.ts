import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import type {
  EffortLevel,
  FrictionLevel,
  Opportunity,
  OpportunitySourceType,
  OpportunityStatus,
  TrustLevel,
} from "@/lib/opportunitySchema";

const TABLE = "opportunities";

type OpportunityRow = {
  id: string;
  title: string;
  source_url: string | null;
  source_name: string | null;
  source_type: string;
  city: string;
  state: string | null;
  location_label: string | null;
  date_label: string | null;
  cost_label: string | null;
  host_name: string | null;
  description: string | null;
  route_id: string;
  opportunity_type: string | null;
  who_it_is_for: string | null;
  path_it_supports: string | null;
  what_it_may_open_next: string | null;
  effort_level: string | null;
  friction_level: string | null;
  trust_level: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
};

export function rowToOpportunity(row: OpportunityRow): Opportunity {
  return {
    id: row.id,
    title: row.title,
    sourceUrl: row.source_url,
    sourceName: row.source_name ?? "",
    sourceType: (row.source_type as OpportunitySourceType) ?? "direct_submission",
    city: row.city,
    state: row.state ?? "",
    locationLabel: row.location_label ?? "",
    dateLabel: row.date_label ?? "",
    costLabel: row.cost_label ?? "",
    hostName: row.host_name ?? "",
    description: row.description ?? "",
    routeId: row.route_id,
    opportunityType: row.opportunity_type ?? "",
    whoItIsFor: row.who_it_is_for ?? "",
    pathItSupports: row.path_it_supports ?? "",
    whatItMayOpenNext: row.what_it_may_open_next ?? "",
    effortLevel: (row.effort_level as EffortLevel) ?? "Medium",
    frictionLevel: (row.friction_level as FrictionLevel) ?? "Medium",
    trustLevel: (row.trust_level as TrustLevel) ?? "Medium",
    status: row.status as OpportunityStatus,
  };
}

export function opportunityToRow(
  opportunity: Opportunity
): Omit<OpportunityRow, "created_at" | "updated_at"> {
  return {
    id: opportunity.id,
    title: opportunity.title,
    source_url: opportunity.sourceUrl,
    source_name: opportunity.sourceName,
    source_type: opportunity.sourceType,
    city: opportunity.city,
    state: opportunity.state,
    location_label: opportunity.locationLabel,
    date_label: opportunity.dateLabel,
    cost_label: opportunity.costLabel,
    host_name: opportunity.hostName,
    description: opportunity.description,
    route_id: opportunity.routeId,
    opportunity_type: opportunity.opportunityType,
    who_it_is_for: opportunity.whoItIsFor,
    path_it_supports: opportunity.pathItSupports,
    what_it_may_open_next: opportunity.whatItMayOpenNext,
    effort_level: opportunity.effortLevel,
    friction_level: opportunity.frictionLevel,
    trust_level: opportunity.trustLevel,
    status: opportunity.status,
    admin_notes: null,
    reviewed_at: opportunity.status === "live" ? new Date().toISOString() : null,
  };
}

/**
 * Reads live opportunities using the public anon client. Subject to Row
 * Level Security (`status = 'live'` only) as the real backstop; the
 * explicit `.eq("status", "live")` below is defense in depth.
 */
export async function getLiveOpportunities(filters?: {
  routeId?: string;
  city?: string;
}): Promise<Opportunity[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  let query = supabase.from(TABLE).select("*").eq("status", "live");
  if (filters?.routeId) query = query.eq("route_id", filters.routeId);
  if (filters?.city) query = query.eq("city", filters.city);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    console.error("getLiveOpportunities query failed:", error.message);
    return [];
  }
  if (!data) return [];
  return (data as OpportunityRow[]).map(rowToOpportunity);
}

export async function getLiveOpportunityById(id: string): Promise<Opportunity | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("status", "live")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getLiveOpportunityById query failed:", error.message);
    return null;
  }
  if (!data) return null;
  return rowToOpportunity(data as OpportunityRow);
}
