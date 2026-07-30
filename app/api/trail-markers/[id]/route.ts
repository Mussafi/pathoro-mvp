import { isAuthorizedAdminRequest } from "@/lib/adminAuth";
import { moderateTrailMarkerAdmin } from "@/lib/trailMarkersAdminDb";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { isCredibilityType, type CredibilityType } from "@/lib/trailMarkerSchema";

/**
 * Admin moderation — approve / reject / archive, edit moderation notes,
 * and the only path that can upgrade credibility_type to
 * verified_experience or licensed_guide (v0.40 PART 9/10).
 */
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

  const { status, moderationNotes, credibilityType } = payload as {
    status?: string;
    moderationNotes?: string;
    credibilityType?: string;
  };

  if (status !== undefined && !["approved", "rejected", "archived", "pending"].includes(status)) {
    return Response.json(
      { ok: false, error: "status must be one of approved, rejected, archived, pending." },
      { status: 400 }
    );
  }

  if (credibilityType !== undefined && !isCredibilityType(credibilityType)) {
    return Response.json({ ok: false, error: "Invalid credibilityType." }, { status: 400 });
  }

  if (status === undefined && moderationNotes === undefined && credibilityType === undefined) {
    return Response.json(
      { ok: false, error: "Provide at least one of status, moderationNotes, credibilityType." },
      { status: 400 }
    );
  }

  try {
    const marker = await moderateTrailMarkerAdmin(id, {
      status: status as "approved" | "rejected" | "archived" | "pending" | undefined,
      moderationNotes,
      credibilityType: credibilityType as CredibilityType | undefined,
    });
    return Response.json({ ok: true, marker });
  } catch (err) {
    console.error("PATCH /api/trail-markers/[id] failed:", err);
    const message = err instanceof Error ? err.message : "Failed to update trail marker.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
