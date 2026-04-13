"use server";

import { createTextbookMintTransaction, type PreparedTextbookMintTransaction } from "@gatorlend/xrpl/server";
import { textbookMetadataSchema } from "@gatorlend/core";
import { z } from "zod";

import { createTextbookAsset, type FinalizeTextbookMintInput } from "@/lib/assets/textbooks";

const createTextbookDraftSchema = z.object({
  owner_wallet: z.string().min(1),
  image_url: z.string().url().or(z.literal("")),
  metadata: textbookMetadataSchema
});

export type FinalizeTextbookMintActionResult =
  | {
      ok: true;
      assetId: string;
    }
  | {
      ok: false;
      error: string;
    };

export async function prepareTextbookMintAction(
  rawInput: unknown
): Promise<PreparedTextbookMintTransaction> {
  const input = createTextbookDraftSchema.parse(rawInput);

  return createTextbookMintTransaction(input);
}

export async function finalizeTextbookMintAction(
  input: FinalizeTextbookMintInput
): Promise<FinalizeTextbookMintActionResult> {
  try {
    const result = await createTextbookAsset(input);
    const assetId = result.asset.id;

    if (!assetId) {
      return {
        ok: false,
        error: "Textbook asset was created without a usable id."
      };
    }

    return {
      ok: true,
      assetId
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to finalize textbook mint."
    };
  }
}
