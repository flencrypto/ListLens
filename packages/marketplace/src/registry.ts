import { ebayConnector } from "./ebay";
import { vintedConnector } from "./vinted";
import type { MarketplaceConnector } from "./connector";
import type { MarketplaceConnectorCapabilities } from "@listlens/schemas";

const connectors: Map<string, MarketplaceConnector> = new Map([
  ["ebay", ebayConnector],
  ["vinted", vintedConnector],
]);

export function getConnector(id: string): MarketplaceConnector | undefined {
  return connectors.get(id);
}

export function getAllCapabilities(): MarketplaceConnectorCapabilities[] {
  return Array.from(connectors.values()).map((c) => c.capabilities);
}

export function listConnectorIds(): string[] {
  return Array.from(connectors.keys());
}
