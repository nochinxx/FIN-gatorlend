"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { submitFeedbackAction } from "@/app/feedback/actions";

const initialState = { error: null };

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [state, action, isPending] = useActionState(submitFeedbackAction, initialState);
  const pathname = usePathname();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      textareaRef.current?.focus();
      setSubmitted(false);
    }
  }, [open]);

  useEffect(() => {
    if (state.error === null && !isPending && submitted) {
      const timer = setTimeout(() => setOpen(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [state.error, isPending, submitted]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open]);

  const showSuccess = submitted && !isPending && state.error === null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: "0.45rem",
          padding: "0.65rem 1rem",
          borderRadius: 999,
          border: "1px solid #d7d7d7",
          background: "#ffffff",
          color: "#111111",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
          boxShadow: "0 2px 12px rgba(0,0,0,0.10)"
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Feedback
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Send feedback"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            padding: "1.5rem",
            pointerEvents: "none"
          }}
        >
          <div
            ref={dialogRef}
            style={{
              width: "100%",
              maxWidth: 360,
              padding: "1.25rem",
              borderRadius: 20,
              background: "#ffffff",
              border: "1px solid #e0e0e0",
              boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
              pointerEvents: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem" }}>Send feedback</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close feedback"
                style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem", color: "#666666", lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            {showSuccess ? (
              <p style={{ margin: 0, color: "#1f7a36", lineHeight: 1.6 }}>
                Thanks for the feedback!
              </p>
            ) : (
              <form
                action={action}
                onSubmit={() => setSubmitted(true)}
                style={{ display: "grid", gap: "0.75rem" }}
              >
                <input type="hidden" name="page_url" value={pathname} />
                <textarea
                  ref={textareaRef}
                  name="message"
                  required
                  minLength={3}
                  rows={4}
                  placeholder="What's on your mind? A bug, suggestion, or anything else..."
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: 12,
                    border: "1px solid #d7d7d7",
                    resize: "vertical",
                    fontFamily: "inherit",
                    fontSize: 14,
                    lineHeight: 1.5,
                    boxSizing: "border-box"
                  }}
                />
                {state.error ? (
                  <p style={{ margin: 0, fontSize: 13, color: "#8b2414" }}>{state.error}</p>
                ) : null}
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    padding: "0.7rem 1rem",
                    borderRadius: 999,
                    border: 0,
                    background: isPending ? "#8f8f8f" : "#111111",
                    color: "#ffffff",
                    fontWeight: 700,
                    cursor: isPending ? "not-allowed" : "pointer",
                    fontSize: 14
                  }}
                >
                  {isPending ? "Sending..." : "Send feedback"}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
