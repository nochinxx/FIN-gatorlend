export const PUBLIC_ASSET_TYPE_OPTIONS = [
  "textbook",
  "calculator",
  "lab_coat",
  "other"
] as const;

export const PUBLIC_ASSET_TYPE_LABELS: Record<(typeof PUBLIC_ASSET_TYPE_OPTIONS)[number], string> = {
  textbook: "Textbook",
  calculator: "Calculator",
  lab_coat: "Lab coat",
  other: "Other academic item"
};

export const PUBLIC_LISTING_TYPE_OPTIONS = [
  "sell",
  "lend",
  "borrow_request",
  "service_offer"
] as const;

export const PUBLIC_LISTING_TYPE_LABELS: Record<(typeof PUBLIC_LISTING_TYPE_OPTIONS)[number], string> = {
  sell: "Sell",
  lend: "Lend",
  borrow_request: "Borrow request",
  service_offer: "Service"
};
