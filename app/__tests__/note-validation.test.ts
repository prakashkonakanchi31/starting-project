import { describe, it, expect } from "vitest";
import { validateNoteForm, EMPTY_TIPTAP_DOC } from "@/app/lib/note-validation";

describe("validateNoteForm", () => {
  it("rejects an empty title", () => {
    const { valid, errors } = validateNoteForm({ title: "" });
    expect(valid).toBe(false);
    expect(errors.title).toBeDefined();
  });

  it("rejects a whitespace-only title", () => {
    const { valid, errors } = validateNoteForm({ title: "   " });
    expect(valid).toBe(false);
    expect(errors.title).toBeDefined();
  });

  it("accepts a non-empty title", () => {
    const { valid, errors } = validateNoteForm({ title: "My note" });
    expect(valid).toBe(true);
    expect(errors).toEqual({});
  });
});

describe("EMPTY_TIPTAP_DOC", () => {
  it("is a valid stringified TipTap doc", () => {
    expect(JSON.parse(EMPTY_TIPTAP_DOC)).toEqual({
      type: "doc",
      content: [{ type: "paragraph" }],
    });
  });
});
