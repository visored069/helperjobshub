import type { AstroCookies } from "astro";
import { getUserFromCookies, type AuthedUser } from "./auth";

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

export function requireUser(cookies: AstroCookies): AuthedUser | Response {
  const user = getUserFromCookies(cookies);
  if (!user) return json({ error: "Not authenticated" }, 401);
  return user;
}

export function isResponse(value: unknown): value is Response {
  return value instanceof Response;
}
