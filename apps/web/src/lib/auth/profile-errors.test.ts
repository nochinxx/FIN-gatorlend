import { describe, expect, it } from "vitest";

import { mapProfileWriteError } from "./profile-errors";

describe("profile error mapping", () => {
  it("duplicate username is handled gracefully by server action", () => {
    const error = mapProfileWriteError({
      code: "23505",
      details: "Key (username)=(gator_reader) already exists.",
      hint: null,
      message: "duplicate key value violates unique constraint \"profiles_username_unique_idx\""
    });

    expect(error.message).toBe("That username is already taken. Try another one.");
  });
});
