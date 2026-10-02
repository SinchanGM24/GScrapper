import { describe, expect, it } from "vitest";
import { deduplicateBusinesses } from "./deduplication";
import { normalizeBusiness } from "./normalization";

describe("normalization and deduplication", () => {
  it("normalizes text, URL, rating, and review count", () => {
    const result = normalizeBusiness({ businessId: "b1", name: "  Cafe   ABC ", website: "example.com", rating: "4.6" as unknown as number, reviewCount: "1.2K" as unknown as number });
    expect(result.name).toBe("Cafe ABC");
    expect(result.website).toBe("https://example.com/");
    expect(result.rating).toBe(4.6);
    expect(result.reviewCount).toBe(1200);
  });

  it("merges duplicate records without losing non-null fields", () => {
    const records = deduplicateBusinesses([
      normalizeBusiness({ businessId: "same", name: "Cafe", address: "Mataram" }),
      normalizeBusiness({ businessId: "same", name: "Cafe", phone: "+62", rating: 4.5 }),
    ]);
    expect(records).toHaveLength(1);
    expect(records[0].address).toBe("Mataram");
    expect(records[0].phone).toBe("+62");
    expect(records[0].rating).toBe(4.5);
  });
});