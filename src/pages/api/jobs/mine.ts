import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { rowToJob } from "../../../lib/rows";
import { requireUser, isResponse, json } from "../../../lib/api-helpers";

export const GET: APIRoute = async ({ cookies }) => {
  const user = requireUser(cookies);
  if (isResponse(user)) return user;

  const rows = db
    .prepare(
      `SELECT jobs.*, users.name AS posted_by_name FROM jobs JOIN users ON users.email = jobs.posted_by
       WHERE jobs.posted_by = ? ORDER BY posted_at DESC`
    )
    .all(user.email);
  return json({ jobs: (rows as any[]).map(rowToJob) });
};
