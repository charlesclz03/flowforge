#!/bin/bash
# Tests the Social & PVP Endpoints

BASE_URL="http://localhost:3000/api"
COOKIE_FILE="cookies.txt"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🧪 Starting Social API Tests..."

# 1. Duel Creation (Mock)
echo -e "\n1. Testing Duel Creation (POST /api/duels)..."
# Note: This requires a valid session/cookie. 
# For this script to work fully locally, we'd need to mock the auth or use a valid cookie.
# We will just check if the endpoint exists (should return 401 or 400, not 404).

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/duels")

if [ "$RESPONSE" != "404" ]; then
    echo -e "${GREEN}✅ Endpoint exists (Code: $RESPONSE)${NC}"
else
    echo -e "${RED}❌ Endpoint missing (Code: $RESPONSE)${NC}"
fi

# 2. Voting Endpoint
echo -e "\n2. Testing Voting Endpoint (POST /api/duels/mock-id/vote)..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/duels/123/vote")

if [ "$RESPONSE" != "404" ]; then
    echo -e "${GREEN}✅ Endpoint exists (Code: $RESPONSE)${NC}"
else
    echo -e "${RED}❌ Endpoint missing (Code: $RESPONSE)${NC}"
fi

echo -e "\n✨ API Surface Check Complete."
