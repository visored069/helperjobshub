import type { APIRoute } from "astro";
import { db, newId } from "../../../lib/db";
import { rowToJob } from "../../../lib/rows";
import { requireUser, isResponse, json } from "../../../lib/api-helpers";
import type { Job } from "../../../lib/types";

const SELECT_JOBS = `SELECT jobs.*, users.name AS posted_by_name FROM jobs JOIN users ON users.email = jobs.posted_by`;

export const GET: APIRoute = async () => {
  const rows = db.prepare(`${SELECT_JOBS} ORDER BY posted_at DESC`).all();
  return json({ jobs: (rows as any[]).map(rowToJob) });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = requireUser(cookies);
  if (isResponse(user)) return user;

  const body = await request.json();
  const id = newId("job");
  const postedAt = new Date().toISOString().slice(0, 10);

  db.prepare(
    `INSERT INTO jobs (id, title, category_id, description, location, pay_type, pay_amount, frequency, urgent, verified_only, posted_by, posted_at, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`
  ).run(
    id,
    String(body.title ?? ""),
    String(body.categoryId ?? ""),
    String(body.description ?? ""),
    String(body.location ?? ""),
    String(body.payType ?? "") as Job["payType"],
    String(body.payAmount ?? ""),
    String(body.frequency ?? "") as Job["frequency"],
    body.urgent ? 1 : 0,
    body.verifiedOnly ? 1 : 0,
    user.email,
    postedAt
  );

  const row = db.prepare(`${SELECT_JOBS} WHERE jobs.id = ?`).get(id);
  return json({ job: rowToJob(row as any) });
};
