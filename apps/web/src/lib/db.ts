// Re-export the canonical Prisma singleton from the shared `@listlens/db` workspace package.
// Keeps a single Prisma instance for the entire monorepo to avoid divergent configuration.
export { prisma } from "@listlens/db";
