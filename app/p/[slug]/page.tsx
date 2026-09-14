import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getNoteByPublicSlug } from '@/lib/notes';
import { NoteContent, type TipTapDoc } from '@/components/notes/NoteContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = getNoteByPublicSlug(slug);
  if (!note) return {};

  return { title: note.title, robots: { index: false, follow: false } };
}

export default async function PublicNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getNoteByPublicSlug(slug);
  if (!note) {
    notFound();
  }

  let doc: TipTapDoc;
  try {
    doc = JSON.parse(note.contentJson);
  } catch {
    doc = { type: 'doc', content: [] };
  }

  return (
    <main className='mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10'>
      <h1 className='text-xl font-semibold'>{note.title}</h1>
      <NoteContent doc={doc} />
    </main>
  );
}
