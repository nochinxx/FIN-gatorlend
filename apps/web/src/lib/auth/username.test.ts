import { describe, expect, it } from "vitest";

import {
  isReservedUsername,
  isValidUsername,
  normalizeUsername,
  validateUsername
} from "./username";

describe("username helpers", () => {
  it("valid username passes", () => {
    expect(isValidUsername("gator_reader")).toBe(true);
    expect(validateUsername("gator_reader")).toBe("gator_reader");
  });

  it("username lowercases correctly", () => {
    expect(normalizeUsername("GatorReader")).toBe("gatorreader");
    expect(validateUsername("GatorReader")).toBe("gatorreader");
  });

  it("username with spaces fails", () => {
    expect(isValidUsername("gator reader")).toBe(false);
    expect(() => validateUsername("gator reader")).toThrow("lowercase letters, numbers, and underscores");
  });

  it("username with special characters fails", () => {
    expect(isValidUsername("gator-reader")).toBe(false);
    expect(() => validateUsername("gator-reader")).toThrow("lowercase letters, numbers, and underscores");
  });

  it("username shorter than 3 fails", () => {
    expect(isValidUsername("ab")).toBe(false);
    expect(() => validateUsername("ab")).toThrow("at least 3 characters");
  });

  it("username longer than 24 fails", () => {
    expect(isValidUsername("averyveryveryverylonguser")).toBe(false);
    expect(() => validateUsername("averyveryveryverylonguser")).toThrow("24 characters or fewer");
  });

  it("username starting with underscore fails", () => {
    expect(isValidUsername("_gator")).toBe(false);
    expect(() => validateUsername("_gator")).toThrow("cannot start or end with an underscore");
  });

  it("username ending with underscore fails", () => {
    expect(isValidUsername("gator_")).toBe(false);
    expect(() => validateUsername("gator_")).toThrow("cannot start or end with an underscore");
  });

  it("reserved usernames fail", () => {
    expect(isReservedUsername("admin")).toBe(true);
    expect(isValidUsername("admin")).toBe(false);
    expect(() => validateUsername("admin")).toThrow("reserved");
  });
});
