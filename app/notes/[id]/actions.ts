'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { verifySession } from '@/lib/session';
import { updateNote, deleteNote, setNotePublic } from '@/lib/notes';
import { validateNoteForm, EMPTY_TIPTAP_DOC, type NoteFormState } from '@/app/lib/note-validation';

export type ShareState = { isPublic: boolean; publicSlug: string | null; error?: string };

export async function updateNoteAction(
  noteId: string,
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const { user } = await verifySession();

  const title = (formData.get('title') as string) ?? '';
  const contentJson = (formData.get('contentJson') as string) || EMPTY_TIPTAP_DOC;

  const { valid, errors } = validateNoteForm({ title });
  if (!valid) {
    return { error: errors.title };
  }

  const note = updateNote(user.id, noteId, { title: title.trim(), contentJson });
  if (!note) {
    return { error: 'Note not found.' };
  }

  redirect(`/notes/${note.id}`);
}

export async function deleteNoteAction(noteId: string): Promise<void> {
  const { user } = await verifySession();
  deleteNote(user.id, noteId);
  redirect('/dashboard');
}

export async function setNotePublicAction(
  noteId: string,
  prevState: ShareState,
  formData: FormData,
): Promise<ShareState> {
  const { user } = await verifySession();
  const isPublic = formData.get('isPublic') === 'true';

  const note = setNotePublic(user.id, noteId, isPublic);
  if (!note) {
    return { ...prevState, error: 'Note not found.' };
  }

  revalidatePath(`/notes/${noteId}/view`);
  revalidatePath('/dashboard');

  return { isPublic: note.isPublic, publicSlug: note.publicSlug };
}
