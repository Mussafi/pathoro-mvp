import { isAuthorizedAdminRequest } from "@/lib/adminAuth";
import { updateScoutCandidateStatus, type ScoutCandidateStatus } from "@/lib/scoutCandidatesDb";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

const VALID_STATUSES: ScoutCandidateStatus[] = [
  "candidate",
  "sent_to_ingestion",
  "dismissed",
  "promoted",
];

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
