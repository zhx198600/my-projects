#!/bin/bash

BASE_URL="http://localhost:3001"
TEST_USER="sharetest_$(date +%s)"
TEST_EMAIL="sharetest_$(date +%s)@example.com"
TEST_PASSWORD="test123456"
TOKEN=""
USER_ID=""

FILE1_ID=""
FOLDER1_ID=""
SHARE_CODE_1=""
SHARE_CODE_2=""
SHARE_CODE_3=""
SHARE_CODE_4=""
SHARE_ID_1=""
SHARE_ID_2=""

echo "=========================================="
echo "  分享功能测试"
echo "=========================================="
echo ""

echo "1. 创建用户并上传文件..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$TEST_USER\", \"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}")
echo "   注册响应: $(echo "$REGISTER_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print('成功' if d['success'] else '失败')")"
TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)
USER_ID=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['user']['id'])" 2>/dev/null)

echo "test file content for sharing" > /tmp/share_test_file.txt
UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/files/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@/tmp/share_test_file.txt")
echo "   上传响应: $(echo "$UPLOAD_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print('成功' if d['success'] else '失败')")"
FILE1_ID=$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['files'][0]['id'])" 2>/dev/null)
echo "   文件ID: $FILE1_ID"

FOLDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/folders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "ShareFolder"}')
echo "   文件夹创建: $(echo "$FOLDER_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print('成功' if d['success'] else '失败')")"
FOLDER1_ID=$(echo "$FOLDER_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
echo "   文件夹ID: $FOLDER1_ID"
echo ""

echo "2. 创建文件分享链接（无密码，永不过期）..."
SHARE1_RESPONSE=$(curl -s -X POST "$BASE_URL/api/shares" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"itemId\": \"$FILE1_ID\", \"itemType\": \"file\"}")
echo "   响应: $SHARE1_RESPONSE"
SHARE1_SUCCESS=$(echo "$SHARE1_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$SHARE1_SUCCESS" = "True" ]; then
  SHARE_CODE_1=$(echo "$SHARE1_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['shareCode'])" 2>/dev/null)
  SHARE_ID_1=$(echo "$SHARE1_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
  echo "   ✓ 文件分享创建成功"
  echo "   分享码: $SHARE_CODE_1"
  echo "   分享链接: /s/$SHARE_CODE_1"
else
  echo "   ✗ 文件分享创建失败"
fi
echo ""

echo "3. 不带密码访问分享链接..."
ACCESS1_RESPONSE=$(curl -s -X GET "$BASE_URL/api/s/$SHARE_CODE_1")
echo "   响应: $ACCESS1_RESPONSE"
ACCESS1_SUCCESS=$(echo "$ACCESS1_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$ACCESS1_SUCCESS" = "True" ]; then
  ACCESS1_ITEM=$(echo "$ACCESS1_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['item']['name'])" 2>/dev/null)
  echo "   ✓ 访问成功，文件名: $ACCESS1_ITEM"
else
  echo "   ✗ 访问失败"
fi
echo ""

echo "4. 带密码创建分享链接（密码: 1234）..."
SHARE2_RESPONSE=$(curl -s -X POST "$BASE_URL/api/shares" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"itemId\": \"$FILE1_ID\", \"itemType\": \"file\", \"password\": \"1234\"}")
echo "   响应: $SHARE2_RESPONSE"
SHARE2_SUCCESS=$(echo "$SHARE2_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$SHARE2_SUCCESS" = "True" ]; then
  SHARE_CODE_2=$(echo "$SHARE2_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['shareCode'])" 2>/dev/null)
  SHARE_ID_2=$(echo "$SHARE2_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
  echo "   ✓ 带密码分享创建成功"
  echo "   分享码: $SHARE_CODE_2"
else
  echo "   ✗ 带密码分享创建失败"
fi
echo ""

echo "5. 测试错误密码访问应失败..."
WRONG_PASS_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/s/$SHARE_CODE_2?password=wrong")
WRONG_HTTP_CODE=$(echo "$WRONG_PASS_RESPONSE" | tail -1)
echo "   HTTP 状态码: $WRONG_HTTP_CODE"
if [ "$WRONG_HTTP_CODE" = "403" ]; then
  echo "   ✓ 错误密码正确返回 403"
else
  echo "   ✗ 预期 403，实际 $WRONG_HTTP_CODE"
fi
echo ""

echo "6. 测试正确密码访问应成功..."
CORRECT_PASS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/s/$SHARE_CODE_2?password=1234")
CORRECT_PASS_SUCCESS=$(echo "$CORRECT_PASS_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$CORRECT_PASS_SUCCESS" = "True" ]; then
  echo "   ✓ 正确密码访问成功"
else
  echo "   ✗ 正确密码访问失败"
  echo "   响应: $CORRECT_PASS_RESPONSE"
fi
echo ""

echo "7. 创建过期分享链接（1天过期）..."
SHARE3_RESPONSE=$(curl -s -X POST "$BASE_URL/api/shares" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"itemId\": \"$FILE1_ID\", \"itemType\": \"file\", \"expireDays\": 1}")
echo "   响应: $SHARE3_RESPONSE"
SHARE3_SUCCESS=$(echo "$SHARE3_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$SHARE3_SUCCESS" = "True" ]; then
  SHARE_CODE_3=$(echo "$SHARE3_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['shareCode'])" 2>/dev/null)
  echo "   ✓ 过期分享创建成功"
  echo "   分享码: $SHARE_CODE_3"
else
  echo "   ✗ 过期分享创建失败"
fi
echo ""

echo "8. 创建文件夹分享链接..."
SHARE4_RESPONSE=$(curl -s -X POST "$BASE_URL/api/shares" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"itemId\": \"$FOLDER1_ID\", \"itemType\": \"folder\"}")
echo "   响应: $SHARE4_RESPONSE"
SHARE4_SUCCESS=$(echo "$SHARE4_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$SHARE4_SUCCESS" = "True" ]; then
  SHARE_CODE_4=$(echo "$SHARE4_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['shareCode'])" 2>/dev/null)
  echo "   ✓ 文件夹分享创建成功"
  echo "   分享码: $SHARE_CODE_4"
else
  echo "   ✗ 文件夹分享创建失败"
fi
echo ""

echo "9. 访问文件夹分享链接..."
FOLDER_ACCESS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/s/$SHARE_CODE_4")
FOLDER_ACCESS_SUCCESS=$(echo "$FOLDER_ACCESS_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$FOLDER_ACCESS_SUCCESS" = "True" ]; then
  FOLDER_ITEMS=$(echo "$FOLDER_ACCESS_RESPONSE" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data'].get('items', [])))" 2>/dev/null)
  echo "   ✓ 文件夹分享访问成功，项目数: $FOLDER_ITEMS"
else
  echo "   ✗ 文件夹分享访问失败"
fi
echo ""

echo "10. 获取用户分享列表..."
LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/api/shares" \
  -H "Authorization: Bearer $TOKEN")
echo "   响应: $LIST_RESPONSE"
LIST_SUCCESS=$(echo "$LIST_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$LIST_SUCCESS" = "True" ]; then
  LIST_COUNT=$(echo "$LIST_RESPONSE" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)
  echo "   ✓ 获取分享列表成功，数量: $LIST_COUNT (预期: 4)"
else
  echo "   ✗ 获取分享列表失败"
fi
echo ""

echo "11. 删除分享链接..."
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/shares/$SHARE_ID_1" \
  -H "Authorization: Bearer $TOKEN")
echo "   响应: $DELETE_RESPONSE"
DELETE_SUCCESS=$(echo "$DELETE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$DELETE_SUCCESS" = "True" ]; then
  echo "   ✓ 分享删除成功"
else
  echo "   ✗ 分享删除失败"
fi
echo ""

echo "12. 验证删除后的分享无法访问..."
DELETED_ACCESS_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/s/$SHARE_CODE_1")
DELETED_HTTP_CODE=$(echo "$DELETED_ACCESS_RESPONSE" | tail -1)
echo "   HTTP 状态码: $DELETED_HTTP_CODE"
if [ "$DELETED_HTTP_CODE" = "404" ]; then
  echo "   ✓ 已删除分享正确返回 404"
else
  echo "   ✗ 预期 404，实际 $DELETED_HTTP_CODE"
fi
echo ""

echo "13. 测试文件下载（分享链接）..."
DOWNLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/s/$SHARE_CODE_2/download?password=1234")
DOWNLOAD_HTTP_CODE=$(echo "$DOWNLOAD_RESPONSE" | tail -1)
echo "   HTTP 状态码: $DOWNLOAD_HTTP_CODE"
if [ "$DOWNLOAD_HTTP_CODE" = "200" ]; then
  echo "   ✓ 文件下载成功"
else
  echo "   ✗ 文件下载失败，状态码: $DOWNLOAD_HTTP_CODE"
fi
echo ""

echo "=========================================="
echo "  测试完成！"
echo "=========================================="
echo ""
echo "测试摘要："
echo "  - 用户: $TEST_USER ($TEST_EMAIL)"
echo "  - 文件1 ID: $FILE1_ID"
echo "  - 文件夹 ID: $FOLDER1_ID"
echo "  - 已删除分享: $SHARE_CODE_1 (ID: $SHARE_ID_1)"
echo "  - 带密码分享: $SHARE_CODE_2 (ID: $SHARE_ID_2)"
echo "  - 过期分享: $SHARE_CODE_3"
echo "  - 文件夹分享: $SHARE_CODE_4"