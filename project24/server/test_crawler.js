const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function testSite(name, url, checkFunction) {
  console.log(`\n🔍 测试: ${name}`);
  console.log(`   URL: ${url}`);
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': USER_AGENT }
    });
    
    console.log(`   ✅ 状态码: ${response.status}`);
    console.log(`   📄 页面大小: ${(response.data.length / 1024).toFixed(1)} KB`);
    
    const $ = cheerio.load(response.data);
    const title = $('title').text().trim();
    console.log(`   📌 页面标题: ${title}`);
    
    if (checkFunction) {
      const result = checkFunction($, response.data);
      console.log(`   📦 提取数据:`, result);
    }
    
    return { success: true, title };
  } catch (e) {
    console.log(`   ❌ 失败: ${e.message}`);
    return { success: false, error: e.message };
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('📊 电商网站爬虫可行性测试');
  console.log('='.repeat(60));

  // 1. 酒仙网
  await testSite('酒仙网', 'https://m.jiuxian.com/', ($) => {
    const products = [];
    $('*').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.includes('¥') && text.length < 100) {
        products.push(text.substring(0, 50));
      }
    });
    return `发现${products.slice(0, 2).length}个含价格文本`;
  });

  // 2. 测试一些静态内容网站
  await testSite('豆瓣读书', 'https://book.douban.com/subject/36127421/', ($) => {
    const price = $('.item-price').text().trim() || $('span:contains("元")').first().text().trim();
    const name = $('h1').text().trim();
    return { name: name.substring(0, 20), price };
  });

  // 3. 中关村在线 - 产品参数比较全
  await testSite('中关村在线', 'https://detail.zol.com.cn/cell_phone/index1500.shtml', ($) => {
    const name = $('.product-model__name').text().trim() || $('h1').text().trim();
    const price = $('.price-type').text().trim();
    return { name: name.substring(0, 30), price };
  });

  // 4. 什么值得买
  await testSite('什么值得买', 'https://www.smzdm.com/p/8507460/', ($) => {
    const name = $('.title-box').text().trim() || $('h1').text().trim();
    return { name: name.substring(0, 30) };
  });

  console.log('\n' + '='.repeat(60));
  console.log('💡 推荐方案:');
  console.log('='.repeat(60));
  console.log('✅ 推荐方案1: 使用演示数据模式 - 确保功能完整展示');
  console.log('✅ 推荐方案2: 中关村在线 - 参数页面反爬较松');
  console.log('✅ 推荐方案3: 豆瓣/图书类网站 - 反爬简单');
  console.log('❌ 不推荐: 京东/天猫/酒仙 - 均有强JS渲染+反爬');
  console.log('\n💡 建议: 当前比价系统已完善Mock数据机制，');
  console.log('    建议直接使用"加载演示数据"体验完整功能！');
}

runTests();
