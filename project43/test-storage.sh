#!/bin/bash

BASE_URL="http://localhost:3001"
TEST_USER="storagetest_$(date +%s)"
TEST_EMAIL="storagetest_$(date +%s)@example.com"
TEST_PASSWORD="test123456"
TOKEN=""
USER_ID=""

TEN_GB=10737418240
ELEVEN_GB=11811160064
FIFTY_KB=51200
HUNDRED_KB=102400

echo "=========================================="
echo "  容量管理功能测试"
echo "=========================================="
echo ""

echo "1. 创建用户并获取 token..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$TEST_USER\", \"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}")
echo "   响应: $REGISTER_RESPONSE"
TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)
USER_ID=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['user']['id'])" 2>/dev/null)
if [ -n "$TOKEN" ]; then
  echo "   ✓ 注册成功，获取到 token"
  echo "   用户ID: $USER_ID"
else
  echo "   ✗ 注册失败"
  exit 1
fi
echo ""

echo "2. 获取存储信息，验证 total=10GB, used=0, available=10GB..."
STORAGE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/user/storage" \
  -H "Authorization: Bearer $TOKEN")
echo "   响应: $STORAGE_RESPONSE"
STORAGE_SUCCESS=$(echo "$STORAGE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$STORAGE_SUCCESS" = "True" ]; then
  TOTAL=$(echo "$STORAGE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['total'])" 2>/dev/null)
  USED=$(echo "$STORAGE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['used'])" 2>/dev/null)
  AVAILABLE=$(echo "$STORAGE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['available'])" 2>/dev/null)
  PERCENTAGE=$(echo "$STORAGE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['percentage'])" 2>/dev/null)
  FORMATTED=$(echo "$STORAGE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['formatted'])" 2>/dev/null)
  
  echo "   total: $TOTAL (预期: $TEN_GB)"
  echo "   used: $USED (预期: 0)"
  echo "   available: $AVAILABLE (预期: $TEN_GB)"
  echo "   percentage: $PERCENTAGE (预期: 0)"
  echo "   formatted: $FORMATTED"
  
  if [ "$TOTAL" = "$TEN_GB" ] && [ "$USED" = "0" ] && [ "$AVAILABLE" = "$TEN_GB" ]; then
    echo "   ✓ 验证通过：存储信息正确"
  else
    echo "   ✗ 验证失败"
  fi
else
  echo "   ✗ 获取存储信息失败"
fi
echo ""

echo "3. 上传一个 100KB 的文件..."
UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/files/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@/tmp/test_100kb.txt")
echo "   响应: $UPLOAD_RESPONSE"
UPLOAD_SUCCESS=$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$UPLOAD_SUCCESS" = "True" ]; then
  UPLOADED_SIZE=$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['totalSize'])" 2>/dev/null)
  echo "   ✓ 文件上传成功"
  echo "   上传文件大小: $UPLOADED_SIZE (预期: $HUNDRED_KB)"
else
  echo "   ✗ 文件上传失败"
  exit 1
fi
echo ""

echo "4. 再次获取存储信息，验证 used 增加..."
STORAGE_RESPONSE2=$(curl -s -X GET "$BASE_URL/api/user/storage" \
  -H "Authorization: Bearer $TOKEN")
echo "   响应: $STORAGE_RESPONSE2"
STORAGE_SUCCESS2=$(echo "$STORAGE_RESPONSE2" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$STORAGE_SUCCESS2" = "True" ]; then
  USED2=$(echo "$STORAGE_RESPONSE2" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['used'])" 2>/dev/null)
  AVAILABLE2=$(echo "$STORAGE_RESPONSE2" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['available'])" 2>/dev/null)
  PERCENTAGE2=$(echo "$STORAGE_RESPONSE2" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['percentage'])" 2>/dev/null)
  FORMATTED2=$(echo "$STORAGE_RESPONSE2" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['formatted'])" 2>/dev/null)
  
  echo "   used: $USED2 (预期: $HUNDRED_KB)"
  echo "   available: $AVAILABLE2 (预期: $((TEN_GB - HUNDRED_KB)))"
  echo "   percentage: $PERCENTAGE2"
  echo "   formatted: $FORMATTED2"
  
  if [ "$USED2" = "$HUNDRED_KB" ]; then
    echo "   ✓ 验证通过：used_storage 已增加 100KB"
  else
    echo "   ✗ 验证失败：used_storage 未正确增加"
  fi
else
  echo "   ✗ 获取存储信息失败"
fi
echo ""

echo "5. 调用容量检查接口，检查 50KB 文件，返回 sufficient=true..."
CHECK_SMALL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/user/storage/check" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"fileSize\": $FIFTY_KB}")
echo "   响应: $CHECK_SMALL_RESPONSE"
CHECK_SUCCESS=$(echo "$CHECK_SMALL_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$CHECK_SUCCESS" = "True" ]; then
  SUFFICIENT=$(echo "$CHECK_SMALL_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['sufficient'])" 2>/dev/null)
  AVAILABLE_CHECK=$(echo "$CHECK_SMALL_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['available'])" 2>/dev/null)
  REQUIRED=$(echo "$CHECK_SMALL_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['required'])" 2>/dev/null)
  MESSAGE=$(echo "$CHECK_SMALL_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['message'])" 2>/dev/null)
  
  echo "   sufficient: $SUFFICIENT (预期: True)"
  echo "   available: $AVAILABLE_CHECK"
  echo "   required: $REQUIRED (预期: $FIFTY_KB)"
  echo "   message: $MESSAGE"
  
  if [ "$SUFFICIENT" = "True" ]; then
    echo "   ✓ 验证通过：50KB 文件容量检查通过"
  else
    echo "   ✗ 验证失败"
  fi
