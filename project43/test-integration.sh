#!/bin/bash
# Integration test script

BASE_URL="http://localhost:3001"

echo "=== Test 1: Health Check ==="
curl -s $BASE_URL/api/health

echo -e "\n=== Test 2: Register ==="
REGISTER_RESP=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser2\",\"email\":\"test2@example.com\",\"password\":\"test123456\"}")
echo "$REGISTER_RESP"
TOKEN=$(echo "$REGISTER_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")

echo -e "\n=== Test 3: Get Storage Info ==="
curl -s $BASE_URL/api/user/storage \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n=== Test 4: Create Folder ==="
FOLDER_RESP=$(curl -s -X POST $BASE_URL/api/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"TestFolder\"}")
echo "$FOLDER_RESP"
FOLDER_ID=$(echo "$FOLDER_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")

echo -e "\n=== Test 5: Get File List ==="
curl -s "$BASE_URL/api/files" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n=== Test 6: Get Folder Breadcrumb ==="
curl -s "$BASE_URL/api/folders/$FOLDER_ID/breadcrumb" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n=== Test 7: Get Shares ==="
curl -s $BASE_URL/api/shares \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n=== Test 8: Create Share ==="
SHARE_RESP=$(curl -s -X POST $BASE_URL/api/shares \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"itemId\":\"$FOLDER_ID\",\"itemType\":\"folder\"}")
echo "$SHARE_RESP"
SHARE_CODE=$(echo "$SHARE_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['shareCode'])")

echo -e "\n=== Test 9: Access Share (Public==="
curl -s $BASE_URL/api/s/$SHARE_CODE

echo -e "\n=== Test 10: Get Me ==="
curl -s $BASE_URL/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n=== All Tests Completed ==="
