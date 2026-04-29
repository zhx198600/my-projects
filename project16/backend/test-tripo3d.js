const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const TRIPO3D_API_KEY = 'tsk_76LZJ_XyMTtS2BLunSai40ZgKzXPEU9fif4ZCzxX8-A';
const TRIPO3D_API_URL = 'https://api.tripo3d.ai/v2';

async function testTripo3DConnection() {
  console.log('=================================');
  console.log('测试 Tripo3D API 连接...');
  console.log('=================================');
  
  try {
    console.log('\n1. 测试 API 基本连接...');
    console.log(`   URL: ${TRIPO3D_API_URL}/tasks`);
    
    const startTime = Date.now();
    
    const response = await axios.get(`${TRIPO3D_API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${TRIPO3D_API_KEY}`
      },
      timeout: 15000
    });
    
    const endTime = Date.now();
    
    console.log(`   ✅ 连接成功！`);
    console.log(`   响应时间: ${endTime - startTime}ms`);
    console.log(`   状态码: ${response.status}`);
    
    if (response.data) {
      console.log(`   响应数据: ${JSON.stringify(response.data).substring(0, 200)}...`);
    }
    
    console.log('\n=================================');
    console.log('Tripo3D API 连接测试成功！');
    console.log('=================================');
    
    return true;
    
  } catch (error) {
    console.log('\n=================================');
    console.log('❌ Tripo3D API 连接测试失败');
    console.log('=================================');
    
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
    
    if (error.config) {
      console.log(`   请求 URL: ${error.config.url}`);
      console.log(`   请求方法: ${error.config.method}`);
    }
    
    console.log('\n可能的原因：');
    console.log('1. 网络连接问题（防火墙、代理等）');
    console.log('2. DNS 解析问题');
    console.log('3. Tripo3D 服务暂时不可用');
    console.log('4. 区域限制（Tripo3D 可能在某些地区不可用）');
    
    console.log('\n建议：');
    console.log('1. 检查网络连接');
    console.log('2. 尝试使用 VPN 或代理');
    console.log('3. 稍后重试');
    console.log('4. 当前系统会自动切换到模拟模式，您仍然可以体验其他功能');
    
    return false;
  }
}

testTripo3DConnection();
