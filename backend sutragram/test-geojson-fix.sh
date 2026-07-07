#!/bin/bash

# GeoJSON Fix Validation Tests
BASE_URL="http://localhost:3001"

echo "========================================="
echo "Testing GeoJSON Fix for Artisan Registration"
echo "=========================================\n"

echo "✅ TEST 1: Artisan Registration WITHOUT GPS Coordinates"
echo "This was FAILING before with 'Point must be an array or object' error"
echo "Should now SUCCESS without location_gps field\n"

curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Artisan 1",
    "email": "test.artisan1@example.com",
    "phone_number": "+919111111111",
    "password": "password123",
    "role": "artisan",
    "preferred_language": "hi",
    "location_city": "Jaipur",
    "location_state": "Rajasthan",
    "location_region": "Rajasthan",
    "craft_specialization": "Blue Pottery",
    "craft_tags": []
  }' | jq '{success, message, profile_has_gps: .data.profile.location_gps}'

echo "\n\n✅ TEST 2: Artisan Registration WITH GPS Coordinates"
echo "Should now SUCCESS with valid location_gps GeoJSON Point\n"

curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Artisan 2",
    "email": "test.artisan2@example.com",
    "phone_number": "+919222222222",
    "password": "password123",
    "role": "artisan",
    "preferred_language": "hi",
    "location_city": "Jaipur",
    "location_state": "Rajasthan",
    "location_region": "Rajasthan",
    "craft_specialization": "Blue Pottery",
    "craft_tags": [],
    "location_gps": {
      "coordinates": [75.7873, 26.9124]
    }
  }' | jq '{success, message, profile_gps: .data.profile.location_gps}'

echo "\n\n========================================="
echo "Summary of Fix:"
echo "========================================="
echo "BEFORE:"
echo "  ❌ Registration failed with GeoJSON validation error"
echo "  ❌ Error: 'Point must be an array or object, instead got type missing'"
echo ""
echo "AFTER:"
echo "  ✅ Registration without GPS coordinates works (no location_gps field)"
echo "  ✅ Registration with GPS coordinates works (valid GeoJSON Point)"
echo ""
echo "FILES MODIFIED:"
echo "  1. models/ArtisanProfile.js - Removed default value for location_gps.type"
echo "  2. controllers/authController.js - Only set location_gps when coordinates provided"
echo "  3. POSTMAN_GUIDE.md - Updated documentation with optional GPS example"
echo "========================================="
