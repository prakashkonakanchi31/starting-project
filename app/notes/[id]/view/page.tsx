import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/session";
import { getNoteById } from "@/lib/notes";
import { NoteContent, type TipTapDoc } from "@/components/notes/NoteContent";
import { DeleteNoteButton } from "@/components/notes/DeleteNoteButton";
import { deleteNoteAction } from "../actions";

export default async function NoteViewPage({
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

  let doc: TipTapDoc;
  try {
    doc = JSON.parse(note.contentJson);
  } catch {
    doc = { type: "doc", content: [] };
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{note.title}</h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/notes/${note.id}`}
            className="rounded-md border border-black/15 px-3 py-2 text-sm font-medium dark:border-white/15"
          >
            Edit
          </Link>
          <DeleteNoteButton deleteAction={deleteNoteAction.bind(null, note.id)} />
        </div>
      </div>
      <NoteContent doc={doc} />
    </main>
  );
}
