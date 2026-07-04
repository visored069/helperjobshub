import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { requireUser, isResponse, json } from "../../../lib/api-helpers";

export const GET: APIRoute = async ({ cookies }) => {
  const user = requireUser(cookies);
  if (isResponse(user)) return user;

  const rows = db.prepare("SELECT job_id FROM saved_jobs WHERE email = ?").all(user.email) as { job_id: string }[];
  return json({ jobIds: rows.map((r) => r.job_id) });
};
