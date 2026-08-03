import "server-only";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import type { Feedback, FeedbackCategory, FeedbackStatus } from "@/lib/feedbackSchema";

const TABLE = "feedback";

type FeedbackRow = {
  id: string;
  category: string;
  message: string;
  page_url: string | null;
  contact_email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

function rowToFeedback(row: FeedbackRow): Feedback {
  return {
    id: row.id,
    category: row.category as FeedbackCategory,
    message: row.message,
    pageUrl: row.page_url ?? "",
    contactEmail: row.contact_email ?? "",
    status: row.status as FeedbackStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Lists all feedback, newest first. Admin-only (service role key). */
export async function getFeedbackAdmin(): Promise<Feedback[]> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getFeedbackAdmin query failed:", error.message);
    return [];
  }
  if (!data) return [];
  return data.map(rowToFeedback);
}

/** Updates a feedback entry's status. Admin-only. */
export async function updateFeedbackAdmin(
  id: string,
  updates: { status: FeedbackStatus }
): Promise<Feedback> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    throw new Error(
      "Supabase admin client isn't configured — check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ status: updates.status })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update feedback.");
  }

  return rowToFeedback(data);
}
