const express = require('express');
const cors = require('cors');
const http = require('http');

process.env.PORT = 3333;

const originalApp = require('../src/server.js');

setTimeout(() => {
  console.log('Testing APIs...\n');
  
  function request(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3333,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
  
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              data: JSON.parse(body)
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: body
            });
          }
        });
      });
      req.on('error', reject);
      if (data) req.write(JSON.stringify(data));
      req.end();
    });
  }

  async function run() {
    console.log('1. Testing pagination with invalid page=abc:');
    const r1 = await request('GET', '/api/resumes?page=abc');
    console.log('   Status:', r1.status, 'Data:', JSON.stringify(r1.data).substring(0, 200));

    console.log('\n2. Testing pagination with page=1&pageSize=1:');
    const r2 = await request('GET', '/api/resumes?page=1&pageSize=1');
    console.log('   Status:', r2.status);
    console.log('   Has pagination:', r2.data.pagination ? 'YES' : 'NO');
    if (r2.data.pagination && console.log('   Pagination:', r2.data.pagination));

    console.log('\n3. Testing get resume by ID:');
    const r3 = await request('GET', '/api/resumes/1');
    console.log('   Status:', r3.status, 'Data:', JSON.stringify(r3.data).substring(0, 200));

    console.log('\n4. Testing resume preview:');
    const r4 = await request('GET', '/api/resumes/1/preview');
    console.log('   Status:', r4.status, 'Has data:', r4.data.data ? 'YES' : 'NO');

    console.log('\n5. Testing delete resume with invalid ID:');
    const r5 = await request('DELETE', '/api/resumes/invalid');
    console.log('   Status:', r5.status, 'Data:', JSON.stringify(r5.data));

    process.exit(0);
  }
  run();
}, 1500);
