import { describe, expect, it } from "vitest";
import { createEmptyBusiness } from "./schema";
import { classifyScore, scoreBusiness } from "./scoring";

describe("scoring", () => {
  it("classifies every threshold boundary", () => {
    expect(classifyScore(49)).toBe("low");
    expect(classifyScore(50)).toBe("medium");
    expect(classifyScore(79)).toBe("medium");
    expect(classifyScore(80)).toBe("high");
    expect(classifyScore(100)).toBe("high");
  });

  it("only awards reasons for satisfied predicates", () => {
    const business = { ...createEmptyBusiness(), businessId: "b1", name: "Cafe", websiteStatus: "none" as const, phone: "+62", rating: 4.6, reviewCount: 327 };
    const result = scoreBusiness(business);
    expect(result.score).toBe(60);
    expect(result.potential).toBe("medium");
    expect(result.reasons).not.toContain("Termasuk kategori target");
  });

  it("does not treat unknown website as no website", () => {
    const business = { ...createEmptyBusiness(), businessId: "b2", name: "Cafe", websiteStatus: "unknown" as const, rating: 4.8, reviewCount: 600 };
    expect(scoreBusiness(business).score).toBe(15);
  });

  it("prioritizes contactability over reputation signals", () => {
    const unreachable = { ...createEmptyBusiness(), businessId: "b3", name: "Popular Cafe", websiteStatus: "none" as const, rating: 4.8, reviewCount: 800 };
    const reachable = { ...unreachable, businessId: "b4", phone: "+62", socialMedia: ["https://instagram.com/popular-cafe"] };
    expect(scoreBusiness(unreachable).score).toBe(40);
    expect(scoreBusiness(unreachable).potential).toBe("low");
    expect(scoreBusiness(reachable).score).toBe(85);
    expect(scoreBusiness(reachable).potential).toBe("high");
  });
});