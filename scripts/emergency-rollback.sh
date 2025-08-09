#!/bin/bash

# ============================================
# Emergency Rollback Script for Credit System
# ============================================
# Usage: ./emergency-rollback.sh [--confirm]
# 
# This script performs an emergency rollback of the credit system
# from the simplified version back to the original version with purchases
#
# Author: WatermarkRemover Team
# Date: 2025-01-08
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if PostgreSQL client is installed
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL client (psql) is not installed"
        exit 1
    fi
    
    # Check if DATABASE_URL is set
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL environment variable is not set"
        exit 1
    fi
    
    # Check if rollback SQL exists
    if [ ! -f "$PROJECT_ROOT/src/db/migrations/0003_rollback_credit_system.sql" ]; then
        print_error "Rollback SQL file not found"
        exit 1
    fi
    
    print_status "Prerequisites check passed"
}

# Function to create backup
create_backup() {
    print_status "Creating database backup..."
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Create backup
    BACKUP_FILE="$BACKUP_DIR/pre_rollback_${TIMESTAMP}.sql"
    pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        print_status "Backup created: $BACKUP_FILE"
    else
        print_error "Failed to create backup"
        exit 1
    fi
}

# Function to perform database rollback
rollback_database() {
    print_status "Starting database rollback..."
    
    # Execute rollback SQL
    psql "$DATABASE_URL" < "$PROJECT_ROOT/src/db/migrations/0003_rollback_credit_system.sql"
    
    if [ $? -eq 0 ]; then
        print_status "Database rollback completed successfully"
    else
        print_error "Database rollback failed"
        exit 1
    fi
}

# Function to verify rollback
verify_rollback() {
    print_status "Verifying rollback..."
    
    # Run verification query
    VERIFY_RESULT=$(psql "$DATABASE_URL" -t -c "SELECT * FROM verify_rollback();" 2>/dev/null)
    
    if echo "$VERIFY_RESULT" | grep -q "FAIL"; then
        print_error "Rollback verification failed:"
        echo "$VERIFY_RESULT"
        exit 1
    else
        print_status "Rollback verification passed"
    fi
}

# Function to switch application code
switch_application_code() {
    print_status "Switching application code..."
    
    # Check if git tag exists
    if git rev-parse pre-credit-migration-v1 >/dev/null 2>&1; then
        print_status "Checking out pre-migration code..."
        git stash
        git checkout pre-credit-migration-v1
        
        print_status "Installing dependencies..."
        npm install
        
        print_status "Building application..."
        npm run build
        
        print_status "Application code switched successfully"
    else
        print_warning "Git tag 'pre-credit-migration-v1' not found. Please manually switch code."
    fi
}

# Function to update environment variables
update_environment() {
    print_status "Updating environment variables..."
    
    # Create or update .env.rollback
    cat > "$PROJECT_ROOT/.env.rollback" << EOF
# Rollback Configuration
CREDIT_SYSTEM_VERSION=v1
ENABLE_CREDIT_PURCHASES=true
ROLLBACK_MODE=true
ROLLBACK_TIMESTAMP=$TIMESTAMP
EOF
    
    print_status "Environment variables updated in .env.rollback"
    print_warning "Please update your production environment variables accordingly"
}

# Function to notify team
notify_team() {
    print_status "Sending notifications..."
    
    # Send Slack notification (if webhook URL is set)
    if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 Emergency rollback initiated for credit system at $TIMESTAMP\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
    
    # Log to monitoring system
    echo "ROLLBACK: Credit system rolled back at $TIMESTAMP" >> "$PROJECT_ROOT/logs/rollback.log"
    
    print_status "Team notified"
}

# Function to display summary
display_summary() {
    echo ""
    echo "============================================"
    echo "        ROLLBACK SUMMARY"
    echo "============================================"
    echo "Timestamp: $TIMESTAMP"
    echo "Backup: $BACKUP_FILE"
    echo "Status: SUCCESS"
    echo ""
    echo "Next Steps:"
    echo "1. Deploy the rolled-back application code"
    echo "2. Monitor system metrics and error rates"
    echo "3. Check user reports and support tickets"
    echo "4. Conduct post-mortem analysis"
    echo "============================================"
}

# Main execution
main() {
    echo "============================================"
    echo "     EMERGENCY ROLLBACK SCRIPT"
    echo "============================================"
    echo ""
    
    # Check if --confirm flag is provided
    if [ "$1" != "--confirm" ]; then
        print_warning "This will rollback the credit system to the previous version."
        print_warning "All changes from the simplified system will be reverted."
        echo ""
        read -p "Are you sure you want to continue? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            print_status "Rollback cancelled"
            exit 0
        fi
    fi
    
    print_status "Starting emergency rollback..."
    echo ""
    
    # Execute rollback steps
    check_prerequisites
    create_backup
    rollback_database
    verify_rollback
    switch_application_code
    update_environment
    notify_team
    
    # Display summary
    display_summary
    
    print_status "Emergency rollback completed successfully!"
}

# Run main function
main "$@"