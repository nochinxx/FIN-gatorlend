type ProfileWriteErrorLike = {
  code?: string | null;
  details?: string | null;
  hint?: string | null;
  message?: string | null;
};

export function isDuplicateUsernameError(error: ProfileWriteErrorLike | null | undefined): boolean {
  if (!error) {
    return false;
  }

  const searchableText = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`;
  return error.code === "23505" && /username/i.test(searchableText);
}

export function mapProfileWriteError(error: ProfileWriteErrorLike | null | undefined): Error {
  if (isDuplicateUsernameError(error)) {
    return new Error("That username is already taken. Try another one.");
  }

  return new Error(`Failed to save profile: ${error?.message ?? "Unknown error."}`);
}
