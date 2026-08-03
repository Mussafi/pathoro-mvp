import { isAuthorizedAdminRequest } from "@/lib/adminAuth";
import { insertFeedback } from "@/lib/feedbackDb";
import { getFeedbackAdmin } from "@/lib/feedbackAdminDb";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { createFeedbackId, type FeedbackCategory } from "@/lib/feedbackSchema";

const MIN_MESSAGE_LENGTH = 4;
const MAX_MESSAGE_LENGTH = 2000;
const VALID_CATEGORIES: FeedbackCategory[] = [
  "helpful",
  "confusing",
  "wrong",
  "path_request",
  "trail_marker_interest",
  "other",
];

// Admin-only: list all feedback. Never public — a submitter's message and
// contact email are only ever readable with a valid ADMIN_TOKEN.
export async function GET(request: Request): Promise<Response> {
  if (!isAuthorizedAdminRequest(request)) {
    return Response.json(
      { ok: false, error: "Missing or invalid admin token." },
      { status: 401 }
    );
  }

  try {
    const feedback = await getFeedbackAdmin();
    return Response.json({ ok: true, feedback });
  } catch (err) {
    console.error("GET /api/feedback failed:", err);
    return Response.json({ ok: true, feedback: [] });
  }
}

// No admin token required — this is the public "Share feedback" form
// (footer + /contact). Safety mechanism: the anon insert policy in
// supabase/migrations/010_create_feedback.sql only allows status = 'new',
// so submitted feedback can never appear pre-reviewed, and there is no
// public read/update/delete path at all.
export async function POST(request: Request): Promise<Response> {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { ok: false, error: "Supabase isn't configured for this deployment." },
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
    category?: string;
    message?: string;
    pageUrl?: string;
    contactEmail?: string;
  };

  const category = body.category ?? "";
  if (!VALID_CATEGORIES.includes(category as FeedbackCategory)) {
    return Response.json(
      { ok: false, error: `category must be one of: ${VALID_CATEGORIES.join(", ")}.` },
      { status: 400 }
    );
  }

  const message = body.message?.trim() ?? "";
  if (message.length < MIN_MESSAGE_LENGTH) {
    return Response.json(
      { ok: false, error: `Your message needs to be at least ${MIN_MESSAGE_LENGTH} characters.` },
      { status: 400 }
    );
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return Response.json(
      { ok: false, error: `Your message needs to be under ${MAX_MESSAGE_LENGTH} characters.` },
      { status: 400 }
    );
  }

  const contactEmail = body.contactEmail?.trim() ?? "";
  if (contactEmail && !contactEmail.includes("@")) {
    return Response.json({ ok: false, error: "That email address doesn't look right." }, { status: 400 });
  }

  const id = createFeedbackId();

  try {
    await insertFeedback({
      id,
      category: category as FeedbackCategory,
      message,
      pageUrl: body.pageUrl?.trim() ?? "",
      contactEmail,
    });
  } catch (err) {
    console.error("POST /api/feedback failed:", err);
    const errMessage = err instanceof Error ? err.message : "Failed to save feedback.";
    return Response.json({ ok: false, error: errMessage }, { status: 500 });
  }

  return Response.json({
    ok: true,
    id,
    message: "Feedback sent. Thank you.",
  });
}
