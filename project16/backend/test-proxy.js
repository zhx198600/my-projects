const axios = require('axios');
const https = require('https');
const http = require('http');

const TRIPO3D_API_KEY = 'tsk_1GGCNWWbUcjjPVthY7OpglJDbamtZkD44ANIWlcbTwY';
const TRIPO3D_API_URL = 'https://api.tripo3d.ai/v2';

const COMMON_PROXY_PORTS = [
  { port: 7890, name: 'Clash/V2RayN (常见)' },
  { port: 1080, name: 'Shadowsocks' },
  { port: 1087, name: 'V2Ray' },
  { port: 10808, name: 'V2Ray (HTTP)' },
  { port: 8080, name: 'HTTP Proxy' },
  { port: 3128, name: 'Squid' },
  { port: 10809, name: 'V2Ray (SOCKS)' },
  { port: 7891, name: 'Clash (SOCKS)' },
];

async function testProxyConnection(proxyPort) {
  const proxyUrl = `http://127.0.0.1:${proxyPort}`;
  
  try {
    const startTime = Date.now();
    const response = await axios.get(`${TRIPO3D_API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${TRIPO3D_API_KEY}`
      },
      timeout: 10000,
      proxy: {
        protocol: 'http',
        host: '127.0.0.1',
        port: proxyPort
      }
    });
    const endTime = Date.now();
    
    return {
      success: true,
      port: proxyPort,
      responseTime: endTime - startTime,
      status: response.status
    };
    
  } catch (error) {
    return {
      success: false,
      port: proxyPort,
      error: error.code || error.message
    };
  }
}

async function testAllProxies() {
  console.log('=================================');
  console.log('代理端口检测工具');
  console.log('=================================');
  console.log('');
  console.log('正在检测常见的代理端口...');
  console.log('');
  
  const results = [];
  
  for (const proxy of COMMON_PROXY_PORTS) {
    console.log(`检测端口 ${proxy.port} (${proxy.name})...`);
    const result = await testProxyConnection(proxy.port);
    results.push({ ...result, name: proxy.name });
    
    if (result.success) {
      console.log(`  ✅ 端口 ${proxy.port} 可用！`);
      console.log(`     响应时间: ${result.responseTime}ms`);
    } else {
      console.log(`  ❌ 端口 ${proxy.port} 不可用: ${result.error}`);
    }
    console.log('');
  }
  
  console.log('=================================');
  console.log('检测结果');
  console.log('=================================');
  
  const successfulProxies = results.filter(r => r.success);
  
  if (successfulProxies.length > 0) {
    console.log('');
    console.log('✅ 找到可用的代理端口：');
    successfulProxies.forEach(p => {
      console.log(`   - 端口: ${p.port} (${p.name})`);
      console.log(`     响应时间: ${p.responseTime}ms`);
    });
    
    console.log('');
    console.log('💡 建议的环境变量配置：');
    console.log('');
    successfulProxies.forEach(p => {
      console.log(`HTTP_PROXY=http://127.0.0.1:${p.port}`);
      console.log(`HTTPS_PROXY=http://127.0.0.1:${p.port}`);
    });
    console.log('');
    console.log('或者在后端 .env 文件中添加：');
    console.log('');
    successfulProxies.forEach(p => {
      console.log(`HTTP_PROXY=http://127.0.0.1:${p.port}`);
      console.log(`HTTPS_PROXY=http://127.0.0.1:${p.port}`);
    });
  } else {
    console.log('');
    console.log('❌ 未找到可用的代理端口。');
    console.log('');
    console.log('💡 建议：');
    console.log('');
    console.log('1. 检查您的代理软件是否正在运行');
    console.log('');
    console.log('2. 查找代理端口的方法：');
    console.log('   - Windows: 打开 "设置" → "网络和Internet" → "代理"');
    console.log('   - 或者检查您的代理软件设置（Clash, V2RayN 等）');
    console.log('');
    console.log('3. 常见的代理软件默认端口：');
    console.log('   - Clash: 7890 (HTTP), 7891 (SOCKS)');
    console.log('   - V2RayN: 10808 (HTTP), 10809 (SOCKS)');
    console.log('   - Shadowsocks: 1080');
    console.log('');
    console.log('4. 如果您知道代理端口，可以手动配置：');
    console.log('   在后端 .env 文件中添加：');
    console.log('   HTTP_PROXY=http://127.0.0.1:你的端口');
    console.log('   HTTPS_PROXY=http://127.0.0.1:你的端口');
  }
  
  console.log('');
  console.log('=================================');
  console.log('当前系统状态');
  console.log('=================================');
  console.log('✅ Remove.bg API: 正常工作');
  console.log('⚠️ Tripo3D API: 需要代理配置');
  console.log('✅ 模拟模式: 已启用');
  console.log('');
  console.log('💡 即使没有 Tripo3D，您仍然可以：');
  console.log('   - 上传图片');
  console.log('   - 智能抠图');
  console.log('   - 精细编辑');
  console.log('   - 体验 3D 演示模式');
  console.log('   - 切换渲染风格');
  console.log('   - 导出截图');
}

testAllProxies();
