import { crawlerService } from './crawlerService';
import { parseJDProduct } from '../parsers/jdParser';
import { parseTmallProduct } from '../parsers/tmallParser';
import { generateMockProduct } from './mockService';
import type { CrawlResult, ProductInfo } from '../types/product';

export async function crawlProduct(url: string, enableMockFallback: boolean = true): Promise<CrawlResult> {
  const platform = crawlerService.detectPlatform(url);
  
  console.log(`开始爬取: ${url}, 平台: ${platform}`);

  if (platform === 'unknown') {
    return {
      success: false,
      error: '不支持的平台，目前仅支持京东和天猫商品链接'
    };
  }

  let productInfo: ProductInfo | null = null;
  let crawlError: string | null = null;

  try {
    if (platform === 'jd') {
      productInfo = await parseJDProduct(url);
    } else {
      productInfo = await parseTmallProduct(url);
    }

    const hasValidData = 
      productInfo.title && 
      productInfo.title !== '京东商品' && 
      productInfo.title !== '天猫商品' &&
      productInfo.params.length > 0;

    if (hasValidData) {
      console.log(`爬虫成功获取真实数据: ${productInfo.title}`);
      return {
        success: true,
        data: productInfo,
        usedMock: false
      };
    }

    crawlError = '页面数据不完整，可能受到网站反爬机制限制';
  } catch (error) {
    crawlError = error instanceof Error ? error.message : '爬虫请求失败';
    console.error(`爬取失败 ${url}:`, crawlError);
  }

  if (enableMockFallback) {
    console.log(`启用模拟数据: ${url}, 原因: ${crawlError}`);
    return {
      success: true,
      data: generateMockProduct(url, platform),
      usedMock: true,
      error: crawlError
    };
  }

  return {
    success: false,
    error: crawlError || '爬虫失败'
  };
}

export async function crawlProducts(urls: string[]): Promise<CrawlResult[]> {
  const results = await Promise.allSettled(
    urls.map(url => crawlProduct(url, true))
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    
    const url = urls[index];
    const platform = crawlerService.detectPlatform(url);
    const error = result.reason instanceof Error ? result.reason.message : '爬取异常';
    
    console.log(`爬取异常，启用模拟数据: ${url}`);
    return {
      success: true,
      data: generateMockProduct(url, platform === 'unknown' ? 'jd' : platform),
      usedMock: true,
      error
    };
  });
}
