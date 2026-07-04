import type { APIRoute } from "astro";
import { destroySession } from "../../../lib/auth";
import { json } from "../../../lib/api-helpers";

export const POST: APIRoute = async ({ cookies }) => {
  destroySession(cookies);
  return json({ ok: true });
};
