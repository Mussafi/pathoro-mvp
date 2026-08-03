import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { FeedbackCategory } from "@/lib/feedbackSchema";

const TABLE = "feedback";

/**
 * Inserts feedback using the public anon client, under Row Level Security
 * (anon may only insert with status = 'new' — see
 * supabase/migrations/010_create_feedback.sql). Same pattern as
 * lib/pathGuideRequestsDb.ts.
 */
export async function insertFeedback(entry: {
  id: string;
  category: FeedbackCategory;
  message: string;
  pageUrl: string;
  contactEmail: string;
}): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase isn't configured.");
  }

  const row = {
    id: entry.id,
    category: entry.category,
    message: entry.message,
    page_url: entry.pageUrl || null,
    contact_email: entry.contactEmail || null,
    status: "new",
  };

  const { error } = await supabase.from(TABLE).insert(row);
  if (error) {
    throw new Error(error.message);
  }
}
