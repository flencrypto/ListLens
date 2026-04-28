/**
 * Seed minimal reference data:
 *  - A default `MeasureObject` so MeasureLens sessions can be created in dev.
 *
 * Run with: `npx tsx packages/db/prisma/seed.ts`
 *
 * Lens definitions are intentionally not seeded — they live in the
 * `@listlens/lenses` package so they can be edited as code.
 */
import { prisma } from "../src";

async function main() {
  await prisma.measureObject.upsert({
    where: { id: "default-measurelens-v1" },
    create: {
      id: "default-measurelens-v1",
      name: "MeasureLens v1",
      description: "Default 3D-printed reference object with ARUCO 4x4 markers.",
      markerSizeMm: 50,
      markerDictionary: "ARUCO_4X4_50",
    },
    update: {},
  });
  console.log("[seed] Reference data seeded");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
