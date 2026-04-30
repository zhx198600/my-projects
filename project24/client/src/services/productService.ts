import type { ProductInfo, ReviewAnalysis, RecommendationResult, DimensionType } from '../types/product';

const API_BASE_URL = 'http://localhost:3000/api';

function generateReviewAnalysis(): ReviewAnalysis {
  const positiveReviews = [
    { id: 'p1', userName: '小明', content: '这个产品真的太好了，质量非常棒，很满意！', rating: 5, date: '2024-04-15', sentiment: 'positive' as const },
    { id: 'p2', userName: 'VIP会员', content: '发货很快，包装也很好，用起来不错，推荐购买。', rating: 5, date: '2024-04-10', sentiment: 'positive' as const },
    { id: 'p3', userName: '张先生', content: '性价比很高，超出预期，真心不错的选择！', rating: 4, date: '2024-04-08', sentiment: 'positive' as const },
    { id: 'p4', userName: '数码达人', content: '做工精细，用料讲究，大品牌值得信赖。', rating: 5, date: '2024-04-05', sentiment: 'positive' as const },
    { id: 'p5', userName: '李女士', content: '物超所值，比实体店便宜多了，正品保障！', rating: 5, date: '2024-04-01', sentiment: 'positive' as const },
  ];

  const negativeReviews = [
    { id: 'n1', userName: '购物狂', content: '客服态度极差，问半天没人理。', rating: 1, date: '2024-03-28', sentiment: 'negative' as const },
    { id: 'n2', userName: '买家***9', content: '发货慢死了，等了半个月才到。', rating: 2, date: '2024-03-25', sentiment: 'negative' as const },
  ];

  const allReviews = [
    ...positiveReviews,
    { id: 'm1', userName: '用户***8', content: '整体还可以吧，一分钱一分货。', rating: 3, date: '2024-04-12', sentiment: 'neutral' as const },
    { id: 'm2', userName: '刘先生', content: '还行，中规中矩，没有特别惊喜。', rating: 3, date: '2024-04-02', sentiment: 'neutral' as const },
    { id: 'm3', userName: '资深评测', content: '用了一段时间，感觉一般般。', rating: 3, date: '2024-03-30', sentiment: 'neutral' as const },
    ...negativeReviews,
  ];

  return {
    totalReviews: 15,
    positiveRate: 67,
    positiveCount: 10,
    neutralCount: 3,
    negativeCount: 2,
    topKeywords: [
      { keyword: '很好', count: 8 },
      { keyword: '不错', count: 6 },
      { keyword: '推荐', count: 5 },
      { keyword: '棒', count: 4 },
      { keyword: '满意', count: 4 },
      { keyword: '值得', count: 3 },
      { keyword: '正品', count: 3 },
      { keyword: '慢', count: 2 },
      { keyword: '客服', count: 1 },
      { keyword: '差', count: 1 },
    ],
    positiveReviews,
    negativeReviews,
    allReviews,
  };
}

export interface AnalyzeResult {
  success: boolean;
  message: string;
  total: number;
  mockCount: number;
  results: (ProductInfo & { success: boolean; usedMock: boolean; error?: string })[];
}

export async function analyzeProducts(urls: string[], timeout: number = 30000): Promise<AnalyzeResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '请求失败，请稍后重试');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('请求超时，请检查网络连接或稍后重试');
    }
    console.error('Error analyzing products:', error);
    throw error;
  }
}

export async function fetchProduct(url: string): Promise<ProductInfo | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return {
        ...result.data,
        id: generateId(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return getMockProducts()[0];
  }
}

