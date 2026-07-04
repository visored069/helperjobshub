import type { APIRoute } from "astro";
import { db, newId } from "../../../lib/db";
import { rowToApplication } from "../../../lib/rows";
import { requireUser, isResponse, json } from "../../../lib/api-helpers";

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = requireUser(cookies);
  if (isResponse(user)) return user;

  const body = await request.json();
  const jobId = String(body.jobId ?? "");

  const job = db.prepare("SELECT id FROM jobs WHERE id = ?").get(jobId);
  if (!job) return json({ error: "Job not found" }, 404);

  const existing = db
    .prepare("SELECT id FROM applications WHERE job_id = ? AND applicant_email = ?")
    .get(jobId, user.email);
  if (existing) {
    const row = db.prepare("SELECT * FROM applications WHERE id = ?").get((existing as any).id);
    return json({ application: rowToApplication(row as any) });
  }

  const id = newId("app");
  const appliedAt = new Date().toISOString().slice(0, 10);
  db.prepare(
    "INSERT INTO applications (id, job_id, applicant_email, applied_at, status) VALUES (?, ?, ?, ?, 'applied')"
  ).run(id, jobId, user.email, appliedAt);

  const row = db.prepare("SELECT * FROM applications WHERE id = ?").get(id);
  return json({ application: rowToApplication(row as any) });
};
