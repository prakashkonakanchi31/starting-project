import Link from 'next/link';

type NoteListItem = {
  id: string;
  title: string;
  updatedAt: string;
  isPublic: boolean;
};

function formatUpdatedAt(updatedAt: string): string {
  const date = new Date(updatedAt.replace(' ', 'T') + 'Z');
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function NoteList({ notes }: { notes: NoteListItem[] }) {
  return (
    <ul className='flex flex-col divide-y divide-black/10 dark:divide-white/10'>
      {notes.map((note) => (
        <li key={note.id}>
          <Link
            href={`/notes/${note.id}/view`}
            className='flex items-center justify-between gap-4 px-3 py-3 hover:bg-black/5 dark:hover:bg-white/5'
          >
            <span className='text-sm font-medium'>{note.title}</span>
            <span className='flex items-center gap-2 text-xs text-black/60 dark:text-white/60'>
              {note.isPublic && (
                <span className='rounded-full bg-foreground/10 px-2 py-0.5 font-medium'>
                  Shared
                </span>
              )}
              {formatUpdatedAt(note.updatedAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
