#!/bin/bash

# Security Scanner for Angular Firebase Applications
# Identifies common security vulnerabilities

set -e

echo "🔍 Running Security Assessment..."

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

ISSUES_FOUND=0

# Function to report security issues
report_issue() {
    local severity="$1"
    local message="$2"
    local file="$3"
    
    case $severity in
        "CRITICAL")
            echo -e "${RED}🚨 CRITICAL: ${message}${NC}"
            if [[ -n "$file" ]]; then echo -e "   📁 File: ${file}"; fi
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
            ;;
        "HIGH")
            echo -e "${RED}⚠️  HIGH: ${message}${NC}"
            if [[ -n "$file" ]]; then echo -e "   📁 File: ${file}"; fi
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
            ;;
        "MEDIUM")
            echo -e "${YELLOW}⚡ MEDIUM: ${message}${NC}"
            if [[ -n "$file" ]]; then echo -e "   📁 File: ${file}"; fi
            ;;
        "INFO")
            echo -e "${GREEN}ℹ️  INFO: ${message}${NC}"
            ;;
    esac
}

echo "📋 Checking for exposed credentials..."

# Check for weak/default credentials (not secure generated ones)
if find . -name "*environment*.ts" -exec grep -l "admin123\|password123\|123456\|secret\|YOUR_API_KEY\|CHANGE_ME" {} \; 2>/dev/null | head -1; then
    for file in $(find . -name "*environment*.ts" -exec grep -l "admin123\|password123\|123456\|secret" {} \; 2>/dev/null); do
        report_issue "CRITICAL" "Weak/default passwords detected" "$file"
    done
    for file in $(find . -name "*environment*.ts" -exec grep -l "YOUR_API_KEY\|CHANGE_ME" {} \; 2>/dev/null); do
        if [[ "$file" == *"environment.prod.ts" ]]; then
            report_issue "CRITICAL" "Production placeholders must be replaced before deployment" "$file"
        else
            report_issue "MEDIUM" "Placeholder values should be updated for deployment" "$file"
        fi
    done
fi

# Check for hardcoded secrets in TypeScript files
echo "🔑 Checking for hardcoded secrets in code..."
if grep -r "apiKey.*['\"].*['\"]" --include="*.ts" . 2>/dev/null | grep -v "YOUR_API_KEY" | head -1; then
    report_issue "HIGH" "Potential API key exposure in TypeScript files"
fi

# Check for Firebase security rules (if they exist)
echo "🔥 Checking Firebase security rules..."
if [[ -f "firestore.rules" ]]; then
    if grep -q "allow read, write: if true" firestore.rules; then
        report_issue "CRITICAL" "Wide-open Firebase security rules detected" "firestore.rules"
    fi
    if ! grep -q "request.auth" firestore.rules; then
        report_issue "HIGH" "Firebase rules don't require authentication" "firestore.rules"  
    fi
else
    report_issue "MEDIUM" "No Firebase security rules file found"
fi

# Check for console usage instead of logger
echo "📝 Checking for unsafe logging practices..."
console_files=$(find . -name "*.ts" -not -path "*/node_modules/*" -not -name "*logger*" -not -name "main.ts" -exec grep -l "console\." {} \; 2>/dev/null | wc -l)
if [[ $console_files -gt 0 ]]; then
    report_issue "MEDIUM" "$console_files files use console.* instead of LoggerService"
fi

# Check authentication patterns
echo "🔐 Checking authentication security..."
if grep -r "sessionStorage\|localStorage" --include="*.ts" . 2>/dev/null | grep -v "\.d\.ts" | head -1; then
    report_issue "MEDIUM" "Using browser storage for authentication (consider security implications)"
fi

# Check for missing HTTPS enforcement
echo "🔒 Checking for HTTPS enforcement..."
if [[ -f "angular.json" ]]; then
    if ! grep -q "ssl.*true" angular.json; then
        report_issue "MEDIUM" "HTTPS not enforced in Angular configuration"
    fi
fi

# Check production environment configuration
echo "🏗️ Checking production configuration..."
if [[ -f "frontend/src/environments/environment.prod.ts" ]] || [[ -f "src/environments/environment.prod.ts" ]]; then
    prod_env=$(find . -name "environment.prod.ts" | head -1)
    if grep -q "YOUR_\|CHANGE_ME\|placeholder" "$prod_env" 2>/dev/null; then
        report_issue "CRITICAL" "Production environment contains placeholder values" "$prod_env"
    fi
fi

# Summary
echo ""
echo "📊 Security Assessment Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ $ISSUES_FOUND -eq 0 ]]; then
    echo -e "${GREEN}✅ No critical security issues found${NC}"
    exit 0
else
    echo -e "${RED}🚨 $ISSUES_FOUND security issues detected${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review and fix critical/high severity issues"
    echo "2. Run security hardening procedures" 
    echo "3. Re-scan after fixes applied"
    exit 1
fi