import { isAuthorizedAdminRequest } from "@/lib/adminAuth";
import { updateOpportunityActionAdmin } from "@/lib/opportunityActionsAdminDb";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import type { OpportunityActionStatus } from "@/lib/opportunityActionSchema";

const VALID_STATUSES: OpportunityActionStatus[] = [
  "new",
  "reviewing",
  "contacted",
  "completed",
  "archived",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
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

  const { id } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const { status } = payload as { status?: string };
  if (!status || !VALID_STATUSES.includes(status as OpportunityActionStatus)) {
    return Response.json(
      { ok: false, error: `status must be one of: ${VALID_STATUSES.join(", ")}.` },
      { status: 400 }
    );
  }

  try {
    const updated = await updateOpportunityActionAdmin(id, { status: status as OpportunityActionStatus });
    return Response.json({ ok: true, action: updated });
  } catch (err) {
    console.error("PATCH /api/admin/opportunity-actions/[id] failed:", err);
    const message = err instanceof Error ? err.message : "Failed to update opportunity action.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
