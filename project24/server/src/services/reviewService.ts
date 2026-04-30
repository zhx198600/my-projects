import type { Review, ReviewAnalysis, KeywordCount, ReviewSentiment } from '../types/product';

const positiveKeywords = ['好', '棒', '不错', '优秀', '满意', '完美', '给力', '推荐', '超值', '喜欢', '赞', '真心', '很好', '非常好', '太棒', '超棒', '值得', '正品', '很快', '实惠'];
const negativeKeywords = ['差', '垃圾', '烂', '糟糕', '失望', '不好', '太差', '恶心', '坑', '骗人', '劣质', '假货', '慢', '贵', '后悔', '千万别买', '不推荐', '失败', '问题', '客服'];

const userNames = ['小明', '小红', '用户***8', '买家***9', '张先生', '李女士', '王先生', '陈小姐', '刘先生', '赵女士', '超级买家', 'VIP会员', '资深评测', '数码达人', '购物狂'];

const positiveReviewTemplates = [
  '这个产品真的太好了，质量非常棒，很满意！',
  '发货很快，包装也很好，用起来不错，推荐购买。',
  '性价比很高，超出预期，真心不错的选择！',
  '做工精细，用料讲究，大品牌值得信赖。',
  '体验很棒，功能齐全，家人都很喜欢。',
  '物超所值，比实体店便宜多了，正品保障！',
  '客服态度很好，有问题及时解决，点赞！',
  '已经是第二次购买了，一如既往的好。',
  '外观漂亮，手感舒适，使用效果非常棒。',
  '收到货很惊喜，质量杠杠的，强力推荐！',
];

const neutralReviewTemplates = [
  '整体还可以吧，一分钱一分货。',
  '还行，中规中矩，没有特别惊喜。',
  '用了一段时间，感觉一般般。',
  '价格还行，质量也就那样吧。',
  '基本符合描述，没有大问题。',
  '送货速度一般，产品也一般。',
  '还行吧，日常用用还可以。',
  '不算特别好，但也不算差。',
  '无功无过，正常使用没问题。',
  '马马虎虎，符合这个价位。',
];

const negativeReviewTemplates = [
  '太差了，完全不值这个价，后悔买了！',
  '质量真垃圾，用了两天就出问题了。',
  '假货！和实体店买的完全不一样。',
  '客服态度极差，问半天没人理。',
  '发货慢死了，等了半个月才到。',
  '宣传与实物不符，太坑人了！',
  '做工粗糙，到处是瑕疵，不推荐！',
  '用起来很糟糕，体验非常差。',
  '千万别买，谁买谁后悔！',
  '真是失败的一次购物，太失望了。',
];

function analyzeSentiment(content: string): ReviewSentiment {
  let positiveScore = 0;
  let negativeScore = 0;

  for (const keyword of positiveKeywords) {
    if (content.includes(keyword)) {
      positiveScore++;
    }
  }

  for (const keyword of negativeKeywords) {
    if (content.includes(keyword)) {
      negativeScore++;
    }
  }

  if (positiveScore > negativeScore) {
    return 'positive';
  } else if (negativeScore > positiveScore) {
    return 'negative';
  }
  return 'neutral';
}

function getRatingFromSentiment(sentiment: ReviewSentiment): number {
  if (sentiment === 'positive') {
    return Math.floor(Math.random() * 2) + 4;
  } else if (sentiment === 'negative') {
    return Math.floor(Math.random() * 2) + 1;
  }
  return 3;
}

function generateRandomDate(): string {
  const daysAgo = Math.floor(Math.random() * 90);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

export function generateMockReviews(productTitle: string): Review[] {
  const reviews: Review[] = [];
  const totalReviews = 15;

  for (let i = 0; i < totalReviews; i++) {
    let template: string;
    const rand = Math.random();

    if (rand < 0.6) {
      template = positiveReviewTemplates[Math.floor(Math.random() * positiveReviewTemplates.length)];
    } else if (rand < 0.8) {
      template = neutralReviewTemplates[Math.floor(Math.random() * neutralReviewTemplates.length)];
    } else {
      template = negativeReviewTemplates[Math.floor(Math.random() * negativeReviewTemplates.length)];
    }

    const sentiment = analyzeSentiment(template);

    reviews.push({
      id: `review-${i + 1}`,
      userName: userNames[Math.floor(Math.random() * userNames.length)],
      content: template,
      rating: getRatingFromSentiment(sentiment),
      date: generateRandomDate(),
      sentiment,
    });
  }

  return reviews;
}

function extractKeywords(reviews: Review[]): KeywordCount[] {
  const wordCount: Record<string, number> = {};
  const allKeywords = [...positiveKeywords, ...negativeKeywords];

  for (const review of reviews) {
    for (const keyword of allKeywords) {
      if (review.content.includes(keyword)) {
        wordCount[keyword] = (wordCount[keyword] || 0) + 1;
      }
    }
  }

  return Object.entries(wordCount)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export function analyzeReviews(reviews: Review[]): ReviewAnalysis {
  const positiveReviews = reviews.filter((r) => r.sentiment === 'positive');
  const neutralReviews = reviews.filter((r) => r.sentiment === 'neutral');
  const negativeReviews = reviews.filter((r) => r.sentiment === 'negative');

  const positiveCount = positiveReviews.length;
  const neutralCount = neutralReviews.length;
  const negativeCount = negativeReviews.length;
  const totalReviews = reviews.length;
  const positiveRate = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0;

  const topKeywords = extractKeywords(reviews);

  return {
    totalReviews,
    positiveRate,
    positiveCount,
    neutralCount,
    negativeCount,
    topKeywords,
    positiveReviews: positiveReviews.slice(0, 5),
    negativeReviews: negativeReviews.slice(0, 5),
    allReviews: reviews,
  };
}

export function generateReviewAnalysis(productTitle: string): ReviewAnalysis {
  const reviews = generateMockReviews(productTitle);
  return analyzeReviews(reviews);
}
