import { verifySession } from '@/lib/session';
import { NoteForm } from '@/components/notes/NoteForm';
import { createNoteAction } from './actions';

export default async function NewNotePage() {
  await verifySession();

  return (
    <main className='mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10'>
      <h1 className='text-xl font-semibold'>New note</h1>
      <NoteForm action={createNoteAction} submitLabel='Create note' />
    </main>
  );
}
