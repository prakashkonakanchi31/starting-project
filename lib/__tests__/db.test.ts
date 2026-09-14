import { describe, expect, it, beforeAll } from 'vitest';
import { existsSync, rmSync } from 'fs';

const TEST_DB_PATH = 'data/test-app.db';

beforeAll(() => {
  process.env.DB_PATH = TEST_DB_PATH;
  for (const suffix of ['', '-wal', '-shm']) {
    const p = TEST_DB_PATH + suffix;
    if (existsSync(p)) rmSync(p);
  }
});

describe('lib/db', () => {
  it('enables WAL journal mode', async () => {
    const { getDb } = await import('@/lib/db');
    const db = getDb();
    const result = db.query('PRAGMA journal_mode;').get() as { journal_mode: string };
    expect(result.journal_mode).toBe('wal');
  });

  it('creates all required tables', async () => {
    const { getDb } = await import('@/lib/db');
    const db = getDb();
    const rows = db
      .query("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;")
      .all() as { name: string }[];
    const names = rows.map((r) => r.name);

    expect(names).toEqual(
      expect.arrayContaining(['user', 'session', 'account', 'verification', 'notes']),
    );
  });
});
