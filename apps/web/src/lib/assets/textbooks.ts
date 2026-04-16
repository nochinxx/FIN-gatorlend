import "server-only";

import {
  assetRecordSchema,
  assetTableRowSchema,
  textbookAssetSchema,
  textbookMetadataSchema,
  type TextbookAsset
} from "@gatorlend/core";
import {
  doesTextbookMetadataMatchChain,
  fetchRegisteredTextbookState,
  finalizeTextbookAssetRegistration
} from "@gatorlend/xrpl/server";
import { z } from "zod";

import { createSupabaseServerClient } from "../supabase/server";

const createTextbookInputSchema = textbookAssetSchema
  .omit({
    id: true,
    xrpl_token_id: true,
    verification_status: true,
    created_at: true,
    updated_at: true
  })
  .extend({
    metadata: textbookMetadataSchema
  });
const finalizeTextbookMintInputSchema = createTextbookInputSchema.extend({
  xrpl_transaction_hash: z.string().min(1)
});

export type CreateTextbookInput = typeof createTextbookInputSchema._type;
export type FinalizeTextbookMintInput = z.infer<typeof finalizeTextbookMintInputSchema>;

export async function createTextbookAsset(
  rawInput: unknown
): Promise<{ asset: TextbookAsset; insertPayload: TextbookAsset }> {
  const input = finalizeTextbookMintInputSchema.parse(rawInput);
  const registration = await finalizeTextbookAssetRegistration({
    owner_wallet: input.owner_wallet,
    image_url: input.image_url,
    metadata: input.metadata,
    transaction_hash: input.xrpl_transaction_hash
  });

  const insertPayload = textbookAssetSchema.parse({
    ...input,
    xrpl_token_id: registration.xrpl_token_id,
    verification_status: registration.verification_status
  });

  const supabase = createSupabaseServerClient();
  const { data: existingAsset, error: existingAssetError } = await supabase
    .from("assets")
    .select("*")
    .eq("xrpl_token_id", registration.xrpl_token_id)
    .maybeSingle();

  if (existingAssetError) {
    throw new Error(`Failed to check existing textbook asset registration: ${existingAssetError.message}`);
  }

  if (existingAsset) {
    const parsedExistingRow = assetTableRowSchema.parse(existingAsset);
    const existingParsedAsset = assetRecordSchema.parse(parsedExistingRow);

    if (existingParsedAsset.asset_type !== "textbook") {
      throw new Error("Expected a textbook asset for an existing XRPL token registration.");
    }

    return {
      asset: existingParsedAsset,
      insertPayload
    };
  }

  const { data, error } = await supabase.from("assets").insert(insertPayload).select("*").single();

  if (error) {
    const { data: retriedAsset, error: retriedAssetError } = await supabase
      .from("assets")
      .select("*")
      .eq("xrpl_token_id", registration.xrpl_token_id)
      .maybeSingle();

    if (retriedAssetError) {
      throw new Error(`Failed to create textbook asset: ${error.message}`);
    }

    if (retriedAsset) {
      const parsedRetriedRow = assetTableRowSchema.parse(retriedAsset);
      const retriedParsedAsset = assetRecordSchema.parse(parsedRetriedRow);

      if (retriedParsedAsset.asset_type !== "textbook") {
        throw new Error("Expected a textbook asset after retrying XRPL registration lookup.");
      }

      return {
        asset: retriedParsedAsset,
        insertPayload
      };
    }

    throw new Error(`Failed to create textbook asset: ${error.message}`);
  }

  const parsedRow = assetTableRowSchema.parse(data);
  const asset = assetRecordSchema.parse(parsedRow);

  if (asset.asset_type !== "textbook") {
    throw new Error("Expected a textbook asset after insert.");
  }

  return {
    asset,
    insertPayload
  };
}

export async function listTextbookAssets(): Promise<TextbookAsset[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("asset_type", "textbook")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list textbook assets: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const parsedRow = assetTableRowSchema.parse(row);
    const asset = assetRecordSchema.parse(parsedRow);

    if (asset.asset_type !== "textbook") {
      throw new Error("Expected textbook assets in textbook catalog query.");
    }

    return asset;
  });
}

export async function getTextbookAssetById(id: string): Promise<TextbookAsset | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("id", id)
    .eq("asset_type", "textbook")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch textbook asset: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const parsedRow = assetTableRowSchema.parse(data);
  const asset = assetRecordSchema.parse(parsedRow);

  if (asset.asset_type !== "textbook") {
    throw new Error("Expected a textbook asset for the requested detail page.");
  }

  return asset;
}

export async function reconcileTextbookAsset(asset: TextbookAsset): Promise<{
  xrplState: Awaited<ReturnType<typeof fetchRegisteredTextbookState>>;
  hasMismatch: boolean;
  expectedMetadataHash: string;
  expectedMetadataUri: string;
}> {
  const xrplState = await fetchRegisteredTextbookState(asset);
  const { expectedMetadataHash, expectedMetadataUri } = doesTextbookMetadataMatchChain(asset);
  const hasMismatch =
    !xrplState.exists ||
    asset.owner_wallet !== xrplState.owner_wallet ||
    asset.xrpl_token_id !== xrplState.xrpl_token_id ||
    xrplState.metadata_hash !== expectedMetadataHash ||
    xrplState.metadata_uri !== expectedMetadataUri;

  return {
    xrplState,
    hasMismatch,
    expectedMetadataHash,
    expectedMetadataUri
  };
}
