import type { ProductInfo, ProductScores, DimensionType, RankedProduct, RecommendationResult } from '../types/product';

function normalizeScore(min: number, max: number, value: number): number {
  if (value <= min) return 1;
  if (value >= max) return 10;
  return Math.round((((value - min) / (max - min)) * 9 + 1) * 10) / 10;
}

function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
}

function getBrandTier(brand: string): number {
  const luxuryBrands = ['Apple', '戴森', 'SK-II', 'Nike', '苹果'];
  const premiumBrands = ['华为', 'HUAWEI', '三星', 'Sony', '索尼', 'Dyson'];
  const midBrands = ['小米', 'MI', 'OPPO', 'vivo', '荣耀'];
  
  const brandLower = brand.toLowerCase();
  
  if (luxuryBrands.some(b => brandLower.includes(b.toLowerCase()))) return 3;
  if (premiumBrands.some(b => brandLower.includes(b.toLowerCase()))) return 2;
  if (midBrands.some(b => brandLower.includes(b.toLowerCase()))) return 1;
  return 1;
}

export function calculateCostPerformance(product: ProductInfo, allProducts: ProductInfo[]): number {
  const price = parsePrice(product.price);
  const paramCount = product.params.length;
  
  if (price === 0) return 5;
  
  const valueRatio = paramCount / price;
  
  const allRatios = allProducts.map(p => {
    const pPrice = parsePrice(p.price);
    return pPrice > 0 ? p.params.length / pPrice : 0;
  });
  
  const minRatio = Math.min(...allRatios);
  const maxRatio = Math.max(...allRatios);
  
  return normalizeScore(minRatio, maxRatio, valueRatio);
}

export function calculateAppearance(product: ProductInfo, allProducts: ProductInfo[]): number {
  const price = parsePrice(product.price);
  const brandTier = getBrandTier(product.brand);
  
  const allPrices = allProducts.map(p => parsePrice(p.price));
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  
  const priceScore = normalizeScore(minPrice, maxPrice, price);
  const brandScore = (brandTier / 3) * 10;
  
  return Math.round((priceScore * 0.4 + brandScore * 0.6) * 10) / 10;
}

export function calculateQuality(product: ProductInfo): number {
  if (!product.reviewAnalysis) return 7;
  
  const positiveRate = product.reviewAnalysis.positiveRate;
  const totalReviews = product.reviewAnalysis.totalReviews;
  
  const reviewCountBonus = Math.min(totalReviews / 100, 1);
  
  const baseScore = (positiveRate / 100) * 10;
  const finalScore = baseScore * 0.9 + reviewCountBonus;
  
  return Math.round(Math.min(Math.max(finalScore, 1), 10) * 10) / 10;
}

export function calculateFunctionality(product: ProductInfo, allProducts: ProductInfo[]): number {
  const paramCount = product.params.length;
  const allParamCounts = allProducts.map(p => p.params.length);
  
  const minParams = Math.min(...allParamCounts);
  const maxParams = Math.max(...allParamCounts);
  
  return normalizeScore(minParams, maxParams, paramCount);
}

export function calculateReputation(product: ProductInfo, allProducts: ProductInfo[]): number {
  if (!product.reviewAnalysis) return 7;
  
  const positiveRate = product.reviewAnalysis.positiveRate;
  const negativeCount = product.reviewAnalysis.negativeCount;
  const totalReviews = product.reviewAnalysis.totalReviews;
  
  const negativeRatio = totalReviews > 0 ? (1 - negativeCount / totalReviews) * 10 : 7;
  
  const allPositiveRates = allProducts
    .filter(p => p.reviewAnalysis)
    .map(p => p.reviewAnalysis!.positiveRate);
  
  const minPositive = allPositiveRates.length > 0 ? Math.min(...allPositiveRates) : 50;
  const maxPositive = allPositiveRates.length > 0 ? Math.max(...allPositiveRates) : 98;
  
  const positiveScore = normalizeScore(minPositive, maxPositive, positiveRate);
  
  return Math.round((positiveScore * 0.7 + negativeRatio * 0.3) * 10) / 10;
}

export function calculateAllScores(product: ProductInfo, allProducts: ProductInfo[]): ProductScores {
  return {
    costPerformance: calculateCostPerformance(product, allProducts),
    appearance: calculateAppearance(product, allProducts),
    quality: calculateQuality(product),
    functionality: calculateFunctionality(product, allProducts),
    reputation: calculateReputation(product, allProducts),
  };
}

export function calculateWeightedScore(
  scores: ProductScores,
  selectedDimension?: DimensionType
): { weighted: ProductScores; overall: number } {
  const weights: Record<DimensionType, number> = {
    costPerformance: 1,
    appearance: 1,
    quality: 1,
    functionality: 1,
    reputation: 1,
  };
  
  if (selectedDimension) {
    weights[selectedDimension] = 2;
  }
  
  const weightedScores: ProductScores = {
    costPerformance: scores.costPerformance * weights.costPerformance,
    appearance: scores.appearance * weights.appearance,
    quality: scores.quality * weights.quality,
    functionality: scores.functionality * weights.functionality,
    reputation: scores.reputation * weights.reputation,
  };
  
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const overallScore = Math.round(
    (Object.values(weightedScores).reduce((a, b) => a + b, 0) / totalWeight) * 10
  ) / 10;
  
  return {
    weighted: weightedScores,
    overall: overallScore,
  };
}

