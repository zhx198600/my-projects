const axios = require('axios');

const TRIPO3D_API_KEY = 'tsk_1GGCNWWbUcjjPVthY7OpglJDbamtZkD44ANIWlcbTwY';
const TRIPO3D_API_URL = 'https://api.tripo3d.ai/v2';
const PROXY_PORT = 58421;

async function testProxy() {
  console.log('=================================');
  console.log('测试代理端口 58421');
  console.log('=================================');
  console.log('');
  
  try {
    console.log('测试 1: 无代理连接...');
    const start1 = Date.now();
    const response1 = await axios.get(`${TRIPO3D_API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${TRIPO3D_API_KEY}`
      },
      timeout: 5000
    });
    console.log(`  ✅ 无代理连接成功！响应时间: ${Date.now() - start1}ms`);
    return true;
  } catch (error) {
    console.log(`  ❌ 无代理连接失败: ${error.code || error.message}`);
  }
  
  console.log('');
  console.log('测试 2: 使用代理端口 58421 连接...');
  
  try {
    const start2 = Date.now();
    const response2 = await axios.get(`${TRIPO3D_API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${TRIPO3D_API_KEY}`
      },
      timeout: 10000,
      proxy: {
        protocol: 'http',
        host: '127.0.0.1',
        port: PROXY_PORT
      }
    });
    const end2 = Date.now();
    
    console.log(`  ✅ 代理连接成功！`);
    console.log(`     响应时间: ${end2 - start2}ms`);
    console.log(`     状态码: ${response2.status}`);
    
    if (response2.data) {
      console.log(`     响应数据: ${JSON.stringify(response2.data).substring(0, 300)}...`);
    }
    
    console.log('');
    console.log('=================================');
    console.log('🎉 代理配置成功！');
    console.log('=================================');
    console.log('');
    console.log('请在后端 .env 文件中添加以下配置：');
    console.log('');
    console.log(`HTTP_PROXY=http://127.0.0.1:${PROXY_PORT}`);
    console.log(`HTTPS_PROXY=http://127.0.0.1:${PROXY_PORT}`);
    console.log('');
    console.log('或者，我可以直接帮您配置。');
    
    return true;
    
  } catch (error) {
    console.log(`  ❌ 代理连接失败: ${error.code || error.message}`);
    
    if (error.response) {
      console.log(`     状态码: ${error.response.status}`);
      if (error.response.data) {
        console.log(`     响应数据: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    console.log('');
    console.log('=================================');
    console.log('建议');
    console.log('=================================');
    console.log('');
    console.log('如果端口 58421 不正确，请检查您的 Clash 设置：');
    console.log('');
    console.log('常见的 Clash 端口：');
    console.log('  - HTTP 代理: 7890');
    console.log('  - SOCKS5 代理: 7891');
    console.log('  - 混合端口: 7890');
    console.log('');
    console.log('请在 Clash 软件中查看正确的代理端口，然后告诉我。');
    
    return false;
  }
}

testProxy();
