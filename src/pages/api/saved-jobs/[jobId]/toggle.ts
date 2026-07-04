import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";
import { requireUser, isResponse, json } from "../../../../lib/api-helpers";

export const POST: APIRoute = async ({ params, cookies }) => {
  const user = requireUser(cookies);
  if (isResponse(user)) return user;

  const jobId = params.jobId;
  if (!jobId) return json({ error: "Missing jobId" }, 400);

  const existing = db
    .prepare("SELECT 1 FROM saved_jobs WHERE email = ? AND job_id = ?")
    .get(user.email, jobId);

  if (existing) {
    db.prepare("DELETE FROM saved_jobs WHERE email = ? AND job_id = ?").run(user.email, jobId);
    return json({ saved: false });
  }

  db.prepare("INSERT INTO saved_jobs (email, job_id) VALUES (?, ?)").run(user.email, jobId);
  return json({ saved: true });
};
