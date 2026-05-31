import { spawn } from 'child_process';

const BASE_URL = 'http://127.0.0.1:3001';

async function testAPI() {
  console.log('=== Starting Integration Tests ===\n');

  // Test 1: Health check
  console.log('Test 1: Health Check');
  try {
    const resp = await fetch(`${BASE_URL}/api/health`);
    const data = await resp.json();
    console.log(`  PASS: ${data.message}\n`);
  } catch (error) {
    console.log(`  FAIL: ${error}\n`);
  }

  // Test 2: Register
  console.log('Test 2: Register User');
  let token = '';
  try {
    const resp = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `testuser_${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'test123456'
      })
    });
    const data = await resp.json();
    if (data.success) {
      token = data.data.token;
      console.log(`  PASS: User registered, token obtained\n`);
    } else {
      console.log(`  FAIL: ${data.error}\n`);
    }
  } catch (error) {
    console.log(`  FAIL: ${error}\n`);
  }

  // Test 3: Storage Info
  console.log('Test 3: Get Storage Info');
  try {
    const resp = await fetch(`${BASE_URL}/api/user/storage`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await resp.json();
    if (data.success) {
      console.log(`  PASS: ${data.data.formatted}\n`);
    } else {
      console.log(`  FAIL: ${data.error}\n`);
    }
  } catch (error) {
    console.log(`  FAIL: ${error}\n`);
  }

  // Test 4: Create Folder
  console.log('Test 4: Create Folder');
  let folderId = '';
  try {
    const resp = await fetch(`${BASE_URL}/api/folders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ name: 'TestFolder' })
    });
    const data = await resp.json();
    if (data.success) {
      folderId = data.data.id;
      console.log(`  PASS: Folder created with ID: ${folderId}\n`);
    } else {
      console.log(`  FAIL: ${data.error}\n`);
    }
  } catch (error) {
    console.log(`  FAIL: ${error}\n`);
  }

  // Test 5: Get File List
  console.log('Test 5: Get File List');
  try {
    const resp = await fetch(`${BASE_URL}/api/files`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await resp.json();
    if (data.success) {
      console.log(`  PASS: Got ${data.data.items.length} items\n`);
    } else {
      console.log(`  FAIL: ${data.error}\n`);
    }
  } catch (error) {
    console.log(`  FAIL: ${error}\n`);
  }

  // Test 6: Get Me
  console.log('Test 6: Get Current User Info');
  try {
    const resp = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await resp.json();
    if (data.success) {
      console.log(`  PASS: User: ${data.data.username}\n`);
    } else {
      console.log(`  FAIL: ${data.error}\n`);
    }
  } catch (error) {
    console.log(`  FAIL: ${error}\n`);
  }

  // Test 7: Share
  console.log('Test 7: Create Share');
  let shareCode = '';
  try {
    const resp = await fetch(`${BASE_URL}/api/shares`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ itemId: folderId, itemType: 'folder' })
    });
    const data = await resp.json();
    if (data.success) {
      shareCode = data.data.shareCode;
      console.log(`  PASS: Share created with code: ${shareCode}\n`);
    } else {
      console.log(`  FAIL: ${data.error}\n`);
    }
  } catch (error) {
    console.log(`  FAIL: ${error}\n`);
  }

  // Test 8: Access Share (Public)
  console.log('Test 8: Access Public Share');
  try {
    const resp = await fetch(`${BASE_URL}/api/s/${shareCode}`);
    const data = await resp.json();
    if (data.success) {
      console.log(`  PASS: Public share accessed\n`);
    } else {
      console.log(`  FAIL: ${data.error}\n`);
    }
  } catch (error) {
    console.log(`  FAIL: ${error}\n`);
  }

  // Test 9: Get Shares List
  console.log('Test 9: Get Shares List');
  try {
    const resp = await fetch(`${BASE_URL}/api/shares`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await resp.json();
    if (data.success) {
      console.log(`  PASS: ${data.data.length} shares found\n`);
    } else {
      console.log(`  FAIL: ${data.error}\n`);
    }
  } catch (error) {
    console.log(`  FAIL: ${error}\n`);
  }

  // Test 10: Delete Folder
  console.log('Test 10: Delete Folder');
  try {
    const resp = await fetch(`${BASE_URL}/api/folders/${folderId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await resp.json();
    if (data.success) {
      console.log(`  PASS: Folder deleted\n`);
    } else {
      console.log(`  FAIL: ${data.error}\n`);
    }
  } catch (error) {
    console.log(`  FAIL: ${error}\n`);
  }

  console.log('=== Integration Tests Completed ===');
}

testAPI();
