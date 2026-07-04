import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { requireUser, isResponse, json } from "../../../lib/api-helpers";

export const GET: APIRoute = async ({ url, cookies }) => {
  const user = requireUser(cookies);
  if (isResponse(user)) return user;

  const jobId = url.searchParams.get("jobId") ?? "";
  const row = db
    .prepare("SELECT id FROM applications WHERE job_id = ? AND applicant_email = ?")
    .get(jobId, user.email);
  return json({ applied: Boolean(row) });
};
