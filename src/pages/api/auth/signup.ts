import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { hashPassword, createSession } from "../../../lib/auth";
import { json } from "../../../lib/api-helpers";

export const POST: APIRoute = async ({ request, cookies }) => {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!name || !email || password.length < 6) {
    return json({ ok: false, error: "Please fill in every field with a valid password (6+ characters)." });
  }

  const existing = db.prepare("SELECT email FROM users WHERE email = ?").get(email);
  if (existing) {
    return json({ ok: false, error: "An account with this email already exists. Try logging in instead." });
  }

  db.prepare("INSERT INTO users (email, name, password_hash, roles, active_role) VALUES (?, ?, ?, '[]', NULL)").run(
    email,
    name,
    hashPassword(password)
  );

  createSession(email, cookies);
  return json({ ok: true, session: { name, email, activeRole: null, roles: [] } });
};
