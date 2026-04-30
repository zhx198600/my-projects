import { crawlerService } from '../services/crawlerService';
import type { ProductInfo, ProductParam } from '../types/product';

export async function parseTmallProduct(url: string): Promise<ProductInfo> {
  try {
    const html = await crawlerService.fetchPage(url);
    const $ = crawlerService.loadHtml(html);

    const title = crawlerService.cleanText(
      $('h1.ItemHeader--title--3Vq_B9A').text() || 
      $('.tb-detail-hd h1').text() || 
      $('h1').first().text()
    );

    const priceText = 
      $('.ItemPrice--priceReal--1uiyqhh span').text() ||
      $('.tm-price').text() || 
      $('.price').text();
    const price = crawlerService.extractPrice(priceText);

    const brand = crawlerService.cleanText(
      $('.ShopHeaderNew--brandName--2i6810_').text() ||
      $('.shop-header a.shop-name').text() ||
      $('.shop-info .name').text()
    );

    const image = 
      $('.ItemPic--mainPic--11694U1 img').attr('src') ||
      $('#J_ImgBooth').attr('src') || 
      $('img.main-img').attr('src') || 
      '';
    const fullImage = image.startsWith('//') ? `https:${image}` : image;

    const params: ProductParam[] = [];
    $('.InfoGroup--groupItem--2hA1Y1z').each((_, elem) => {
      const key = crawlerService.cleanText($(elem).find('.InfoGroup--label--2D1O05I').text());
      const value = crawlerService.cleanText($(elem).find('.InfoGroup--value--1Tj8WxS').text());
      if (key && value) {
        params.push({ key, value });
      }
    });

    if (params.length === 0) {
      $('#J_AttrList li').each((_, elem) => {
        const key = crawlerService.cleanText($(elem).find('span.attr-name').text());
        const value = crawlerService.cleanText($(elem).find('span.attr-value').text());
        if (key && value) {
          params.push({ key, value });
        }
      });
    }

    if (params.length === 0) {
      $('.attributes-list li').each((_, elem) => {
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
      title: title || '天猫商品',
      price: price || '0',
      brand: brand || '未知品牌',
      image: fullImage,
      url,
      params,
      platform: 'tmall'
    };
  } catch (error) {
    console.error('天猫解析失败:', error);
    throw error;
  }
}