else
  echo "   ✗ 容量检查失败"
fi
echo ""

echo "6. 调用容量检查接口，检查 11GB 文件，返回 sufficient=false..."
CHECK_LARGE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/user/storage/check" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"fileSize\": $ELEVEN_GB}")
echo "   响应: $CHECK_LARGE_RESPONSE"
CHECK_SUCCESS2=$(echo "$CHECK_LARGE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$CHECK_SUCCESS2" = "True" ]; then
  SUFFICIENT2=$(echo "$CHECK_LARGE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['sufficient'])" 2>/dev/null)
  AVAILABLE_CHECK2=$(echo "$CHECK_LARGE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['available'])" 2>/dev/null)
  REQUIRED2=$(echo "$CHECK_LARGE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['required'])" 2>/dev/null)
  MESSAGE2=$(echo "$CHECK_LARGE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['message'])" 2>/dev/null)
  
  echo "   sufficient: $SUFFICIENT2 (预期: False)"
  echo "   available: $AVAILABLE_CHECK2"
  echo "   required: $REQUIRED2 (预期: $ELEVEN_GB)"
  echo "   message: $MESSAGE2"
  
  if [ "$SUFFICIENT2" = "False" ]; then
    echo "   ✓ 验证通过：11GB 文件容量检查失败（正确）"
  else
    echo "   ✗ 验证失败"
  fi
else
  echo "   ✗ 容量检查失败"
fi
echo ""

echo "7. 尝试上传超大文件，验证返回 413 状态码..."
echo "   首先将用户 used_storage 增加到接近上限（模拟已用 9.9GB）..."
ALMOST_FULL=$((TEN_GB - 102400))
sqlite3 data/cloud-drive.db "UPDATE users SET used_storage = $ALMOST_FULL WHERE id = '$USER_ID';" 2>/dev/null
echo "   已设置 used_storage = $ALMOST_FULL (约 9.9GB)"
echo ""

echo "   验证存储信息..."
STORAGE_RESPONSE3=$(curl -s -X GET "$BASE_URL/api/user/storage" \
  -H "Authorization: Bearer $TOKEN")
echo "   响应: $STORAGE_RESPONSE3"
USED3=$(echo "$STORAGE_RESPONSE3" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['used'])" 2>/dev/null)
AVAILABLE3=$(echo "$STORAGE_RESPONSE3" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['available'])" 2>/dev/null)
echo "   当前 used: $USED3, available: $AVAILABLE3"
echo ""

echo "   尝试上传 200KB 文件（超过剩余空间）..."
UPLOAD_TOO_LARGE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/files/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@/tmp/test_100kb.txt" \
  -F "files=@/tmp/test_100kb.txt")
HTTP_CODE=$(echo "$UPLOAD_TOO_LARGE_RESPONSE" | tail -1)
RESPONSE_BODY=$(echo "$UPLOAD_TOO_LARGE_RESPONSE" | sed '$d')
echo "   HTTP 状态码: $HTTP_CODE (预期: 413)"
echo "   响应: $RESPONSE_BODY"

if [ "$HTTP_CODE" = "413" ]; then
  echo "   ✓ 验证通过：返回 413 Payload Too Large"
  ERROR_MSG=$(echo "$RESPONSE_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['error'])" 2>/dev/null)
  echo "   错误信息: $ERROR_MSG"
  if [[ "$ERROR_MSG" == *"Not enough storage space"* ]]; then
    echo "   ✓ 错误信息包含详细的容量信息"
  else
    echo "   ✗ 错误信息格式可能不正确"
  fi
else
  echo "   ✗ 验证失败：预期 413，实际 $HTTP_CODE"
fi
echo ""

echo "8. 恢复用户 used_storage..."
sqlite3 data/cloud-drive.db "UPDATE users SET used_storage = $HUNDRED_KB WHERE id = '$USER_ID';" 2>/dev/null
echo "   已恢复 used_storage = $HUNDRED_KB"
echo ""

echo "=========================================="
echo "  测试完成！"
echo "=========================================="
echo ""
echo "测试摘要："
echo "  - 用户: $TEST_USER ($TEST_EMAIL)"
echo "  - 用户ID: $USER_ID"
echo "  - 默认配额: 10GB"
