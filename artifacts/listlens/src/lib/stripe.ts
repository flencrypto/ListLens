// Static plan catalogue used by the billing page. `priceId` is left undefined
// so Subscribe buttons render disabled in this demo build.
export interface PlanInfo {
  name: string;
  price: number;
  priceId?: string;
}

export const PLANS: Record<"studio_starter" | "studio_reseller", PlanInfo> = {
  studio_starter: { name: "Studio Starter", price: 999, priceId: undefined },
  studio_reseller: { name: "Studio Reseller", price: 2499, priceId: undefined },
};
