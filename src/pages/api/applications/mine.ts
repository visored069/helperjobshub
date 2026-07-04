import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { rowToApplication } from "../../../lib/rows";
import { requireUser, isResponse, json } from "../../../lib/api-helpers";

export const GET: APIRoute = async ({ cookies }) => {
  const user = requireUser(cookies);
  if (isResponse(user)) return user;

  const rows = db
    .prepare("SELECT * FROM applications WHERE applicant_email = ? ORDER BY applied_at DESC")
    .all(user.email);
  return json({ applications: (rows as any[]).map(rowToApplication) });
};
