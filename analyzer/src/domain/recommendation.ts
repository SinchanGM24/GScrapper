import type { ScoredBusiness } from "./filtering";

export function recommendBusinesses(businesses: ScoredBusiness[], limit = 10): ScoredBusiness[] {
  return [...businesses].sort((a, b) => {
    const score = b.analysis.score - a.analysis.score;
    if (score) return score;
    const website = Number(a.websiteStatus === "none") - Number(b.websiteStatus === "none");
    if (website) return website;
    const reviews = (b.reviewCount ?? -1) - (a.reviewCount ?? -1);
    if (reviews) return reviews;
    const rating = (b.rating ?? -1) - (a.rating ?? -1);
    if (rating) return rating;
    return a.name.localeCompare(b.name) || a.businessId.localeCompare(b.businessId);
  }).slice(0, limit);
}