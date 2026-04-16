import { createHash } from "node:crypto";

import { createXrplClient } from "./client";

const TEXTBOOK_URI_PREFIX = "gatorlend:textbook:";
const NFT_PAGE_LIMIT = 400;
const TX_VALIDATION_RETRY_COUNT = 8;
const TX_VALIDATION_RETRY_MS = 1_500;
const TF_TRANSFERABLE = 8;

type UnknownRecord = Record<string, unknown>;

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

export type PreparedTextbookMintTransaction = {
  TransactionType: "NFTokenMint";
  Account: string;
  URI: string;
  Flags: number;
  NFTokenTaxon: number;
};

export type FinalizeTextbookRegistrationInput = TextbookMintDraft & {
  transaction_hash: string;
};

export type FinalizedTextbookRegistration = {
  asset_type: "textbook";
  owner_wallet: string;
  xrpl_token_id: string;
  verification_status: "verified";
  transaction_hash: string;
  metadata_hash: string;
  metadata_uri: string;
};

export type RegisteredTextbookState = {
  asset_type: "textbook";
  owner_wallet: string;
  xrpl_token_id: string;
  metadata: TextbookMetadataSnapshot;
  metadata_hash: string | null;
  metadata_uri: string | null;
  exists: boolean;
};

type XrplTransactionState = {
  account: string | null;
  hash: string | null;
  uriHex: string | null;
  transactionType: string | null;
  transactionResult: string | null;
  validated: boolean;
};

