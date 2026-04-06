import { z } from "zod";

export const assetTypeSchema = z.enum(["textbook", "goggles", "lab_coat"]);

export const verificationStatusSchema = z.enum([
  "pending",
  "verified",
  "mismatch",
  "hidden"
]);

const baseAssetSchema = z.object({
  id: z.string().uuid().optional(),
  asset_type: assetTypeSchema,
  owner_wallet: z.string().min(1),
  image_url: z.string().url().optional().or(z.literal("")),
  xrpl_token_id: z.string().min(1),
  verification_status: verificationStatusSchema,
  created_at: z.string().optional(),
updated_at: z.string().optional()
});

export const textbookMetadataSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string().min(1),
  course_code: z.string().min(1),
  edition: z.string().min(1),
  condition: z.string().min(1)
});

export const gogglesMetadataSchema = z.object({
  brand: z.string().min(1),
  size: z.string().min(1),
  condition: z.string().min(1)
});

export const labCoatMetadataSchema = z.object({
  size: z.string().min(1),
  condition: z.string().min(1)
});

export const textbookAssetSchema = baseAssetSchema.extend({
  asset_type: z.literal("textbook"),
  metadata: textbookMetadataSchema
});

export const gogglesAssetSchema = baseAssetSchema.extend({
  asset_type: z.literal("goggles"),
  metadata: gogglesMetadataSchema
});

export const labCoatAssetSchema = baseAssetSchema.extend({
  asset_type: z.literal("lab_coat"),
  metadata: labCoatMetadataSchema
});

export const assetRecordSchema = z.discriminatedUnion("asset_type", [
  textbookAssetSchema,
  gogglesAssetSchema,
  labCoatAssetSchema
]);

export const assetTableRowSchema = z.object({
  id: z.string().uuid().optional(),
  asset_type: assetTypeSchema,
  owner_wallet: z.string().min(1),
  image_url: z.string().url().optional().or(z.literal("")),
  xrpl_token_id: z.string().min(1),
  verification_status: verificationStatusSchema,
  metadata: z.record(z.string(), z.unknown()),
  created_at: z.string().optional(),
updated_at: z.string().optional()
});

export type AssetType = z.infer<typeof assetTypeSchema>;
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;
export type TextbookMetadata = z.infer<typeof textbookMetadataSchema>;
export type GogglesMetadata = z.infer<typeof gogglesMetadataSchema>;
export type LabCoatMetadata = z.infer<typeof labCoatMetadataSchema>;
export type AssetTableRow = z.infer<typeof assetTableRowSchema>;
export type AssetRecord = z.infer<typeof assetRecordSchema>;
export type TextbookAsset = z.infer<typeof textbookAssetSchema>;
export type GogglesAsset = z.infer<typeof gogglesAssetSchema>;
export type LabCoatAsset = z.infer<typeof labCoatAssetSchema>;
