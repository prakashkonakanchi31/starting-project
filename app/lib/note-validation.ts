export type NoteFormErrors = {
  title?: string;
};

export type NoteFormState = {
  error?: string;
};

export const EMPTY_TIPTAP_DOC = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph" }],
});

export function validateNoteForm(input: { title: string }): {
  valid: boolean;
  errors: NoteFormErrors;
} {
  const errors: NoteFormErrors = {};

  if (!input.title.trim()) {
    errors.title = "Title is required.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
