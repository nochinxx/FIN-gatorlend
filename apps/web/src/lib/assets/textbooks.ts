import "server-only";

import {
  assetRecordSchema,
  assetTableRowSchema,
  textbookAssetSchema,
  textbookMetadataSchema,
  type TextbookAsset
} from "@gatorlend/core";
import {
  fetchRegisteredTextbookStatePlaceholder,
  registerTextbookAssetPlaceholder
} from "@gatorlend/xrpl";

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

export type CreateTextbookInput = typeof createTextbookInputSchema._type;

export async function createTextbookAsset(
  rawInput: unknown
): Promise<{ asset: TextbookAsset; insertPayload: TextbookAsset }> {
  const input = createTextbookInputSchema.parse(rawInput);
  const registration = await registerTextbookAssetPlaceholder({
    owner_wallet: input.owner_wallet,
    image_url: input.image_url,
    metadata: input.metadata
  });

  const insertPayload = textbookAssetSchema.parse({
    ...input,
    xrpl_token_id: registration.xrpl_token_id,
    verification_status: registration.verification_status
  });

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("assets")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
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
  xrplState: Awaited<ReturnType<typeof fetchRegisteredTextbookStatePlaceholder>>;
  hasMismatch: boolean;
}> {
  const xrplState = await fetchRegisteredTextbookStatePlaceholder(asset);
  const hasMismatch =
    asset.owner_wallet !== xrplState.owner_wallet ||
    asset.xrpl_token_id !== xrplState.xrpl_token_id ||
    JSON.stringify(asset.metadata) !== JSON.stringify(xrplState.metadata);

  return {
    xrplState,
    hasMismatch
  };
}
