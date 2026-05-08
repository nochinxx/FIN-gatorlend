import { describe, expect, it } from "vitest";

import {
  canStartAuthFlow,
  canAccessMarketplaceRoutes,
  canAccessProtectedAppRoutes,
  getMarketplaceRoleForEmail,
  isEmailVerified,
  isMarketplaceEmailAllowed,
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

describe("canStartAuthFlow", () => {
  it("allows valid @sfsu.edu emails", () => {
    expect(canStartAuthFlow("student@sfsu.edu")).toBe(true);
  });

  it("allows approved tester emails", () => {
    expect(canStartAuthFlow("mariojillesca@gmail.com")).toBe(true);
    expect(isMarketplaceEmailAllowed("mariojillesca@gmail.com")).toBe(true);
  });

  it("rejects unrelated emails", () => {
    expect(canStartAuthFlow("someone@gmail.com")).toBe(false);
  });
});

describe("verified access checks", () => {
  const verifiedUser = {
    email: "student@sfsu.edu",
    email_confirmed_at: "2026-05-07T00:00:00.000Z"
  };

  const unverifiedUser = {
    email: "student@sfsu.edu",
    email_confirmed_at: null
  };

  const verifiedTester = {
    email: "mariojillesca@gmail.com",
    email_confirmed_at: "2026-05-07T00:00:00.000Z"
  };

  const unverifiedTester = {
    email: "mariojillesca@gmail.com",
    email_confirmed_at: null
  };

  it("marks verified users as verified", () => {
    expect(isEmailVerified(verifiedUser)).toBe(true);
  });

  it("blocks unverified users", () => {
    expect(isEmailVerified(unverifiedUser)).toBe(false);
    expect(canAccessMarketplaceRoutes(unverifiedUser)).toBe(false);
    expect(canAccessProtectedAppRoutes(unverifiedUser)).toBe(false);
  });

  it("allows verified @sfsu.edu users", () => {
    expect(canAccessMarketplaceRoutes(verifiedUser)).toBe(true);
    expect(canAccessProtectedAppRoutes(verifiedUser)).toBe(true);
  });

  it("allows verified approved tester users", () => {
    expect(canAccessMarketplaceRoutes(verifiedTester)).toBe(true);
    expect(canAccessProtectedAppRoutes(verifiedTester)).toBe(true);
  });

  it("blocks unverified approved tester users", () => {
    expect(canAccessMarketplaceRoutes(unverifiedTester)).toBe(false);
    expect(canAccessProtectedAppRoutes(unverifiedTester)).toBe(false);
  });
});

describe("marketplace role resolution", () => {
  it("assigns owner to the gmail tester account", () => {
    expect(getMarketplaceRoleForEmail("mariojillesca@gmail.com")).toBe("owner");
  });

  it("assigns admin to the configured sfsu tester account", () => {
    expect(getMarketplaceRoleForEmail("mjimenezillesca@sfsu.edu")).toBe("admin");
  });

  it("defaults other users to student", () => {
    expect(getMarketplaceRoleForEmail("student@sfsu.edu")).toBe("student");
  });
});
