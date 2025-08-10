#!/bin/bash

# PorVerse Production Deployment Script
set -e

echo "🚀 Starting PorVerse Production Deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Copy .env.example to .env and fill in your values"
    exit 1
fi

# Check required environment variables
echo "📋 Checking environment variables..."
required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" 
    "SUPABASE_SERVICE_ROLE_KEY"
    "OPENAI_API_KEY"
    "STRIPE_SECRET_KEY"
    "RESEND_API_KEY"
    "JWT_SECRET"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables OK"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Type checking
echo "🔍 Type checking..."
npm run type-check

# Build
echo "🏗️ Building application..."
npm run build

# Database migrations (if using Supabase migrations)
echo "🗄️ Running database migrations..."
if command -v supabase &> /dev/null; then
    supabase db push
else
    echo "⚠️ Supabase CLI not found, skipping migrations"
fi

# Test deployment
echo "🧪 Testing deployment..."
npm start &
SERVER_PID=$!
sleep 10

# Health check
if curl -f http://localhost:3000/api/health; then
    echo "✅ Health check passed"
    kill $SERVER_PID
else
    echo "❌ Health check failed"
    kill $SERVER_PID
    exit 1
fi

echo "🎉 Deployment ready! Deploy to your hosting platform."
echo ""
echo "Next steps:"
echo "1. Deploy to Vercel/Netlify/Digital Ocean"
echo "2. Set up domain and SSL"
echo "3. Configure webhooks"
echo "4. Monitor logs and performance"