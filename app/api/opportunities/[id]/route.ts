import { getLiveOpportunityById } from "@/lib/opportunitiesDb";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    console.error(
      "GET /api/opportunities/[id]: Supabase isn't configured (missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    );
    return Response.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  try {
    const opportunity = await getLiveOpportunityById(id);
    if (!opportunity) {
      return Response.json({ ok: false, error: "Not found." }, { status: 404 });
    }
    return Response.json({ ok: true, opportunity });
  } catch (err) {
    console.error("GET /api/opportunities/[id] failed:", err);
    return Response.json({ ok: false, error: "Not found." }, { status: 404 });
  }
}
