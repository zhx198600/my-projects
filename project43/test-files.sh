#!/bin/bash

BASE_URL="http://localhost:3001"
TEST_USER="filetest_$(date +%s)"
TEST_EMAIL="filetest_$(date +%s)@example.com"
TEST_PASSWORD="test123456"
TOKEN=""
USER_ID=""

PHOTOS_FOLDER_ID=""
DOCUMENTS_FOLDER_ID=""
FILE1_ID=""
FILE2_ID=""
FILE3_ID=""
FILE4_ID=""

echo "=========================================="
echo "  文件列表与基础操作功能测试"
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

echo "2. 创建文件夹 'Photos'..."
CREATE_PHOTOS_RESPONSE=$(curl -s -X POST "$BASE_URL/api/folders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\": \"Photos\"}")
echo "   响应: $CREATE_PHOTOS_RESPONSE"
PHOTOS_FOLDER_ID=$(echo "$CREATE_PHOTOS_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
if [ -n "$PHOTOS_FOLDER_ID" ]; then
  echo "   ✓ Photos 文件夹创建成功，ID: $PHOTOS_FOLDER_ID"
else
  echo "   ✗ Photos 文件夹创建失败"
  exit 1
fi
echo ""

echo "3. 创建文件夹 'Documents'..."
CREATE_DOCS_RESPONSE=$(curl -s -X POST "$BASE_URL/api/folders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\": \"Documents\"}")
echo "   响应: $CREATE_DOCS_RESPONSE"
DOCUMENTS_FOLDER_ID=$(echo "$CREATE_DOCS_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
if [ -n "$DOCUMENTS_FOLDER_ID" ]; then
  echo "   ✓ Documents 文件夹创建成功，ID: $DOCUMENTS_FOLDER_ID"
else
  echo "   ✗ Documents 文件夹创建失败"
  exit 1
fi
echo ""

echo "4. 上传2个文件到根目录..."
UPLOAD_ROOT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/files/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@/tmp/test1.txt" \
  -F "files=@/tmp/test2.txt")
echo "   响应: $UPLOAD_ROOT_RESPONSE"
UPLOAD_SUCCESS=$(echo "$UPLOAD_ROOT_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$UPLOAD_SUCCESS" = "True" ]; then
  FILE1_ID=$(echo "$UPLOAD_ROOT_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['files'][0]['id'])" 2>/dev/null)
  FILE2_ID=$(echo "$UPLOAD_ROOT_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['files'][1]['id'])" 2>/dev/null)
  echo "   ✓ 根目录文件上传成功"
  echo "   文件1 ID: $FILE1_ID"
  echo "   文件2 ID: $FILE2_ID"
else
  echo "   ✗ 根目录文件上传失败"
  exit 1
fi
echo ""

echo "5. 上传2个文件到 'Photos' 文件夹..."
UPLOAD_PHOTOS_RESPONSE=$(curl -s -X POST "$BASE_URL/api/files/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "parentId=$PHOTOS_FOLDER_ID" \
  -F "files=@/tmp/photo1.jpg" \
  -F "files=@/tmp/photo2.jpg")
echo "   响应: $UPLOAD_PHOTOS_RESPONSE"
UPLOAD_PHOTOS_SUCCESS=$(echo "$UPLOAD_PHOTOS_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$UPLOAD_PHOTOS_SUCCESS" = "True" ]; then
  FILE3_ID=$(echo "$UPLOAD_PHOTOS_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['files'][0]['id'])" 2>/dev/null)
  FILE4_ID=$(echo "$UPLOAD_PHOTOS_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['files'][1]['id'])" 2>/dev/null)
  echo "   ✓ Photos 文件夹文件上传成功"
  echo "   文件3 ID: $FILE3_ID"
  echo "   文件4 ID: $FILE4_ID"
else
  echo "   ✗ Photos 文件夹文件上传失败"
  exit 1
fi
echo ""

echo "6. 获取根目录列表，验证排序和文件夹优先..."
ROOT_LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/api/files" \
  -H "Authorization: Bearer $TOKEN")
echo "   响应: $ROOT_LIST_RESPONSE"
LIST_SUCCESS=$(echo "$ROOT_LIST_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$LIST_SUCCESS" = "True" ]; then
  TOTAL=$(echo "$ROOT_LIST_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['total'])" 2>/dev/null)
  FIRST_TYPE=$(echo "$ROOT_LIST_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['items'][0]['type'])" 2>/dev/null)
  SECOND_TYPE=$(echo "$ROOT_LIST_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['items'][1]['type'])" 2>/dev/null)
  echo "   ✓ 根目录列表获取成功"
  echo "   总条目数: $TOTAL (预期: 4)"
  echo "   第一个条目类型: $FIRST_TYPE (预期: folder)"
  echo "   第二个条目类型: $SECOND_TYPE (预期: folder)"
  if [ "$TOTAL" = "4" ] && [ "$FIRST_TYPE" = "folder" ] && [ "$SECOND_TYPE" = "folder" ]; then
    echo "   ✓ 验证通过：总数正确，文件夹优先"
  else
    echo "   ✗ 验证失败"
  fi
else
  echo "   ✗ 根目录列表获取失败"
fi
echo ""

echo "7. 按大小降序排序列表..."
SORT_SIZE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/files?sortBy=size&sortOrder=desc" \
  -H "Authorization: Bearer $TOKEN")
echo "   响应: $SORT_SIZE_RESPONSE"
SORT_SUCCESS=$(echo "$SORT_SIZE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$SORT_SUCCESS" = "True" ]; then
  echo "   ✓ 按大小降序排序成功"
  echo "   排序后条目（只显示类型和名称）:"
  echo "$SORT_SIZE_RESPONSE" | python3 -c "
import sys,json
data = json.load(sys.stdin)
for item in data['data']['items']:
    size = item.get('size', 'N/A')
    print(f'     - {item[\"type\"]}: {item[\"name\"]} (size: {size})')
"
else
  echo "   ✗ 按大小降序排序失败"
fi
echo ""

echo "8. 按创建时间降序排序列表..."
SORT_DATE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/files?sortBy=created_at&sortOrder=desc" \
  -H "Authorization: Bearer $TOKEN")
echo "   响应: $SORT_DATE_RESPONSE"
SORT_DATE_SUCCESS=$(echo "$SORT_DATE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$SORT_DATE_SUCCESS" = "True" ]; then
  echo "   ✓ 按创建时间降序排序成功"
  echo "   排序后条目（只显示类型和名称）:"
  echo "$SORT_DATE_RESPONSE" | python3 -c "
import sys,json
data = json.load(sys.stdin)
for item in data['data']['items']:
    print(f'     - {item[\"type\"]}: {item[\"name\"]} (created: {item[\"createdAt\"]})')
"
else
  echo "   ✗ 按创建时间降序排序失败"
fi
echo ""

echo "9. 重命名一个文件 (test1.txt -> renamed_test.txt)..."
RENAME_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/files/$FILE1_ID/rename" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\": \"renamed_test.txt\"}")
echo "   响应: $RENAME_RESPONSE"
RENAME_SUCCESS=$(echo "$RENAME_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$RENAME_SUCCESS" = "True" ]; then
  NEW_NAME=$(echo "$RENAME_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['name'])" 2>/dev/null)
  echo "   ✓ 文件重命名成功，新名称: $NEW_NAME"
else
  echo "   ✗ 文件重命名失败"
fi
echo ""

echo "10. 验证同目录重名检查 (尝试重命名为 test2.txt)..."
DUPLICATE_RENAME_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/files/$FILE1_ID/rename" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\": \"test2.txt\"}")
HTTP_CODE=$(echo "$DUPLICATE_RENAME_RESPONSE" | tail -1)
echo "   HTTP 状态码: $HTTP_CODE"
if [ "$HTTP_CODE" = "409" ]; then
  echo "   ✓ 重名检查通过，返回 409"
else
  echo "   ✗ 重名检查失败，预期 409，实际 $HTTP_CODE"
fi
echo ""

echo "11. 将一个文件移动到 'Documents' 文件夹..."
INITIAL_STORAGE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['usedStorage'])" 2>/dev/null)
echo "   移动前 used_storage: $INITIAL_STORAGE"

