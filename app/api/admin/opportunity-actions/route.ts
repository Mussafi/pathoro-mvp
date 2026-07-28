import { isAuthorizedAdminRequest } from "@/lib/adminAuth";
import { getOpportunityActionsAdmin } from "@/lib/opportunityActionsAdminDb";

// Admin-only: list all opportunity actions. Never public — a requester's
// name, email, and message are only ever readable with a valid ADMIN_TOKEN.
export async function GET(request: Request): Promise<Response> {
  if (!isAuthorizedAdminRequest(request)) {
    return Response.json(
      { ok: false, error: "Missing or invalid admin token." },
      { status: 401 }
    );
  }

  try {
    const actions = await getOpportunityActionsAdmin();
    return Response.json({ ok: true, actions });
  } catch (err) {
    console.error("GET /api/admin/opportunity-actions failed:", err);
    return Response.json({ ok: true, actions: [] });
  }
}
