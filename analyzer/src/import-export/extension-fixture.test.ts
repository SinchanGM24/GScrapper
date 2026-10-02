import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseCsv, parseJson } from "./csv";

const fixtureRoot = "../GScrapper Extension/fixtures";

describe("GMap Collector integration fixtures", () => {
  it("imports the extension JSON fixture", () => {
    const dataset = parseJson(readFileSync(`${fixtureRoot}/sample-dataset.json`, "utf8"));
    expect(dataset.source).toBe("gmap-collector");
    expect(dataset.businesses).toHaveLength(1);
    expect(dataset.businesses[0].businessId).toBe("mapsurl_fixture_cafe_abc");
  });

  it("imports the extension CSV fixture", () => {
    const result = parseCsv(readFileSync(`${fixtureRoot}/sample-dataset.csv`, "utf8"));
    expect(result.errors).toEqual([]);
    expect(result.importedRows).toBe(1);
    expect(result.dataset?.businesses[0].name).toBe("Cafe ABC");
  });
});
