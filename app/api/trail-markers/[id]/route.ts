import { isAuthorizedAdminRequest } from "@/lib/adminAuth";
import { setTrailMarkerStatusAdmin } from "@/lib/trailMarkersAdminDb";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

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
  if (status !== "live" && status !== "rejected") {
    return Response.json(
      { ok: false, error: "status must be 'live' or 'rejected'." },
      { status: 400 }
    );
  }

  try {
    const marker = await setTrailMarkerStatusAdmin(id, status);
    return Response.json({ ok: true, marker });
  } catch (err) {
    console.error("PATCH /api/trail-markers/[id] failed:", err);
    const message = err instanceof Error ? err.message : "Failed to update trail marker.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
