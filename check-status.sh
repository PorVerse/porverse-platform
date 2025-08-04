#!/bin/bash

# =============================================
# 🔍 PORVERSE STATUS CHECK SCRIPT
# =============================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}🔍 PORVERSE STATUS CHECK${NC}"
echo -e "${PURPLE}========================${NC}"
echo ""

# Load environment
set -a
source .env.local 2>/dev/null || echo -e "${YELLOW}⚠️  .env.local not found${NC}"
set +a

# =============================================
# 1. ENVIRONMENT CHECK
# =============================================

echo -e "${BLUE}🔧 Environment Variables Status:${NC}"

# Critical variables check
declare -A required_vars=(
    ["NEXT_PUBLIC_SUPABASE_URL"]="Supabase Database"
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]="Supabase Auth"
    ["SUPABASE_SERVICE_ROLE_KEY"]="Supabase Admin"
)

declare -A optional_vars=(
    ["OPENROUTER_API_KEY"]="OpenRouter AI"
    ["OPENAI_API_KEY"]="OpenAI Backup"
    ["PAYPAL_CLIENT_ID"]="PayPal Payments"
    ["RESEND_API_KEY"]="Email Service"
    ["STRIPE_SECRET_KEY"]="Stripe Payments"
)

# Check required variables
echo ""
echo -e "${GREEN}📋 Required Variables:${NC}"
for var in "${!required_vars[@]}"; do
    if [ ! -z "${!var}" ] && [[ "${!var}" != *"your_"* ]]; then
        echo -e "${GREEN}   ✅ ${required_vars[$var]}${NC}"
    else
        echo -e "${RED}   ❌ ${required_vars[$var]} (${var})${NC}"
    fi
done

# Check optional variables
echo ""
echo -e "${YELLOW}📋 Optional Variables:${NC}"
for var in "${!optional_vars[@]}"; do
    if [ ! -z "${!var}" ] && [[ "${!var}" != *"your_"* ]]; then
        echo -e "${GREEN}   ✅ ${optional_vars[$var]}${NC}"
    else
        echo -e "${YELLOW}   ⚠️  ${optional_vars[$var]} (${var})${NC}"
    fi
done

# =============================================
# 2. DATABASE STATUS
# =============================================

echo ""
echo -e "${BLUE}🗄️  Database Status:${NC}"

if [ ! -z "$NEXT_PUBLIC_SUPABASE_URL" ] && [ ! -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo -e "${GREEN}   ✅ Supabase credentials configured${NC}"
    echo -e "${GREEN}   ✅ Ready for database operations${NC}"
else
    echo -e "${RED}   ❌ Database credentials missing${NC}"
fi

# =============================================
# 3. AI SERVICES STATUS
# =============================================

echo ""
echo -e "${BLUE}🤖 AI Services Status:${NC}"

if [ ! -z "$OPENROUTER_API_KEY" ] && [[ "$OPENROUTER_API_KEY" != *"your_"* ]]; then
    echo -e "${GREEN}   ✅ OpenRouter configured (PRIMARY)${NC}"
elif [ ! -z "$OPENAI_API_KEY" ] && [[ "$OPENAI_API_KEY" != *"your_"* ]]; then
    echo -e "${GREEN}   ✅ OpenAI configured${NC}"
else
    echo -e "${YELLOW}   ⚠️  No AI service configured${NC}"
fi

# =============================================
# 4. PAYMENT SERVICES STATUS
# =============================================

echo ""
echo -e "${BLUE}💳 Payment Services Status:${NC}"

if [ ! -z "$PAYPAL_CLIENT_ID" ] && [[ "$PAYPAL_CLIENT_ID" != *"your_"* ]]; then
    echo -e "${GREEN}   ✅ PayPal configured (${PAYPAL_MODE:-sandbox})${NC}"
else
    echo -e "${YELLOW}   ⚠️  PayPal not configured${NC}"
fi

if [ ! -z "$STRIPE_SECRET_KEY" ] && [[ "$STRIPE_SECRET_KEY" != *"your_"* ]]; then
    echo -e "${GREEN}   ✅ Stripe configured${NC}"
else
    echo -e "${YELLOW}   ⚠️  Stripe not configured${NC}"
fi

# =============================================
# 5. EMAIL STATUS
# =============================================

echo ""
echo -e "${BLUE}📧 Email Service Status:${NC}"

if [ ! -z "$RESEND_API_KEY" ] && [[ "$RESEND_API_KEY" != *"your_"* ]]; then
    echo -e "${GREEN}   ✅ Resend email service configured${NC}"
else
    echo -e "${YELLOW}   ⚠️  Email service not configured${NC}"
fi

# =============================================
# 6. OVERALL STATUS
# =============================================

score=0
total=10

# Calculate readiness score
[ ! -z "$NEXT_PUBLIC_SUPABASE_URL" ] && [[ "$NEXT_PUBLIC_SUPABASE_URL" != *"your_"* ]] && ((score++))
[ ! -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && [[ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" != *"your_"* ]] && ((score++))
[ ! -z "$SUPABASE_SERVICE_ROLE_KEY" ] && [[ "$SUPABASE_SERVICE_ROLE_KEY" != *"your_"* ]] && ((score++))
[ -d "node_modules" ] && ((score++))
[ ! -z "$JWT_SECRET" ] && ((score++))
[ ! -z "$ENCRYPTION_KEY" ] && ((score++))

# AI services
([ ! -z "$OPENROUTER_API_KEY" ] && [[ "$OPENROUTER_API_KEY" != *"your_"* ]]) || \
([ ! -z "$OPENAI_API_KEY" ] && [[ "$OPENAI_API_KEY" != *"your_"* ]]) && ((score++))

# Payment services
([ ! -z "$PAYPAL_CLIENT_ID" ] && [[ "$PAYPAL_CLIENT_ID" != *"your_"* ]]) || \
([ ! -z "$STRIPE_SECRET_KEY" ] && [[ "$STRIPE_SECRET_KEY" != *"your_"* ]]) && ((score++))

# Email service
[ ! -z "$RESEND_API_KEY" ] && [[ "$RESEND_API_KEY" != *"your_"* ]] && ((score++))

# Build status
[ -d ".next" ] && ((score++))

percentage=$((score * 100 / total))

echo ""
echo -e "${PURPLE}📊 OVERALL STATUS SUMMARY${NC}"
echo -e "${PURPLE}==========================${NC}"

if [ $percentage -ge 90 ]; then
    echo -e "${GREEN}🎉 PORVERSE READY FOR LAUNCH! ($score/$total - $percentage%)${NC}"
    echo -e "${GREEN}✅ All critical systems operational${NC}"
elif [ $percentage -ge 70 ]; then
    echo -e "${YELLOW}⚠️  PORVERSE MOSTLY READY ($score/$total - $percentage%)${NC}"
    echo -e "${YELLOW}Missing some optional services but core functionality works${NC}"
else
    echo -e "${RED}❌ PORVERSE NEEDS SETUP ($score/$total - $percentage%)${NC}"
    echo -e "${RED}Critical systems missing - setup required${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo -e "${BLUE}   1. Install dependencies: npm install${NC}"
echo -e "${BLUE}   2. Apply database schema in Supabase${NC}"
echo -e "${BLUE}   3. Build application: npm run build${NC}"
echo -e "${BLUE}   4. Start development: npm run dev${NC}"

echo ""
echo -e "${GREEN}Ready to build the future of personal transformation? 🚀${NC}"