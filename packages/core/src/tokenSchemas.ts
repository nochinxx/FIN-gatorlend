import { z } from "zod";

export const assetTypeSchema = z.enum([
  "textbook",
  "calculator",
  "lab_coat",
  "goggles",
  "food_voucher",
  "service",
  "other"
]);

export const verificationStatusSchema = z.enum([
  "pending",
  "verified",
  "mismatch",
  "hidden"
]);

export const listingTypeSchema = z.enum([
  "sell",
  "lend",
  "borrow_request",
  "service_offer",
  "voucher"
]);

export const listingStatusSchema = z.enum([
  "draft",
  "active",
  "reserved",
  "transferred",
  "completed",
  "cancelled"
]);

export const tokenizationStatusSchema = z.enum([
  "not_tokenized",
  "mock_tokenized",
  "xrpl_testnet_minted",
  "verified_on_chain"
]);

export const transactionStatusSchema = z.enum([
  "pending",
  "accepted",
  "declined",
  "handoff_confirmed",
  "completed",
  "cancelled",
  "disputed"
]);

export const ownershipEventSourceSchema = z.enum(["mock", "xrpl"]);

const localAssetImagePathSchema = z.string().regex(/^\/(?:images|branding)\/.+\.(?:png|jpe?g|webp)$/i);
export const assetImageSchema = z.union([z.string().url(), localAssetImagePathSchema, z.literal("")]);

