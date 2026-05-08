import {
  assetRecordSchema,
  createListingInputSchema,
  listingSchema
} from "./tokenSchemas.js";

type TestCase = {
  name: string;
  payload: unknown;
  shouldPass: boolean;
};

const validTextbookAssetPayload = {
  asset_type: "textbook",
  owner_wallet: "rTextbookOwner123",
  image_url: "https://example.com/textbook.jpg",
  xrpl_token_id: "00080000TEXTBOOK",
  verification_status: "verified",
  metadata: {
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    isbn: "9780262046305",
    course_code: "CSU340",
    edition: "4th",
    condition: "used-good"
  }
};

const validCalculatorAssetPayload = {
  asset_type: "calculator",
  owner_wallet: "rCalculatorOwner123",
  image_url: "/images/calculator.jpeg",
  xrpl_token_id: "00080000CALCULATOR",
  verification_status: "pending",
  metadata: {
    brand: "Texas Instruments",
    model: "TI-84 Plus",
    condition: "used-good"
  }
};

const validServiceAssetPayload = {
  asset_type: "service",
  owner_wallet: "rTutorOwner123",
  image_url: "",
  xrpl_token_id: "00080000SERVICE",
  verification_status: "pending",
  metadata: {
    category: "Tutoring",
    location: "SFSU Library",
    notes: "One hour session"
  }
};

const invalidUnknownAssetType = {
  asset_type: "bad_type",
  owner_wallet: "rUnknownAsset123",
  image_url: "https://example.com/asset.jpg",
  xrpl_token_id: "00080000UNKNOWN",
  verification_status: "pending",
  metadata: {}
};

const assetTestCases: TestCase[] = [
  {
    name: "valid textbook asset payload",
    payload: validTextbookAssetPayload,
    shouldPass: true
  },
  {
    name: "valid calculator asset payload",
    payload: validCalculatorAssetPayload,
    shouldPass: true
  },
  {
    name: "valid service asset payload",
    payload: validServiceAssetPayload,
    shouldPass: true
  },
  {
    name: "invalid payload with unknown asset_type",
    payload: invalidUnknownAssetType,
    shouldPass: false
  }
];

const validTextbookListing = {
  asset_type: "textbook",
  listing_type: "sell",
  title: "Introduction to Algorithms",
  description: "Good condition course textbook.",
  condition: "used-good",
  image_url: "/images/textbook.jpg",
  owner_user_id: "11111111-1111-4111-8111-111111111111",
  owner_wallet: null,
  price_amount: 30,
  price_type: "usd",
  payment_methods: ["cash", "venmo"],
  status: "active",
  tokenization_status: "mock_tokenized",
  mock_token_id: "mock_algorithms",
  xrpl_token_id: null,
  metadata: {
    course_code: "CSU340"
  }
};

const validCalculatorListing = {
  asset_type: "calculator",
  listing_type: "lend",
  title: "TI-84 Calculator",
  description: "Available for finals week.",
  condition: "used-good",
  image_url: "/images/calculator.jpeg",
  owner_user_id: "22222222-2222-4222-8222-222222222222",
  owner_wallet: null,
  price_amount: 10,
  price_type: "deposit",
  payment_methods: ["cash"],
  status: "active",
  tokenization_status: "mock_tokenized",
  mock_token_id: "mock_calculator",
  xrpl_token_id: null,
  metadata: {
    model: "TI-84 Plus"
  }
};

const validServiceListing = {
  asset_type: "service",
  listing_type: "service_offer",
  title: "Chemistry tutoring",
  description: "One-on-one tutoring for CHEM 115.",
  condition: null,
  image_url: "",
  owner_user_id: "33333333-3333-4333-8333-333333333333",
  owner_wallet: null,
  price_amount: 25,
  price_type: "hourly",
  payment_methods: ["zelle"],
  status: "active",
  tokenization_status: "mock_tokenized",
  mock_token_id: "mock_service",
  xrpl_token_id: null,
  metadata: {
    category: "Tutoring"
  }
};

const invalidListingAssetType = {
  ...validTextbookListing,
  asset_type: ""
};

const invalidListingType = {
  ...validTextbookListing,
  listing_type: "bad_listing_type"
};

const invalidListingWithoutTitle = {
  ...validTextbookListing,
  title: ""
};

const invalidListingWithoutOwnerUserId = {
  ...validTextbookListing,
  owner_user_id: ""
};

const listingTestCases: TestCase[] = [
  {
    name: "valid textbook listing passes",
    payload: validTextbookListing,
    shouldPass: true
  },
  {
    name: "valid calculator listing passes",
    payload: validCalculatorListing,
    shouldPass: true
  },
  {
    name: "valid service listing passes",
    payload: validServiceListing,
    shouldPass: true
  },
  {
    name: "empty asset_type fails",
    payload: invalidListingAssetType,
    shouldPass: false
  },
  {
    name: "invalid listing_type fails",
    payload: invalidListingType,
    shouldPass: false
  },
  {
    name: "listing without title fails",
    payload: invalidListingWithoutTitle,
    shouldPass: false
  },
  {
    name: "listing without owner_user_id fails",
    payload: invalidListingWithoutOwnerUserId,
    shouldPass: false
  }
];

for (const testCase of assetTestCases) {
  const result = assetRecordSchema.safeParse(testCase.payload);

  if (result.success !== testCase.shouldPass) {
    throw new Error(
      `${testCase.name} failed. Expected success=${testCase.shouldPass}, received success=${result.success}.`
    );
  }
}

for (const testCase of listingTestCases) {
  const result = listingSchema.safeParse(testCase.payload);

  if (result.success !== testCase.shouldPass) {
    throw new Error(
      `${testCase.name} failed. Expected success=${testCase.shouldPass}, received success=${result.success}.`
    );
  }
}

const listingWithDefaults = createListingInputSchema.parse({
  asset_type: "textbook",
  listing_type: "sell",
  title: "Default listing test",
  owner_user_id: "44444444-4444-4444-8444-444444444444",
  metadata: {}
});

if (listingWithDefaults.tokenization_status !== "mock_tokenized") {
  throw new Error("tokenization_status defaults to mock_tokenized when creating a normal listing failed.");
}

console.log("assetRecordSchema validation cases:");
for (const testCase of assetTestCases) {
  console.log(`- ${testCase.name}`);
}

console.log("listingSchema validation cases:");
for (const testCase of listingTestCases) {
  console.log(`- ${testCase.name}`);
}

console.log("- tokenization_status defaults to mock_tokenized when creating a normal listing");
console.log("All schema validation cases passed.");
