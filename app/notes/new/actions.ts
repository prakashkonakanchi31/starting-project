"use server";

import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import { createNote } from "@/lib/notes";
import {
  validateNoteForm,
  EMPTY_TIPTAP_DOC,
  type NoteFormState,
} from "@/app/lib/note-validation";

export async function createNoteAction(
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const { user } = await verifySession();

  const title = (formData.get("title") as string) ?? "";
  const contentJson = (formData.get("contentJson") as string) || EMPTY_TIPTAP_DOC;

  const { valid, errors } = validateNoteForm({ title });
  if (!valid) {
    return { error: errors.title };
  }

  const note = createNote(user.id, { title: title.trim(), contentJson });
  redirect(`/notes/${note.id}`);
}
