import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { rowToGiverProfile } from "../../../lib/rows";
import { requireUser, isResponse, json } from "../../../lib/api-helpers";

export const GET: APIRoute = async ({ cookies }) => {
  const user = requireUser(cookies);
  if (isResponse(user)) return user;

  const row = db.prepare("SELECT * FROM giver_profiles WHERE email = ?").get(user.email);
  if (!row) {
    return json({ profile: { name: "", location: "", verification: "unverified", rating: 0, ratingCount: 0 } });
  }
  return json({ profile: rowToGiverProfile(row as any) });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = requireUser(cookies);
  if (isResponse(user)) return user;

  const body = await request.json();
  db.prepare(
    `INSERT INTO giver_profiles (email, name, location, verification, rating, rating_count)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET
       name = excluded.name,
       location = excluded.location,
       verification = excluded.verification,
       rating = excluded.rating,
       rating_count = excluded.rating_count`
  ).run(
    user.email,
    String(body.name ?? ""),
    String(body.location ?? ""),
    String(body.verification ?? "unverified"),
    Number(body.rating ?? 0),
    Number(body.ratingCount ?? 0)
  );

  return json({ ok: true });
};
