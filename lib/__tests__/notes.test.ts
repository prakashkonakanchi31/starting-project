import { describe, expect, it, beforeAll } from 'vitest';
import { plugin } from 'bun';
import { existsSync, rmSync } from 'fs';

// "server-only" throws unless resolved through the "react-server" export
// condition (which only Next.js's build sets); stub it as a virtual empty
// module so lib/notes.ts can be imported directly in this Bun-run test.
plugin({
  name: 'stub-server-only',
  setup(build) {
    build.module('server-only', () => ({ exports: {}, loader: 'object' }));
  },
});

const TEST_DB_PATH = 'data/test-notes.db';

beforeAll(() => {
  process.env.DB_PATH = TEST_DB_PATH;
  for (const suffix of ['', '-wal', '-shm']) {
    const p = TEST_DB_PATH + suffix;
    if (existsSync(p)) rmSync(p);
  }
});

describe('lib/notes getNotesByUser', () => {
  it("returns a user's notes ordered by most recently updated", async () => {
    const { createNote, getNotesByUser } = await import('@/lib/notes');
    const { run } = await import('@/lib/db');

    const userId = 'user-a';
    const older = createNote(userId, { title: 'Older', contentJson: '{}' });
    const newer = createNote(userId, { title: 'Newer', contentJson: '{}' });

    run(`UPDATE notes SET updated_at = '2020-01-01 00:00:00' WHERE id = ?`, [older.id]);
    run(`UPDATE notes SET updated_at = '2025-01-01 00:00:00' WHERE id = ?`, [newer.id]);

    const notes = getNotesByUser(userId);
    expect(notes.map((n) => n.id)).toEqual([newer.id, older.id]);
  });

  it('excludes notes belonging to other users', async () => {
    const { createNote, getNotesByUser } = await import('@/lib/notes');

    const userA = 'user-scope-a';
    const userB = 'user-scope-b';
    createNote(userA, { title: "A's note", contentJson: '{}' });
    createNote(userB, { title: "B's note", contentJson: '{}' });

    const notes = getNotesByUser(userA);
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe("A's note");
  });

  it('returns an empty array for a user with no notes', async () => {
    const { getNotesByUser } = await import('@/lib/notes');
    expect(getNotesByUser('user-with-no-notes')).toEqual([]);
  });
});

describe('lib/notes setNotePublic / getNoteByPublicSlug', () => {
  it('generates a public slug when enabling sharing', async () => {
    const { createNote, setNotePublic } = await import('@/lib/notes');
    const note = createNote('user-share-a', { title: 'Shareable', contentJson: '{}' });

    const updated = setNotePublic('user-share-a', note.id, true);

    expect(updated?.isPublic).toBe(true);
    expect(updated?.publicSlug).toBeTruthy();
    expect(updated?.publicSlug?.length).toBeGreaterThanOrEqual(16);
  });

  it('returns the note via getNoteByPublicSlug once public', async () => {
    const { createNote, setNotePublic, getNoteByPublicSlug } = await import('@/lib/notes');
    const note = createNote('user-share-b', { title: 'Findable', contentJson: '{}' });
    const updated = setNotePublic('user-share-b', note.id, true);

    const found = getNoteByPublicSlug(updated!.publicSlug!);
    expect(found?.id).toBe(note.id);
    expect(found?.title).toBe('Findable');
  });

  it('returns null from getNoteByPublicSlug for a non-public note', async () => {
    const { createNote, getNoteByPublicSlug } = await import('@/lib/notes');
    const { run } = await import('@/lib/db');
    const note = createNote('user-share-c', { title: 'Private', contentJson: '{}' });
    run(`UPDATE notes SET public_slug = 'leftover-slug-value' WHERE id = ?`, [note.id]);

    expect(getNoteByPublicSlug('leftover-slug-value')).toBeNull();
  });

  it('returns null from getNoteByPublicSlug for an unknown slug', async () => {
    const { getNoteByPublicSlug } = await import('@/lib/notes');
    expect(getNoteByPublicSlug('does-not-exist')).toBeNull();
  });

  it('clears is_public and public_slug when disabling sharing, invalidating the old link', async () => {
    const { createNote, setNotePublic, getNoteByPublicSlug } = await import('@/lib/notes');
    const note = createNote('user-share-d', { title: 'Toggle off', contentJson: '{}' });
    const enabled = setNotePublic('user-share-d', note.id, true);
    const slug = enabled!.publicSlug!;

    const disabled = setNotePublic('user-share-d', note.id, false);

    expect(disabled?.isPublic).toBe(false);
    expect(disabled?.publicSlug).toBeNull();
    expect(getNoteByPublicSlug(slug)).toBeNull();
  });

  it('does not allow toggling sharing on a note owned by another user', async () => {
    const { createNote, setNotePublic } = await import('@/lib/notes');
    const note = createNote('user-share-owner', { title: 'Not yours', contentJson: '{}' });

    const result = setNotePublic('user-share-attacker', note.id, true);

    expect(result).toBeNull();
  });
});
