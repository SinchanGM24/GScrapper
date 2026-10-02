import type { BusinessRecord, Potential, PotentialResult } from "./schema";

export interface ProspectFilters {
  query: string;
  potential: Potential | "all";
  websiteStatus: "all" | "present" | "none" | "unknown";
  category: string;
  phoneAvailable: "all" | "yes" | "no";
}

export const emptyFilters: ProspectFilters = { query: "", potential: "all", websiteStatus: "all", category: "", phoneAvailable: "all" };

export interface ScoredBusiness extends BusinessRecord {
  analysis: PotentialResult;
}

export function filterBusinesses(businesses: ScoredBusiness[], filters: ProspectFilters): ScoredBusiness[] {
  const query = filters.query.trim().toLowerCase();
  return businesses.filter((business) => {
    const searchable = [business.name, business.category, business.address, business.phone].filter(Boolean).join(" ").toLowerCase();
    return (!query || searchable.includes(query))
      && (filters.potential === "all" || business.analysis.potential === filters.potential)
      && (filters.websiteStatus === "all" || business.websiteStatus === filters.websiteStatus)
      && (!filters.category || business.category?.toLowerCase() === filters.category.toLowerCase())
      && (filters.phoneAvailable === "all" || (filters.phoneAvailable === "yes" ? Boolean(business.phone) : !business.phone));
  });
}

export function sortBusinesses(businesses: ScoredBusiness[], field: "score" | "rating" | "reviews" | "name"): ScoredBusiness[] {
  return [...businesses].sort((a, b) => {
    if (field === "name") return a.name.localeCompare(b.name);
    if (field === "rating") return (b.rating ?? -1) - (a.rating ?? -1);
    if (field === "reviews") return (b.reviewCount ?? -1) - (a.reviewCount ?? -1);
    return b.analysis.score - a.analysis.score;
  });
}