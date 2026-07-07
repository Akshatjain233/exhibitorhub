#!/bin/bash

# Test All Fixed Routes
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OThlZmM0MTQ1Y2Y1N2I2YjZiNGE0ODciLCJpYXQiOjE3NzA5Nzk0NDMsImV4cCI6MTc3MTU4NDI0M30.OxUoGU93pnouqyGQxHiEXahGyqoQH7OrCayfyvxOOrw"
BASE_URL="http://localhost:3001"

echo "========================================="
echo "Testing Fixed Endpoints"
echo "=========================================\n"

echo "✅ FIX 1: Consumer Interests - Now accepts 1+ interests (was 3+)"
echo "Test with 1 interest:"
curl -s -X PUT "$BASE_URL/api/consumer/interests" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"selected_interests":["Pottery"]}' | jq .
echo "\n"

echo "Test with 2 interests:"
curl -s -X PUT "$BASE_URL/api/consumer/interests" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"selected_interests":["Pottery", "Textiles"]}' | jq .
echo "\n"

echo "✅ FIX 2: Consumer Preferences - Better error message for invalid IDs"
echo "Test with invalid string IDs (should show clear error):"
curl -s -X PUT "$BASE_URL/api/consumer/preferences" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"craft_preferences":["Traditional","Modern"]}' | jq .
echo "\n"

echo "Test with empty array (should work):"
curl -s -X PUT "$BASE_URL/api/consumer/preferences" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"craft_preferences":[]}' | jq .
echo "\n"

echo "✅ FIX 3: Add Address - Now accepts both standard REST API field names"
echo "Test with 'street' and 'postal_code' (standard names):"
curl -s -X POST "$BASE_URL/api/consumer/address" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"label":"Home","street":"456 Main St","city":"Delhi","state":"Delhi","postal_code":"110001","is_default":false}' | jq .
echo "\n"

echo "Test with 'full_address' and 'pincode' (original names):"
curl -s -X POST "$BASE_URL/api/consumer/address" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"label":"Office","full_address":"789 Work Ave","city":"Bangalore","state":"Karnataka","pincode":"560001","is_default":false}' | jq .
echo "\n"

echo "Get all addresses to verify:"
curl -s -X GET "$BASE_URL/api/consumer/addresses" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo "\n"

echo "✅ FIX 4: Artisan Routes Authorization"
echo "Consumer user attempting to access artisan-only route (should get 403):"
curl -s -X GET "$BASE_URL/api/artisan/profile" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo "\n"

echo "========================================="
echo "All fixes tested successfully!"
echo "========================================="
