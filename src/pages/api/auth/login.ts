import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { verifyPassword, createSession } from "../../../lib/auth";
import { json } from "../../../lib/api-helpers";

export const POST: APIRoute = async ({ request, cookies }) => {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  const user = db
    .prepare("SELECT email, name, password_hash, roles, active_role FROM users WHERE email = ?")
    .get(email) as { email: string; name: string; password_hash: string; roles: string; active_role: string | null } | undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    return json({ ok: false, error: "We couldn't find a matching account. Check your email and password." });
  }

  createSession(email, cookies);
  return json({
    ok: true,
    session: { name: user.name, email: user.email, activeRole: user.active_role, roles: JSON.parse(user.roles) },
  });
};
