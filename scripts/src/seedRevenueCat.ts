import {
  type App,
  type CreateProductData,
  type Entitlement,
  type Offering,
  type Package,
  type Product,
  type Project,
  attachProductsToEntitlement,
  attachProductsToPackage,
  createApp,
  createEntitlement,
  createOffering,
  createPackages,
  createProduct,
  createProject,
  listAppPublicApiKeys,
  listApps,
  listEntitlements,
  listOfferings,
  listPackages,
  listProducts,
  listProjects,
  updateOffering,
} from "@replit/revenuecat-sdk";

import { getUncachableRevenueCatClient } from "./revenueCatClient.js";

const PROJECT_NAME = "Mr.FLENS · List-LENS";

const APP_STORE_APP_NAME = "Mr.FLENS · List-LENS (iOS)";
const APP_STORE_BUNDLE_ID = "com.mrflens.listlens";
const PLAY_STORE_APP_NAME = "Mr.FLENS · List-LENS (Android)";
const PLAY_STORE_PACKAGE_NAME = "com.mrflens.listlens";

const ENTITLEMENT_IDENTIFIER = "pro";
const ENTITLEMENT_DISPLAY_NAME = "Pro Access";

const OFFERING_IDENTIFIER = "default";
const OFFERING_DISPLAY_NAME = "Default Offering";

interface PlanSeed {
  productId: string;
  playStoreProductId: string;
  displayName: string;
  userTitle: string;
  duration: "P1W" | "P1M" | "P2M" | "P3M" | "P6M" | "P1Y";
  packageLookupKey: "$rc_monthly" | "$rc_annual" | "$rc_lifetime";
  packageDisplayName: string;
  prices: { amount_micros: number; currency: string }[];
}

const PLANS: PlanSeed[] = [
  {
    productId: "studio_starter_monthly",
    playStoreProductId: "studio_starter_monthly:monthly",
    displayName: "Studio Starter Monthly",
    userTitle: "Studio Starter — Unlimited listings",
    duration: "P1M",
    packageLookupKey: "$rc_monthly",
    packageDisplayName: "Studio Starter Monthly",
    prices: [
      { amount_micros: 9990000, currency: "GBP" },
      { amount_micros: 11990000, currency: "USD" },
      { amount_micros: 10990000, currency: "EUR" },
    ],
  },
  {
    productId: "studio_reseller_monthly",
    playStoreProductId: "studio_reseller_monthly:monthly",
    displayName: "Studio Reseller Monthly",
    userTitle: "Studio Reseller — Bulk listing tools",
    duration: "P1M",
    packageLookupKey: "$rc_annual",
    packageDisplayName: "Studio Reseller Monthly",
    prices: [
      { amount_micros: 24990000, currency: "GBP" },
      { amount_micros: 29990000, currency: "USD" },
      { amount_micros: 27990000, currency: "EUR" },
    ],
  },
  {
    productId: "guard_monthly",
    playStoreProductId: "guard_monthly:monthly",
    displayName: "Guard Monthly",
    userTitle: "Guard Monthly — 10 checks / month",
    duration: "P1M",
    packageLookupKey: "$rc_lifetime",
    packageDisplayName: "Guard Monthly",
    prices: [
      { amount_micros: 6990000, currency: "GBP" },
      { amount_micros: 7990000, currency: "USD" },
      { amount_micros: 7490000, currency: "EUR" },
    ],
  },
];

type TestStorePricesResponse = {
  object: string;
  prices: { amount_micros: number; currency: string }[];
};

