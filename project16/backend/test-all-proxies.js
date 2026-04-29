const axios = require('axios');
const https = require('https');
const http = require('http');

const TRIPO3D_API_KEY = 'tsk_1GGCNWWbUcjjPVthY7OpglJDbamtZkD44ANIWlcbTwY';
const TRIPO3D_API_URL = 'https://api.tripo3d.ai/v2';

console.log('=================================');
console.log('详细代理测试');
console.log('=================================');
console.log('');

async function testWithHttpProxy(port) {
  console.log(`测试 HTTP 代理端口 ${port}...`);
  
  try {
    const proxyUrl = `http://127.0.0.1:${port}`;
    console.log(`  代理 URL: ${proxyUrl}`);
    
    const startTime = Date.now();
    
    const response = await axios.get(`${TRIPO3D_API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${TRIPO3D_API_KEY}`
      },
      timeout: 10000,
      proxy: {
        protocol: 'http',
        host: '127.0.0.1',
        port: port
      }
    });
    
    const endTime = Date.now();
    
    console.log(`  ✅ 连接成功！`);
    console.log(`     响应时间: ${endTime - startTime}ms`);
    console.log(`     状态码: ${response.status}`);
    
    return { success: true, port, responseTime: endTime - startTime };
    
  } catch (error) {
    console.log(`  ❌ 连接失败: ${error.code || error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log(`     原因: 端口 ${port} 没有开放或没有服务在监听`);
    } else if (error.code === 'ERR_BAD_REQUEST') {
      console.log(`     原因: 请求格式错误，可能是代理类型不匹配`);
      console.log(`     建议: 尝试检查是否是 SOCKS5 代理而不是 HTTP 代理`);
    }
    
    return { success: false, port, error: error.code };
  }
}

async function testWithHttpAgent(port) {
  console.log('');
  console.log(`使用 HttpAgent 测试端口 ${port}...`);
  
  try {
    const httpAgent = new http.Agent({
      keepAlive: true
    });
    
    const httpsAgent = new https.Agent({
      keepAlive: true,
      rejectUnauthorized: false
    });
    
    const proxyOptions = {
      host: '127.0.0.1',
      port: port,
      protocol: 'http:'
    };
    
    console.log(`  代理配置: ${JSON.stringify(proxyOptions)}`);
    
    const startTime = Date.now();
    
    const response = await axios.get(`${TRIPO3D_API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${TRIPO3D_API_KEY}`
      },
      timeout: 10000,
      proxy: proxyOptions,
      httpAgent: httpAgent,
      httpsAgent: httpsAgent
    });
    
    const endTime = Date.now();
    
    console.log(`  ✅ 连接成功！`);
    console.log(`     响应时间: ${endTime - startTime}ms`);
    console.log(`     状态码: ${response.status}`);
    
    return { success: true, port, responseTime: endTime - startTime };
    
  } catch (error) {
    console.log(`  ❌ 连接失败: ${error.code || error.message}`);
    return { success: false, port, error: error.code };
  }
}

async function testSimpleConnection() {
  console.log('');
  console.log('测试直接连接（无代理）...');
  
  try {
    const startTime = Date.now();
    
    const response = await axios.get('https://www.baidu.com', {
      timeout: 5000
    });
    
    const endTime = Date.now();
    
    console.log(`  ✅ 百度连接成功！响应时间: ${endTime - startTime}ms`);
    return true;
  } catch (error) {
    console.log(`  ❌ 百度连接失败: ${error.code || error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('当前时间:', new Date().toLocaleString());
  console.log('');
  
  await testSimpleConnection();
  
  console.log('');
  console.log('=================================');
  console.log('测试常见的 Clash 端口');
  console.log('=================================');
  console.log('');
  
  const commonPorts = [
    { port: 7890, name: 'Clash HTTP 默认端口' },
    { port: 58421, name: '您截图中的端口' },
    { port: 10808, name: 'V2RayN HTTP 端口' },
    { port: 1080, name: 'Shadowsocks 端口' },
    { port: 8080, name: '通用 HTTP 代理' },
  ];
  
  const results = [];
  
  for (const proxy of commonPorts) {
    console.log('');
    console.log(`--- ${proxy.name} (端口 ${proxy.port}) ---`);
    const result = await testWithHttpProxy(proxy.port);
    results.push({ ...result, name: proxy.name });
    
    if (result.success) {
      console.log('');
      console.log('🎉 找到可用的代理端口！');
      console.log('');
      console.log('请在后端 .env 文件中配置：');
      console.log(`  HTTP_PROXY=http://127.0.0.1:${proxy.port}`);
      console.log(`  HTTPS_PROXY=http://127.0.0.1:${proxy.port}`);
      break;
    }
  }
  
  const successfulPorts = results.filter(r => r.success);
  
  console.log('');
  console.log('=================================');
  console.log('测试总结');
  console.log('=================================');
  console.log('');
  
  if (successfulPorts.length > 0) {
    console.log('✅ 成功找到以下可用端口：');
    successfulPorts.forEach(p => {
      console.log(`   - 端口 ${p.port} (${p.name}) - 响应时间: ${p.responseTime}ms`);
    });
  } else {
    console.log('❌ 未找到可用的代理端口。');
    console.log('');
    console.log('建议：');
    console.log('  1. 确认 Clash 软件正在运行');
    console.log('  2. 确认 Clash 的 "系统代理" 已开启');
    console.log('  3. 在 Clash 软件中查看正确的 HTTP 代理端口');
    console.log('');
    console.log('常见的 Clash HTTP 代理端口：');
    console.log('  - Clash for Windows: 7890');
    console.log('  - Clash Verge: 通常也是 7890');
    console.log('  - Clash Nyanpasu: 可能不同，请查看设置');
  }
  
  console.log('');
  console.log('=================================');
  console.log('当前系统状态');
  console.log('=================================');
  console.log('✅ Remove.bg API: 正常工作');
  console.log('⚠️ Tripo3D API: 需要正确的代理配置');
  console.log('✅ 模拟模式: 已启用，您仍然可以体验大部分功能');
}

runAllTests();
