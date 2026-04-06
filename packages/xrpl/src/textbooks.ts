import { createHash } from "node:crypto";

export type TextbookMetadataSnapshot = {
  title: string;
  author: string;
  isbn: string;
  course_code: string;
  edition: string;
  condition: string;
};

export type TextbookMintDraft = {
  owner_wallet: string;
  image_url?: string;
  metadata: TextbookMetadataSnapshot;
};

export type RegisteredTextbookState = {
  asset_type: "textbook";
  owner_wallet: string;
  xrpl_token_id: string;
  metadata: TextbookMetadataSnapshot;
};

function createDeterministicTokenId(draft: TextbookMintDraft): string {
  return createHash("sha256")
    .update(`${draft.owner_wallet}:${draft.metadata.isbn}:${draft.metadata.course_code}`)
    .digest("hex")
    .toUpperCase()
    .slice(0, 32);
}

export async function registerTextbookAssetPlaceholder(
  draft: TextbookMintDraft
): Promise<{ xrpl_token_id: string; verification_status: "pending" }> {
  // TODO: replace this with a real server-side XLS-20 mint/register flow.
  // Keep privileged XRPL logic off the client.
  return {
    xrpl_token_id: createDeterministicTokenId(draft),
    verification_status: "pending"
  };
}

export async function fetchRegisteredTextbookStatePlaceholder(
  asset: {
    owner_wallet: string;
    xrpl_token_id: string;
    metadata: TextbookMetadataSnapshot;
  }
): Promise<RegisteredTextbookState> {
  // TODO: replace this with on-chain XRPL lookups for owner and XLS-20 token state.
  const metadata =
    asset.xrpl_token_id.startsWith("MISMATCH")
      ? {
          ...asset.metadata,
          edition: `${asset.metadata.edition} (XRPL mismatch mock)`
        }
      : asset.metadata;

  return {
    asset_type: "textbook",
    owner_wallet: asset.owner_wallet,
    xrpl_token_id: asset.xrpl_token_id,
    metadata
  };
}
