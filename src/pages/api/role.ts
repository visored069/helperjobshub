import type { APIRoute } from "astro";
import { db } from "../../lib/db";
import { requireUser, isResponse, json } from "../../lib/api-helpers";

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = requireUser(cookies);
  if (isResponse(user)) return user;

  const body = await request.json();
  const role = String(body.role ?? "");
  if (role !== "finder" && role !== "giver") return json({ error: "Invalid role" }, 400);

  const roles = user.roles.includes(role) ? user.roles : [...user.roles, role];
  db.prepare("UPDATE users SET roles = ?, active_role = ? WHERE email = ?").run(JSON.stringify(roles), role, user.email);

  return json({ session: { name: user.name, email: user.email, activeRole: role, roles } });
};
