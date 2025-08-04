#!/bin/bash

# ================================
# PORVERSE QUICK SETUP SCRIPT
# ================================

echo "🚀 Starting PorVerse Production Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ================================
# 1. ENVIRONMENT CHECK
# ================================

echo -e "${BLUE}📋 Step 1: Checking environment...${NC}"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating template...${NC}"
    cp .env.example .env.local 2>/dev/null || echo "Please create .env.local from the template provided"
fi

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null || echo "not installed")
if [[ $NODE_VERSION == "not installed" ]]; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Node.js found: $NODE_VERSION${NC}"
fi

# Check npm
NPM_VERSION=$(npm --version 2>/dev/null || echo "not installed")
if [[ $NPM_VERSION == "not installed" ]]; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
else
    echo -e "${GREEN}✅ npm found: $NPM_VERSION${NC}"
fi

# ================================
# 2. DEPENDENCIES INSTALLATION
# ================================

echo -e "${BLUE}📦 Step 2: Installing dependencies...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm packages...${NC}"
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# ================================
# 3. ENVIRONMENT VALIDATION
# ================================

echo -e "${BLUE}🔐 Step 3: Validating environment variables...${NC}"

# Source the environment file
set -a
source .env.local 2>/dev/null
set +a

# Critical environment variables
REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "${RED}   - $var${NC}"
    done
    echo -e "${YELLOW}Please update your .env.local file${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Core environment variables found${NC}"
fi

# ================================
# 4. DATABASE SETUP
# ================================

echo -e "${BLUE}🗄️  Step 4: Setting up database...${NC}"

# Check if supabase CLI is available
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✅ Supabase CLI found${NC}"
    
    # Run migrations
    echo -e "${YELLOW}Running database migrations...${NC}"
    supabase db reset --linked 2>/dev/null || echo -e "${YELLOW}⚠️  Manual database setup required${NC}"
else
    echo -e "${YELLOW}⚠️  Supabase CLI not found. Manual database setup required.${NC}"
    echo -e "${BLUE}Please run the SQL migration script in your Supabase dashboard.${NC}"
fi

# ================================
# 5. BUILD & TEST
# ================================

echo -e "${BLUE}🔨 Step 5: Building application...${NC}"

# Build the application
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# ================================
# 6. OPTIONAL SERVICES TEST
# ================================

echo -e "${BLUE}🧪 Step 6: Testing integrations...${NC}"

# Test basic functionality
npm run type-check 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ TypeScript validation passed${NC}"
else
    echo -e "${YELLOW}⚠️  TypeScript warnings found${NC}"
fi

# ================================
# 7. SETUP SUMMARY
# ================================

echo -e "${GREEN}🎉 PorVerse Setup Complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. ${YELLOW}Configure remaining API keys in .env.local${NC}"
echo -e "2. ${YELLOW}Run: npm run dev (for development)${NC}"
echo -e "3. ${YELLOW}Run: npm run start (for production)${NC}"
echo -e "4. ${YELLOW}Visit: http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}Required API keys to configure:${NC}"
echo -e "- ${YELLOW}OPENAI_API_KEY${NC} (for AI features)"
echo -e "- ${YELLOW}STRIPE_SECRET_KEY${NC} (for payments)"
echo -e "- ${YELLOW}RESEND_API_KEY${NC} (for emails)"
echo ""
echo -e "${GREEN}🚀 Ready to launch!${NC}"

# ================================
# 8. QUICK START OPTIONS
# ================================

echo ""
read -p "Start development server now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}🚀 Starting development server...${NC}"
    npm run dev
fi