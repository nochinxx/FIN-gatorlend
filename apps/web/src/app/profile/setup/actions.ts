"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { saveCurrentUserProfile } from "@/lib/auth/profile";

export type ProfileSetupState = {
  error: string | null;
};

function sanitizeNextPath(nextPath: string | null): string {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/marketplace";
  }

  return nextPath;
}

export async function completeProfileSetupAction(
  _previousState: ProfileSetupState,
  formData: FormData
): Promise<ProfileSetupState> {
  const nextPath = sanitizeNextPath(String(formData.get("next_path") ?? ""));

  try {
    await saveCurrentUserProfile({
      username: String(formData.get("username") ?? ""),
      display_name: String(formData.get("display_name") ?? ""),
      major: String(formData.get("major") ?? ""),
      student_type: String(formData.get("student_type") ?? "")
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to complete profile setup."
    };
  }

  revalidatePath("/profile");
  revalidatePath("/marketplace");
  revalidatePath("/my-listings");
  redirect(nextPath);
}
