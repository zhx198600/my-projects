import { crawlerService } from '../services/crawlerService';
import type { ProductInfo, ProductParam } from '../types/product';

export async function parseJDProduct(url: string): Promise<ProductInfo> {
  try {
    const html = await crawlerService.fetchPage(url);
    const $ = crawlerService.loadHtml(html);

    const title = crawlerService.cleanText($('div.sku-name').text() || $('h1').first().text() || $('#name h1').text());

    const priceText = $('span.p-price').text() || $('span.price').text() || $('.p-price .price').text();
    const price = crawlerService.extractPrice(priceText);

    const brand = crawlerService.cleanText($('#parameter-brand li').first().text() || $('ul#parameter-brand a').text() || $('.p-author').text());

    const image = $('img#spec-img').attr('src') || $('.jqzoom').attr('src') || $('.main-img').attr('src') || '';
    const fullImage = image.startsWith('//') ? `https:${image}` : image;

    const params: ProductParam[] = [];
    $('ul.p-parameter-list li').each((_, elem) => {
      const text = crawlerService.cleanText($(elem).text());
      if (text && text.includes('：')) {
        const [key, value] = text.split('：', 2);
        if (key && value) {
          params.push({
            key: crawlerService.cleanText(key),
            value: crawlerService.cleanText(value)
          });
        }
      }
    });

    if (params.length === 0) {
      $('#detail .tab-con .p-parameter-list li').each((_, elem) => {
        const text = crawlerService.cleanText($(elem).text());
        if (text && text.includes('：')) {
          const [key, value] = text.split('：', 2);
          if (key && value) {
            params.push({
              key: crawlerService.cleanText(key),
              value: crawlerService.cleanText(value)
            });
          }
        }
      });
    }

    return {
      title: title || '京东商品',
      price: price || '0',
      brand: brand || '未知品牌',
      image: fullImage,
      url,
      params,
      platform: 'jd'
    };
  } catch (error) {
    console.error('京东解析失败:', error);
    throw error;
  }
}
