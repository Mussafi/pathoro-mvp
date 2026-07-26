import { isAuthorizedAdminRequest } from "@/lib/adminAuth";
import { getLiveTrailMarkers } from "@/lib/trailMarkersDb";
import { getNeedsReviewTrailMarkers, insertTrailMarkerAdmin } from "@/lib/trailMarkersAdminDb";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import {
  createTrailMarkerId,
  isMarkerType,
  isValidMarkerBody,
  TRAIL_MARKER_BODY_MAX_LENGTH,
  TRAIL_MARKER_BODY_MIN_LENGTH,
  type MarkerType,
} from "@/lib/trailMarkerSchema";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const opportunityId = searchParams.get("opportunityId") ?? undefined;
  const routeId = searchParams.get("routeId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  if (!isSupabaseConfigured()) {
    return Response.json({ ok: true, markers: [] });
  }

  // Admin-only path: list markers awaiting review. Never public — the
  // needs_review queue can only be read with a valid ADMIN_TOKEN.
  if (status === "needs_review") {
    if (!isAuthorizedAdminRequest(request)) {
      return Response.json(
        { ok: false, error: "Missing or invalid admin token." },
        { status: 401 }
      );
    }
    try {
      const markers = await getNeedsReviewTrailMarkers();
      return Response.json({ ok: true, markers });
    } catch (err) {
      console.error("GET /api/trail-markers?status=needs_review failed:", err);
      return Response.json({ ok: true, markers: [] });
    }
  }

  if (!opportunityId && !routeId) {
    return Response.json(
      { ok: false, error: "Provide opportunityId and/or routeId." },
      { status: 400 }
    );
  }

  try {
    const markers = await getLiveTrailMarkers({ opportunityId, routeId });
    return Response.json({ ok: true, markers });
  } catch (err) {
    console.error("GET /api/trail-markers failed:", err);
    return Response.json({ ok: true, markers: [] });
  }
}

// No admin token required — anyone walking a path can leave a trail
// marker. This is intentionally not gated the way opportunity approval is;
// the safety mechanism is that every marker is forced to needs_review
// below and never reaches the public GET until an admin approves it.
export async function POST(request: Request): Promise<Response> {
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

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const body = payload as {
    opportunityId?: string;
    routeId?: string;
    markerType?: string;
    body?: string;
    displayName?: string;
    city?: string;
  };

  if (!body.opportunityId?.trim() && !body.routeId?.trim()) {
    return Response.json(
      { ok: false, error: "A trail marker needs an opportunityId or routeId." },
      { status: 400 }
    );
  }

  if (!isMarkerType(body.markerType)) {
    return Response.json(
      { ok: false, error: "Missing or invalid markerType." },
      { status: 400 }
    );
  }

  if (!body.body || !isValidMarkerBody(body.body)) {
    return Response.json(
      {
        ok: false,
        error: `Trail marker text must be between ${TRAIL_MARKER_BODY_MIN_LENGTH} and ${TRAIL_MARKER_BODY_MAX_LENGTH} characters.`,
      },
      { status: 400 }
    );
  }

  try {
    const marker = await insertTrailMarkerAdmin({
      id: createTrailMarkerId(),
      opportunityId: body.opportunityId?.trim() || null,
      routeId: body.routeId?.trim() || null,
      markerType: body.markerType as MarkerType,
      body: body.body.trim(),
      displayName: body.displayName?.trim() ?? "",
      city: body.city?.trim() ?? "",
    });
    return Response.json({
      ok: true,
      marker,
      message: "Trail marker submitted for review.",
    });
  } catch (err) {
    console.error("POST /api/trail-markers failed:", err);
    const message = err instanceof Error ? err.message : "Failed to save trail marker.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
