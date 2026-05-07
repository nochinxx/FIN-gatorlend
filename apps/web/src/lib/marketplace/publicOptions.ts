export const PUBLIC_ASSET_TYPE_OPTIONS = [
  "textbook",
  "calculator",
  "lab_coat",
  "goggles",
  "other"
] as const;

export const PUBLIC_ASSET_TYPE_LABELS: Record<(typeof PUBLIC_ASSET_TYPE_OPTIONS)[number], string> = {
  textbook: "Textbook",
  calculator: "Calculator",
  lab_coat: "Lab coat",
  goggles: "Goggles",
  other: "Other academic item"
};

export const PUBLIC_LISTING_TYPE_OPTIONS = [
  "sell",
  "lend",
  "borrow_request"
] as const;
