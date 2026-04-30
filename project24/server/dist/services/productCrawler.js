"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlProduct = crawlProduct;
exports.crawlProducts = crawlProducts;
const crawlerService_1 = require("./crawlerService");
const jdParser_1 = require("../parsers/jdParser");
const tmallParser_1 = require("../parsers/tmallParser");
const mockService_1 = require("./mockService");
async function crawlProduct(url, enableMockFallback = true) {
    const platform = crawlerService_1.crawlerService.detectPlatform(url);
    console.log(`开始爬取: ${url}, 平台: ${platform}`);
    if (platform === 'unknown') {
        return {
            success: false,
            error: '不支持的平台，目前仅支持京东和天猫商品链接'
        };
    }
    try {
        let productInfo;
        if (platform === 'jd') {
            productInfo = await (0, jdParser_1.parseJDProduct)(url);
        }
        else {
            productInfo = await (0, tmallParser_1.parseTmallProduct)(url);
        }
        const hasValidData = productInfo.title &&
            productInfo.title !== '京东商品' &&
            productInfo.title !== '天猫商品' &&
            productInfo.params.length > 0;
        if (!hasValidData && enableMockFallback) {
            console.log(`真实爬虫数据不完整，启用Mock数据降级: ${url}`);
            return {
                success: true,
                data: (0, mockService_1.generateMockProduct)(url, platform),
                usedMock: true
            };
        }
        return {
            success: true,
            data: productInfo,
            usedMock: false
        };
    }
    catch (error) {
        console.error(`爬取失败 ${url}:`, error instanceof Error ? error.message : '未知错误');
        if (enableMockFallback) {
            console.log(`爬虫失败，启用Mock数据降级: ${url}`);
            return {
                success: true,
                data: (0, mockService_1.generateMockProduct)(url, platform),
                usedMock: true,
                error: error instanceof Error ? error.message : '爬虫失败，已使用模拟数据'
            };
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : '爬虫失败'
        };
    }
}
async function crawlProducts(urls) {
    const results = await Promise.allSettled(urls.map(url => crawlProduct(url, true)));
    return results.map((result, index) => {
        if (result.status === 'fulfilled') {
            return result.value;
        }
        const url = urls[index];
        const platform = crawlerService_1.crawlerService.detectPlatform(url);
        console.log(`爬取异常，启用Mock降级: ${url}`);
        return {
            success: true,
            data: (0, mockService_1.generateMockProduct)(url, platform === 'unknown' ? 'jd' : platform),
            usedMock: true,
            error: '爬取异常，已使用模拟数据'
        };
    });
}
