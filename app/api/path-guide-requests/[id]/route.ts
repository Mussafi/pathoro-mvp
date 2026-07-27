import { isAuthorizedAdminRequest } from "@/lib/adminAuth";
import { updatePathGuideRequestAdmin } from "@/lib/pathGuideRequestsAdminDb";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import type { PathGuideRequestStatus } from "@/lib/pathGuideRequestSchema";

const VALID_STATUSES: PathGuideRequestStatus[] = ["new", "reviewed", "matched", "rejected"];

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
  if (!status || !VALID_STATUSES.includes(status as PathGuideRequestStatus)) {
    return Response.json(
      { ok: false, error: `status must be one of: ${VALID_STATUSES.join(", ")}.` },
      { status: 400 }
    );
  }

  try {
    const updated = await updatePathGuideRequestAdmin(id, { status: status as PathGuideRequestStatus });
    return Response.json({ ok: true, request: updated });
  } catch (err) {
    console.error("PATCH /api/path-guide-requests/[id] failed:", err);
    const message = err instanceof Error ? err.message : "Failed to update path guide request.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
