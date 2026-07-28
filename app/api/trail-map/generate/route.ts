import { generateStarterTrailMap } from "@/lib/generatedTrailMaps";

const MIN_GOAL_LENGTH = 2;
const MAX_GOAL_LENGTH = 120;

// Generates a starter Trail Map draft for any goal that doesn't match a
// curated template (see lib/goalSpecificity.ts). No admin token — this
// is a public, read-only generation endpoint with no persistence: every
// call is stateless and produces a fresh confidence: "generated_starter"
// draft, never saved or treated as verified.
export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const body = payload as {
    goalText?: string;
    city?: string;
    state?: string;
    userContext?: string;
  };

  const goalText = body.goalText?.trim() ?? "";
  if (goalText.length < MIN_GOAL_LENGTH || goalText.length > MAX_GOAL_LENGTH) {
    return Response.json(
      { ok: false, error: `Goal text should be between ${MIN_GOAL_LENGTH} and ${MAX_GOAL_LENGTH} characters.` },
      { status: 400 }
    );
  }

  try {
    const goal = generateStarterTrailMap(goalText, {
      city: body.city?.trim() || undefined,
      state: body.state?.trim() || undefined,
      userContext: body.userContext?.trim() || undefined,
    });
    return Response.json({ ok: true, goal });
  } catch (err) {
    console.error("POST /api/trail-map/generate failed:", err);
    return Response.json({ ok: false, error: "Failed to generate a starter map." }, { status: 500 });
  }
}
