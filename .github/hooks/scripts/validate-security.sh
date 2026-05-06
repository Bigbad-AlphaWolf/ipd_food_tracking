#!/bin/bash

# Pre-commit validation script for IPD Food Tracking Angular app
# Checks for security and code quality issues

set -e

# Read hook input from stdin
HOOK_INPUT=$(cat)

# Parse tool information from hook input
TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool.name // empty')
FILE_PATHS=$(echo "$HOOK_INPUT" | jq -r '.tool.parameters.filePath // empty')

# Initialize validation flags
HAS_ERRORS=false
WARNINGS=()
ERRORS=()

# Function to check environment files for exposed credentials
check_environment_security() {
    local file="$1"
    
    if [[ "$file" == *"environment"* ]]; then
        if grep -q "admin123\|CHANGE_ME\|YOUR_API_KEY\|placeholder" "$file" 2>/dev/null; then
            ERRORS+=("🚨 SECURITY: $file contains exposed credentials or placeholder values")
            HAS_ERRORS=true
        fi
        
        if [[ "$file" == *"environment.prod.ts" ]] && grep -q "ddsi-food-app" "$file" 2>/dev/null; then
            WARNINGS+=("⚠️  Production environment file appears to use development Firebase config")
        fi
    fi
}

# Function to check for console usage instead of LoggerService
check_console_usage() {
    local file="$1"
    
    if [[ "$file" == *".ts" ]] && [[ "$file" != *"logger.service.ts" ]] && [[ "$file" != *"main.ts" ]]; then
        if grep -q "console\." "$file" 2>/dev/null; then
            WARNINGS+=("⚠️  $file uses console.* - consider using LoggerService for production-safe logging")
        fi
    fi
}

# Function to check component architecture compliance
check_component_architecture() {
    local file="$1"
    
    if [[ "$file" == *".component.ts" ]]; then
        if grep -q "standalone.*true" "$file" 2>/dev/null; then
            ERRORS+=("🚨 ARCHITECTURE: $file uses standalone components - this project requires traditional modules (standalone: false)")
            HAS_ERRORS=true
        fi
    fi
}

# Function to check admin password exposure in TypeScript files
check_admin_password_exposure() {
    local file="$1"
    
    if [[ "$file" == *".ts" ]]; then
        if grep -q "adminPassword.*admin123" "$file" 2>/dev/null; then
            ERRORS+=("🚨 SECURITY: $file contains hardcoded admin password 'admin123'")
            HAS_ERRORS=true
        fi
    fi
}

# Only run validations for relevant tools and file operations
if [[ "$TOOL_NAME" == *"file"* || "$TOOL_NAME" == *"edit"* || "$TOOL_NAME" == *"create"* || "$TOOL_NAME" == *"replace"* ]]; then
    
    # Check if we have specific file paths to validate
    if [[ -n "$FILE_PATHS" && "$FILE_PATHS" != "null" ]]; then
        FILES_TO_CHECK=("$FILE_PATHS")
    else
        # Check recent changes if no specific file provided
        FILES_TO_CHECK=($(find frontend/src -name "*.ts" -o -name "*environment*" 2>/dev/null | head -20))
    fi
    
    # Run validations on each file
    for file in "${FILES_TO_CHECK[@]}"; do
        if [[ -f "$file" ]]; then
            check_environment_security "$file"
            check_console_usage "$file"
            check_component_architecture "$file"
            check_admin_password_exposure "$file"
        fi
    done
fi

# Prepare hook response
if [[ "$HAS_ERRORS" == true ]]; then
    # Block operation due to security errors
    ERROR_MSG="VALIDATION FAILED - Critical security issues detected:"
    for error in "${ERRORS[@]}"; do
        ERROR_MSG="$ERROR_MSG\n$error"
    done
    
    echo "{
        \"hookSpecificOutput\": {
            \"hookEventName\": \"PreToolUse\",
            \"permissionDecision\": \"deny\",
            \"permissionDecisionReason\": \"$ERROR_MSG\"
        },
        \"stopReason\": \"Security validation failed\"
    }" | jq .
    
    exit 2  # Blocking error
elif [[ ${#WARNINGS[@]} -gt 0 ]]; then
    # Show warnings but allow operation
    WARNING_MSG="Code quality warnings:"
    for warning in "${WARNINGS[@]}"; do
        WARNING_MSG="$WARNING_MSG\n$warning"
    done
    
    echo "{
        \"hookSpecificOutput\": {
            \"hookEventName\": \"PreToolUse\",
            \"permissionDecision\": \"ask\",
            \"permissionDecisionReason\": \"$WARNING_MSG\"
        },
        \"systemMessage\": \"Code quality warnings detected. Review and approve to continue.\"
    }" | jq .
else
    # All clear - allow operation
    echo "{
        \"hookSpecificOutput\": {
            \"hookEventName\": \"PreToolUse\",
            \"permissionDecision\": \"allow\"
        }
    }" | jq .
fi