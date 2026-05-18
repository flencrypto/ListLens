export type MarketplaceRecommendation = {
  marketplace: string;
  channelType: string;
  exactMatch: number;
  weeklyComps: number;
  medianSalePrice: number;
  p75SalePrice: number;
  feePercent: number;
  shippingAllowance: number;
  sellThroughRate: number;
  saleSpeedDays: [number, number];
  confidence: number;
  notes: string[];
};

export type MarketplaceAgentResult = MarketplaceRecommendation & {
  expectedNet: number;
  saleValueRange: [number, number];
  velocityScore: number;
  volumeScore: number;
  valueScore: number;
  agentScore: number;
  rankLabel: string;
};

export const marketplaceRecommendations: MarketplaceRecommendation[] = [
  {
    marketplace: "eBay",
    channelType: "Open marketplace",
    exactMatch: 0.92,
    weeklyComps: 46,
    medianSalePrice: 144,
    p75SalePrice: 156,
    feePercent: 0.128,
    shippingAllowance: 4,
    sellThroughRate: 0.74,
    saleSpeedDays: [7, 12],
    confidence: 0.88,
    notes: ["Strong exact-SKU volume", "Best balance of liquidity and net value", "Use condition photos and authenticity risk language"],
  },
  {
    marketplace: "StockX-style bid/ask",
    channelType: "Authenticated resale",
    exactMatch: 0.86,
    weeklyComps: 28,
    medianSalePrice: 151,
    p75SalePrice: 164,
    feePercent: 0.145,
    shippingAllowance: 0,
    sellThroughRate: 0.58,
    saleSpeedDays: [14, 24],
    confidence: 0.8,
    notes: ["Higher visible price but stronger fee drag", "Better for cleaner pairs with box", "Slower without paid authentication"],
  },
  {
    marketplace: "GOAT-style consignment",
    channelType: "Authenticated resale",
    exactMatch: 0.84,
    weeklyComps: 19,
    medianSalePrice: 158,
    p75SalePrice: 174,
    feePercent: 0.169,
    shippingAllowance: 0,
    sellThroughRate: 0.46,
    saleSpeedDays: [18, 35],
    confidence: 0.73,
    notes: ["Highest upper price band", "Lower comparable volume for this condition", "Use when seller can wait"],
  },
  {
    marketplace: "Depop",
    channelType: "Social resale",
    exactMatch: 0.76,
    weeklyComps: 34,
    medianSalePrice: 128,
    p75SalePrice: 142,
    feePercent: 0.104,
    shippingAllowance: 5,
    sellThroughRate: 0.69,
    saleSpeedDays: [8, 16],
    confidence: 0.72,
    notes: ["Good youth-fashion demand", "Lower median price", "Strong listing copy and lifestyle images help"],
  },
  {
    marketplace: "Vinted",
    channelType: "Peer resale",
    exactMatch: 0.68,
    weeklyComps: 39,
    medianSalePrice: 116,
    p75SalePrice: 130,
    feePercent: 0.02,
    shippingAllowance: 0,
    sellThroughRate: 0.81,
    saleSpeedDays: [3, 9],
    confidence: 0.7,
    notes: ["Fastest likely sale", "Buyers price-sensitive", "Best if cash speed matters more than top value"],
  },
  {
    marketplace: "Owned Shopify storefront",
    channelType: "Owned commerce",
    exactMatch: 0.79,
    weeklyComps: 11,
    medianSalePrice: 149,
    p75SalePrice: 167,
    feePercent: 0.032,
    shippingAllowance: 6,
    sellThroughRate: 0.32,
    saleSpeedDays: [21, 45],
    confidence: 0.66,
    notes: ["Best fee structure", "Requires existing buyer demand", "Use for premium price if audience exists"],
  },
];

export function evaluateMarketplaceRecommendations(
  recommendations: MarketplaceRecommendation[],
): MarketplaceAgentResult[] {
  const maxVolume = Math.max(...recommendations.map((item) => item.weeklyComps));
  const maxNet = Math.max(...recommendations.map((item) => item.medianSalePrice * (1 - item.feePercent) + item.shippingAllowance));

  return recommendations
    .map((item) => {
      const expectedNet = Math.round(item.medianSalePrice * (1 - item.feePercent) + item.shippingAllowance);
      const saleValueRange: [number, number] = [
        Math.round(item.medianSalePrice * (1 - item.feePercent) + item.shippingAllowance),
        Math.round(item.p75SalePrice * (1 - item.feePercent) + item.shippingAllowance),
      ];
      const meanSpeed = (item.saleSpeedDays[0] + item.saleSpeedDays[1]) / 2;
      const velocityScore = Math.max(0, Math.min(1, 1 - meanSpeed / 45));
      const volumeScore = item.weeklyComps / maxVolume;
      const valueScore = expectedNet / maxNet;
      const agentScore =
        valueScore * 0.38 +
        velocityScore * 0.24 +
        volumeScore * 0.18 +
        item.exactMatch * 0.14 +
        item.sellThroughRate * 0.06;

      return {
        ...item,
        expectedNet,
        saleValueRange,
        velocityScore,
        volumeScore,
        valueScore,
        agentScore,
        rankLabel: "",
      };
    })
    .sort((a, b) => b.agentScore - a.agentScore)
    .map((item, index) => ({
      ...item,
      rankLabel: index === 0 ? "Best balanced return" : index === 1 ? "Strong alternative" : index === 2 ? "Premium but slower" : "Use-case fit",
    }));
}
