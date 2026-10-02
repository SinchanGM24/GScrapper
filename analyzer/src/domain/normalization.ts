import type { BusinessRecord, Dataset, DatasetEnvelope, WebsiteStatus } from "./schema";
import { createEmptyBusiness } from "./schema";

export function cleanText(value: unknown): string | null {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text || null;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

function toReviewCount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isInteger(value) && value >= 0 ? value : null;
  const raw = String(value).trim().replace(/\s/g, "");
  const multiplier = /k$/i.test(raw) ? 1000 : 1;
  const numeric = Number(raw.replace(/k$/i, "").replace(/[.,](?=\d{3}(?:\D|$))/g, "").replace(",", "."));
  return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric * multiplier) : null;
}

function normalizeUrl(value: unknown): string | null {
  const text = cleanText(value);
  if (!text) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeWebsiteStatus(value: unknown, website: string | null): WebsiteStatus {
  if (website) return "present";
  if (value === "none" || value === "unknown" || value === "present") return value;
  return "unknown";
}

export function normalizeBusiness(input: Partial<BusinessRecord>): BusinessRecord {
  const business = { ...createEmptyBusiness(), ...input };
  const website = normalizeUrl(business.website);
  return {
    ...business,
    businessId: cleanText(business.businessId) ?? "",
    name: cleanText(business.name) ?? "",
    category: cleanText(business.category),
    address: cleanText(business.address),
    phone: cleanText(business.phone),
    website,
    websiteStatus: normalizeWebsiteStatus(business.websiteStatus, website),
    mapsUrl: normalizeUrl(business.mapsUrl),
    rating: (() => {
      const rating = toNumber(business.rating);
      return rating !== null && rating >= 0 && rating <= 5 ? rating : null;
    })(),
    reviewCount: toReviewCount(business.reviewCount),
    businessStatus: cleanText(business.businessStatus),
    latitude: toNumber(business.latitude),
    longitude: toNumber(business.longitude),
    placeId: cleanText(business.placeId),
    area: cleanText(business.area),
    collectedAt: cleanText(business.collectedAt),
  };
}

export function normalizeDataset(input: Dataset): Dataset {
  return { ...input, businesses: input.businesses.map(normalizeBusiness) };
}

export function parseEnvelope(input: unknown): DatasetEnvelope {
  if (!input || typeof input !== "object") throw new Error("JSON dataset harus berupa object.");
  const candidate = input as Partial<DatasetEnvelope>;
  if (candidate.schemaName !== "gmap-prospect-dataset" || candidate.schemaVersion !== "1.0") {
    throw new Error("Schema JSON tidak didukung. Gunakan schema gmap-prospect-dataset versi 1.0.");
  }
  if (!candidate.dataset || !Array.isArray(candidate.dataset.businesses)) {
    throw new Error("JSON dataset tidak memiliki businesses array yang valid.");
  }
  return { ...candidate, dataset: normalizeDataset(candidate.dataset) } as DatasetEnvelope;
}