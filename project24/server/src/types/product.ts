export interface ProductParam {
  key: string;
  value: string;
}

export type ReviewSentiment = 'positive' | 'neutral' | 'negative';

export interface Review {
  id: string;
  userName: string;
  content: string;
  rating: number;
  date: string;
  sentiment: ReviewSentiment;
}

export interface KeywordCount {
  keyword: string;
  count: number;
}

export interface ReviewAnalysis {
  totalReviews: number;
  positiveRate: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  topKeywords: KeywordCount[];
  positiveReviews: Review[];
  negativeReviews: Review[];
  allReviews: Review[];
}

export interface ProductInfo {
  title: string;
  price: string;
  brand: string;
  image: string;
  url: string;
  params: ProductParam[];
  platform: 'jd' | 'tmall' | 'unknown';
  reviewAnalysis?: ReviewAnalysis;
}

export interface CrawlResult {
  success: boolean;
  data?: ProductInfo;
  error?: string;
  usedMock?: boolean;
}

export type PlatformType = 'jd' | 'tmall' | 'unknown';

export type DimensionType = 'costPerformance' | 'appearance' | 'quality' | 'functionality' | 'reputation';

export interface ProductScores {
  costPerformance: number;
  appearance: number;
  quality: number;
  functionality: number;
  reputation: number;
}

export interface WeightedScore extends ProductScores {
  overallScore: number;
}

export interface RankedProduct extends ProductInfo {
  scores: ProductScores;
  weightedScore: WeightedScore;
}

export interface RecommendationResult {
  recommendedProduct: RankedProduct;
  rankedProducts: RankedProduct[];
  recommendationReason: string;
  selectedDimension: DimensionType | null;
  dimensionName: string;
}

export interface ProductRecommendationRequest {
  products: ProductInfo[];
  selectedDimension?: DimensionType;
}
