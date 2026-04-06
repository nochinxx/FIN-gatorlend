"use server";

import { redirect } from "next/navigation";

import { createTextbookAsset } from "@/lib/assets/textbooks";

export type CreateTextbookFormState = {
  error?: string;
};

export async function createTextbookAction(
  _previousState: CreateTextbookFormState,
  formData: FormData
): Promise<CreateTextbookFormState> {
  let assetId: string | undefined;

  try {
    const imageUrlValue = formData.get("image_url");

    const result = await createTextbookAsset({
      asset_type: "textbook",
      owner_wallet: String(formData.get("owner_wallet") ?? ""),
      image_url: typeof imageUrlValue === "string" ? imageUrlValue : "",
      metadata: {
        title: String(formData.get("title") ?? ""),
        author: String(formData.get("author") ?? ""),
        isbn: String(formData.get("isbn") ?? ""),
        course_code: String(formData.get("course_code") ?? ""),
        edition: String(formData.get("edition") ?? ""),
        condition: String(formData.get("condition") ?? "")
      }
    });
    assetId = result.asset.id;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create textbook asset."
    };
  }

  if (!assetId) {
    return {
      error: "Textbook asset was created without a usable id."
    };
  }

  redirect(`/assets/${assetId}`);
}
