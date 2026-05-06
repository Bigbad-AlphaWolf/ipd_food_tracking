# Netlify Deployment Guide for IPD Food Tracking App

This guide explains how to deploy your Angular food tracking app to Netlify using environment variables for secure configuration.

## 🚀 Quick Setup

### 1. Local Development Setup

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Update .env with your Firebase configuration
# Edit .env and replace placeholder values with real Firebase config

# 3. Install dependencies and test
npm install
npm start
```

### 2. Netlify Deployment Setup

#### Option A: Netlify CLI (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Set environment variables
netlify env:set NG_APP_FIREBASE_API_KEY "your-api-key"
netlify env:set NG_APP_FIREBASE_AUTH_DOMAIN "your-project.firebaseapp.com"
netlify env:set NG_APP_FIREBASE_PROJECT_ID "your-project-id"
netlify env:set NG_APP_FIREBASE_STORAGE_BUCKET "your-project.appspot.com"
netlify env:set NG_APP_FIREBASE_MESSAGING_SENDER_ID "123456789"
netlify env:set NG_APP_FIREBASE_APP_ID "1:123:web:abc123"
netlify env:set NG_APP_ADMIN_PASSWORD "your-secure-password"

# Deploy
netlify deploy --prod
```

#### Option B: Netlify Dashboard

1. Connect your repository to Netlify
2. Set build command: `cd frontend && npm ci && npm run build:prod`
3. Set publish directory: `frontend/dist/frontend/browser`
4. Add environment variables in Site Settings > Environment Variables:
   - `NG_APP_FIREBASE_API_KEY`
   - `NG_APP_FIREBASE_AUTH_DOMAIN`
   - `NG_APP_FIREBASE_PROJECT_ID`
   - `NG_APP_FIREBASE_STORAGE_BUCKET`
   - `NG_APP_FIREBASE_MESSAGING_SENDER_ID`
   - `NG_APP_FIREBASE_APP_ID`
   - `NG_APP_ADMIN_PASSWORD`

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NG_APP_FIREBASE_API_KEY` | Firebase API Key | `AIzaSyXXXXXXXXXXXXX` |
| `NG_APP_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `myproject.firebaseapp.com` |
| `NG_APP_FIREBASE_PROJECT_ID` | Firebase Project ID | `myproject-123` |
| `NG_APP_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `myproject.appspot.com` |
| `NG_APP_FIREBASE_MESSAGING_SENDER_ID` | FCM Sender ID | `123456789` |
| `NG_APP_FIREBASE_APP_ID` | Firebase App ID | `1:123:web:abc123` |
| `NG_APP_ADMIN_PASSWORD` | Admin panel password | `SecurePassword123!` |

### Where to Get Firebase Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (⚙️ icon)
4. Scroll to "Your apps" section
5. Copy the configuration values

### Generating Secure Admin Password

```bash
# Generate a secure password
openssl rand -base64 32 | tr -d "=+/" | cut -c1-24
```

## 🔒 Security Considerations

### Before Production Deployment:

1. **Firebase Security Rules**: Update Firestore rules from development (open) to production (restricted)
2. **Admin Password**: Use a strong, generated password
3. **HTTPS**: Netlify provides HTTPS by default
4. **Environment Variables**: Never commit actual values to git

### Firebase Security Rules Example:

```javascript
// firestore.rules - Production rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Employees collection - authenticated access only
    match /employees/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Meals collection - authenticated access only
    match /meals/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🛠️ How It Works

### Development Flow:
1. `npm start` → runs `load-env.js` → loads `.env` → serves app
2. Environment variables become available via `globalThis.NG_APP_*`
3. Angular environment files read from `globalThis`

### Production Flow:
1. Netlify builds with `npm run build:prod`
2. `load-env.js` reads environment variables from Netlify
3. Creates `assets/env.js` with configuration
4. Angular app loads `env.js` before initialization

### Build Process:
```
Netlify Environment Variables
        ↓
    load-env.js
        ↓
   assets/env.js
        ↓
   Angular Environment Files
        ↓
    Application Services
```

## 📝 Scripts Reference

| Script | Description |
|--------|-------------|
| `npm start` | Load env vars and start dev server |
| `npm run build` | Load env vars and build for development |
| `npm run build:prod` | Load env vars and build for production |

## 🐛 Troubleshooting

### "ng: not found" Error in CI
If you get `sh: 1: ng: not found` during Netlify deployment:

**Cause**: Angular CLI is not installed globally in CI environments.

**Solution**: The package.json scripts now use `npx ng` instead of `ng` directly. Make sure your package.json contains:
```json
{
  "scripts": {
    "ng": "npx ng",
    "build:prod": "node scripts/load-env.js && npx ng build --configuration=production"
  }
}
```

### Missing Environment Variables
- Check Netlify Site Settings > Environment Variables
- Ensure all variables start with `NG_APP_` prefix
- Check build logs for missing variable warnings

### Firebase Connection Issues
- Verify Firebase configuration values
- Check Firebase console for project settings
- Ensure Firebase rules allow your app's requests

### Build Failures
- Check Node.js version compatibility (recommend 18.x or 20.x)
- Verify all dependencies are in package.json
- Check for TypeScript errors in build logs

### Deployment Issues
- Verify `netlify.toml` configuration
- Check publish directory setting: `frontend/dist/frontend/browser`
- Ensure build command includes `cd frontend`

## 📚 Additional Resources

- [Netlify Environment Variables Documentation](https://docs.netlify.com/environment-variables/overview/)
- [Firebase Web Setup Guide](https://firebase.google.com/docs/web/setup)
- [Angular Deployment Guide](https://angular.io/guide/deployment)

---

**⚠️ Important**: Never commit `.env` files or actual credentials to version control. Always use environment variables for production deployment.