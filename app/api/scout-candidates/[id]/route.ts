import { isAuthorizedAdminRequest } from "@/lib/adminAuth";
import {
  getScoutCandidateById,
  updateScoutCandidateStatus,
  type ScoutCandidateStatus,
} from "@/lib/scoutCandidatesDb";
import { getScoutRequestByIdAdmin } from "@/lib/scoutRequestsAdminDb";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

const VALID_STATUSES: ScoutCandidateStatus[] = [
  "candidate",
  "sent_to_ingestion",
  "dismissed",
  "promoted",
];

// Public, no admin token: backs the candidate detail page
// (/opportunity/candidate/[id]) — see getScoutCandidateById for why a
// single candidate row is safe to read by id without a token. Includes
// the parent request's routeId/pathGoal/city (not its admin_notes or
// public_token) purely as display/link context, e.g. "Scout similar
// access points" needs to know which goal to scout again for.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  try {
    const candidate = await getScoutCandidateById(id);
    if (!candidate || candidate.status === "dismissed") {
      return Response.json({ ok: false, error: "Candidate not found." }, { status: 404 });
    }

    const parentRequest = await getScoutRequestByIdAdmin(candidate.scoutRequestId);

    return Response.json({
      ok: true,
      candidate,
      routeId: parentRequest?.routeId || candidate.likelyRouteId || "",
      pathGoal: parentRequest?.pathGoal || "",
      city: parentRequest?.city || "",
    });
  } catch (err) {
    console.error("GET /api/scout-candidates/[id] failed:", err);
    return Response.json({ ok: false, error: "Something went wrong." }, { status: 500 });
  }
}

// Admin-only: move a candidate through the review workflow (send to
// ingestion / dismiss / mark promoted). Never public.
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
  if (!status || !VALID_STATUSES.includes(status as ScoutCandidateStatus)) {
    return Response.json(
      { ok: false, error: `status must be one of: ${VALID_STATUSES.join(", ")}.` },
      { status: 400 }
    );
  }

  try {
    const candidate = await updateScoutCandidateStatus(id, status as ScoutCandidateStatus);
    return Response.json({ ok: true, candidate });
  } catch (err) {
    console.error("PATCH /api/scout-candidates/[id] failed:", err);
    const message = err instanceof Error ? err.message : "Failed to update scout candidate.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
