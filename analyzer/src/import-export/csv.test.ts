import { describe, expect, it } from "vitest";
import { parseCsv, stringifyCsv } from "./csv";
import { normalizeBusiness } from "../domain/normalization";

describe("CSV contract", () => {
  it("round-trips commas, quotes, and newlines", () => {
    const business = normalizeBusiness({ businessId: "b1", name: "Cafe, \"ABC\"", address: "Line 1\nLine 2" });
    const result = parseCsv(stringifyCsv([business]));
    expect(result.errors).toEqual([]);
    expect(result.dataset?.businesses[0].name).toBe('Cafe, "ABC"');
    expect(result.dataset?.businesses[0].address).toBe("Line 1 Line 2");
  });
});