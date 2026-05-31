const BASE_URL = 'http://localhost:3001/api';

async function test() {
  let token = '';
  let userId = '';
  let folderId = '';
  let fileId = '';

  try {
    console.log('=== 1. 测试注册 ===');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `test${Date.now()}`,
        email: `test${Date.now()}@test.com`,
        password: '123456'
      })
    });
    const registerData = await registerRes.json();
    console.log('注册状态:', registerRes.status);
    console.log('注册结果:', registerData.success ? '成功' : '失败', registerData.error || '');
    token = registerData.data.token;
    userId = registerData.data.user.id;
    console.log('Token:', token.substring(0, 20) + '...');

    console.log('\n=== 2. 测试创建文件夹 ===');
    const folderRes = await fetch(`${BASE_URL}/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: '测试文件夹' })
    });
    const folderData = await folderRes.json();
    console.log('创建文件夹状态:', folderRes.status);
    console.log('创建文件夹结果:', folderData.success ? '成功' : '失败', folderData.error || '');
    folderId = folderData.data.id;
    console.log('文件夹ID:', folderId);

    console.log('\n=== 3. 测试移动文件夹 ===');
    const moveFolderRes = await fetch(`${BASE_URL}/folders/${folderId}/move`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ parentId: null })
    });
    const moveFolderData = await moveFolderRes.json();
    console.log('移动文件夹状态:', moveFolderRes.status);
    console.log('移动文件夹结果:', moveFolderData.success ? '成功' : '失败', moveFolderData.error || '');

    console.log('\n=== 4. 测试删除文件夹 ===');
    const deleteFolderRes = await fetch(`${BASE_URL}/folders/${folderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const deleteFolderData = await deleteFolderRes.json();
    console.log('删除文件夹状态:', deleteFolderRes.status);
    console.log('删除文件夹结果:', deleteFolderData.success ? '成功' : '失败', deleteFolderData.error || '');

    console.log('\n=== 所有API测试完成 ===');

  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

test();
