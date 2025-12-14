#!/bin/bash

# FlowForge Deployment Checklist Script
# Run this before deploying to Vercel

echo "🚀 FlowForge Pre-Deployment Checklist"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Node modules installed
echo -n "1. Checking node_modules... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "   Run: npm install"
    exit 1
fi

# Check 2: .env.local exists
echo -n "2. Checking .env.local... "
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "   Create .env.local with required variables"
    exit 1
fi

# Check 3: Database URL configured
echo -n "3. Checking DATABASE_URL... "
if grep -q "DATABASE_URL" .env.local; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} Not found (optional for MVP)"
fi

# Check 4: Build succeeds
echo -n "4. Running production build... "
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "   Build failed. Run: npm run build"
    exit 1
fi

# Check 5: Assets exist
echo -n "5. Checking visual assets... "
ASSETS_OK=true
for file in "favicon.ico" "icon-192x192.png" "icon-512x512.png" "og-image.png"; do
    if [ ! -f "public/$file" ]; then
        ASSETS_OK=false
        break
    fi
done

if [ "$ASSETS_OK" = true ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "   Some assets missing in public/"
    exit 1
fi

# Check 6: Git repository
echo -n "6. Checking git repository... "
if [ -d ".git" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} Not initialized"
    echo "   Run: git init"
fi

# Check 7: Uncommitted changes
if [ -d ".git" ]; then
    echo -n "7. Checking for uncommitted changes... "
    if [ -z "$(git status --porcelain)" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠${NC} You have uncommitted changes"
        echo "   Run: git add . && git commit -m 'your message'"
    fi
fi

echo ""
echo "======================================"
echo -e "${GREEN}✅ Pre-deployment checks complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Go to vercel.com and import your repository"
echo "3. Add environment variables in Vercel dashboard"
echo "4. Deploy!"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions."

