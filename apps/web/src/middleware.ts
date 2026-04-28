import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
