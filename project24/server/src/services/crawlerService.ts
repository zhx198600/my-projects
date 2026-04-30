import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import type { PlatformType } from '../types/product';

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
  private axiosInstance: AxiosInstance;
  private userAgentIndex: number = 0;

  constructor() {
    this.axiosInstance = axios.create({
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

  private getRandomUserAgent(): string {
    this.userAgentIndex = (this.userAgentIndex + 1) % USER_AGENTS.length;
    return USER_AGENTS[this.userAgentIndex];
  }

  detectPlatform(url: string): PlatformType {
    if (url.includes('jd.com') || url.includes('jd.hk')) {
      return 'jd';
    }
    if (url.includes('tmall.com') || url.includes('taobao.com')) {
      return 'tmall';
    }
    return 'unknown';
  }

  async fetchPage(url: string): Promise<string> {
    try {
      await this.randomDelay(500, 1500);
      
      const response = await this.axiosInstance.get(url, {
        headers: {
          'Referer': new URL(url).origin
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('爬虫请求失败:', error instanceof Error ? error.message : '未知错误');
      throw new Error(`页面抓取失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  loadHtml(html: string): cheerio.CheerioAPI {
    return cheerio.load(html);
  }

  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  cleanText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  extractPrice(text: string): string {
    const priceMatch = text.match(/[\d,.]+/);
    return priceMatch ? priceMatch[0] : '0';
  }
}

export const crawlerService = new CrawlerService();
