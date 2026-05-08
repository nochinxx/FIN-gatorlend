const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_]{1,22})[a-z0-9]$/;

const RESERVED_USERNAMES = new Set([
  "admin",
  "root",
  "support",
  "sfsu",
  "official",
  "gatorlend",
  "marketplace",
  "api",
  "auth",
  "login",
  "signup",
  "profile",
  "listings",
  "assets"
]);

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase();
}

export function isReservedUsername(input: string): boolean {
  return RESERVED_USERNAMES.has(normalizeUsername(input));
}

export function isValidUsername(input: string): boolean {
  const normalizedUsername = normalizeUsername(input);

  if (normalizedUsername.length < 3 || normalizedUsername.length > 24) {
    return false;
  }

  if (isReservedUsername(normalizedUsername)) {
    return false;
  }

  return USERNAME_PATTERN.test(normalizedUsername);
}

export function validateUsername(input: string): string {
  const normalizedUsername = normalizeUsername(input);

  if (!normalizedUsername) {
    throw new Error("Username is required.");
  }

  if (normalizedUsername.length < 3) {
    throw new Error("Username must be at least 3 characters.");
  }

  if (normalizedUsername.length > 24) {
    throw new Error("Username must be 24 characters or fewer.");
  }

  if (normalizedUsername.startsWith("_") || normalizedUsername.endsWith("_")) {
    throw new Error("Username cannot start or end with an underscore.");
  }

  if (!USERNAME_PATTERN.test(normalizedUsername)) {
    throw new Error("Username can only use lowercase letters, numbers, and underscores.");
  }

  if (isReservedUsername(normalizedUsername)) {
    throw new Error("That username is reserved. Choose another one.");
  }

  return normalizedUsername;
}

export function getReservedUsernames(): string[] {
  return [...RESERVED_USERNAMES];
}
