import { isAuthorizedAdminRequest } from "@/lib/adminAuth";
import { getApprovedTrailMarkers, type TrailMarkerFilters } from "@/lib/trailMarkersDb";
import {
  getAllTrailMarkersAdmin,
  getPendingTrailMarkers,
  insertTrailMarkerAdmin,
} from "@/lib/trailMarkersAdminDb";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import {
  createTrailMarkerId,
  isContextType,
  isMarkerType,
  isValidMarkerBody,
  TRAIL_MARKER_AUTHOR_NAME_MAX_LENGTH,
  TRAIL_MARKER_BODY_MAX_LENGTH,
  TRAIL_MARKER_BODY_MIN_LENGTH,
  TRAIL_MARKER_EXPERIENCE_LABEL_MAX_LENGTH,
  type ContextType,
  type MarkerType,
} from "@/lib/trailMarkerSchema";

// Every context_type needs a specific id (or goal, for the goal-level
// trail_map context) attached — a marker is never posted context-free
// (see docs/MVP-LOCKED-PRINCIPLES.md#trail-markers-not-comments).
function missingContextError(
  contextType: ContextType,
  ids: { goal?: string; routeId?: string; branchId?: string; milestoneId?: string; opportunityId?: string; candidateId?: string }
): string | null {
  switch (contextType) {
    case "trail_map":
      return ids.goal?.trim() ? null : "trail_map markers need a goal.";
    case "branch":
      return ids.goal?.trim() && ids.branchId?.trim()
        ? null
        : "branch markers need a goal and branchId.";
    case "milestone":
      return ids.goal?.trim() && ids.milestoneId?.trim()
        ? null
        : "milestone markers need a goal and milestoneId.";
    case "opportunity":
      return ids.opportunityId?.trim() ? null : "opportunity markers need an opportunityId.";
    case "candidate_opportunity":
      return ids.candidateId?.trim() ? null : "candidate_opportunity markers need a candidateId.";
    case "route":
      return ids.routeId?.trim() ? null : "route markers need a routeId.";
    default:
      return "Unknown context_type.";
  }
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;

  if (!isSupabaseConfigured()) {
    return Response.json({ ok: true, markers: [] });
  }

  // Admin-only paths: the moderation queue and the full history. Never
  // public — both require a valid ADMIN_TOKEN.
  if (status === "pending" || status === "all") {
    if (!isAuthorizedAdminRequest(request)) {
      return Response.json(
        { ok: false, error: "Missing or invalid admin token." },
        { status: 401 }
      );
    }
    try {
      const markers = status === "all" ? await getAllTrailMarkersAdmin() : await getPendingTrailMarkers();
      return Response.json({ ok: true, markers });
    } catch (err) {
      console.error(`GET /api/trail-markers?status=${status} failed:`, err);
      return Response.json({ ok: true, markers: [] });
    }
  }

  const filters: TrailMarkerFilters = {
    goal: searchParams.get("goal") ?? undefined,
    branchId: searchParams.get("branchId") ?? undefined,
    milestoneId: searchParams.get("milestoneId") ?? undefined,
    opportunityId: searchParams.get("opportunityId") ?? undefined,
    candidateId: searchParams.get("candidateId") ?? undefined,
    routeId: searchParams.get("routeId") ?? undefined,
    contextType: isContextType(searchParams.get("contextType") ?? undefined)
      ? (searchParams.get("contextType") as ContextType)
      : undefined,
  };

  if (
    !filters.goal &&
    !filters.branchId &&
    !filters.milestoneId &&
    !filters.opportunityId &&
    !filters.candidateId &&
    !filters.routeId &&
    !filters.contextType
  ) {
    return Response.json(
      { ok: false, error: "Provide at least one filter (goal, branchId, milestoneId, opportunityId, candidateId, routeId, or contextType)." },
      { status: 400 }
    );
  }

  try {
    const markers = await getApprovedTrailMarkers(filters);
    return Response.json({ ok: true, markers });
  } catch (err) {
    console.error("GET /api/trail-markers failed:", err);
    return Response.json({ ok: true, markers: [] });
  }
}

// No admin token required — anyone walking a path can leave a trail
// marker. This is intentionally not gated the way opportunity approval is;
// the safety mechanism is that every marker is forced to status = pending
// below and never reaches a public GET until an admin approves it. Status
// and credibility_type are never read from the request body at all — both
// are decided entirely server-side, so a public submitter has no way to
// mark themselves approved, verified, or licensed (v0.40 PART 3/10).
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
    contextType?: string;
    goal?: string;
    routeId?: string;
    trailGoal?: string;
    branchId?: string;
    milestoneId?: string;
    opportunityId?: string;
    candidateId?: string;
    markerType?: string;
    body?: string;
    authorName?: string;
    authorRole?: string;
    experienceLabel?: string;
    contactEmail?: string;
  };

  if (!isContextType(body.contextType)) {
    return Response.json(
      { ok: false, error: "Missing or invalid contextType." },
      { status: 400 }
    );
  }
  const contextType = body.contextType;

  const contextError = missingContextError(contextType, body);
  if (contextError) {
    return Response.json({ ok: false, error: contextError }, { status: 400 });
  }

  if (!isMarkerType(body.markerType)) {
    return Response.json({ ok: false, error: "Missing or invalid markerType." }, { status: 400 });
  }
  const markerType = body.markerType as MarkerType;

  if (
    markerType === "opportunity_check" &&
    contextType !== "opportunity" &&
    contextType !== "candidate_opportunity"
  ) {
    return Response.json(
      { ok: false, error: "opportunity_check markers must use contextType opportunity or candidate_opportunity." },
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

  const authorName = (body.authorName ?? "").trim().slice(0, TRAIL_MARKER_AUTHOR_NAME_MAX_LENGTH);
  const experienceLabel = (body.experienceLabel ?? "")
    .trim()
    .slice(0, TRAIL_MARKER_EXPERIENCE_LABEL_MAX_LENGTH);
  const authorRole = (body.authorRole ?? "").trim().slice(0, TRAIL_MARKER_EXPERIENCE_LABEL_MAX_LENGTH);
  const contactEmail = (body.contactEmail ?? "").trim();

  try {
    const marker = await insertTrailMarkerAdmin({
      id: createTrailMarkerId(),
      contextType,
      goal: (body.goal ?? "").trim(),
      routeId: body.routeId?.trim() || null,
      trailGoal: body.trailGoal?.trim() || null,
      branchId: body.branchId?.trim() || null,
      milestoneId: body.milestoneId?.trim() || null,
      opportunityId: body.opportunityId?.trim() || null,
      candidateId: body.candidateId?.trim() || null,
      markerType,
      body: body.body.trim(),
      authorName,
      authorRole,
      experienceLabel,
      contactEmail,
    });
    return Response.json({
      ok: true,
      marker,
      message: "Thanks — Pathoro will review this before it appears on the path.",
    });
  } catch (err) {
    console.error("POST /api/trail-markers failed:", err);
    const message = err instanceof Error ? err.message : "Failed to save trail marker.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
