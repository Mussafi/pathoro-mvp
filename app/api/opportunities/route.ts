import { isAuthorizedAdminRequest } from "@/lib/adminAuth";
import { getLiveOpportunities } from "@/lib/opportunitiesDb";
import { upsertOpportunityAdmin } from "@/lib/opportunitiesAdminDb";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import type { Opportunity } from "@/lib/opportunitySchema";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const routeId = searchParams.get("routeId") ?? undefined;
  const city = searchParams.get("city") ?? undefined;

  if (!isSupabaseConfigured()) {
    console.error(
      "GET /api/opportunities: Supabase isn't configured (missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). Returning an empty list so the public app can fall back to seed data."
    );
    return Response.json({ ok: true, opportunities: [] });
  }

  try {
    const opportunities = await getLiveOpportunities({ routeId, city });
    return Response.json({ ok: true, opportunities });
  } catch (err) {
    console.error("GET /api/opportunities failed:", err);
    return Response.json({ ok: true, opportunities: [] });
  }
}

export async function POST(request: Request): Promise<Response> {
  if (!isAuthorizedAdminRequest(request)) {
    return Response.json(
      { ok: false, error: "Missing or invalid admin token." },
      { status: 401 }
    );
  }

  if (!isSupabaseAdminConfigured()) {
    return Response.json(
      {
        ok: false,
        error:
          "Supabase admin client isn't configured. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const draft = body as Partial<Opportunity>;
  if (!draft.id || !draft.title || !draft.routeId) {
    return Response.json(
      { ok: false, error: "Missing required fields: id, title, routeId." },
      { status: 400 }
    );
  }

  const opportunity: Opportunity = {
    id: draft.id,
    title: draft.title,
    sourceUrl: draft.sourceUrl ?? null,
    sourceName: draft.sourceName ?? "",
    sourceType: draft.sourceType ?? "direct_submission",
    city: draft.city ?? "",
    state: draft.state ?? "",
    locationLabel: draft.locationLabel ?? "",
    dateLabel: draft.dateLabel ?? "",
    costLabel: draft.costLabel ?? "",
    hostName: draft.hostName ?? "",
    description: draft.description ?? "",
    routeId: draft.routeId,
    opportunityType: draft.opportunityType ?? "",
    whoItIsFor: draft.whoItIsFor ?? "",
    pathItSupports: draft.pathItSupports ?? "",
    whatItMayOpenNext: draft.whatItMayOpenNext ?? "",
    effortLevel: draft.effortLevel ?? "Medium",
    frictionLevel: draft.frictionLevel ?? "Medium",
    trustLevel: draft.trustLevel ?? "Medium",
    // Approving via this endpoint always publishes — forced server-side
    // regardless of what the client sends, since "approve" only ever means "live".
    status: "live",
  };

  try {
    const saved = await upsertOpportunityAdmin(opportunity);
    return Response.json({ ok: true, opportunity: saved });
  } catch (err) {
    console.error("POST /api/opportunities failed:", err);
    const message = err instanceof Error ? err.message : "Failed to save opportunity.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
