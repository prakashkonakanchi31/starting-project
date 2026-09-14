import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

declare global {
  var __appDb: Database | undefined;
}

function createConnection(): Database {
  const dbPath = process.env.DB_PATH ?? 'data/app.db';
  const dir = dirname(dbPath);
  if (dir && dir !== '.' && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath, { create: true });
  db.run('PRAGMA journal_mode = WAL;');
  runMigrations(db);
  return db;
}

function runMigrations(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      emailVerified INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expiresAt TEXT NOT NULL,
      ipAddress TEXT,
      userAgent TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES user(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      issuer TEXT NOT NULL,
      accountId TEXT NOT NULL,
      providerId TEXT NOT NULL,
      accessToken TEXT,
      refreshToken TEXT,
      accessTokenExpiresAt TEXT,
      refreshTokenExpiresAt TEXT,
      scope TEXT,
      idToken TEXT,
      password TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES user(id),
      UNIQUE (issuer, accountId)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content_json TEXT NOT NULL,
      is_public INTEGER NOT NULL DEFAULT 0,
      public_slug TEXT UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES user(id)
    );
  `);

  db.run('CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);');
  db.run('CREATE INDEX IF NOT EXISTS idx_notes_public_slug ON notes(public_slug);');
  db.run('CREATE INDEX IF NOT EXISTS idx_notes_is_public ON notes(is_public);');
}

export function getDb(): Database {
  if (!globalThis.__appDb) {
    globalThis.__appDb = createConnection();
  }
  return globalThis.__appDb;
}

export function query<T>(sql: string, params: unknown[] = []): T[] {
  return getDb()
    .query(sql)
    .all(...(params as [])) as T[];
}

export function get<T>(sql: string, params: unknown[] = []): T | undefined {
  return (
    (getDb()
      .query(sql)
      .get(...(params as [])) as T | null) ?? undefined
  );
}

export function run(sql: string, params: unknown[] = []) {
  return getDb()
    .query(sql)
    .run(...(params as []));
}
