"use server";

import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";

export async function submitFeedbackAction(_previousState: { error: string | null }, formData: FormData): Promise<{ error: string | null }> {
  const message = formData.get("message");

  if (typeof message !== "string" || message.trim().length < 3) {
    return { error: "Message must be at least 3 characters." };
  }

  const pageUrl = formData.get("page_url");
  const supabase = await createSupabaseServerAuthClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("feedback").insert({
    message: message.trim(),
    page_url: typeof pageUrl === "string" ? pageUrl : null,
    user_id: user?.id ?? null
  });

  if (error) {
    return { error: "Failed to submit feedback. Please try again." };
  }

  return { error: null };
}