async function seedRevenueCat() {
  const client = await getUncachableRevenueCatClient();

  let project: Project;
  const { data: existingProjects, error: listProjectsError } = await listProjects({
    client,
    query: { limit: 20 },
  });
  if (listProjectsError) throw new Error("Failed to list projects");
  const existingProject = existingProjects.items?.find((p) => p.name === PROJECT_NAME);
  if (existingProject) {
    console.log("Project already exists:", existingProject.id);
    project = existingProject;
  } else {
    const { data: newProject, error } = await createProject({
      client,
      body: { name: PROJECT_NAME },
    });
    if (error) throw new Error("Failed to create project");
    console.log("Created project:", newProject.id);
    project = newProject;
  }

  const { data: apps, error: listAppsError } = await listApps({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listAppsError || !apps || apps.items.length === 0) throw new Error("No apps found");

  let app: App | undefined = apps.items.find((a) => a.type === "test_store");
  let appStoreApp: App | undefined = apps.items.find((a) => a.type === "app_store");
  let playStoreApp: App | undefined = apps.items.find((a) => a.type === "play_store");

  if (!app) throw new Error("No app with test store found");
  console.log("Test store app:", app.id);

  if (!appStoreApp) {
    const { data: newApp, error } = await createApp({
      client,
      path: { project_id: project.id },
      body: {
        name: APP_STORE_APP_NAME,
        type: "app_store",
        app_store: { bundle_id: APP_STORE_BUNDLE_ID },
      },
    });
    if (error) throw new Error("Failed to create App Store app");
    appStoreApp = newApp;
    console.log("Created App Store app:", appStoreApp.id);
  } else {
    console.log("App Store app:", appStoreApp.id);
  }

  if (!playStoreApp) {
    const { data: newApp, error } = await createApp({
      client,
      path: { project_id: project.id },
      body: {
        name: PLAY_STORE_APP_NAME,
        type: "play_store",
        play_store: { package_name: PLAY_STORE_PACKAGE_NAME },
      },
    });
    if (error) throw new Error("Failed to create Play Store app");
    playStoreApp = newApp;
    console.log("Created Play Store app:", playStoreApp.id);
  } else {
    console.log("Play Store app:", playStoreApp.id);
  }

  const { data: existingProducts, error: listProductsError } = await listProducts({
    client,
    path: { project_id: project.id },
    query: { limit: 100 },
  });
  if (listProductsError) throw new Error("Failed to list products");

  const ensureProduct = async (
    targetApp: App,
    label: string,
    storeIdentifier: string,
    plan: PlanSeed,
    isTestStore: boolean,
  ): Promise<Product> => {
    const existing = existingProducts.items?.find(
      (p) => p.store_identifier === storeIdentifier && p.app_id === targetApp.id,
    );
    if (existing) {
      console.log(`${label} product exists:`, existing.id);
      return existing;
    }
    const body: CreateProductData["body"] = {
      store_identifier: storeIdentifier,
      app_id: targetApp.id,
      type: "subscription",
      display_name: plan.displayName,
    };
    if (isTestStore) {
      body.subscription = { duration: plan.duration };
      body.title = plan.userTitle;
    }
    const { data: created, error } = await createProduct({
      client,
      path: { project_id: project.id },
      body,
    });
    if (error) throw new Error(`Failed to create ${label} product`);
    console.log(`Created ${label} product:`, created.id);
    return created;
  };

  let entitlement: Entitlement | undefined;
  const { data: existingEntitlements, error: listEntitlementsError } = await listEntitlements({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listEntitlementsError) throw new Error("Failed to list entitlements");
  const existingEntitlement = existingEntitlements.items?.find(
    (e) => e.lookup_key === ENTITLEMENT_IDENTIFIER,
  );
  if (existingEntitlement) {
    entitlement = existingEntitlement;
    console.log("Entitlement exists:", entitlement.id);
  } else {
    const { data: newEnt, error } = await createEntitlement({
      client,
      path: { project_id: project.id },
      body: { lookup_key: ENTITLEMENT_IDENTIFIER, display_name: ENTITLEMENT_DISPLAY_NAME },
    });
    if (error) throw new Error("Failed to create entitlement");
    entitlement = newEnt;
    console.log("Created entitlement:", entitlement.id);
  }

  let offering: Offering | undefined;
  const { data: existingOfferings, error: listOfferingsError } = await listOfferings({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listOfferingsError) throw new Error("Failed to list offerings");
  const existingOffering = existingOfferings.items?.find(
    (o) => o.lookup_key === OFFERING_IDENTIFIER,
  );
  if (existingOffering) {
    offering = existingOffering;
    console.log("Offering exists:", offering.id);
  } else {
    const { data: newOff, error } = await createOffering({
      client,
      path: { project_id: project.id },
      body: { lookup_key: OFFERING_IDENTIFIER, display_name: OFFERING_DISPLAY_NAME },
    });
    if (error) throw new Error("Failed to create offering");
    offering = newOff;
    console.log("Created offering:", offering.id);
  }
  if (!offering.is_current) {
    const { error } = await updateOffering({
      client,
      path: { project_id: project.id, offering_id: offering.id },
      body: { is_current: true },
    });
    if (error) throw new Error("Failed to set offering as current");
    console.log("Marked offering as current");
  }

  const { data: existingPackages, error: listPackagesError } = await listPackages({
    client,
    path: { project_id: project.id, offering_id: offering.id },
    query: { limit: 20 },
  });
  if (listPackagesError) throw new Error("Failed to list packages");

  for (const plan of PLANS) {
    const tsProduct = await ensureProduct(app, `${plan.displayName} test`, plan.productId, plan, true);
    const iosProduct = await ensureProduct(appStoreApp, `${plan.displayName} iOS`, plan.productId, plan, false);
    const playProduct = await ensureProduct(
      playStoreApp,
      `${plan.displayName} Play`,
      plan.playStoreProductId,
      plan,
      false,
    );

    const { data: priceData, error: priceError } = await client.post<TestStorePricesResponse>({
      url: "/projects/{project_id}/products/{product_id}/test_store_prices",
      path: { project_id: project.id, product_id: tsProduct.id },
      body: { prices: plan.prices },
    });
    if (priceError) {
      if (priceError && typeof priceError === "object" && "type" in priceError && priceError["type"] === "resource_already_exists") {
        console.log(`Test prices exist for ${plan.displayName}`);
      } else {
        throw new Error(`Failed to add test prices for ${plan.displayName}`);
      }
    } else {
      console.log(`Added test prices for ${plan.displayName}:`, JSON.stringify(priceData));
    }

    const { error: attachEntErr } = await attachProductsToEntitlement({
      client,
      path: { project_id: project.id, entitlement_id: entitlement.id },
      body: { product_ids: [tsProduct.id, iosProduct.id, playProduct.id] },
    });
    if (attachEntErr) {
      if (attachEntErr.type === "unprocessable_entity_error") {
        console.log(`Products already attached to entitlement for ${plan.displayName}`);
      } else {
        throw new Error(`Failed to attach products to entitlement for ${plan.displayName}`);
      }
    }

    let pkg: Package | undefined = existingPackages.items?.find(
      (p) => p.lookup_key === plan.packageLookupKey,
    );
    if (!pkg) {
      const { data: newPkg, error } = await createPackages({
        client,
        path: { project_id: project.id, offering_id: offering.id },
        body: { lookup_key: plan.packageLookupKey, display_name: plan.packageDisplayName },
      });
      if (error) throw new Error(`Failed to create package ${plan.packageLookupKey}`);
      pkg = newPkg;
      console.log(`Created package ${plan.packageLookupKey}:`, pkg.id);
    } else {
      console.log(`Package ${plan.packageLookupKey} exists:`, pkg.id);
    }

    const { error: attachPkgErr } = await attachProductsToPackage({
      client,
      path: { project_id: project.id, package_id: pkg.id },
      body: {
        products: [
          { product_id: tsProduct.id, eligibility_criteria: "all" },
          { product_id: iosProduct.id, eligibility_criteria: "all" },
          { product_id: playProduct.id, eligibility_criteria: "all" },
        ],
      },
    });
    if (attachPkgErr) {
      if (
        attachPkgErr.type === "unprocessable_entity_error" &&
        attachPkgErr.message?.includes("Cannot attach product")
      ) {
        console.log(`Skipping incompatible product attach for ${plan.packageLookupKey}`);
      } else {
        throw new Error(`Failed to attach products to package ${plan.packageLookupKey}`);
      }
    }
  }

  const fetchKeys = async (label: string, target: App) => {
    const { data, error } = await listAppPublicApiKeys({
      client,
      path: { project_id: project.id, app_id: target.id },
    });
    if (error) throw new Error(`Failed to list public API keys for ${label}`);
    return data?.items.map((i) => i.key).join(", ") ?? "N/A";
  };

  const testKeys = await fetchKeys("Test Store", app);
  const iosKeys = await fetchKeys("App Store", appStoreApp);
  const playKeys = await fetchKeys("Play Store", playStoreApp);

  console.log("\n====================");
  console.log("RevenueCat setup complete!");
  console.log("Project ID:", project.id);
  console.log("Test Store App ID:", app.id);
  console.log("App Store App ID:", appStoreApp.id);
  console.log("Play Store App ID:", playStoreApp.id);
  console.log("Entitlement Identifier:", ENTITLEMENT_IDENTIFIER);
  console.log("Test Store API Keys:", testKeys);
  console.log("App Store API Keys:", iosKeys);
  console.log("Play Store API Keys:", playKeys);
  console.log("====================\n");
}

seedRevenueCat().catch((err) => {
  console.error(err);
  process.exit(1);
});
