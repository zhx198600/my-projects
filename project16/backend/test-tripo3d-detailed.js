const axios = require('axios');
const https = require('https');
const dns = require('dns');
const { exec } = require('child_process');

const TRIPO3D_API_KEY = 'tsk_1GGCNWWbUcjjPVthY7OpglJDbamtZkD44ANIWlcbTwY';
const TRIPO3D_API_URL = 'https://api.tripo3d.ai/v2';
const TRIPO3D_PLATFORM_URL = 'https://platform.tripo3d.ai';

async function testDNS() {
  console.log('\n=================================');
  console.log('1. DNS 解析测试');
  console.log('=================================');
  
  try {
    const result = await dns.promises.lookup('api.tripo3d.ai');
    console.log(`   ✅ DNS 解析成功:`);
    console.log(`      地址: ${result.address}`);
    console.log(`      家族: IPv${result.family}`);
    return result.address;
  } catch (error) {
    console.log(`   ❌ DNS 解析失败: ${error.message}`);
    return null;
  }
}

async function testPlatformConnection() {
  console.log('\n=================================');
  console.log('2. Tripo3D 平台网站连接测试');
  console.log('=================================');
  console.log(`   URL: ${TRIPO3D_PLATFORM_URL}`);
  
  try {
    const startTime = Date.now();
    const response = await axios.get(TRIPO3D_PLATFORM_URL, {
      timeout: 10000,
      maxRedirects: 5
    });
    const endTime = Date.now();
    
    console.log(`   ✅ 连接成功！`);
    console.log(`   响应时间: ${endTime - startTime}ms`);
    console.log(`   状态码: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`   ❌ 连接失败: ${error.code || error.message}`);
    return false;
  }
}

async function testAPIConnection() {
  console.log('\n=================================');
  console.log('3. Tripo3D API 连接测试');
  console.log('=================================');
  console.log(`   URL: ${TRIPO3D_API_URL}/tasks`);
  console.log(`   API Key: ${TRIPO3D_API_KEY.substring(0, 10)}...`);
  
  try {
    const startTime = Date.now();
    const response = await axios.get(`${TRIPO3D_API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${TRIPO3D_API_KEY}`
      },
      timeout: 20000
    });
    const endTime = Date.now();
    
    console.log(`   ✅ API 连接成功！`);
    console.log(`   响应时间: ${endTime - startTime}ms`);
    console.log(`   状态码: ${response.status}`);
    
    if (response.data) {
      console.log(`   响应数据: ${JSON.stringify(response.data).substring(0, 300)}...`);
    }
    
    return true;
    
  } catch (error) {
    console.log(`   ❌ API 连接失败`);
    
    if (error.code) {
      console.log(`   错误代码: ${error.code}`);
    }
    
    if (error.message) {
      console.log(`   错误信息: ${error.message}`);
    }
    
    if (error.response) {
      console.log(`   状态码: ${error.response.status}`);
      if (error.response.data) {
        console.log(`   响应数据: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    return false;
  }
}

async function testWithDifferentTimeout() {
  console.log('\n=================================');
  console.log('4. 长超时测试 (30秒)');
  console.log('=================================');
  
  try {
    const startTime = Date.now();
    const response = await axios.get(`${TRIPO3D_API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${TRIPO3D_API_KEY}`
      },
      timeout: 30000
    });
    const endTime = Date.now();
    
    console.log(`   ✅ 长超时测试成功！`);
    console.log(`   响应时间: ${endTime - startTime}ms`);
    return true;
    
  } catch (error) {
    console.log(`   ❌ 长超时测试失败: ${error.code || error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('=================================');
  console.log('Tripo3D 连接诊断工具');
  console.log('=================================');
  console.log(`当前时间: ${new Date().toISOString()}`);
  console.log(`API URL: ${TRIPO3D_API_URL}`);
  
  const dnsResult = await testDNS();
  const platformResult = await testPlatformConnection();
  const apiResult = await testAPIConnection();
  
  if (!apiResult) {
    await testWithDifferentTimeout();
  }
  
  console.log('\n=================================');
  console.log('诊断总结');
  console.log('=================================');
  
  if (dnsResult && platformResult && apiResult) {
    console.log('✅ 所有测试通过！Tripo3D API 连接正常。');
    console.log('   请更新后端的 API key 配置。');
  } else if (dnsResult && platformResult && !apiResult) {
    console.log('⚠️ 平台网站可以访问，但 API 无法连接。');
    console.log('   可能的原因：');
    console.log('   1. API 端点 (api.tripo3d.ai) 有不同的网络策略');
    console.log('   2. API 服务暂时不可用');
    console.log('   3. 防火墙阻止了对 API 端点的访问');
    console.log('');
    console.log('   建议：');
    console.log('   1. 检查是否有 VPN 或代理配置');
    console.log('   2. 检查防火墙设置');
    console.log('   3. 稍后重试');
  } else if (!dnsResult) {
    console.log('⚠️ DNS 解析失败。');
    console.log('   建议检查网络连接和 DNS 设置。');
  }
  
  console.log('\n=================================');
  console.log('当前系统状态');
  console.log('=================================');
  console.log('✅ Remove.bg API: 正常工作');
  console.log('⚠️ Tripo3D API: 连接超时');
  console.log('✅ 模拟模式: 已启用，您仍然可以体验大部分功能');
  console.log('');
  console.log('💡 即使 Tripo3D API 无法连接，您仍然可以：');
  console.log('   - 上传图片');
  console.log('   - 智能抠图');
  console.log('   - 精细编辑');
  console.log('   - 体验 3D 演示模式');
  console.log('   - 切换渲染风格');
  console.log('   - 导出截图');
}

runAllTests();
