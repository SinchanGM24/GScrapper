import type { BusinessRecord } from "./schema";
import { normalizeBusiness } from "./normalization";

export function mergeBusinesses(current: BusinessRecord, incoming: BusinessRecord): BusinessRecord {
  const currentDate = current.collectedAt ? Date.parse(current.collectedAt) : 0;
  const incomingDate = incoming.collectedAt ? Date.parse(incoming.collectedAt) : 0;
  const newest = incomingDate >= currentDate ? incoming : current;

  return normalizeBusiness({
    ...current,
    ...newest,
    businessId: current.businessId || incoming.businessId,
    category: current.category ?? incoming.category,
    address: current.address ?? incoming.address,
    phone: current.phone ?? incoming.phone,
    website: current.website ?? incoming.website,
    mapsUrl: current.mapsUrl ?? incoming.mapsUrl,
    rating: current.rating ?? incoming.rating,
    reviewCount: current.reviewCount ?? incoming.reviewCount,
    area: current.area ?? incoming.area,
    placeId: current.placeId ?? incoming.placeId,
  });
}

export function deduplicateBusinesses(records: BusinessRecord[]): BusinessRecord[] {
  const byId = new Map<string, BusinessRecord>();
  for (const record of records.map(normalizeBusiness)) {
    if (!record.businessId) continue;
    const existing = byId.get(record.businessId);
    byId.set(record.businessId, existing ? mergeBusinesses(existing, record) : record);
  }
  return [...byId.values()];
}