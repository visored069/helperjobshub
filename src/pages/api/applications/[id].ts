import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { requireUser, isResponse, json } from "../../../lib/api-helpers";

const VALID_STATUSES = ["applied", "viewed", "shortlisted", "declined", "hired", "closed"];

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const user = requireUser(cookies);
  if (isResponse(user)) return user;

  const id = params.id;
  if (!id) return json({ error: "Missing id" }, 400);

  const row = db
    .prepare(
      `SELECT a.job_id, j.posted_by FROM applications a JOIN jobs j ON j.id = a.job_id WHERE a.id = ?`
    )
    .get(id) as { job_id: string; posted_by: string } | undefined;
  if (!row) return json({ error: "Not found" }, 404);
  if (row.posted_by !== user.email) return json({ error: "Forbidden" }, 403);

  const body = await request.json();
  const status = String(body.status ?? "");
  if (!VALID_STATUSES.includes(status)) return json({ error: "Invalid status" }, 400);

  db.prepare("UPDATE applications SET status = ? WHERE id = ?").run(status, id);
  return json({ ok: true });
};
