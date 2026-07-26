import "server-only";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import type { ScoutCandidate } from "@/lib/tavily";

const TABLE = "scout_candidates";
const MAX_SAVED_CANDIDATES = 8;

export type ScoutCandidateStatus = "candidate" | "sent_to_ingestion" | "dismissed" | "promoted";

/** A scout candidate as persisted to Supabase, tied to one scout request. */
export type ScoutCandidateRecord = {
  id: string;
  scoutRequestId: string;
  title: string;
  url: string;
  sourceName: string;
  sourceType: string;
  snippet: string;
  likelyRouteId: string;
  opportunityType: string;
  category: string;
  confidence: string;
  pathoroFit: string;
  whyThisMayFit: string;
  leverageHint: string;
  suggestedNextStep: string;
  canonicalSourceLikely: boolean;
  status: ScoutCandidateStatus;
  createdAt: string;
  updatedAt: string;
};

type ScoutCandidateRow = {
  id: string;
  scout_request_id: string;
  title: string;
  url: string;
  source_name: string | null;
  source_type: string | null;
  snippet: string | null;
  likely_route_id: string | null;
  opportunity_type: string | null;
  category: string | null;
  confidence: string | null;
  pathoro_fit: string | null;
  why_this_may_fit: string | null;
  leverage_hint: string | null;
  suggested_next_step: string | null;
  canonical_source_likely: boolean | null;
  status: string;
  created_at: string;
  updated_at: string;
};

function rowToScoutCandidateRecord(row: ScoutCandidateRow): ScoutCandidateRecord {
  return {
    id: row.id,
    scoutRequestId: row.scout_request_id,
    title: row.title,
    url: row.url,
    sourceName: row.source_name ?? "",
    sourceType: row.source_type ?? "",
    snippet: row.snippet ?? "",
    likelyRouteId: row.likely_route_id ?? "",
    opportunityType: row.opportunity_type ?? "",
    category: row.category ?? "",
    confidence: row.confidence ?? "",
    pathoroFit: row.pathoro_fit ?? "",
    whyThisMayFit: row.why_this_may_fit ?? "",
    leverageHint: row.leverage_hint ?? "",
    suggestedNextStep: row.suggested_next_step ?? "",
    canonicalSourceLikely: row.canonical_source_likely ?? false,
    status: row.status as ScoutCandidateStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function createScoutCandidateId(): string {
  return `scout-cand-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Dedupes by URL and by normalized title (a defensive second pass —
 * scoutOpportunities in lib/tavily.ts already dedupes by URL across
 * queries, but this guards the save step itself against near-duplicate
 * titles from different URLs), then keeps only the top
 * MAX_SAVED_CANDIDATES — candidates arrive already sorted best-fit-first.
 */
function dedupeAndCap(candidates: ScoutCandidate[]): ScoutCandidate[] {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const deduped: ScoutCandidate[] = [];

  for (const candidate of candidates) {
    const titleKey = normalizeTitle(candidate.title);
    if (seenUrls.has(candidate.url) || seenTitles.has(titleKey)) continue;
    seenUrls.add(candidate.url);
    seenTitles.add(titleKey);
    deduped.push(candidate);
    if (deduped.length >= MAX_SAVED_CANDIDATES) break;
  }

  return deduped;
}

/**
 * Saves the top scout candidates for a request. Admin-only write path
 * (service role key) — called right after a scout request is inserted, in
 * POST /api/scout-requests, never from the client.
 */
export async function saveScoutCandidates(
  requestId: string,
  candidates: ScoutCandidate[]
): Promise<ScoutCandidateRecord[]> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    throw new Error("Supabase admin client isn't configured.");
  }

  const toSave = dedupeAndCap(candidates);
  if (toSave.length === 0) return [];

  const rows = toSave.map((candidate) => ({
    id: createScoutCandidateId(),
    scout_request_id: requestId,
    title: candidate.title,
    url: candidate.url,
    source_name: candidate.sourceName,
    source_type: candidate.sourceType,
    snippet: candidate.snippet,
    likely_route_id: candidate.likelyRouteId,
    opportunity_type: candidate.opportunityType,
    category: candidate.opportunityCategory,
    confidence: candidate.confidence,
    pathoro_fit: candidate.pathoroFit,
    why_this_may_fit: candidate.whyThisMayFit,
    leverage_hint: candidate.leverageHint,
    suggested_next_step: candidate.suggestedNextStep,
    canonical_source_likely: candidate.canonicalSourceLikely,
    status: "candidate" satisfies ScoutCandidateStatus,
  }));

  const { data, error } = await supabaseAdmin.from(TABLE).insert(rows).select();
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []).map(rowToScoutCandidateRecord);
}

/** Lists candidates for one scout request, best-fit first. */
export async function getScoutCandidatesForRequest(
  requestId: string
): Promise<ScoutCandidateRecord[]> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .eq("scout_request_id", requestId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getScoutCandidatesForRequest query failed:", error.message);
    return [];
  }
  return (data ?? []).map(rowToScoutCandidateRecord);
}

/** Batch version for the admin list view — one query instead of one per request. */
export async function getScoutCandidatesForRequests(
  requestIds: string[]
): Promise<Record<string, ScoutCandidateRecord[]>> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin || requestIds.length === 0) return {};

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .in("scout_request_id", requestIds)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getScoutCandidatesForRequests query failed:", error.message);
    return {};
  }

  const grouped: Record<string, ScoutCandidateRecord[]> = {};
  for (const row of data ?? []) {
    const record = rowToScoutCandidateRecord(row);
    (grouped[record.scoutRequestId] ??= []).push(record);
  }
  return grouped;
}

/** Updates one candidate's status (sent to ingestion, dismissed, promoted). Admin-only. */
export async function updateScoutCandidateStatus(
  id: string,
  status: ScoutCandidateStatus
): Promise<ScoutCandidateRecord> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    throw new Error("Supabase admin client isn't configured.");
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update scout candidate.");
  }
  return rowToScoutCandidateRecord(data);
}
