#!/bin/bash

# Test Credit System V2
# This script tests the credit system before and after migration

set -e

echo "================================"
echo "Credit System V2 Testing Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check environment
echo "🔍 Checking environment..."
if [ -f .env.local ]; then
    source .env.local
    echo -e "${GREEN}✓${NC} Environment loaded"
else
    echo -e "${RED}✗${NC} .env.local not found"
    exit 1
fi

# Function to run SQL query
run_query() {
    psql "$DATABASE_URL" -t -c "$1"
}

# Function to check table exists
table_exists() {
    local result=$(run_query "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$1');")
    if [[ "$result" == *"t"* ]]; then
        return 0
    else
        return 1
    fi
}

echo ""
echo "📊 Current Database State:"
echo "-------------------------"

# Check if credit tables exist
if table_exists "user_credits"; then
    echo -e "${GREEN}✓${NC} user_credits table exists"
    user_count=$(run_query "SELECT COUNT(*) FROM user_credits;")
    echo "  Users with credits: $user_count"
fi

if table_exists "credit_packages"; then
    echo -e "${YELLOW}!${NC} credit_packages table exists (will be removed)"
    package_count=$(run_query "SELECT COUNT(*) FROM credit_packages;")
    echo "  Credit packages: $package_count"
fi

if table_exists "credit_purchases"; then
    echo -e "${YELLOW}!${NC} credit_purchases table exists (will be removed)"
    purchase_count=$(run_query "SELECT COUNT(*) FROM credit_purchases;")
    echo "  Credit purchases: $purchase_count"
fi

if table_exists "subscription_credit_config"; then
    echo -e "${GREEN}✓${NC} subscription_credit_config table exists"
    echo "  Current configurations:"
    run_query "SELECT plan_id, monthly_credits FROM subscription_credit_config;"
fi

echo ""
echo "🧪 Testing Credit Service (V1):"
echo "-------------------------------"

# Test with V1 configuration
export NEXT_PUBLIC_CREDIT_SYSTEM_VERSION=v1
echo "Testing with NEXT_PUBLIC_CREDIT_SYSTEM_VERSION=v1"

# Start dev server in background for testing
echo "Starting development server..."
pnpm dev > /tmp/dev-v1.log 2>&1 &
DEV_PID=$!
sleep 5

# Test API endpoint
echo "Testing credit status endpoint..."
response=$(curl -s http://localhost:3000/api/credits/status || echo "API not available")
echo "Response: $response"

# Kill dev server
kill $DEV_PID 2>/dev/null || true

echo ""
echo "🔄 Testing Credit Service (V2):"
echo "-------------------------------"

# Test with V2 configuration
export NEXT_PUBLIC_CREDIT_SYSTEM_VERSION=v2
echo "Testing with NEXT_PUBLIC_CREDIT_SYSTEM_VERSION=v2"

# Start dev server in background for testing
echo "Starting development server..."
pnpm dev > /tmp/dev-v2.log 2>&1 &
DEV_PID=$!
sleep 5

# Test API endpoint
echo "Testing credit status endpoint..."
response=$(curl -s http://localhost:3000/api/credits/status || echo "API not available")
echo "Response: $response"

# Kill dev server
kill $DEV_PID 2>/dev/null || true

echo ""
echo "✅ Pre-migration tests complete!"
echo ""
echo "Next steps:"
echo "1. Review the test results above"
echo "2. Backup your database: pg_dump \$DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql"
echo "3. Run migration: psql \$DATABASE_URL < src/db/migrations/0003_simplify_credit_system.sql"
echo "4. Update .env.local: NEXT_PUBLIC_CREDIT_SYSTEM_VERSION=v2"
echo "5. Test the application thoroughly"
echo ""
echo "To rollback if needed:"
echo "psql \$DATABASE_URL < src/db/migrations/0003_rollback_credit_system.sql"