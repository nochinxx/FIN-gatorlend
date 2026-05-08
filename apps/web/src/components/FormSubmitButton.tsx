"use client";

import type { CSSProperties, ReactNode } from "react";
import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  children: ReactNode;
  pendingLabel?: ReactNode;
  style?: CSSProperties;
};

export function FormSubmitButton({
  children,
  pendingLabel = "Working...",
  style
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      style={{
        opacity: pending ? 0.72 : 1,
        cursor: pending ? "wait" : "pointer",
        ...style
      }}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
