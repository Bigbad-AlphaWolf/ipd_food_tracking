# Firebase Security Best Practices

Comprehensive guide for securing Firebase applications in production environments.

## 🔒 Firestore Security Rules

### **Replace Wide-Open Rules**

❌ **Never use in production:**
```javascript
allow read, write: if true;
```

✅ **Always require authentication:**
```javascript
allow read, write: if request.auth != null;
```

### **Implement Proper Authorization**

```javascript
// User can only access their own data
allow read, write: if request.auth.uid == resource.data.userId;

// Admin access with custom claims  
allow read, write: if request.auth.token.admin == true;

// Role-based access
allow read: if request.auth.token.role in ['user', 'admin'];
allow write: if request.auth.token.role == 'admin';
```

### **Data Validation Rules**

```javascript
// Validate required fields
allow create: if request.resource.data.keys().hasAll(['name', 'email']);

// Type validation
allow write: if request.resource.data.age is int 
             && request.resource.data.age > 0;

// String format validation  
allow write: if request.resource.data.email.matches('.*@.*\\..*');
```

## 🔑 Authentication Security

### **Firebase Auth Configuration**

1. **Enable appropriate providers** in Firebase Console
2. **Set up custom claims** for role-based access
3. **Configure password policies** (minimum length, complexity)
4. **Enable multi-factor authentication** for admin accounts

### **Session Management**

```typescript
// Set proper session persistence
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

// Handle session timeout
const TIMEOUT_MINUTES = 30;
setInterval(() => {
  if (firebase.auth().currentUser) {
    firebase.auth().currentUser.getIdTokenResult().then(result => {
      const authTime = new Date(result.authTime);
      if (Date.now() - authTime.getTime() > TIMEOUT_MINUTES * 60 * 1000) {
        firebase.auth().signOut();
      }
    });
  }
}, 60 * 1000); // Check every minute
```

## 🌍 Environment Security

### **Secure Configuration Management**

1. **Never commit secrets** to version control
2. **Use environment variables** for all sensitive data
3. **Separate configurations** for dev/staging/production
4. **Validate environment** variables at startup

### **Environment File Structure**

```typescript
// ✅ Secure environment template
export const environment = {
  production: true,
  firebase: {
    apiKey: process.env['FIREBASE_API_KEY'] || '',
    // ... other config from environment
  },
  adminPassword: process.env['ADMIN_PASSWORD'] || '',
};
```

### **.gitignore Configuration**

```bash
# Environment files
.env
.env.local  
.env.production
.env.staging

# Firebase
.firebase/
firebase-debug.log

# Security keys
*.pem
*.key
secrets.json
```

## 🛡️ Production Security Checklist

### **Before Deployment**
- [ ] Replace all hardcoded credentials
- [ ] Deploy proper Firestore security rules
- [ ] Enable Firebase Auth with proper providers
- [ ] Set up custom claims for admin users
- [ ] Configure HTTPS enforcement
- [ ] Enable security monitoring and alerting

### **Firebase Console Security**
- [ ] Remove test/demo data
- [ ] Set up proper IAM roles
- [ ] Enable audit logging
- [ ] Configure backup and recovery
- [ ] Set up monitoring dashboards

### **Application Security**
- [ ] Input validation on all forms
- [ ] Proper error handling (no information disclosure)
- [ ] Content Security Policy headers
- [ ] Rate limiting for API calls
- [ ] XSS protection

## 🚨 Security Monitoring

### **Set Up Alerts**

1. **Authentication failures** (multiple failed attempts)
2. **Unauthorized access attempts** (rule violations)
3. **Unusual data access patterns** (mass downloads)
4. **Configuration changes** (rules updates)

### **Logging Security Events**

```typescript
// Log security-relevant events
function logSecurityEvent(event: string, details: any) {
  if (environment.production) {
    // Send to monitoring service
    firebase.analytics().logEvent('security_event', {
      event_type: event,
      timestamp: new Date().toISOString(),
      ...details
    });
  }
}

// Usage examples
logSecurityEvent('failed_login', { username, ip_address });
logSecurityEvent('admin_access', { action, resource });
logSecurityEvent('rule_violation', { rule, user_id });
```

## 🔄 Regular Security Maintenance

### **Monthly Tasks**
- [ ] Review Firebase security logs
- [ ] Audit user permissions and roles
- [ ] Update Firebase SDK versions
- [ ] Test security rules with emulator
- [ ] Review and rotate API keys

### **Quarterly Tasks**
- [ ] Penetration testing
- [ ] Security rule comprehensive review
- [ ] Update security policies
- [ ] Train team on new security practices
- [ ] Review third-party integrations

## 📚 Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firebase Auth Best Practices](https://firebase.google.com/docs/auth/best-practices)
- [Angular Security Guide](https://angular.io/guide/security)
- [OWASP Web Application Security](https://owasp.org/www-project-top-ten/)

## 🚨 Incident Response

### **If Security Breach Detected**
1. **Immediately revoke** compromised credentials
2. **Update security rules** to block further access
3. **Document the incident** (what, when, how)
4. **Assess data impact** and notify stakeholders
5. **Update security measures** to prevent recurrence