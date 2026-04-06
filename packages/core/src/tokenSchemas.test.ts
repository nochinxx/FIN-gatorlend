import { assetRecordSchema } from "./tokenSchemas.js";

type TestCase = {
  name: string;
  payload: unknown;
  shouldPass: boolean;
};

const validTextbookPayload = {
  asset_type: "textbook",
  owner_wallet: "rTextbookOwner123",
  image_url: "https://example.com/textbook.jpg",
  xrpl_token_id: "00080000TEXTBOOK",
  verification_status: "verified",
  metadata: {
    title: "Campbell Biology",
    author: "Lisa Urry",
    isbn: "9780134093413",
    course_code: "BSC2010",
    edition: "11th",
    condition: "used-good"
  }
};

const validGogglesPayload = {
  asset_type: "goggles",
  owner_wallet: "rGogglesOwner123",
  image_url: "https://example.com/goggles.jpg",
  xrpl_token_id: "00080000GOGGLES",
  verification_status: "pending",
  metadata: {
    brand: "3M",
    size: "standard",
    condition: "new"
  }
};

const validLabCoatPayload = {
  asset_type: "lab_coat",
  owner_wallet: "rLabCoatOwner123",
  image_url: "https://example.com/lab-coat.jpg",
  xrpl_token_id: "00080000LABCOAT",
  verification_status: "pending",
  metadata: {
    size: "M",
    condition: "used-good"
  }
};

const invalidGogglesMissingRequiredField = {
  asset_type: "goggles",
  owner_wallet: "rBrokenGogglesOwner123",
  image_url: "https://example.com/broken-goggles.jpg",
  xrpl_token_id: "00080000BADGOGGLES",
  verification_status: "pending",
  metadata: {
    size: "standard",
    condition: "scratched"
  }
};

const invalidUnknownAssetType = {
  asset_type: "calculator",
  owner_wallet: "rUnknownAsset123",
  image_url: "https://example.com/calculator.jpg",
  xrpl_token_id: "00080000CALC",
  verification_status: "pending",
  metadata: {
    brand: "TI",
    model: "84 Plus"
  }
};

const testCases: TestCase[] = [
  {
    name: "valid textbook payload",
    payload: validTextbookPayload,
    shouldPass: true
  },
  {
    name: "valid goggles payload",
    payload: validGogglesPayload,
    shouldPass: true
  },
  {
    name: "valid lab_coat payload",
    payload: validLabCoatPayload,
    shouldPass: true
  },
  {
    name: "invalid goggles payload missing brand",
    payload: invalidGogglesMissingRequiredField,
    shouldPass: false
  },
  {
    name: "invalid payload with unknown asset_type",
    payload: invalidUnknownAssetType,
    shouldPass: false
  }
];

for (const testCase of testCases) {
  const result = assetRecordSchema.safeParse(testCase.payload);

  if (result.success !== testCase.shouldPass) {
    throw new Error(
      `${testCase.name} failed. Expected success=${testCase.shouldPass}, received success=${result.success}.`
    );
  }
}

console.log("assetRecordSchema validation cases:");
for (const testCase of testCases) {
  console.log(`- ${testCase.name}`);
}
console.log("All schema validation cases passed.");