MOVE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/files/$FILE2_ID/move" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"parentId\": \"$DOCUMENTS_FOLDER_ID\"}")
echo "   响应: $MOVE_RESPONSE"
MOVE_SUCCESS=$(echo "$MOVE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$MOVE_SUCCESS" = "True" ]; then
  NEW_PARENT_ID=$(echo "$MOVE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['parentId'])" 2>/dev/null)
  echo "   ✓ 文件移动成功"
  echo "   新 parentId: $NEW_PARENT_ID (预期: $DOCUMENTS_FOLDER_ID)"
  if [ "$NEW_PARENT_ID" = "$DOCUMENTS_FOLDER_ID" ]; then
    echo "   ✓ 验证通过：文件已移动到 Documents 文件夹"
  else
    echo "   ✗ 验证失败：parentId 不匹配"
  fi
else
  echo "   ✗ 文件移动失败"
fi
echo ""

echo "12. 验证移动后文件位置正确 (获取 Documents 文件夹内容)..."
DOCS_LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/api/files?parentId=$DOCUMENTS_FOLDER_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "   响应: $DOCS_LIST_RESPONSE"
DOCS_LIST_SUCCESS=$(echo "$DOCS_LIST_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$DOCS_LIST_SUCCESS" = "True" ]; then
  DOCS_TOTAL=$(echo "$DOCS_LIST_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['total'])" 2>/dev/null)
  echo "   Documents 文件夹内条目数: $DOCS_TOTAL (预期: 1)"
  echo "   条目列表:"
  echo "$DOCS_LIST_RESPONSE" | python3 -c "
