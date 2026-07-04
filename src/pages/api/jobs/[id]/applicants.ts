import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";
import { requireUser, isResponse, json } from "../../../../lib/api-helpers";
import type { ApplicantView } from "../../../../lib/types";

export const GET: APIRoute = async ({ params, cookies }) => {
  const user = requireUser(cookies);
  if (isResponse(user)) return user;

  const id = params.id;
  if (!id) return json({ error: "Missing id" }, 400);

  const job = db.prepare("SELECT posted_by FROM jobs WHERE id = ?").get(id) as { posted_by: string } | undefined;
  if (!job) return json({ error: "Not found" }, 404);
  if (job.posted_by !== user.email) return json({ error: "Forbidden" }, 403);

  const rows = db
    .prepare(
      `SELECT a.id AS application_id, a.applicant_email, a.applied_at, a.status,
              u.name,
              COALESCE(w.experience_years, 0) AS experience_years,
              COALESCE(w.rating, 0) AS rating,
              COALESCE(w.rating_count, 0) AS rating_count,
              COALESCE(w.verification, 'unverified') AS verification
       FROM applications a
       JOIN users u ON u.email = a.applicant_email
       LEFT JOIN worker_profiles w ON w.email = a.applicant_email
       WHERE a.job_id = ?
       ORDER BY a.applied_at DESC`
    )
    .all(id) as any[];

  const applicants: ApplicantView[] = rows.map((row) => ({
    applicationId: row.application_id,
    name: row.name,
    email: row.applicant_email,
    experienceYears: row.experience_years,
    rating: row.rating,
    ratingCount: row.rating_count,
    verification: row.verification,
    appliedAt: row.applied_at,
    status: row.status,
  }));

  return json({ applicants });
};
