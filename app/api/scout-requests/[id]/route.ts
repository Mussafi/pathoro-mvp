import { isAuthorizedAdminRequest } from "@/lib/adminAuth";
import { updateScoutRequestAdmin } from "@/lib/scoutRequestsAdminDb";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import type { ScoutRequestStatus } from "@/lib/scoutRequestSchema";

const VALID_STATUSES: ScoutRequestStatus[] = ["new", "reviewed", "scouted", "rejected"];

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

  const { status, adminNotes, resultSummary } = payload as {
    status?: string;
    adminNotes?: string;
    resultSummary?: string;
  };
  if (status !== undefined && !VALID_STATUSES.includes(status as ScoutRequestStatus)) {
    return Response.json(
      { ok: false, error: `status must be one of: ${VALID_STATUSES.join(", ")}.` },
      { status: 400 }
    );
  }

  try {
    const scoutRequest = await updateScoutRequestAdmin(id, {
      status: status as ScoutRequestStatus | undefined,
      adminNotes,
      resultSummary,
    });
    return Response.json({ ok: true, request: scoutRequest });
  } catch (err) {
    console.error("PATCH /api/scout-requests/[id] failed:", err);
    const message = err instanceof Error ? err.message : "Failed to update scout request.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
