#!/bin/bash

BASE_URL="http://localhost:3001"
TEST_USER="testuser_$(date +%s)"
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="test123456"
TOKEN=""

echo "=========================================="
echo "  认证系统测试"
echo "=========================================="
echo ""

echo "1. 测试注册新用户..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$TEST_USER\", \"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}")
echo "   响应: $REGISTER_RESPONSE"
TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)
if [ -n "$TOKEN" ]; then
  echo "   ✓ 注册成功，获取到 token"
else
  echo "   ✗ 注册失败"
  exit 1
fi
echo ""

echo "2. 测试获取当前用户信息 (带 token)..."
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")
echo "   响应: $ME_RESPONSE"
echo ""

echo "3. 测试未带 token 访问受保护接口..."
NO_TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/user/storage")
HTTP_CODE=$(echo "$NO_TOKEN_RESPONSE" | tail -1)
echo "   HTTP 状态码: $HTTP_CODE"
if [ "$HTTP_CODE" = "401" ]; then
  echo "   ✓ 未认证返回 401"
else
  echo "   ✗ 预期 401，实际 $HTTP_CODE"
fi
echo ""

echo "4. 测试带有效 token 访问受保护接口..."
STORAGE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/user/storage" \
  -H "Authorization: Bearer $TOKEN")
echo "   响应: $STORAGE_RESPONSE"
STORAGE_QUOTA=$(echo "$STORAGE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['storageQuota'])" 2>/dev/null)
if [ "$STORAGE_QUOTA" = "10737418240" ]; then
  echo "   ✓ storage_quota = 10737418240 (10GB)"
else
  echo "   ✗ 预期 10737418240，实际 $STORAGE_QUOTA"
fi
echo ""

echo "5. 测试登录成功..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}")
echo "   响应: $LOGIN_RESPONSE"
LOGIN_SUCCESS=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$LOGIN_SUCCESS" = "True" ]; then
  echo "   ✓ 登录成功"
else
  echo "   ✗ 登录失败"
fi
echo ""

echo "6. 测试错误密码登录..."
WRONG_PASS_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"wrongpassword\"}")
WRONG_HTTP_CODE=$(echo "$WRONG_PASS_RESPONSE" | tail -1)
echo "   HTTP 状态码: $WRONG_HTTP_CODE"
if [ "$WRONG_HTTP_CODE" = "401" ]; then
  echo "   ✓ 错误密码返回 401"
else
  echo "   ✗ 预期 401，实际 $WRONG_HTTP_CODE"
fi
echo ""

echo "7. 测试登出..."
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/logout")
echo "   响应: $LOGOUT_RESPONSE"
echo ""

echo "=========================================="
echo "  测试完成！"
echo "=========================================="
