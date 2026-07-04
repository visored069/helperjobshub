import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { AstroCookies } from "astro";
import { db, newId } from "./db";

const SESSION_COOKIE = "hjh_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

export function createSession(email: string, cookies: AstroCookies): void {
  const token = newId("sess");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  db.prepare("INSERT INTO sessions (token, email, expires_at) VALUES (?, ?, ?)").run(token, email, expiresAt);
  cookies.set(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function destroySession(cookies: AstroCookies): void {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  }
  cookies.delete(SESSION_COOKIE, { path: "/" });
}

export interface AuthedUser {
  email: string;
  name: string;
  roles: string[];
  activeRole: string | null;
}

export function getUserFromCookies(cookies: AstroCookies): AuthedUser | null {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = db
    .prepare("SELECT email, expires_at FROM sessions WHERE token = ?")
    .get(token) as { email: string; expires_at: string } | undefined;
  if (!session) return null;

  if (new Date(session.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }

  const user = db
    .prepare("SELECT email, name, roles, active_role FROM users WHERE email = ?")
    .get(session.email) as { email: string; name: string; roles: string; active_role: string | null } | undefined;
  if (!user) return null;

  return {
    email: user.email,
    name: user.name,
    roles: JSON.parse(user.roles),
    activeRole: user.active_role,
  };
}
