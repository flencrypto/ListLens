# Marketplace Intelligence Agent

The SoleLens Marketplace Agent recommends where a seller should list an exact scanned item. It is not a "highest sold price" widget. It balances expected net value, volume of comparable sales, sale speed, fees, and exact-match confidence.

## Required inputs

- Identified product: brand, model, colourway, SKU, size, release year
- Condition report: grade, sole wear, creasing, staining, heel drag, box/accessory status
- Region and currency
- Marketplace fee and shipping assumptions
- Sold comparable records by marketplace
- Active listing count and sell-through rate
- Recent sale velocity and confidence window

## Exact-item matching

Comparable sales should be filtered or weighted by:

- SKU and model family
- Colourway
- size band
- condition grade
- box/accessory status
- seller region
- sale recency

When exact-match coverage is weak, the agent should return a range of recommendations instead of pretending one marketplace is definitive.

## Scoring model

The current frontend prototype uses this weighted baseline:

```text
agent_score =
  expected_net_value * 0.38 +
  sale_velocity * 0.24 +
  comparable_volume * 0.18 +
  exact_match_strength * 0.14 +
  sell_through_rate * 0.06
```

Expected net value is calculated after channel fees and shipping assumptions. Sale velocity is derived from the expected time-to-sell range. Comparable volume penalises low-liquidity outliers.

## Output contract

Each marketplace recommendation should return:

```json
{
  "marketplace": "eBay",
  "rankLabel": "Best balanced return",
  "saleValueRange": [130, 140],
  "saleSpeedDays": [7, 12],
  "weeklyComps": 46,
  "exactMatch": 0.92,
  "confidence": 0.88,
  "notes": [
    "Strong exact-SKU volume",
    "Best balance of liquidity and net value"
  ]
}
```

This lets SoleLens say things like: `Sell on eBay for GBP 130-140 net, expected in 7-12 days`, or `Use Vinted for a faster sale at a lower value range`.
