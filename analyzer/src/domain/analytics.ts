import type { ScoredBusiness } from "./filtering";

export interface AnalyticsSummary {
  total: number;
  withWebsite: number;
  withoutWebsite: number;
  withPhone: number;
  high: number;
  medium: number;
  low: number;
  categories: Array<{ name: string; count: number }>;
}

export function summarizeBusinesses(businesses: ScoredBusiness[]): AnalyticsSummary {
  const categoryCounts = new Map<string, number>();
  for (const business of businesses) {
    const category = business.category ?? "Tidak diketahui";
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
  }
  return {
    total: businesses.length,
    withWebsite: businesses.filter((b) => b.websiteStatus === "present").length,
    withoutWebsite: businesses.filter((b) => b.websiteStatus === "none").length,
    withPhone: businesses.filter((b) => Boolean(b.phone)).length,
    high: businesses.filter((b) => b.analysis.potential === "high").length,
    medium: businesses.filter((b) => b.analysis.potential === "medium").length,
    low: businesses.filter((b) => b.analysis.potential === "low").length,
    categories: [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
  };
}