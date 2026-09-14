import { describe, expect, it, beforeAll } from "vitest";
import { plugin } from "bun";
import { existsSync, rmSync } from "fs";

// "server-only" throws unless resolved through the "react-server" export
// condition (which only Next.js's build sets); stub it as a virtual empty
// module so lib/notes.ts can be imported directly in this Bun-run test.
plugin({
  name: "stub-server-only",
  setup(build) {
    build.module("server-only", () => ({ exports: {}, loader: "object" }));
  },
});

const TEST_DB_PATH = "data/test-notes.db";

beforeAll(() => {
  process.env.DB_PATH = TEST_DB_PATH;
  for (const suffix of ["", "-wal", "-shm"]) {
    const p = TEST_DB_PATH + suffix;
    if (existsSync(p)) rmSync(p);
  }
});

describe("lib/notes getNotesByUser", () => {
  it("returns a user's notes ordered by most recently updated", async () => {
    const { createNote, getNotesByUser } = await import("@/lib/notes");
    const { run } = await import("@/lib/db");

    const userId = "user-a";
    const older = createNote(userId, { title: "Older", contentJson: "{}" });
    const newer = createNote(userId, { title: "Newer", contentJson: "{}" });

    run(`UPDATE notes SET updated_at = '2020-01-01 00:00:00' WHERE id = ?`, [older.id]);
    run(`UPDATE notes SET updated_at = '2025-01-01 00:00:00' WHERE id = ?`, [newer.id]);

    const notes = getNotesByUser(userId);
    expect(notes.map((n) => n.id)).toEqual([newer.id, older.id]);
  });

  it("excludes notes belonging to other users", async () => {
    const { createNote, getNotesByUser } = await import("@/lib/notes");

    const userA = "user-scope-a";
    const userB = "user-scope-b";
    createNote(userA, { title: "A's note", contentJson: "{}" });
    createNote(userB, { title: "B's note", contentJson: "{}" });

    const notes = getNotesByUser(userA);
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe("A's note");
  });

  it("returns an empty array for a user with no notes", async () => {
    const { getNotesByUser } = await import("@/lib/notes");
    expect(getNotesByUser("user-with-no-notes")).toEqual([]);
  });
});