export function getMockProducts(): (ProductInfo & { usedMock: boolean })[] {
  return [
    {
      id: '1',
      title: 'Apple iPhone 15 Pro Max 256GB 原色钛金属 移动联通电信5G手机',
      price: '9999.00',
      brand: 'Apple',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Apple%20iPhone%2015%20Pro%20Max%20smartphone%20titanium%20finish%20product%20photography%20white%20background&image_size=square',
      url: 'https://item.jd.com/100123456789.html',
      platform: 'jd',
      usedMock: true,
      params: [
        { key: '品牌', value: 'Apple', category: '基本信息' },
        { key: '商品名称', value: 'Apple iPhone 15 Pro Max', category: '基本信息' },
        { key: 'CPU型号', value: 'A17 Pro', category: '性能参数' },
        { key: '机身内存', value: '256GB', category: '存储' },
        { key: '颜色', value: '原色钛金属', category: '外观' },
        { key: '电池容量', value: '4441mAh', category: '电池' },
        { key: '充电功率', value: '27W', category: '电池' },
        { key: '屏幕尺寸', value: '6.7英寸', category: '显示' },
        { key: '屏幕分辨率', value: '2796×1290', category: '显示' },
        { key: '操作系统', value: 'iOS 17', category: '系统' },
      ],
      reviewAnalysis: generateReviewAnalysis(),
    },
    {
      id: '2',
      title: '华为 HUAWEI Mate 60 Pro 12GB+512GB 雅丹黑 卫星通话',
      price: '6999.00',
      brand: '华为HUAWEI',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huawei%20Mate%2060%20Pro%20black%20smartphone%20product%20photo%20professional%20studio%20lighting&image_size=square',
      url: 'https://item.jd.com/100987654321.html',
      platform: 'jd',
      usedMock: true,
      params: [
        { key: '品牌', value: '华为 HUAWEI', category: '基本信息' },
        { key: '商品名称', value: '华为Mate 60 Pro', category: '基本信息' },
        { key: 'CPU型号', value: '麒麟9000S', category: '性能参数' },
        { key: '机身内存', value: '512GB', category: '存储' },
        { key: '颜色', value: '雅丹黑', category: '外观' },
        { key: '电池容量', value: '5000mAh', category: '电池' },
        { key: '充电功率', value: '88W', category: '电池' },
        { key: '屏幕尺寸', value: '6.8英寸', category: '显示' },
        { key: '屏幕分辨率', value: '2720×1260', category: '显示' },
        { key: '操作系统', value: 'HarmonyOS 4.0', category: '系统' },
      ],
      reviewAnalysis: generateReviewAnalysis(),
    },
    {
      id: '3',
      title: '小米14 Pro 16GB+1TB 黑色 骁龙8 Gen3处理器',
      price: '5999.00',
      brand: '小米MI',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Xiaomi%2014%20Pro%20black%20android%20smartphone%20product%20photography%20studio%20quality&image_size=square',
      url: 'https://item.jd.com/100555566666.html',
      platform: 'jd',
      usedMock: true,
      params: [
        { key: '品牌', value: '小米', category: '基本信息' },
        { key: '商品名称', value: '小米14 Pro', category: '基本信息' },
        { key: 'CPU型号', value: '骁龙8 Gen3', category: '性能参数' },
        { key: '机身内存', value: '1TB', category: '存储' },
        { key: '颜色', value: '黑色', category: '外观' },
        { key: '电池容量', value: '4820mAh', category: '电池' },
        { key: '充电功率', value: '120W', category: '电池' },
        { key: '屏幕尺寸', value: '6.73英寸', category: '显示' },
        { key: '屏幕分辨率', value: '3200×1440', category: '显示' },
        { key: '操作系统', value: 'MIUI 15', category: '系统' },
      ],
      reviewAnalysis: generateReviewAnalysis(),
    },
  ];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export async function getRecommendation(
  products: ProductInfo[],
  selectedDimension?: DimensionType
): Promise<RecommendationResult | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products,
        selectedDimension,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get recommendation');
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting recommendation:', error);
    return null;
  }
}

export const dimensionOptions: { key: DimensionType; name: string; icon: string }[] = [
  { key: 'costPerformance', name: '性价比', icon: '💰' },
  { key: 'appearance', name: '外观', icon: '🎨' },
  { key: 'quality', name: '质量', icon: '✅' },
  { key: 'functionality', name: '功能', icon: '⚙️' },
  { key: 'reputation', name: '口碑', icon: '👍' },
];
