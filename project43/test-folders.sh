#!/bin/bash

echo "============================================"
echo "文件夹管理功能测试"
echo "============================================"
echo ""

API_BASE="http://localhost:3001/api"
TOKEN=""
USERNAME="testuser_$(date +%s)"
EMAIL="${USERNAME}@test.com"
PASSWORD="password123"

echo "1. 创建用户并获取 token"
echo "--------------------------"
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "注册响应: $REGISTER_RESPONSE"

TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "登录获取 token..."
  LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
  echo "登录响应: $LOGIN_RESPONSE"
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
  echo "❌ 失败: 无法获取 token"
  exit 1
fi

echo "✅ Token: ${TOKEN:0:20}..."
echo ""

echo "2. 在根目录创建文件夹 'Documents'"
echo "---------------------------------"
CREATE_DOCUMENTS=$(curl -s -X POST "$API_BASE/folders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Documents"}')

echo "创建响应: $CREATE_DOCUMENTS"

DOCUMENTS_ID=$(echo "$CREATE_DOCUMENTS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$DOCUMENTS_ID" ]; then
  echo "❌ 失败: 无法创建 Documents 文件夹"
  exit 1
fi

echo "✅ Documents ID: $DOCUMENTS_ID"
echo ""

echo "3. 在 'Documents' 下创建子文件夹 'Work'"
echo "--------------------------------------"
CREATE_WORK=$(curl -s -X POST "$API_BASE/folders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\":\"Work\",\"parentId\":\"$DOCUMENTS_ID\"}")

echo "创建响应: $CREATE_WORK"

WORK_ID=$(echo "$CREATE_WORK" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$WORK_ID" ]; then
  echo "❌ 失败: 无法创建 Work 文件夹"
  exit 1
fi

echo "✅ Work ID: $WORK_ID"
echo ""

echo "4. 获取根目录文件夹列表"
echo "-----------------------"
ROOT_FOLDERS=$(curl -s -X GET "$API_BASE/folders" \
  -H "Authorization: Bearer $TOKEN")

echo "根目录文件夹: $ROOT_FOLDERS"

if echo "$ROOT_FOLDERS" | grep -q '"name":"Documents"'; then
  echo "✅ 根目录包含 Documents 文件夹"
else
  echo "❌ 失败: 根目录不包含 Documents 文件夹"
  exit 1
fi
echo ""

echo "5. 获取 'Documents' 目录列表"
echo "----------------------------"
DOCUMENTS_FOLDERS=$(curl -s -X GET "$API_BASE/folders?parentId=$DOCUMENTS_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Documents 子文件夹: $DOCUMENTS_FOLDERS"

if echo "$DOCUMENTS_FOLDERS" | grep -q '"name":"Work"'; then
  echo "✅ Documents 包含 Work 子文件夹"
else
  echo "❌ 失败: Documents 不包含 Work 子文件夹"
  exit 1
fi
echo ""

echo "6. 重命名 'Work' 为 'Job'"
echo "--------------------------"
RENAME_WORK=$(curl -s -X PUT "$API_BASE/folders/$WORK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Job"}')

echo "重命名响应: $RENAME_WORK"

if echo "$RENAME_WORK" | grep -q '"name":"Job"'; then
  echo "✅ 成功重命名为 Job"
else
  echo "❌ 失败: 无法重命名文件夹"
  exit 1
fi
echo ""

echo "7. 尝试删除 'Documents'（非空），应该被拒绝"
echo "---------------------------------------------"
DELETE_DOCUMENTS=$(curl -s -X DELETE "$API_BASE/folders/$DOCUMENTS_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "删除响应: $DELETE_DOCUMENTS"

if echo "$DELETE_DOCUMENTS" | grep -q '"success":false'; then
  echo "✅ 正确拒绝删除非空文件夹"
else
  echo "❌ 失败: 应该拒绝删除非空文件夹"
  exit 1
fi
echo ""

echo "8. 先删除 'Job'，再删除 'Documents'"
echo "-----------------------------------"

echo "删除 Job..."
DELETE_JOB=$(curl -s -X DELETE "$API_BASE/folders/$WORK_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "删除 Job 响应: $DELETE_JOB"

if echo "$DELETE_JOB" | grep -q '"success":true'; then
  echo "✅ 成功删除 Job"
else
  echo "❌ 失败: 无法删除 Job"
  exit 1
fi
echo ""

echo "删除 Documents..."
DELETE_DOCUMENTS2=$(curl -s -X DELETE "$API_BASE/folders/$DOCUMENTS_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "删除 Documents 响应: $DELETE_DOCUMENTS2"

if echo "$DELETE_DOCUMENTS2" | grep -q '"success":true'; then
  echo "✅ 成功删除 Documents"
else
  echo "❌ 失败: 无法删除 Documents"
  exit 1
fi
echo ""

echo "9. 重新创建文件夹并获取树结构"
echo "-----------------------------"

echo "重新创建 Documents..."
CREATE_DOCUMENTS2=$(curl -s -X POST "$API_BASE/folders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Documents"}')
DOCUMENTS_ID2=$(echo "$CREATE_DOCUMENTS2" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "创建 Work..."
CREATE_WORK2=$(curl -s -X POST "$API_BASE/folders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\":\"Work\",\"parentId\":\"$DOCUMENTS_ID2\"}")
WORK_ID2=$(echo "$CREATE_WORK2" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "创建 Personal..."
CREATE_PERSONAL=$(curl -s -X POST "$API_BASE/folders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\":\"Personal\",\"parentId\":\"$DOCUMENTS_ID2\"}")

echo "获取 Work 文件夹树结构..."
GET_TREE=$(curl -s -X GET "$API_BASE/folders/$WORK_ID2/tree" \
  -H "Authorization: Bearer $TOKEN")

echo "树结构响应: $GET_TREE"

if echo "$GET_TREE" | grep -q '"breadcrumbs":' && echo "$GET_TREE" | grep -q '"tree":'; then
  echo "✅ 成功获取文件夹树结构"
else
  echo "❌ 失败: 无法获取文件夹树结构"
  exit 1
fi

if echo "$GET_TREE" | grep -q '"name":"Documents"'; then
  echo "✅ 面包屑包含 Documents"
else
  echo "❌ 失败: 面包屑不包含 Documents"
  exit 1
fi

if echo "$GET_TREE" | grep -q '"name":"Work"'; then
  echo "✅ 树结构包含 Work"
else
  echo "❌ 失败: 树结构不包含 Work"
  exit 1
fi

echo ""
echo "============================================"
echo "✅ 所有测试通过！"
echo "============================================"
