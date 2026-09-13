import "server-only";
import { get, run } from "@/lib/db";

export type Note = {
  id: string;
  userId: string;
  title: string;
  contentJson: string;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    contentJson: row.content_json,
    isPublic: Boolean(row.is_public),
    publicSlug: row.public_slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createNote(
  userId: string,
  data: { title: string; contentJson: string },
): Note {
  const id = crypto.randomUUID();

  run(
    `INSERT INTO notes (id, user_id, title, content_json) VALUES (?, ?, ?, ?)`,
    [id, userId, data.title, data.contentJson],
  );

  const row = get<NoteRow>(`SELECT * FROM notes WHERE id = ?`, [id]);
  if (!row) {
    throw new Error("Failed to create note");
  }

  return toNote(row);
}

export function getNoteById(userId: string, noteId: string): Note | null {
  const row = get<NoteRow>(
    `SELECT * FROM notes WHERE id = ? AND user_id = ?`,
    [noteId, userId],
  );

  return row ? toNote(row) : null;
}

export function updateNote(
  userId: string,
  noteId: string,
  data: { title: string; contentJson: string },
): Note | null {
  const { changes } = run(
    `UPDATE notes SET title = ?, content_json = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?`,
    [data.title, data.contentJson, noteId, userId],
  );

  if (changes === 0) {
    return null;
  }

  const row = get<NoteRow>(`SELECT * FROM notes WHERE id = ?`, [noteId]);
  if (!row) {
    return null;
  }

  return toNote(row);
}
