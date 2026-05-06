---
name: security-hardening
description: 'Comprehensive security hardening for Angular Firebase applications. Use for fixing exposed credentials, implementing proper Firebase rules, securing authentication, and establishing security best practices.'
argument-hint: 'Optional: focus area (credentials|firebase|auth|all)'
---

# Security Hardening for Angular Firebase Applications

## When to Use

- **Exposed credentials** detected in environment files or source code
- **Wide-open Firebase security rules** allowing unrestricted access  
- **Insecure authentication patterns** using simple passwords or sessionStorage
- **Development configs** exposed in production environments
- **Missing security validation** in CI/CD pipelines
- **Before production deployment** of Angular Firebase applications

## Security Assessment Checklist

### 🔍 **Phase 1: Identify Vulnerabilities**

Run [security scanner](./scripts/security-scan.sh) to detect:

- [ ] **Exposed Credentials**
  - Hardcoded passwords (`admin123`, `password123`)
  - API keys and secrets in source code  
  - Firebase config with placeholder values
  - Environment variables in version control

- [ ] **Firebase Security Issues**
  - Wide-open Firestore rules (`allow read, write: if true`)
  - Missing authentication requirements
  - No data validation rules
  - Development Firebase config in production

- [ ] **Authentication Vulnerabilities** 
  - Simple password-based admin access
  - Session storage without encryption
  - No session expiration handling
  - Missing role-based access control

- [ ] **Code Quality Issues**
  - Direct `console.*` usage instead of logging service
  - Missing error handling for security operations
  - No input validation on security-critical operations

### 🛠️ **Phase 2: Implement Fixes**

#### **Credential Security**
1. **Replace hardcoded passwords** using [password generator](./scripts/generate-secure-credentials.sh)
2. **Move secrets to environment variables** with [environment template](./assets/environment-template.ts)
3. **Set up secret management** using [Firebase environment setup](./references/firebase-environment-setup.md)

#### **Firebase Security Rules**
1. **Implement proper Firestore rules** using [security rules template](./assets/firestore-security-rules.txt)
2. **Add authentication requirements** for all data access
3. **Implement data validation** rules for input sanitization  
4. **Test security rules** using [rules testing script](./scripts/test-firebase-rules.sh)

#### **Authentication Hardening**
1. **Replace simple password auth** with [Firebase Auth integration](./references/firebase-auth-setup.md)
2. **Implement secure session management** with proper expiration
3. **Add role-based access control** using [RBAC template](./assets/rbac-setup.ts)
4. **Set up multi-factor authentication** for admin access

#### **Code Security**
1. **Replace console logging** with production-safe LoggerService
2. **Add input validation** for all user inputs
3. **Implement proper error handling** without information disclosure
4. **Add security headers** for production deployment

### ✅ **Phase 3: Validation & Testing**

1. **Run automated security tests** using [security test suite](./scripts/security-tests.sh)
2. **Verify Firebase rules** block unauthorized access attempts
3. **Test credential rotation** procedures work correctly
4. **Validate authentication** flows handle edge cases
5. **Check production build** removes development artifacts

### 📚 **Phase 4: Documentation & Monitoring**

1. **Update security documentation** using [security checklist template](./assets/security-checklist.md)
2. **Set up security monitoring** with [monitoring setup guide](./references/security-monitoring.md)
3. **Create incident response plan** for security breaches
4. **Schedule regular security reviews** and penetration testing

## Quick Start Commands

```bash
# Full security assessment and hardening
/security-hardening all

# Focus on specific area
/security-hardening credentials
/security-hardening firebase  
/security-hardening auth

# Run security scan only
./scripts/security-scan.sh

# Generate secure credentials
./scripts/generate-secure-credentials.sh

# Test Firebase security rules
./scripts/test-firebase-rules.sh
```

## Decision Points

### **Credential Management**
- **Simple passwords** → Replace with environment variables + secure generation
- **API keys in code** → Move to secure environment configuration  
- **Development secrets** → Separate dev/staging/production credentials

### **Firebase Security Level**
- **Open rules** → Implement authentication-based rules
- **Basic auth** → Add role-based access control
- **No validation** → Add data validation and sanitization

### **Authentication Strategy**
- **Session-only** → Add proper session management with expiration
- **Single-factor** → Implement multi-factor authentication
- **No audit trail** → Add security event logging

## Completion Criteria

- [ ] **No credentials** exposed in source code or version control
- [ ] **Firebase rules** require authentication for all operations
- [ ] **Authentication system** uses secure, industry-standard practices
- [ ] **Security validation** integrated into CI/CD pipeline
- [ ] **Monitoring** detects and alerts on security events
- [ ] **Documentation** includes security procedures and incident response
- [ ] **Penetration testing** confirms security measures work effectively

## Related Security Resources

- [Firebase Security Best Practices](./references/firebase-security-best-practices.md)
- [Angular Security Checklist](./references/angular-security-checklist.md)  
- [Environment Configuration Security](./references/environment-security.md)
- [Authentication Implementation Guide](./references/authentication-guide.md)