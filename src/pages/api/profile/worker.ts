import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { rowToWorkerProfile } from "../../../lib/rows";
import { requireUser, isResponse, json } from "../../../lib/api-helpers";

export const GET: APIRoute = async ({ cookies }) => {
  const user = requireUser(cookies);
  if (isResponse(user)) return user;

  const row = db.prepare("SELECT * FROM worker_profiles WHERE email = ?").get(user.email);
  if (!row) {
    return json({
      profile: { name: "", skills: [], experienceYears: 0, availableNow: false, verification: "unverified", rating: 0, ratingCount: 0, bio: "" },
    });
  }
  return json({ profile: rowToWorkerProfile(row as any) });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = requireUser(cookies);
  if (isResponse(user)) return user;

  const body = await request.json();
  db.prepare(
    `INSERT INTO worker_profiles (email, name, skills, experience_years, available_now, verification, rating, rating_count, bio)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET
       name = excluded.name,
       skills = excluded.skills,
       experience_years = excluded.experience_years,
       available_now = excluded.available_now,
       verification = excluded.verification,
       rating = excluded.rating,
       rating_count = excluded.rating_count,
       bio = excluded.bio`
  ).run(
    user.email,
    String(body.name ?? ""),
    JSON.stringify(body.skills ?? []),
    Number(body.experienceYears ?? 0),
    body.availableNow ? 1 : 0,
    String(body.verification ?? "unverified"),
    Number(body.rating ?? 0),
    Number(body.ratingCount ?? 0),
    String(body.bio ?? "")
  );

  return json({ ok: true });
};