import sys,json
data = json.load(sys.stdin)
for item in data['data']['items']:
    print(f'     - {item[\"type\"]}: {item[\"name\"]}')
"
  if [ "$DOCS_TOTAL" = "1" ]; then
    echo "   ✓ 验证通过：Documents 文件夹内有1个文件"
  else
    echo "   ✗ 验证失败"
  fi
else
  echo "   ✗ 获取 Documents 文件夹内容失败"
fi
echo ""

echo "13. 删除一个文件，验证 used_storage 正确减少..."
FILE_TO_DELETE_SIZE=$(echo "$ROOT_LIST_RESPONSE" | python3 -c "
import sys,json
data = json.load(sys.stdin)
for item in data['data']['items']:
    if item['type'] == 'file':
        print(item['size'])
        break
" 2>/dev/null)
echo "   待删除文件大小: $FILE_TO_DELETE_SIZE"
echo "   删除前 used_storage: $INITIAL_STORAGE"

DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/files/$FILE1_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "   响应: $DELETE_RESPONSE"
DELETE_SUCCESS=$(echo "$DELETE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['success'])" 2>/dev/null)
if [ "$DELETE_SUCCESS" = "True" ]; then
  FREED_SIZE=$(echo "$DELETE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['freedSize'])" 2>/dev/null)
  echo "   ✓ 文件删除成功，释放空间: $FREED_SIZE 字节"

  FINAL_STORAGE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
    -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['usedStorage'])" 2>/dev/null)
  echo "   删除后 used_storage: $FINAL_STORAGE"

  EXPECTED_STORAGE=$((INITIAL_STORAGE - FREED_SIZE))
  echo "   预期 used_storage: $EXPECTED_STORAGE"

  if [ "$FINAL_STORAGE" = "$EXPECTED_STORAGE" ]; then
    echo "   ✓ 验证通过：used_storage 正确减少"
  else
    echo "   ✗ 验证失败：used_storage 不正确"
  fi
else
  echo "   ✗ 文件删除失败"
fi
echo ""

echo "=========================================="
echo "  测试完成！"
echo "=========================================="
echo ""
echo "测试摘要："
echo "  - 用户: $TEST_USER ($TEST_EMAIL)"
echo "  - Photos 文件夹 ID: $PHOTOS_FOLDER_ID"
echo "  - Documents 文件夹 ID: $DOCUMENTS_FOLDER_ID"
echo "  - 已删除文件 ID: $FILE1_ID"
echo "  - 已移动文件 ID: $FILE2_ID (到 Documents)"
