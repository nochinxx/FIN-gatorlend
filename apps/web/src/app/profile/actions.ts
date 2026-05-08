"use server";

import { revalidatePath } from "next/cache";

import { saveCurrentUserProfile } from "@/lib/auth/profile";

export type ProfileFormState = {
  error: string | null;
  success: string | null;
};

export async function updateProfileAction(
  _previousState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  try {
    await saveCurrentUserProfile({
      username: String(formData.get("username") ?? ""),
      display_name: String(formData.get("display_name") ?? ""),
      major: String(formData.get("major") ?? ""),
      student_type: String(formData.get("student_type") ?? ""),
      bio: String(formData.get("bio") ?? ""),
      wallet_address: String(formData.get("wallet_address") ?? "")
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update profile.",
      success: null
    };
  }

  revalidatePath("/profile");
  revalidatePath("/marketplace");
  revalidatePath("/listings/new");
  revalidatePath("/my-listings");

  return {
    error: null,
    success: "Profile updated."
  };
}
