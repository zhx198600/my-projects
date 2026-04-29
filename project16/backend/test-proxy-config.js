const axios = require('axios');
require('dotenv').config();

const TRIPO3D_API_KEY = process.env.TRIPO3D_API_KEY || 'tsk_1GGCNWWbUcjjPVthY7OpglJDbamtZkD44ANIWlcbTwY';
const TRIPO3D_API_URL = process.env.TRIPO3D_API_URL || 'https://api.tripo3d.ai/v2';

console.log('=================================');
console.log('Tripo3D API 连接测试 (带代理)');
console.log('=================================');
console.log('');
console.log('环境变量检查：');
console.log(`  HTTP_PROXY: ${process.env.HTTP_PROXY || '未设置'}`);
console.log(`  HTTPS_PROXY: ${process.env.HTTPS_PROXY || '未设置'}`);
console.log(`  API Key: ${TRIPO3D_API_KEY.substring(0, 10)}...`);
console.log(`  API URL: ${TRIPO3D_API_URL}`);
console.log('');

async function testConnection() {
  try {
    console.log('正在测试 Tripo3D API 连接...');
    console.log('');
    
    const startTime = Date.now();
    
    const proxyConfig = {};
    if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
      const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
      const url = new URL(proxyUrl);
      proxyConfig.proxy = {
        protocol: url.protocol.replace(':', ''),
        host: url.hostname,
        port: parseInt(url.port)
      };
      console.log(`使用代理: ${proxyUrl}`);
    }
    
    const response = await axios.get(`${TRIPO3D_API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${TRIPO3D_API_KEY}`
      },
      timeout: 15000,
      ...proxyConfig
    });
    
    const endTime = Date.now();
    
    console.log('');
    console.log('=================================');
    console.log('✅ Tripo3D API 连接成功！');
    console.log('=================================');
    console.log('');
    console.log(`  响应时间: ${endTime - startTime}ms`);
    console.log(`  状态码: ${response.status}`);
    
    if (response.data) {
      console.log('');
      console.log('  响应数据:');
      console.log(`    ${JSON.stringify(response.data).substring(0, 500)}`);
    }
    
    console.log('');
    console.log('🎉 代理配置成功！Tripo3D API 现在可以正常访问了。');
    console.log('');
    console.log('现在您可以：');
    console.log('  1. 上传图片');
    console.log('  2. 智能抠图');
    console.log('  3. 精细编辑');
    console.log('  4. 一键转3D（现在可以真正根据您的图片生成3D模型了！）');
    console.log('  5. 体验不同的渲染风格');
    console.log('  6. 导出3D模型');
    
    return true;
    
  } catch (error) {
    console.log('');
    console.log('=================================');
    console.log('❌ Tripo3D API 连接失败');
    console.log('=================================');
    console.log('');
    
    if (error.code) {
      console.log(`  错误代码: ${error.code}`);
    }
    
    if (error.message) {
      console.log(`  错误信息: ${error.message}`);
    }
    
    if (error.response) {
      console.log(`  状态码: ${error.response.status}`);
      if (error.response.data) {
        console.log(`  响应数据: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    console.log('');
    console.log('可能的原因：');
    console.log('  1. 代理端口不正确（当前配置的是 58421）');
    console.log('  2. Clash 软件没有运行');
    console.log('  3. 代理配置需要调整');
    console.log('');
    console.log('建议：');
    console.log('  1. 确认 Clash 软件正在运行');
    console.log('  2. 确认 Clash 的 HTTP 代理端口是 58421');
    console.log('  3. 如果端口不同，请告诉我正确的端口号');
    
    return false;
  }
}

testConnection();
