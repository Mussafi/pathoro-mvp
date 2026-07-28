import { insertOpportunityAction } from "@/lib/opportunityActionsDb";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import type { OpportunityActionType } from "@/lib/opportunityActionSchema";

const VALID_ACTION_TYPES: OpportunityActionType[] = [
  "attend_apply_signup",
  "verify_first",
  "find_someone_ahead",
  "similar_access_points",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// No admin token required — this is the public "Take this opportunity"
// flow on every /opportunity/[id] page. Safety mechanism: the anon insert
// policy in supabase/migrations/007_create_opportunity_actions.sql only
// allows status = 'new', so a submitted action can never appear
// pre-reviewed, and there is no public read/update/delete path at all.
// Client-provided status is never read or trusted here.
export async function POST(request: Request): Promise<Response> {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { ok: false, error: "Supabase isn't configured for this deployment." },
      { status: 500 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const body = payload as {
    opportunityId?: string;
    opportunityTitle?: string;
    opportunitySlug?: string;
    goal?: string;
    routeId?: string;
    actionType?: string;
    userName?: string;
    userEmail?: string;
    message?: string;
    sourceUrl?: string;
    trustLabel?: string;
  };

  const opportunityTitle = body.opportunityTitle?.trim() ?? "";
  if (!opportunityTitle) {
    return Response.json({ ok: false, error: "opportunityTitle is required." }, { status: 400 });
  }

  const actionType = body.actionType?.trim() ?? "";
  if (!VALID_ACTION_TYPES.includes(actionType as OpportunityActionType)) {
    return Response.json(
      { ok: false, error: `actionType must be one of: ${VALID_ACTION_TYPES.join(", ")}.` },
      { status: 400 }
    );
  }

  const userEmail = body.userEmail?.trim() ?? "";
  if (userEmail && !EMAIL_RE.test(userEmail)) {
    return Response.json({ ok: false, error: "That email address doesn't look right." }, { status: 400 });
  }

  try {
    const { id } = await insertOpportunityAction({
      opportunityId: body.opportunityId?.trim() ?? "",
      opportunityTitle,
      opportunitySlug: body.opportunitySlug?.trim() ?? "",
      goal: body.goal?.trim() ?? "",
      routeId: body.routeId?.trim() ?? "",
      actionType: actionType as OpportunityActionType,
      userName: body.userName?.trim() ?? "",
      userEmail,
      message: body.message?.trim() ?? "",
      sourceUrl: body.sourceUrl?.trim() || null,
      trustLabel: body.trustLabel?.trim() ?? "",
    });

    return Response.json({ ok: true, id, message: "Opportunity step started." });
  } catch (err) {
    console.error("POST /api/opportunity-actions failed:", err);
    const message = err instanceof Error ? err.message : "Failed to save opportunity action.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
