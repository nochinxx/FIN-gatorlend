"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createTextbookAction,
  type CreateTextbookFormState
} from "./actions";

const initialState: CreateTextbookFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: "0.9rem 1.2rem",
        borderRadius: 12,
        border: 0,
        background: pending ? "#899688" : "#17331d",
        color: "#fffaf0",
        fontWeight: 700,
        cursor: pending ? "wait" : "pointer"
      }}
    >
      {pending ? "Creating..." : "Create Textbook Asset"}
    </button>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = true,
  placeholder
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label style={{ display: "grid", gap: "0.35rem" }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        style={{
          padding: "0.85rem 0.95rem",
          borderRadius: 12,
          border: "1px solid #b4b09c",
          background: "#fffdf6"
        }}
      />
    </label>
  );
}

export function TextbookForm() {
  const [state, formAction] = useActionState(createTextbookAction, initialState);

  return (
    <form action={formAction} style={{ display: "grid", gap: "1rem" }}>
      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
        }}
      >
        <Field label="Title" name="title" placeholder="Campbell Biology" />
        <Field label="Author" name="author" placeholder="Lisa Urry" />
        <Field label="ISBN" name="isbn" placeholder="9780134093413" />
        <Field label="Course Code" name="course_code" placeholder="BSC2010" />
        <Field label="Edition" name="edition" placeholder="11th" />
        <Field label="Condition" name="condition" placeholder="used-good" />
        <Field label="Owner Wallet" name="owner_wallet" placeholder="r..." />
        <Field
          label="Image URL"
          name="image_url"
          type="url"
          required={false}
          placeholder="https://example.com/textbook.jpg"
        />
      </div>
      {state.error ? (
        <p
          style={{
            margin: 0,
            padding: "0.85rem 1rem",
            borderRadius: 12,
            background: "#ffe7de",
            color: "#7f2413"
          }}
        >
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
