import { getScoutRequestByIdAdmin } from "@/lib/scoutRequestsAdminDb";
import { getLiveOpportunities } from "@/lib/opportunitiesDb";
import type { PublicScoutRequest } from "@/lib/scoutRequestSchema";

// Public, token-gated: this is the one place a user without an admin
// token can read a scout_requests row. Looked up server-side with the
// service role key (bypasses RLS), then gated here by comparing the
// token — never via an anon RLS select policy, so there is no way to
// enumerate or read another request's row, and admin-only fields
// (admin_notes, the token itself) are stripped before the response goes
// out regardless of whether the token matched.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return Response.json(
      { ok: false, error: "Missing token." },
      { status: 400 }
    );
  }

  try {
    const scoutRequest = await getScoutRequestByIdAdmin(id);
    if (!scoutRequest || !scoutRequest.publicToken || scoutRequest.publicToken !== token) {
      return Response.json(
        { ok: false, error: "Scout request not found." },
        { status: 404 }
      );
    }

    const opportunities = await getLiveOpportunities({
      routeId: scoutRequest.routeId || undefined,
      city: scoutRequest.city || undefined,
    });

    const publicRequest: PublicScoutRequest = {
      id: scoutRequest.id,
      city: scoutRequest.city,
      state: scoutRequest.state,
      routeId: scoutRequest.routeId,
      pathGoal: scoutRequest.pathGoal,
      status: scoutRequest.status,
      resultSummary: scoutRequest.resultSummary,
      createdAt: scoutRequest.createdAt,
      updatedAt: scoutRequest.updatedAt,
      reviewedAt: scoutRequest.reviewedAt,
      respondedAt: scoutRequest.respondedAt,
    };

    return Response.json({ ok: true, request: publicRequest, opportunities });
  } catch (err) {
    console.error("GET /api/scout-requests/[id]/public failed:", err);
    return Response.json(
      { ok: false, error: "Something went wrong loading this request." },
      { status: 500 }
    );
  }
}
