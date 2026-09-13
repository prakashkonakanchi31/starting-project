import { notFound } from "next/navigation";
import { verifySession } from "@/lib/session";
import { getNoteById } from "@/lib/notes";
import { NoteForm } from "@/components/notes/NoteForm";
import { updateNoteAction } from "./actions";

export default async function NoteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await verifySession();
  const { id } = await params;

  const note = getNoteById(user.id, id);
  if (!note) {
    notFound();
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <h1 className="text-xl font-semibold">Edit note</h1>
      <NoteForm
        action={updateNoteAction.bind(null, note.id)}
        initialTitle={note.title}
        initialContentJson={note.contentJson}
        submitLabel="Save changes"
      />
    </main>
  );
}
