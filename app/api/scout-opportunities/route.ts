import { isAuthorizedAdminRequest } from "@/lib/adminAuth";
import { isTavilyConfigured, scoutOpportunities, type ScoutCandidate } from "@/lib/tavily";

export type ScoutResponse =
  | { ok: true; candidates: ScoutCandidate[]; queriesUsed: string[] }
  | { ok: false; error: string };

export async function POST(request: Request): Promise<Response> {
  if (!isAuthorizedAdminRequest(request)) {
    return Response.json(
      { ok: false, error: "Missing or invalid admin token." } satisfies ScoutResponse,
      { status: 401 }
    );
  }

  if (!isTavilyConfigured()) {
    return Response.json(
      {
        ok: false,
        error:
          "TAVILY_API_KEY isn't configured. Add it to your environment — see docs/V0.11-AI-OPPORTUNITY-SCOUT.md.",
      } satisfies ScoutResponse,
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "Invalid request body." } satisfies ScoutResponse,
      { status: 400 }
    );
  }

  const { city, state, pathGoal, routeId, keywords } = (body ?? {}) as {
    city?: string;
    state?: string;
    pathGoal?: string;
    routeId?: string;
    keywords?: string;
  };

  if (!city?.trim() || !pathGoal?.trim() || !routeId?.trim()) {
    return Response.json(
      { ok: false, error: "Missing required fields: city, pathGoal, routeId." } satisfies ScoutResponse,
      { status: 400 }
    );
  }

  try {
    const { candidates, queriesUsed } = await scoutOpportunities({
      city: city.trim(),
      state: state?.trim(),
      pathGoal: pathGoal.trim(),
      routeId: routeId.trim(),
      keywords: keywords?.trim(),
    });
    return Response.json({ ok: true, candidates, queriesUsed } satisfies ScoutResponse);
  } catch (err) {
    console.error("POST /api/scout-opportunities failed:", err);
    const message = err instanceof Error ? err.message : "Scout search failed.";
    return Response.json({ ok: false, error: message } satisfies ScoutResponse, { status: 500 });
  }
}
