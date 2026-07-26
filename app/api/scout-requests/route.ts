import { isAuthorizedAdminRequest } from "@/lib/adminAuth";
import { insertScoutRequest } from "@/lib/scoutRequestsDb";
import { getScoutRequestsAdmin } from "@/lib/scoutRequestsAdminDb";
import { getScoutCandidatesForRequests, saveScoutCandidates } from "@/lib/scoutCandidatesDb";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { createScoutRequestId } from "@/lib/scoutRequestSchema";
import { isTavilyConfigured, scoutOpportunities } from "@/lib/tavily";

// Admin-only: list all scout requests, each with its saved AI-found
// candidates. Never public — a real user's requested path/city is only
// ever readable with a valid ADMIN_TOKEN.
export async function GET(request: Request): Promise<Response> {
  if (!isAuthorizedAdminRequest(request)) {
    return Response.json(
      { ok: false, error: "Missing or invalid admin token." },
      { status: 401 }
    );
  }

  try {
    const requests = await getScoutRequestsAdmin();
    const candidatesByRequestId = await getScoutCandidatesForRequests(requests.map((r) => r.id));
    const requestsWithCandidates = requests.map((r) => ({
      ...r,
      candidates: candidatesByRequestId[r.id] ?? [],
    }));
    return Response.json({ ok: true, requests: requestsWithCandidates });
  } catch (err) {
    console.error("GET /api/scout-requests failed:", err);
    return Response.json({ ok: true, requests: [] });
  }
}

// No admin token required — this is the public "Request scout" CTA on
// /route-planning. Safety mechanism: the anon insert policy in
// supabase/migrations/003_create_scout_requests.sql only allows
// status = 'new', so a submitted request can never appear pre-reviewed,
// and there is no public read/update/delete path at all.
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
    city?: string;
    state?: string;
    routeId?: string;
    pathGoal?: string;
    userContext?: string;
    requestedFromPage?: string;
  };

  if (!body.city?.trim() || !body.routeId?.trim() || !body.pathGoal?.trim()) {
    return Response.json(
      { ok: false, error: "Missing required fields: city, routeId, pathGoal." },
      { status: 400 }
    );
  }

  const id = createScoutRequestId();
  const city = body.city.trim();
  const state = body.state?.trim() ?? "";
  const routeId = body.routeId.trim();
  const pathGoal = body.pathGoal.trim();

  let publicToken: string;
  try {
    ({ publicToken } = await insertScoutRequest({
      id,
      city,
      state,
      routeId,
      pathGoal,
      userContext: body.userContext?.trim() ?? "",
      requestedFromPage: body.requestedFromPage?.trim() ?? "",
    }));
  } catch (err) {
    console.error("POST /api/scout-requests failed:", err);
    const message = err instanceof Error ? err.message : "Failed to save scout request.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }

  // Automatically run the same scout used by /admin/opportunity-scout so
  // the requester sees something without waiting on manual admin work.
  // This never fails the request itself — the scout_requests row above is
  // already saved either way, and the result page falls back to "still
  // looking" copy when there are no candidates yet.
  if (isTavilyConfigured()) {
    try {
      const { candidates } = await scoutOpportunities({ city, state, pathGoal, routeId });
      await saveScoutCandidates(id, candidates);
    } catch (err) {
      console.error(`Automatic scout failed for request ${id}:`, err);
    }
  } else {
    console.error(`Automatic scout skipped for request ${id}: TAVILY_API_KEY isn't configured.`);
  }

  return Response.json({
    ok: true,
    message: "Scout request sent. Pathoro will look for real-world access points for this route.",
    id,
    publicToken,
    resultUrl: `/scout-request/${id}?token=${publicToken}`,
  });
}