type AccountNftRecord = {
  NFTokenID: string;
  URI: string | null;
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function getString(record: UnknownRecord, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function getBoolean(record: UnknownRecord, key: string): boolean | null {
  const value = record[key];
  return typeof value === "boolean" ? value : null;
}

function getArray(record: UnknownRecord, key: string): unknown[] {
  const value = record[key];
  return Array.isArray(value) ? value : [];
}

function createTextbookMetadataPayload(draft: TextbookMintDraft): string {
  return JSON.stringify({
    asset_type: "textbook",
    schema_version: 1,
    image_url: draft.image_url ?? "",
    metadata: {
      title: draft.metadata.title,
      author: draft.metadata.author,
      isbn: draft.metadata.isbn,
      course_code: draft.metadata.course_code,
      edition: draft.metadata.edition,
      condition: draft.metadata.condition
    }
  });
}

function createTextbookMetadataHash(draft: TextbookMintDraft): string {
  return createHash("sha256").update(createTextbookMetadataPayload(draft)).digest("hex").toUpperCase();
}

function encodeUtf8ToHex(value: string): string {
  return Buffer.from(value, "utf8").toString("hex").toUpperCase();
}

function decodeHexToUtf8(value: string): string {
  return Buffer.from(value, "hex").toString("utf8");
}

function normalizeHex(value: string): string {
  return value.trim().toUpperCase();
}

function createCommittedMetadataUri(draft: TextbookMintDraft): { metadataHash: string; metadataUri: string } {
  const metadataHash = createTextbookMetadataHash(draft);

  return {
    metadataHash,
    metadataUri: `${TEXTBOOK_URI_PREFIX}${metadataHash}`
  };
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchValidatedTransactionState(transactionHash: string): Promise<XrplTransactionState> {
  const client = createXrplClient();

  await client.connect();

  try {
    for (let attempt = 0; attempt < TX_VALIDATION_RETRY_COUNT; attempt += 1) {
      try {
        const response = await client.request({
          command: "tx",
          transaction: transactionHash
        });
        const result = isRecord(response.result) ? response.result : null;
        const meta = result && isRecord(result.meta) ? result.meta : null;
        const validated = result ? getBoolean(result, "validated") === true : false;
        const transactionState: XrplTransactionState = {
          account: result ? getString(result, "Account") : null,
          hash: result ? getString(result, "hash") : null,
          uriHex: result ? getString(result, "URI") : null,
          transactionType: result ? getString(result, "TransactionType") : null,
          transactionResult: meta ? getString(meta, "TransactionResult") : null,
          validated
        };

        if (transactionState.validated) {
          return transactionState;
        }
      } catch (error) {
        if (attempt === TX_VALIDATION_RETRY_COUNT - 1) {
          throw error;
        }
      }

      await sleep(TX_VALIDATION_RETRY_MS);
    }
  } finally {
    await client.disconnect();
  }

  throw new Error("XRPL mint transaction was not validated before the timeout.");
}

async function findAccountNftByTokenIdOrUri(input: {
  account: string;
  expectedTokenId?: string;
  expectedUriHex?: string;
}): Promise<AccountNftRecord | null> {
  const client = createXrplClient();
  const expectedTokenId = input.expectedTokenId ? normalizeHex(input.expectedTokenId) : null;
  const expectedUriHex = input.expectedUriHex ? normalizeHex(input.expectedUriHex) : null;

  await client.connect();

  try {
    let marker: unknown = undefined;

    while (true) {
      const response = await client.request({
        command: "account_nfts",
        account: input.account,
        limit: NFT_PAGE_LIMIT,
        marker
      });
      const result = isRecord(response.result) ? response.result : null;
      const accountNfts = result ? getArray(result, "account_nfts") : [];

      for (const candidate of accountNfts) {
        if (!isRecord(candidate)) {
          continue;
        }

        const nftTokenId = getString(candidate, "NFTokenID");
        const uriHex = getString(candidate, "URI");

        if (!nftTokenId) {
          continue;
        }

        const tokenMatches = expectedTokenId ? normalizeHex(nftTokenId) === expectedTokenId : false;
        const uriMatches = expectedUriHex && uriHex ? normalizeHex(uriHex) === expectedUriHex : false;

        if (tokenMatches || uriMatches) {
          return {
            NFTokenID: normalizeHex(nftTokenId),
            URI: uriHex ? normalizeHex(uriHex) : null
          };
        }
      }

      marker = result?.marker;

      if (!marker) {
        return null;
      }
    }
  } finally {
    await client.disconnect();
  }
}

export function createTextbookMintTransaction(draft: TextbookMintDraft): PreparedTextbookMintTransaction {
  const { metadataUri } = createCommittedMetadataUri(draft);

  return {
    TransactionType: "NFTokenMint",
    Account: draft.owner_wallet,
    URI: encodeUtf8ToHex(metadataUri),
    Flags: TF_TRANSFERABLE,
    NFTokenTaxon: 0
  };
}

export async function finalizeTextbookAssetRegistration(
  input: FinalizeTextbookRegistrationInput
): Promise<FinalizedTextbookRegistration> {
  const transactionHash = input.transaction_hash.trim();

  if (!transactionHash) {
    throw new Error("Missing XRPL transaction hash for textbook mint finalization.");
  }

  const expectedTransaction = createTextbookMintTransaction(input);
  const expectedUriHex = normalizeHex(expectedTransaction.URI);
  const { metadataHash, metadataUri } = createCommittedMetadataUri(input);
  const transactionState = await fetchValidatedTransactionState(transactionHash);

  if (!transactionState.validated) {
    throw new Error("XRPL mint transaction is not validated yet.");
  }

  if (transactionState.transactionType !== "NFTokenMint") {
    throw new Error("XRPL transaction was not an NFTokenMint.");
  }

  if (transactionState.transactionResult !== "tesSUCCESS") {
    throw new Error(
      `XRPL mint transaction did not succeed. Received ${transactionState.transactionResult ?? "unknown result"}.`
    );
  }

  if (!transactionState.account || transactionState.account !== input.owner_wallet) {
    throw new Error("XRPL mint transaction account does not match the connected wallet.");
  }

  if (!transactionState.uriHex || normalizeHex(transactionState.uriHex) !== expectedUriHex) {
    throw new Error("XRPL mint transaction URI does not match the expected textbook metadata commitment.");
  }

  const nftRecord = await findAccountNftByTokenIdOrUri({
    account: input.owner_wallet,
    expectedUriHex
  });

  if (!nftRecord) {
    throw new Error("Minted XRPL NFT was not found on the owner account after validation.");
  }

  return {
    asset_type: "textbook",
    owner_wallet: input.owner_wallet,
    xrpl_token_id: nftRecord.NFTokenID,
    verification_status: "verified",
    transaction_hash: transactionState.hash ?? transactionHash,
    metadata_hash: metadataHash,
    metadata_uri: metadataUri
  };
}

export async function fetchRegisteredTextbookState(
  asset: {
    owner_wallet: string;
    xrpl_token_id: string;
    metadata: TextbookMetadataSnapshot;
    image_url?: string;
  }
): Promise<RegisteredTextbookState> {
  const nftRecord = await findAccountNftByTokenIdOrUri({
    account: asset.owner_wallet,
    expectedTokenId: asset.xrpl_token_id
  });

  if (!nftRecord) {
    return {
      asset_type: "textbook",
      owner_wallet: asset.owner_wallet,
      xrpl_token_id: asset.xrpl_token_id,
      metadata: asset.metadata,
      metadata_hash: null,
      metadata_uri: null,
      exists: false
    };
  }

  let metadataHash: string | null = null;
  let metadataUri: string | null = null;

  if (nftRecord.URI) {
    const decodedUri = decodeHexToUtf8(nftRecord.URI);

    if (decodedUri.startsWith(TEXTBOOK_URI_PREFIX)) {
      metadataUri = decodedUri;
      metadataHash = decodedUri.slice(TEXTBOOK_URI_PREFIX.length) || null;
    }
  }

  return {
    asset_type: "textbook",
    owner_wallet: asset.owner_wallet,
    xrpl_token_id: nftRecord.NFTokenID,
    metadata: asset.metadata,
    metadata_hash: metadataHash,
    metadata_uri: metadataUri,
    exists: true
  };
}

export function doesTextbookMetadataMatchChain(asset: {
  owner_wallet: string;
  xrpl_token_id: string;
  metadata: TextbookMetadataSnapshot;
  image_url?: string;
}): { expectedMetadataHash: string; expectedMetadataUri: string } {
  const { metadataHash, metadataUri } = createCommittedMetadataUri(asset);

  return {
    expectedMetadataHash: metadataHash,
    expectedMetadataUri: metadataUri
  };
}
