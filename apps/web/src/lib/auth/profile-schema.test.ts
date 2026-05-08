import { describe, expect, it } from "vitest";

import {
  PROFILE_SETUP_REQUIRED_MESSAGE,
  assertMarketplaceProfileReady,
  getProfileIdentityLabel,
  profileNeedsSetup
} from "./profile-schema";

describe("profile setup requirements", () => {
  it("missing profile triggers setup requirement", () => {
    expect(profileNeedsSetup(null)).toBe(true);
    expect(() => assertMarketplaceProfileReady(null)).toThrow(PROFILE_SETUP_REQUIRED_MESSAGE);
  });

  it("profile without username triggers setup requirement", () => {
    const profile = {
      email: "student@sfsu.edu",
      username: null,
      display_name: "Student"
    };

    expect(profileNeedsSetup(profile)).toBe(true);
    expect(() => assertMarketplaceProfileReady(profile)).toThrow(PROFILE_SETUP_REQUIRED_MESSAGE);
  });

  it("profile with username allows marketplace usage", () => {
    const profile = {
      email: "student@sfsu.edu",
      username: "gator_reader",
      display_name: "Student"
    };

    expect(profileNeedsSetup(profile)).toBe(false);
    expect(() => assertMarketplaceProfileReady(profile)).not.toThrow();
  });

  it("owner identity prefers username then display name then email prefix", () => {
    expect(
      getProfileIdentityLabel({
        email: "student@sfsu.edu",
        username: "gator_reader",
        display_name: "Student"
      })
    ).toBe("gator_reader");

    expect(
      getProfileIdentityLabel({
        email: "student@sfsu.edu",
        username: null,
        display_name: "Student"
      })
    ).toBe("Student");

    expect(
      getProfileIdentityLabel({
        email: "student@sfsu.edu",
        username: null,
        display_name: null
      })
    ).toBe("student");
  });
});
