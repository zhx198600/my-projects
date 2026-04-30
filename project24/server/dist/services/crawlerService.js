"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlerService = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1'
];
class CrawlerService {
    constructor() {
        this.userAgentIndex = 0;
        this.axiosInstance = axios_1.default.create({
            timeout: 15000,
            maxRedirects: 5,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'max-age=0'
            }
        });
        this.axiosInstance.interceptors.request.use((config) => {
            config.headers['User-Agent'] = this.getRandomUserAgent();
            return config;
        });
    }
    getRandomUserAgent() {
        this.userAgentIndex = (this.userAgentIndex + 1) % USER_AGENTS.length;
        return USER_AGENTS[this.userAgentIndex];
    }
    detectPlatform(url) {
        if (url.includes('jd.com') || url.includes('jd.hk')) {
            return 'jd';
        }
        if (url.includes('tmall.com') || url.includes('taobao.com')) {
            return 'tmall';
        }
        return 'unknown';
    }
    async fetchPage(url) {
        try {
            await this.randomDelay(500, 1500);
            const response = await this.axiosInstance.get(url, {
                headers: {
                    'Referer': new URL(url).origin
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('爬虫请求失败:', error instanceof Error ? error.message : '未知错误');
            throw new Error(`页面抓取失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }
    loadHtml(html) {
        return cheerio.load(html);
    }
    async randomDelay(min, max) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }
    cleanText(text) {
        return text.replace(/\s+/g, ' ').trim();
    }
    extractPrice(text) {
        const priceMatch = text.match(/[\d,.]+/);
        return priceMatch ? priceMatch[0] : '0';
    }
}
exports.crawlerService = new CrawlerService();