export function rankProducts(
  products: ProductInfo[],
  selectedDimension?: DimensionType
): RankedProduct[] {
  return products
    .map(product => {
      const scores = calculateAllScores(product, products);
      const { weighted, overall } = calculateWeightedScore(scores, selectedDimension);
      
      return {
        ...product,
        scores,
        weightedScore: {
          ...weighted,
          overallScore: overall,
        },
      } as RankedProduct;
    })
    .sort((a, b) => b.weightedScore.overallScore - a.weightedScore.overallScore);
}

const dimensionNames: Record<DimensionType, string> = {
  costPerformance: '性价比',
  appearance: '外观',
  quality: '质量',
  functionality: '功能',
  reputation: '口碑',
};

const dimensionDescriptions: Record<DimensionType, { high: string; low: string }> = {
  costPerformance: { high: '性价比极高，每一分钱都物超所值', low: '价格相对较高' },
  appearance: { high: '品牌知名，定位高端，外观设计出众', low: '外观中规中矩' },
  quality: { high: '用户评价极佳，品质可靠', low: '用户评价一般' },
  functionality: { high: '参数丰富，功能全面', low: '基础功能为主' },
  reputation: { high: '市场口碑极佳，用户满意度高', low: '口碑中等' },
};

export function generateRecommendationReason(
  rankedProducts: RankedProduct[],
  selectedDimension?: DimensionType
): string {
  const topProduct = rankedProducts[0];
  const scores = topProduct.scores;
  
  const dimensionEntries = Object.entries(scores) as [DimensionType, number][];
  const sortedDimensions = dimensionEntries.sort((a, b) => b[1] - a[1]);
  const topDimensions = sortedDimensions.slice(0, 2).map(([dim]) => dim);
  
  const reasonParts: string[] = [];
  
  if (selectedDimension) {
    reasonParts.push(`基于您选择的【${dimensionNames[selectedDimension]}】侧重点进行综合评估：`);
    reasonParts.push(`\n\n✨ **推荐 ${topProduct.title}**`);
    reasonParts.push(`\n\n该商品在${dimensionNames[selectedDimension]}方面表现尤为出色（${scores[selectedDimension]}分），${dimensionDescriptions[selectedDimension].high}。`);
  } else {
    reasonParts.push(`基于多维度综合评估：`);
    reasonParts.push(`\n\n✨ **推荐 ${topProduct.title}**`);
  }
  
  reasonParts.push(`\n\n📊 **各维度表现：**`);
  reasonParts.push(`\n- 💰 性价比: ${scores.costPerformance}分`);
  reasonParts.push(`\n- 🎨 外观品牌: ${scores.appearance}分`);
  reasonParts.push(`\n- ✅ 产品质量: ${scores.quality}分`);
  reasonParts.push(`\n- ⚙️ 功能配置: ${scores.functionality}分`);
  reasonParts.push(`\n- 👍 用户口碑: ${scores.reputation}分`);
  reasonParts.push(`\n- 🎯 综合得分: ${topProduct.weightedScore.overallScore}分`);
  
  reasonParts.push(`\n\n💡 **推荐理由：**`);
  if (topDimensions.includes('costPerformance') && topDimensions.includes('functionality')) {
    reasonParts.push(`这款产品在性价比和功能配置方面都表现出色，既能享受到丰富的功能配置，又能获得良好的价格优势。`);
  } else if (topDimensions.includes('quality') && topDimensions.includes('reputation')) {
    reasonParts.push(`这款产品在质量控制和市场口碑方面表现优异，经过大量用户验证，品质值得信赖。`);
  } else if (topDimensions.includes('appearance') && topDimensions.includes('reputation')) {
    reasonParts.push(`这款产品品牌定位高端，外观设计出色，同时拥有良好的用户口碑，彰显品质生活。`);
  } else {
    reasonParts.push(`这款产品在${topDimensions.map(d => dimensionNames[d]).join('、')}方面表现突出，整体实力均衡。`);
  }
  
  if (selectedDimension && rankedProducts.length > 1) {
    const runnerUp = rankedProducts[1];
    reasonParts.push(`\n\n📌 **对比提醒：**`);
    reasonParts.push(`相比第二名 ${runnerUp.title.substring(0, 20)}...（综合得分 ${runnerUp.weightedScore.overallScore}分），该商品在您关注的${dimensionNames[selectedDimension]}维度上更具优势。`);
  }
  
  return reasonParts.join('');
}

export function generateRecommendation(
  products: ProductInfo[],
  selectedDimension?: DimensionType
): RecommendationResult {
  const rankedProducts = rankProducts(products, selectedDimension);
  const recommendationReason = generateRecommendationReason(rankedProducts, selectedDimension);
  
  return {
    recommendedProduct: rankedProducts[0],
    rankedProducts,
    recommendationReason,
    selectedDimension: selectedDimension || null,
    dimensionName: selectedDimension ? dimensionNames[selectedDimension] : '综合推荐',
  };
}

export function getDimensionInfo(): { key: DimensionType; name: string }[] {
  return Object.entries(dimensionNames).map(([key, name]) => ({
    key: key as DimensionType,
    name,
  }));
}
