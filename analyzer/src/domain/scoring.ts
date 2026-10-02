import type { BusinessRecord, Potential, PotentialResult, ScoringConfig } from "./schema";
import { defaultScoringConfig } from "./schema";

type Rule = {
  id: keyof ScoringConfig["rules"];
  points: number;
  reason: string;
  matches: (business: BusinessRecord, config: ScoringConfig) => boolean;
};

const rules: Rule[] = [
  { id: "noWebsite", points: 25, reason: "Tidak memiliki website", matches: (b) => b.websiteStatus === "none" },
  { id: "phoneAvailable", points: 25, reason: "Memiliki nomor telepon", matches: (b) => Boolean(b.phone) },
  { id: "socialMediaAvailable", points: 20, reason: "Memiliki akun sosial media", matches: (b) => Boolean(b.socialMedia?.length) },
  { id: "targetCategory", points: 15, reason: "Termasuk kategori target", matches: (b, c) => Boolean(b.category && c.targetCategories.some((target) => target.trim().toLowerCase() === b.category?.trim().toLowerCase())) },
  { id: "ratingAtLeast4", points: 5, reason: "Rating minimal 4.0", matches: (b) => b.rating !== null && b.rating >= 4 },
  { id: "reviewsAtLeast100", points: 5, reason: "Memiliki minimal 100 reviews", matches: (b) => b.reviewCount !== null && b.reviewCount >= 100 },
  { id: "reviewsAtLeast500", points: 5, reason: "Memiliki minimal 500 reviews", matches: (b) => b.reviewCount !== null && b.reviewCount >= 500 },
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