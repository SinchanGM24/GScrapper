import type { BusinessRecord, Potential, PotentialResult, ScoringConfig } from "./schema";
import { defaultScoringConfig } from "./schema";

type Rule = {
  id: keyof ScoringConfig["rules"];
  points: number;
  reason: string;
  matches: (business: BusinessRecord, config: ScoringConfig) => boolean;
};

const rules: Rule[] = [
  { id: "noWebsite", points: 40, reason: "Tidak memiliki website", matches: (b) => b.websiteStatus === "none" },
  { id: "targetCategory", points: 20, reason: "Termasuk kategori target", matches: (b, c) => Boolean(b.category && c.targetCategories.some((target) => target.trim().toLowerCase() === b.category?.trim().toLowerCase())) },
  { id: "phoneAvailable", points: 10, reason: "Memiliki nomor telepon", matches: (b) => Boolean(b.phone) },
  { id: "ratingAtLeast4", points: 10, reason: "Rating minimal 4.0", matches: (b) => b.rating !== null && b.rating >= 4 },
  { id: "reviewsAtLeast100", points: 10, reason: "Memiliki minimal 100 reviews", matches: (b) => b.reviewCount !== null && b.reviewCount >= 100 },
  { id: "reviewsAtLeast500", points: 10, reason: "Memiliki minimal 500 reviews", matches: (b) => b.reviewCount !== null && b.reviewCount >= 500 },
];

export function classifyScore(score: number, config: ScoringConfig = defaultScoringConfig): Potential {
  if (score >= config.thresholds.mediumMax + 1) return "high";
  if (score >= config.thresholds.lowMax + 1) return "medium";
  return "low";
}

export function scoreBusiness(business: BusinessRecord, config: ScoringConfig = defaultScoringConfig): PotentialResult {
  let score = 0;
  const reasons: string[] = [];
  const appliedRules: string[] = [];

  for (const rule of rules) {
    const points = config.rules[rule.id];
    if (points > 0 && rule.matches(business, config)) {
      score += points;
      reasons.push(rule.reason);
      appliedRules.push(rule.id);
    }
  }

  const boundedScore = Math.min(100, Math.max(0, score));
  return { businessId: business.businessId, score: boundedScore, potential: classifyScore(boundedScore, config), reasons, appliedRules, configVersion: config.configVersion };
}

export function scoreBusinesses(businesses: BusinessRecord[], config?: ScoringConfig): PotentialResult[] {
  return businesses.map((business) => scoreBusiness(business, config));
}