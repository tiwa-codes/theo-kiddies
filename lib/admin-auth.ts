/**
 * Admin authorisation.
 *
 * Being signed in is NOT enough to be an admin: /sign-up is open to the public,
 * so any customer can create a Clerk account. Admin access is granted only to
 * the Clerk user IDs listed in the ADMIN_USER_IDS env var.
 *
 * Find your user ID in the Clerk dashboard → Users → (your account) → the
 * `user_...` value. Then set, in .env and in Vercel:
 *
 *   ADMIN_USER_IDS=user_2abc...,user_2def...
 *
 * If the variable is unset or empty, nobody is an admin. This fails closed on
 * purpose — a misconfiguration should lock you out, not let the world in.
 */
import { auth } from "@clerk/nextjs/server";

/** Parse the comma-separated allowlist into user IDs. */
export function parseAdminUserIds(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** Pure authorisation decision — the single source of truth, used everywhere. */
export function isAdminUserId(
  userId: string | null | undefined,
  raw: string | undefined
): boolean {
  if (!userId) return false;
  return parseAdminUserIds(raw).includes(userId);
}

export class AdminAuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminAuthError";
    this.status = status;
  }
}

/**
 * Assert that the caller is an allow-listed admin.
 * Throws AdminAuthError, which adminAuthResponse() turns into a 401/403.
 *
 * The middleware already guards these routes; this is defence in depth, so a
 * route that slips out of the matcher is still closed.
 */
export async function requireAdmin(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new AdminAuthError("Unauthorized", 401);
  }

  if (!isAdminUserId(userId, process.env.ADMIN_USER_IDS)) {
    throw new AdminAuthError("Forbidden", 403);
  }

  return userId;
}

/** Turn an AdminAuthError into a Response; returns null for any other error. */
export function adminAuthResponse(err: unknown): Response | null {
  if (err instanceof AdminAuthError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  return null;
}
