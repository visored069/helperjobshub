import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const dataDir = resolve(fileURLToPath(new URL("../../data/", import.meta.url)));
mkdirSync(dataDir, { recursive: true });

const dbPath = resolve(dataDir, "app.db");

export const db = new DatabaseSync(dbPath);

db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    roles TEXT NOT NULL DEFAULT '[]',
    active_role TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category_id TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    pay_type TEXT NOT NULL,
    pay_amount TEXT NOT NULL,
    frequency TEXT NOT NULL,
    urgent INTEGER NOT NULL DEFAULT 0,
    verified_only INTEGER NOT NULL DEFAULT 0,
    posted_by TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    posted_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open'
  );

  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    applied_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'applied',
    UNIQUE (job_id, applicant_email)
  );

  CREATE TABLE IF NOT EXISTS saved_jobs (
    email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    PRIMARY KEY (email, job_id)
  );

  CREATE TABLE IF NOT EXISTS worker_profiles (
    email TEXT PRIMARY KEY REFERENCES users(email) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    skills TEXT NOT NULL DEFAULT '[]',
    experience_years INTEGER NOT NULL DEFAULT 0,
    available_now INTEGER NOT NULL DEFAULT 0,
    verification TEXT NOT NULL DEFAULT 'unverified',
    rating REAL NOT NULL DEFAULT 0,
    rating_count INTEGER NOT NULL DEFAULT 0,
    bio TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS giver_profiles (
    email TEXT PRIMARY KEY REFERENCES users(email) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    verification TEXT NOT NULL DEFAULT 'unverified',
    rating REAL NOT NULL DEFAULT 0,
    rating_count INTEGER NOT NULL DEFAULT 0
  );
`);

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
