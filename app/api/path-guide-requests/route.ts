import { isAuthorizedAdminRequest } from "@/lib/adminAuth";
import { insertPathGuideRequest } from "@/lib/pathGuideRequestsDb";
import { getPathGuideRequestsAdmin } from "@/lib/pathGuideRequestsAdminDb";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { createPathGuideRequestId } from "@/lib/pathGuideRequestSchema";

const MIN_QUESTION_LENGTH = 8;
const MAX_QUESTION_LENGTH = 800;

// Admin-only: list all path guide requests. Never public — a requester's
// question and contact email are only ever readable with a valid
// ADMIN_TOKEN.
export async function GET(request: Request): Promise<Response> {
  if (!isAuthorizedAdminRequest(request)) {
    return Response.json(
      { ok: false, error: "Missing or invalid admin token." },
      { status: 401 }
    );
  }

  try {
    const requests = await getPathGuideRequestsAdmin();
    return Response.json({ ok: true, requests });
  } catch (err) {
    console.error("GET /api/path-guide-requests failed:", err);
    return Response.json({ ok: true, requests: [] });
  }
}

// No admin token required — this is the public "Find a guide" flow on the
// Trail Map's Path Guide card. Safety mechanism: the anon insert policy in
// supabase/migrations/006_create_path_guide_requests.sql only allows
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
    goalId?: string;
    goalTitle?: string;
    branchId?: string;
    branchTitle?: string;
    question?: string;
    requestedGuideType?: string;
    contactEmail?: string;
  };

  const question = body.question?.trim() ?? "";
  if (question.length < MIN_QUESTION_LENGTH) {
    return Response.json(
      { ok: false, error: `Your question needs to be at least ${MIN_QUESTION_LENGTH} characters.` },
      { status: 400 }
    );
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return Response.json(
      { ok: false, error: `Your question needs to be under ${MAX_QUESTION_LENGTH} characters.` },
      { status: 400 }
    );
  }

  const contactEmail = body.contactEmail?.trim() ?? "";
  if (contactEmail && !contactEmail.includes("@")) {
    return Response.json({ ok: false, error: "That email address doesn't look right." }, { status: 400 });
  }

  const id = createPathGuideRequestId();

  try {
    await insertPathGuideRequest({
      id,
      goalId: body.goalId?.trim() ?? "",
      goalTitle: body.goalTitle?.trim() ?? "",
      branchId: body.branchId?.trim() ?? "",
      branchTitle: body.branchTitle?.trim() ?? "",
      question,
      requestedGuideType: body.requestedGuideType?.trim() ?? "",
      contactEmail,
    });
  } catch (err) {
    console.error("POST /api/path-guide-requests failed:", err);
    const message = err instanceof Error ? err.message : "Failed to save path guide request.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }

  return Response.json({
    ok: true,
    id,
    message: "Path guide request sent.",
  });
}
