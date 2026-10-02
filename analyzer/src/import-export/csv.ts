import Papa from "papaparse";
import type { BusinessRecord, Dataset } from "../domain/schema";
import { deduplicateBusinesses } from "../domain/deduplication";
import { normalizeBusiness, parseEnvelope } from "../domain/normalization";

export const csvHeaders = [
  "businessId", "name", "category", "address", "phone", "website", "websiteStatus", "mapsUrl",
  "rating", "reviewCount", "openingHours", "businessStatus", "latitude", "longitude", "placeId", "area", "collectedAt",
] as const;

export interface ImportResult {
  dataset: Dataset | null;
  errors: string[];
  importedRows: number;
}

export function parseCsv(input: string, metadata?: Partial<Dataset>): ImportResult {
  const parsed = Papa.parse<Record<string, string>>(input, { header: true, skipEmptyLines: true });
  const errors = parsed.errors.map((error) => `Baris ${error.row ?? "?"}: ${error.message}`);
  const businesses: BusinessRecord[] = [];

  for (const [index, row] of parsed.data.entries()) {
    const business = normalizeBusiness(row as Partial<BusinessRecord>);
    if (!business.businessId || !business.name) {
      errors.push(`Baris ${index + 2}: businessId dan name wajib tersedia.`);
      continue;
    }
    businesses.push(business);
  }

  return {
    dataset: {
      datasetId: metadata?.datasetId ?? `ds_${Date.now()}`,
      name: metadata?.name ?? "Imported CSV Dataset",
      keyword: metadata?.keyword ?? null,
      location: metadata?.location ?? null,
      collectedAt: metadata?.collectedAt ?? new Date().toISOString(),
      source: metadata?.source ?? "manual-import",
      businesses: deduplicateBusinesses(businesses),
    },
    errors,
    importedRows: businesses.length,
  };
}

export function stringifyCsv(businesses: BusinessRecord[]): string {
  return Papa.unparse(businesses.map((business) => Object.fromEntries(csvHeaders.map((header) => [header, business[header] ?? ""]))), { columns: [...csvHeaders] });
}

export function parseJson(input: string): Dataset {
  try {
    return parseEnvelope(JSON.parse(input)).dataset;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "JSON dataset tidak valid.");
  }
}

export function stringifyJson(dataset: Dataset): string {
  return JSON.stringify({ schemaName: "gmap-prospect-dataset", schemaVersion: "1.0", dataset }, null, 2);
}