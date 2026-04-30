import express from 'express';
import cors from 'cors';
import { crawlProducts } from './services/productCrawler';
import { generateRecommendation, getDimensionInfo } from './services/ratingService';
import type { DimensionType } from './types/product';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    success: true
  });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的URL数组'
      });
    }

    if (urls.length < 2 || urls.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'URL数量应在2-5个之间'
      });
    }

    const crawlResults = await crawlProducts(urls);

    const results = crawlResults.map((result, index) => ({
      id: index + 1,
      ...result.data,
      success: result.success,
      usedMock: result.usedMock,
      error: result.error
    }));

    const mockCount = results.filter(r => r.usedMock).length;
    const message = mockCount > 0 
      ? `分析完成（其中 ${mockCount} 个使用了模拟数据）` 
      : '分析完成';

    res.json({
      success: true,
      message,
      total: urls.length,
      mockCount,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: (error as Error).message
    });
  }
});

app.get('/api/crawl', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        message: '请提供有效的URL'
      });
    }

    const result = await crawlProducts([url]);

    res.json({
      success: true,
      message: '爬取完成',
      data: result[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: (error as Error).message
    });
  }
});

app.get('/api/dimensions', (req, res) => {
  try {
    const dimensions = getDimensionInfo();
    res.json({
      success: true,
      data: dimensions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: (error as Error).message
    });
  }
});

app.post('/api/recommend', async (req, res) => {
  try {
    const { products, selectedDimension } = req.body;

    if (!products || !Array.isArray(products) || products.length < 2) {
      return res.status(400).json({
        success: false,
        message: '请提供至少2款商品进行对比'
      });
    }

    const validDimensions: DimensionType[] = ['costPerformance', 'appearance', 'quality', 'functionality', 'reputation'];
    
    if (selectedDimension && !validDimensions.includes(selectedDimension)) {
      return res.status(400).json({
        success: false,
        message: '无效的评分维度'
      });
    }

    const result = generateRecommendation(products, selectedDimension);

    res.json({
      success: true,
      message: '推荐生成成功',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: (error as Error).message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`可用API: POST /api/analyze, GET /api/crawl, GET /api/dimensions, POST /api/recommend`);
});
