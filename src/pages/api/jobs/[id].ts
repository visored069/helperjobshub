import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { rowToJob } from "../../../lib/rows";
import { requireUser, isResponse, json } from "../../../lib/api-helpers";

export const GET: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) return json({ error: "Missing id" }, 400);

  const row = db
    .prepare(`SELECT jobs.*, users.name AS posted_by_name FROM jobs JOIN users ON users.email = jobs.posted_by WHERE jobs.id = ?`)
    .get(id);
  if (!row) return json({ job: null }, 404);
  return json({ job: rowToJob(row as any) });
};

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const user = requireUser(cookies);
  if (isResponse(user)) return user;

  const id = params.id;
  if (!id) return json({ error: "Missing id" }, 400);

  const row = db.prepare("SELECT posted_by FROM jobs WHERE id = ?").get(id) as { posted_by: string } | undefined;
  if (!row) return json({ error: "Not found" }, 404);
  if (row.posted_by !== user.email) return json({ error: "Forbidden" }, 403);

  const body = await request.json();
  const status = String(body.status ?? "");
  if (!["open", "filled", "closed"].includes(status)) return json({ error: "Invalid status" }, 400);

  db.prepare("UPDATE jobs SET status = ? WHERE id = ?").run(status, id);
  return json({ ok: true });
};
