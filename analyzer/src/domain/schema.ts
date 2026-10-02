export type WebsiteStatus = "present" | "none" | "unknown";
export type DatasetSource = "gmap-collector" | "manual-import" | "analyzer-export";
export type Potential = "high" | "medium" | "low";

export interface BusinessRecord {
  businessId: string;
  name: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  socialMedia: string[] | null;
  website: string | null;
  websiteStatus: WebsiteStatus;
  mapsUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  openingHours: unknown | null;
  businessStatus: string | null;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
  area: string | null;
  collectedAt: string | null;
}

export interface Dataset {
  datasetId: string;
  name: string;
  keyword: string | null;
  location: string | null;
  collectedAt: string | null;
  source: DatasetSource;
  businesses: BusinessRecord[];
}

export interface DatasetEnvelope {
  schemaName: "gmap-prospect-dataset";
  schemaVersion: "1.0";
  dataset: Dataset;
}

export interface PotentialResult {
  businessId: string;
  score: number;
  potential: Potential;
  reasons: string[];
  appliedRules: string[];
  configVersion: string;
}

export interface ScoringConfig {
  configVersion: string;
  targetCategories: string[];
  rules: {
    noWebsite: number;
    targetCategory: number;
    phoneAvailable: number;
    socialMediaAvailable: number;
    ratingAtLeast4: number;
    reviewsAtLeast100: number;
    reviewsAtLeast500: number;
  };
  thresholds: {
    lowMax: number;
    mediumMax: number;
    highMax: number;
  };
}

export const defaultScoringConfig: ScoringConfig = {
  configVersion: "1.0",
  targetCategories: [],
  rules: {
    noWebsite: 25,
    targetCategory: 15,
    phoneAvailable: 25,
    socialMediaAvailable: 25,
    ratingAtLeast4: 5,
    reviewsAtLeast100: 5,
    reviewsAtLeast500: 5,
  },
  thresholds: { lowMax: 49, mediumMax: 79, highMax: 100 },
};

export function createEmptyBusiness(): BusinessRecord {
  return {
    businessId: "",
    name: "",
    category: null,
    address: null,
    phone: null,
    socialMedia: null,
    website: null,
    websiteStatus: "unknown",
    mapsUrl: null,
    rating: null,
    reviewCount: null,
    openingHours: null,
    businessStatus: null,
    latitude: null,
    longitude: null,
    placeId: null,
    area: null,
    collectedAt: null,
  };
}