const baseAssetSchema = z.object({
  id: z.string().uuid().optional(),
  asset_type: assetTypeSchema,
  owner_wallet: z.string().min(1),
  image_url: assetImageSchema.optional(),
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

export const calculatorMetadataSchema = z.object({
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  condition: z.string().min(1).optional()
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

export const foodVoucherMetadataSchema = z.object({
  vendor: z.string().min(1).optional(),
  value: z.string().min(1).optional(),
  expires_at: z.string().min(1).optional()
});

export const serviceMetadataSchema = z.object({
  category: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  notes: z.string().min(1).optional()
});

export const otherMetadataSchema = z.object({
  notes: z.string().min(1).optional()
});

export const textbookAssetSchema = baseAssetSchema.extend({
  asset_type: z.literal("textbook"),
  metadata: textbookMetadataSchema
});

export const calculatorAssetSchema = baseAssetSchema.extend({
  asset_type: z.literal("calculator"),
  metadata: calculatorMetadataSchema.default({})
});

export const gogglesAssetSchema = baseAssetSchema.extend({
  asset_type: z.literal("goggles"),
  metadata: gogglesMetadataSchema
});

export const labCoatAssetSchema = baseAssetSchema.extend({
  asset_type: z.literal("lab_coat"),
  metadata: labCoatMetadataSchema
});

export const foodVoucherAssetSchema = baseAssetSchema.extend({
  asset_type: z.literal("food_voucher"),
  metadata: foodVoucherMetadataSchema.default({})
});

export const serviceAssetSchema = baseAssetSchema.extend({
  asset_type: z.literal("service"),
  metadata: serviceMetadataSchema.default({})
});

export const otherAssetSchema = baseAssetSchema.extend({
  asset_type: z.literal("other"),
  metadata: otherMetadataSchema.default({})
});

export const assetRecordSchema = z.discriminatedUnion("asset_type", [
  textbookAssetSchema,
  calculatorAssetSchema,
  gogglesAssetSchema,
  labCoatAssetSchema,
  foodVoucherAssetSchema,
  serviceAssetSchema,
  otherAssetSchema
]);

export const assetTableRowSchema = z.object({
  id: z.string().uuid().optional(),
  asset_type: assetTypeSchema,
  owner_wallet: z.string().min(1),
  image_url: assetImageSchema.optional(),
  xrpl_token_id: z.string().min(1),
  verification_status: verificationStatusSchema,
  metadata: z.record(z.string(), z.unknown()),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const listingMetadataSchema = z.record(z.string(), z.unknown()).default({});
export const marketplaceListingAssetTypeSchema = z.string().trim().min(1).max(40);

const baseListingSchema = z.object({
  id: z.string().uuid().optional(),
  asset_type: marketplaceListingAssetTypeSchema,
  listing_type: listingTypeSchema,
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  condition: z.string().optional().nullable(),
  image_url: assetImageSchema.optional().nullable(),
  owner_user_id: z.string().uuid(),
  owner_wallet: z.string().min(1).optional().nullable(),
  price_amount: z.number().nonnegative().optional().nullable(),
  price_type: z.string().min(1).optional().nullable(),
  payment_methods: z.array(z.string().min(1)).optional().nullable(),
  status: listingStatusSchema,
  tokenization_status: tokenizationStatusSchema,
  mock_token_id: z.string().min(1).optional().nullable(),
  xrpl_token_id: z.string().min(1).optional().nullable(),
  metadata: listingMetadataSchema,
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const listingSchema = baseListingSchema;

export const createListingInputSchema = baseListingSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
    status: true,
    tokenization_status: true,
    mock_token_id: true
  })
  .extend({
    status: listingStatusSchema.default("active"),
    tokenization_status: tokenizationStatusSchema.default("mock_tokenized"),
    mock_token_id: z.string().min(1).optional().nullable()
  });

export const listingRequestSchema = z.object({
  id: z.string().uuid().optional(),
  listing_id: z.string().uuid(),
  owner_user_id: z.string().uuid(),
  requester_user_id: z.string().uuid(),
  status: transactionStatusSchema.default("pending"),
  message: z.string().optional().nullable(),
  payment_method: z.string().optional().nullable(),
  handoff_location: z.string().optional().nullable(),
  availability_note: z.string().optional().nullable(),
  owner_note: z.string().optional().nullable(),
  requested_at: z.string().optional(),
  accepted_at: z.string().optional().nullable(),
  completed_at: z.string().optional().nullable(),
  dismissed_by_owner_at: z.string().optional().nullable(),
  dismissed_by_requester_at: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const createListingRequestInputSchema = listingRequestSchema
  .omit({
    id: true,
    owner_user_id: true,
    requester_user_id: true,
    status: true,
    requested_at: true,
    accepted_at: true,
    completed_at: true,
    created_at: true,
    updated_at: true
  })
  .extend({
    message: z.string().optional(),
    payment_method: z.string().optional(),
    handoff_location: z.string().optional(),
    availability_note: z.string().optional()
  });

export const listingImageSchema = z.object({
  id: z.string().uuid().optional(),
  listing_id: z.string().uuid(),
  user_id: z.string().uuid(),
  storage_path: z.string().min(1),
  public_url: z.string().url().optional().nullable(),
  display_order: z.number().int().nonnegative().default(0),
  created_at: z.string().optional()
});

export const ownershipEventSchema = z.object({
  id: z.string().uuid().optional(),
  listing_id: z.string().uuid(),
  from_user_id: z.string().uuid().optional().nullable(),
  to_user_id: z.string().uuid(),
  transfer_type: listingTypeSchema,
  source: ownershipEventSourceSchema.default("mock"),
  xrpl_tx_hash: z.string().min(1).optional().nullable(),
  created_at: z.string().optional()
});

export type AssetType = z.infer<typeof assetTypeSchema>;
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;
export type ListingType = z.infer<typeof listingTypeSchema>;
export type ListingStatus = z.infer<typeof listingStatusSchema>;
export type TokenizationStatus = z.infer<typeof tokenizationStatusSchema>;
export type TransactionStatus = z.infer<typeof transactionStatusSchema>;
export type OwnershipEventSource = z.infer<typeof ownershipEventSourceSchema>;
export type TextbookMetadata = z.infer<typeof textbookMetadataSchema>;
export type CalculatorMetadata = z.infer<typeof calculatorMetadataSchema>;
export type GogglesMetadata = z.infer<typeof gogglesMetadataSchema>;
export type LabCoatMetadata = z.infer<typeof labCoatMetadataSchema>;
export type FoodVoucherMetadata = z.infer<typeof foodVoucherMetadataSchema>;
export type ServiceMetadata = z.infer<typeof serviceMetadataSchema>;
export type OtherMetadata = z.infer<typeof otherMetadataSchema>;
export type AssetTableRow = z.infer<typeof assetTableRowSchema>;
export type AssetRecord = z.infer<typeof assetRecordSchema>;
export type TextbookAsset = z.infer<typeof textbookAssetSchema>;
export type CalculatorAsset = z.infer<typeof calculatorAssetSchema>;
export type GogglesAsset = z.infer<typeof gogglesAssetSchema>;
export type LabCoatAsset = z.infer<typeof labCoatAssetSchema>;
export type FoodVoucherAsset = z.infer<typeof foodVoucherAssetSchema>;
export type ServiceAsset = z.infer<typeof serviceAssetSchema>;
export type OtherAsset = z.infer<typeof otherAssetSchema>;
export type Listing = z.infer<typeof listingSchema>;
export type CreateListingInput = z.infer<typeof createListingInputSchema>;
export type ListingRequest = z.infer<typeof listingRequestSchema>;
export type CreateListingRequestInput = z.infer<typeof createListingRequestInputSchema>;
export type ListingImage = z.infer<typeof listingImageSchema>;
export type OwnershipEvent = z.infer<typeof ownershipEventSchema>;
