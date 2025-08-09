#!/bin/bash

# Credit System V2 Migration Runner
# Safely apply the credit system simplification migration with rollback capability

set -e

echo "================================================"
echo "Credit System V2 Migration Runner"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check for DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    if [ -f .env.local ]; then
        source .env.local
    else
        echo -e "${RED}✗${NC} DATABASE_URL not set and .env.local not found"
        exit 1
    fi
fi

# Function to run SQL query
run_query() {
    psql "$DATABASE_URL" -t -c "$1"
}

# Function to confirm action
confirm() {
    echo -e "${YELLOW}$1${NC}"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
}

# Step 1: Create backup
echo -e "${BLUE}Step 1: Creating database backup...${NC}"
BACKUP_FILE="backup_credit_migration_$(date +%Y%m%d_%H%M%S).sql"
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo -e "${GREEN}✓${NC} Backup created: $BACKUP_FILE ($BACKUP_SIZE)"
echo ""

# Step 2: Check current state
echo -e "${BLUE}Step 2: Checking current database state...${NC}"
echo "Current credit system tables:"

# Check user_credits
user_credit_count=$(run_query "SELECT COUNT(*) FROM user_credits;" 2>/dev/null || echo "0")
echo "  - user_credits: $user_credit_count records"

# Check if purchase tables exist
if psql "$DATABASE_URL" -c "SELECT 1 FROM credit_packages LIMIT 1;" &>/dev/null; then
    package_count=$(run_query "SELECT COUNT(*) FROM credit_packages;")
    echo "  - credit_packages: $package_count records (will be deleted)"
fi

if psql "$DATABASE_URL" -c "SELECT 1 FROM credit_purchases LIMIT 1;" &>/dev/null; then
    purchase_count=$(run_query "SELECT COUNT(*) FROM credit_purchases;")
    echo "  - credit_purchases: $purchase_count records (will be deleted)"
fi

echo ""

# Step 3: Show migration preview
echo -e "${BLUE}Step 3: Migration Preview${NC}"
echo "This migration will:"
echo "  1. Drop credit_packages and credit_purchases tables"
echo "  2. Remove purchased_credits column from user_credits"
echo "  3. Update subscription credit allocations:"
echo "     - Free: 5 credits/month"
echo "     - Pro Monthly: 100 credits/month"
echo "     - Pro Yearly: 150 credits/month"
echo "     - Lifetime: 500 credits/month"
echo "  4. Add transaction type constraints"
echo ""

confirm "Ready to apply migration?"

# Step 4: Apply migration
echo -e "${BLUE}Step 4: Applying migration...${NC}"
if psql "$DATABASE_URL" < src/db/migrations/0003_simplify_credit_system.sql; then
    echo -e "${GREEN}✓${NC} Migration applied successfully!"
else
    echo -e "${RED}✗${NC} Migration failed!"
    echo ""
    confirm "Would you like to restore from backup?"
    
    echo "Restoring from backup..."
    psql "$DATABASE_URL" < "$BACKUP_FILE"
    echo -e "${GREEN}✓${NC} Database restored from backup"
    exit 1
fi

echo ""

# Step 5: Verify migration
echo -e "${BLUE}Step 5: Verifying migration...${NC}"

# Check tables were dropped
if ! psql "$DATABASE_URL" -c "SELECT 1 FROM credit_packages LIMIT 1;" &>/dev/null; then
    echo -e "${GREEN}✓${NC} credit_packages table removed"
else
    echo -e "${RED}✗${NC} credit_packages table still exists"
fi

if ! psql "$DATABASE_URL" -c "SELECT 1 FROM credit_purchases LIMIT 1;" &>/dev/null; then
    echo -e "${GREEN}✓${NC} credit_purchases table removed"
else
    echo -e "${RED}✗${NC} credit_purchases table still exists"
fi

# Check column was dropped
if ! psql "$DATABASE_URL" -c "SELECT purchased_credits FROM user_credits LIMIT 1;" &>/dev/null; then
    echo -e "${GREEN}✓${NC} purchased_credits column removed"
else
    echo -e "${RED}✗${NC} purchased_credits column still exists"
fi

# Check credit configurations
echo ""
echo "Updated subscription credit configurations:"
run_query "SELECT plan_id, monthly_credits FROM subscription_credit_config ORDER BY plan_id;"

echo ""

# Step 6: Update environment
echo -e "${BLUE}Step 6: Environment Configuration${NC}"
echo "To activate the simplified credit system (V2), update your .env.local:"
echo ""
echo -e "${YELLOW}NEXT_PUBLIC_CREDIT_SYSTEM_VERSION=v2${NC}"
echo -e "${YELLOW}NEXT_PUBLIC_ENABLE_CREDIT_PURCHASES=false${NC}"
echo ""

# Step 7: Generate Drizzle types
echo -e "${BLUE}Step 7: Generating Drizzle types...${NC}"
pnpm db:generate
echo -e "${GREEN}✓${NC} Drizzle types updated"
echo ""

# Final summary
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Migration completed successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next steps:"
echo "1. Update .env.local with V2 configuration"
echo "2. Restart your development server: pnpm dev"
echo "3. Test the application thoroughly"
echo "4. Deploy to staging/production when ready"
echo ""
echo "Rollback information:"
echo "- Backup saved to: $BACKUP_FILE"
echo "- To rollback: psql \$DATABASE_URL < src/db/migrations/0003_rollback_credit_system.sql"
echo "- Then restore: psql \$DATABASE_URL < $BACKUP_FILE"
echo ""
echo "For production deployment, follow the deployment guide:"
echo "DEPLOYMENT_GUIDE_CREDIT_V2.md"