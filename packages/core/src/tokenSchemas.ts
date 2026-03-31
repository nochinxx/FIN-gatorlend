import { z } from "zod";

export const verificationStatusSchema = z.enum([
  "pending",
  "verified",
  "mismatch",
  "hidden"
]);

export const assetTableRowSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string().min(1),
  course_code: z.string().min(1),
  edition: z.string().min(1),
  condition: z.string().min(1),
  owner_wallet: z.string().min(1),
  image_url: z.string().url().optional().or(z.literal("")),
  xrpl_token_id: z.string().min(1),
  verification_status: verificationStatusSchema,
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const textbookAssetSchema = assetTableRowSchema;

export type VerificationStatus = z.infer<typeof verificationStatusSchema>;
export type AssetTableRow = z.infer<typeof assetTableRowSchema>;
export type TextbookAsset = z.infer<typeof textbookAssetSchema>;
