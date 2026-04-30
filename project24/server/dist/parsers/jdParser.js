"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJDProduct = parseJDProduct;
const crawlerService_1 = require("../services/crawlerService");
async function parseJDProduct(url) {
    try {
        const html = await crawlerService_1.crawlerService.fetchPage(url);
        const $ = crawlerService_1.crawlerService.loadHtml(html);
        const title = crawlerService_1.crawlerService.cleanText($('div.sku-name').text() || $('h1').first().text() || $('#name h1').text());
        const priceText = $('span.p-price').text() || $('span.price').text() || $('.p-price .price').text();
        const price = crawlerService_1.crawlerService.extractPrice(priceText);
        const brand = crawlerService_1.crawlerService.cleanText($('#parameter-brand li').first().text() || $('ul#parameter-brand a').text() || $('.p-author').text());
        const image = $('img#spec-img').attr('src') || $('.jqzoom').attr('src') || $('.main-img').attr('src') || '';
        const fullImage = image.startsWith('//') ? `https:${image}` : image;
        const params = [];
        $('ul.p-parameter-list li').each((_, elem) => {
            const text = crawlerService_1.crawlerService.cleanText($(elem).text());
            if (text && text.includes('：')) {
                const [key, value] = text.split('：', 2);
                if (key && value) {
                    params.push({
                        key: crawlerService_1.crawlerService.cleanText(key),
                        value: crawlerService_1.crawlerService.cleanText(value)
                    });
                }
            }
        });
        if (params.length === 0) {
            $('#detail .tab-con .p-parameter-list li').each((_, elem) => {
                const text = crawlerService_1.crawlerService.cleanText($(elem).text());
                if (text && text.includes('：')) {
                    const [key, value] = text.split('：', 2);
                    if (key && value) {
                        params.push({
                            key: crawlerService_1.crawlerService.cleanText(key),
                            value: crawlerService_1.crawlerService.cleanText(value)
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
    }
    catch (error) {
        console.error('京东解析失败:', error);
        throw error;
    }
}
