import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { isAdminUserId } from "@/lib/admin-auth";

// Admin *pages* — a failed check redirects a human somewhere sensible.
const isAdminPage = createRouteMatcher(["/admin(.*)"]);

// Admin *APIs* — these write to Supabase with the service-role key, so they
// need the same gate. They were previously unprotected: the matcher below only
// covered /admin, and /api/admin/... does not match that pattern.
const isAdminApi = createRouteMatcher(["/api/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const page = isAdminPage(req);
  const api = isAdminApi(req);

  if (!page && !api) return;

  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return api
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : redirectToSignIn();
  }

  // Signed in is not the same as authorised — /sign-up is public.
  if (!isAdminUserId(userId, process.env.ADMIN_USER_IDS)) {
    return api
      ? NextResponse.json({ error: "Forbidden" }, { status: 403 })
      : NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: [
    // Run on all routes except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
