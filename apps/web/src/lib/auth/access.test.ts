import { describe, expect, it } from "vitest";

import {
  canStartAuthFlow,
  canAccessMarketplaceRoutes,
  canAccessProtectedAppRoutes,
  isSfsuEmail
} from "./access";

describe("isSfsuEmail", () => {
  it("accepts mario@sfsu.edu", () => {
    expect(isSfsuEmail("mario@sfsu.edu")).toBe(true);
  });

  it("accepts name.name@sfsu.edu", () => {
    expect(isSfsuEmail("name.name@sfsu.edu")).toBe(true);
  });

  it("rejects gmail.com", () => {
    expect(isSfsuEmail("mario@gmail.com")).toBe(false);
  });

  it("rejects fake sfsu.edu.attacker.com", () => {
    expect(isSfsuEmail("mario@sfsu.edu.attacker.com")).toBe(false);
  });

  it("rejects empty null and undefined safely", () => {
    expect(isSfsuEmail("")).toBe(false);
    expect(isSfsuEmail(null)).toBe(false);
    expect(isSfsuEmail(undefined)).toBe(false);
  });
});

describe("canAccessProtectedAppRoutes", () => {
  it("allows sfsu emails", () => {
    expect(canAccessProtectedAppRoutes("student@sfsu.edu")).toBe(true);
  });

  it("still allows legacy allowlisted emails", () => {
    expect(canAccessProtectedAppRoutes("mariojillesca@gmail.com")).toBe(true);
  });
});

describe("canAccessMarketplaceRoutes", () => {
  it("allows sfsu emails", () => {
    expect(canAccessMarketplaceRoutes("student@sfsu.edu")).toBe(true);
  });

  it("rejects legacy allowlist-only gmail access", () => {
    expect(canAccessMarketplaceRoutes("mariojillesca@gmail.com")).toBe(false);
  });
});

describe("canStartAuthFlow", () => {
  it("allows sfsu emails", () => {
    expect(canStartAuthFlow("student@sfsu.edu")).toBe(true);
  });

  it("allows legacy allowlisted emails", () => {
    expect(canStartAuthFlow("mariojillesca@gmail.com")).toBe(true);
  });

  it("rejects unrelated emails", () => {
    expect(canStartAuthFlow("someone@gmail.com")).toBe(false);
  });
});
