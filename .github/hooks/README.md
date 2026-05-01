# Pre-Commit Security Hook

This hook validates critical security and code quality issues in the IPD Food Tracking Angular application before allowing tool operations.

## What It Checks

### 🚨 **Blocking Errors** (Operations denied):
- **Exposed credentials**: Hardcoded admin passwords (`admin123`), placeholder values (`YOUR_API_KEY`, `CHANGE_ME`)
- **Architecture violations**: Standalone components (this project requires traditional modules)
- **Hardcoded passwords**: Admin passwords in TypeScript files

### ⚠️ **Warnings** (Requires confirmation):
- **Console usage**: Direct `console.*` calls instead of `LoggerService`
- **Config issues**: Production environment using development Firebase config

## Files Monitored

- `frontend/src/environments/*.ts` - Environment configuration
- `frontend/src/**/*.component.ts` - Angular components
- `frontend/src/**/*.service.ts` - Angular services
- Any TypeScript file being edited

## Hook Configuration

**File**: `.github/hooks/pre-commit.json`
**Script**: `.github/hooks/scripts/validate-security.sh`
**Trigger**: `PreToolUse` event (before any file operation)

## Testing the Hook

### Manual Test

```bash
# Test the script directly
cd .github/hooks
echo '{"tool":{"name":"replace_string_in_file","parameters":{"filePath":"frontend/src/environments/environment.ts"}}}' | ./scripts/validate-security.sh
```

### Trigger Common Violations

1. **Test exposed credentials**:
   ```bash
   # This should be blocked
   echo "adminPassword: 'admin123'" >> frontend/src/environments/environment.ts
   ```

2. **Test console usage**:
   ```bash
   # This should warn
   echo "console.log('test');" >> frontend/src/app/test.service.ts
   ```

3. **Test standalone components**:
   ```bash
   # This should be blocked
   echo "standalone: true" >> frontend/src/app/test.component.ts
   ```

## Hook Output Examples

### ✅ **Success**:
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow"
  }
}
```

### ⚠️ **Warning** (requires confirmation):
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse", 
    "permissionDecision": "ask",
    "permissionDecisionReason": "Code quality warnings:\n⚠️ file.ts uses console.* - consider using LoggerService"
  }
}
```

### 🚨 **Blocked** (operation denied):
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny", 
    "permissionDecisionReason": "VALIDATION FAILED - Critical security issues detected:\n🚨 environment.ts contains exposed credentials"
  },
  "stopReason": "Security validation failed"
}
```

## Bypassing the Hook

If you need to bypass for legitimate reasons:

1. **Temporary disable**: Rename `pre-commit.json` to `pre-commit.json.disabled`
2. **Fix and retry**: Address the security issues then retry the operation
3. **Manual approval**: For warnings, approve when prompted

## Customization

Edit `scripts/validate-security.sh` to:
- Add new validation rules
- Modify file patterns
- Adjust error/warning thresholds
- Add project-specific checks

## Related Security Tasks

- [ ] Replace hardcoded admin passwords with environment variables
- [ ] Implement proper Firebase security rules  
- [ ] Set up proper authentication system
- [ ] Add SSL/HTTPS configuration for production