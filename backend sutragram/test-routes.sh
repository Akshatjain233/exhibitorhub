#!/bin/bash

# API Test Script for sutraGram
# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Token from successful login
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OThlZmM0MTQ1Y2Y1N2I2YjZiNGE0ODciLCJpYXQiOjE3NzA5Nzk0NDMsImV4cCI6MTc3MTU4NDI0M30.OxUoGU93pnouqyGQxHiEXahGyqoQH7OrCayfyvxOOrw"
BASE_URL="http://localhost:3001"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          sutraGram API Route Testing                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local expect_fail=$5
    
    echo -e "${YELLOW}Testing:${NC} $description"
    echo -e "${BLUE}$method $endpoint${NC}"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE:/d')
    
    if [ "$expect_fail" = "true" ]; then
        if [ "$http_code" -ge 400 ]; then
            echo -e "${GREEN}✓ Failed as expected (${http_code})${NC}"
        else
            echo -e "${RED}✗ Expected to fail but got ${http_code}${NC}"
        fi
    else
        if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
            echo -e "${GREEN}✓ Success (${http_code})${NC}"
        else
            echo -e "${RED}✗ Failed (${http_code})${NC}"
        fi
    fi
    
    echo "$body" | jq . 2>/dev/null || echo "$body"
    echo -e "\n"
}

# ========================================
# AUTH ROUTES TESTING
# ========================================
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}     AUTH ROUTES${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

test_endpoint "POST" "/api/auth/refresh-token" "" "Refresh JWT Token"

test_endpoint "PUT" "/api/auth/language" '{"preferred_language":"en"}' "Update Language Preference"

test_endpoint "POST" "/api/auth/logout" "" "Logout"

# ========================================
# USER ROUTES TESTING
# ========================================
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}     USER ROUTES${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

test_endpoint "GET" "/api/user/profile" "" "Get User Profile"

test_endpoint "PUT" "/api/user/profile" '{"name":"API Test User"}' "Update User Profile"

test_endpoint "PUT" "/api/user/settings" '{"notifications_enabled":true}' "Update User Settings"

# ========================================
# CONSUMER ROUTES TESTING
# ========================================
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}     CONSUMER ROUTES${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

test_endpoint "GET" "/api/consumer/profile" "" "Get Consumer Profile"

test_endpoint "PUT" "/api/consumer/profile" '{"bio":"Test bio"}' "Update Consumer Profile"

test_endpoint "PUT" "/api/consumer/interests" '{"selected_interests":["Pottery","Textiles"]}' "Update Consumer Interests"

test_endpoint "PUT" "/api/consumer/preferences" '{"craft_preferences":["Traditional","Modern"]}' "Update Consumer Preferences"

test_endpoint "GET" "/api/consumer/addresses" "" "Get Consumer Addresses"

test_endpoint "POST" "/api/consumer/address" '{"street":"123 Test St","city":"Mumbai","state":"Maharashtra","postal_code":"400001","country":"India","address_type":"home","is_default":true}' "Add Consumer Address"

test_endpoint "GET" "/api/consumer/following" "" "Get Followed Artisans"

# ========================================
# ARTISAN ROUTES TESTING (Should fail - user is consumer)
# ========================================
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}     ARTISAN ROUTES (Authorization Test)${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

test_endpoint "GET" "/api/artisan/profile" "" "Get Artisan Profile (Should Fail)" "true"

test_endpoint "PUT" "/api/artisan/profile" '{"workshop_name":"Test Workshop"}' "Update Artisan Profile (Should Fail)" "true"

test_endpoint "GET" "/api/artisan/analytics" "" "Get Artisan Analytics (Should Fail)" "true"

# ========================================
# PUBLIC ROUTES TESTING
# ========================================
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}     PUBLIC ROUTES${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

test_endpoint "GET" "/api/artisan/search?query=pottery" "" "Search Artisans (Public)"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Test Suite Complete                               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
