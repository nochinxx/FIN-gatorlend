export const LANDING_HERO_TITLE = "Student Exchange Pilot. Tokenization Ready.";

export const LANDING_HERO_BODY =
  "GatorLend is a student-built pilot for verified school-email users to explore how everyday academic items can be listed, requested, and tracked. Wallets are not required for normal use, while XRPL testnet minting remains available as an optional verification layer for selected assets.";

export const PILOT_DISCLAIMER =
  "GatorLend is an independent student-built pilot. It is not an official marketplace of San Francisco State University, the CSU system, or any campus department. The platform does not process payments, hold funds, guarantee items, or manage disputes.";

export const FOOTER_DISCLAIMER =
  "Independent student-built pilot. Not affiliated with, sponsored by, or endorsed by San Francisco State University or the CSU system. GatorLend does not process payments, custody funds, guarantee listings, or manage disputes.";

export const CURRENT_MVP_LINE =
  "Current MVP: school-email access, mock listings, request flow, and internal ownership tracking.";

export const ADVANCED_LAYER_LINE =
  "Advanced layer: optional XRPL testnet minting for selected demo assets.";

export const LANDING_HOW_IT_WORKS = [
  {
    title: "Sign in with a verified school email",
    description:
      "Students access the pilot through email-based authentication. Wallet connection is not required for normal usage."
  },
  {
    title: "Create a demo listing",
    description:
      "Create a demo listing for an academic item such as a textbook, calculator, lab coat, or goggles. The platform creates an internal mock asset record for tracking."
  },
  {
    title: "Request and confirm handoff",
    description:
      "Another verified user can send a request. If accepted, the platform tracks the request status and records an internal ownership update after both users confirm the handoff."
  }
] as const;

export const LANDING_FEATURED_ITEMS = [
  {
    name: "Lab Coat",
    context: "BIO101",
    label: "Pilot example",
    recordLabel: "Mock Asset ID",
    recordId: "mock_lab_coat_01",
    image: "/images/lab-coat.jpeg"
  },
  {
    name: "Calculator",
    context: "MATH226",
    label: "Demo listing",
    recordLabel: "Mock Asset ID",
    recordId: "mock_calculator_01",
    image: "/images/calculator.jpeg"
  },
  {
    name: "Textbook",
    context: "CSU340",
    label: "Mock record",
    recordLabel: "Mock Asset ID",
    recordId: "mock_textbook_01",
    image: "/images/textbook.jpg"
  }
] as const;

export const LANDING_WHY_IT_MATTERS = [
  "Early survey feedback suggests students are interested in a simpler way to discover and request common academic items.",
  "The pilot helps us test which item categories are most useful before expanding the system.",
  "The goal is to learn from real usage before deciding where tokenization adds value."
] as const;

export const LANDING_TOKENIZATION_POINTS = [
  "School-email access and Supabase-tracked ownership power the default marketplace flow.",
  "Selected demo assets can use the XRPL testnet flow to mint an XLS-20 NFT and compare on-chain state against marketplace metadata.",
  "No real funds, payment tokens, or production blockchain assets are used in the pilot."
] as const;

export const LANDING_ROADMAP = [
  "Phase 1: closed student pilot",
  "Phase 2: improve request and handoff flows",
  "Phase 3: evaluate optional tokenization for categories that benefit from stronger verification"
] as const;

export const PUBLIC_MARKETING_TEXT = [
  LANDING_HERO_TITLE,
  LANDING_HERO_BODY,
  CURRENT_MVP_LINE,
  ADVANCED_LAYER_LINE,
  ...LANDING_HOW_IT_WORKS.map((item) => item.title),
  ...LANDING_HOW_IT_WORKS.map((item) => item.description),
  ...LANDING_WHY_IT_MATTERS,
  ...LANDING_TOKENIZATION_POINTS,
  ...LANDING_ROADMAP
].join(" ");
