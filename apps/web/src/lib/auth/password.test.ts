import { describe, expect, it } from "vitest";

import { MIN_PASSWORD_LENGTH, validatePassword } from "./password";

describe("validatePassword", () => {
  it("requires a password", () => {
    expect(() => validatePassword("")).toThrow("Password is required.");
  });

  it("requires at least the minimum length", () => {
    expect(() => validatePassword("short")).toThrow(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    );
  });

  it("accepts passwords at the minimum length", () => {
    expect(validatePassword("12345678")).toBe("12345678");
  });
});
