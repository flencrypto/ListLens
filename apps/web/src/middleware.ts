import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/clerk-config";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/studio(.*)",
  "/guard(.*)",
  "/billing(.*)",
  "/history(.*)",
  "/lenses(.*)",
]);

// Routes that must remain accessible without authentication: webhooks (signed
// by the provider), liveness/readiness probes, and legal pages.
const isPublicRoute = createRouteMatcher([
  "/api/webhooks/(.*)",
  "/api/health",
  "/api/ready",
  "/legal/(.*)",
]);

// In demo mode (no real Clerk keys configured) we skip Clerk entirely and let
// every request through. Clerk would otherwise throw on every request because
// it requires `CLERK_SECRET_KEY` at runtime. The whole app then runs against
// the demo user id from `lib/clerk-config.ts`.
const demoMiddleware = () => NextResponse.next();

const realMiddleware = clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export default isClerkConfigured() ? realMiddleware : demoMiddleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
