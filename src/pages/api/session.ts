import type { APIRoute } from "astro";
import { getUserFromCookies } from "../../lib/auth";
import { json } from "../../lib/api-helpers";

export const GET: APIRoute = async ({ cookies }) => {
  const user = getUserFromCookies(cookies);
  if (!user) return json({ session: null });
  return json({ session: { name: user.name, email: user.email, activeRole: user.activeRole, roles: user.roles } });
};
