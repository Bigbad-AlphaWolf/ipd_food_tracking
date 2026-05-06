export const environment = {
  production: true, // Set to false for development
  firebase: {
    // 🔒 Replace with your Firebase project configuration
    // Get these values from Firebase Console > Project Settings > Your apps
    apiKey: process.env['FIREBASE_API_KEY'] || '', 
    authDomain: process.env['FIREBASE_AUTH_DOMAIN'] || '',
    projectId: process.env['FIREBASE_PROJECT_ID'] || '',
    storageBucket: process.env['FIREBASE_STORAGE_BUCKET'] || '',
    messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'] || '',
    appId: process.env['FIREBASE_APP_ID'] || '',
  },
  
  // 🚨 SECURITY: Never hardcode passwords in source code
  // Use environment variables or secure secret management
  adminPassword: process.env['ADMIN_PASSWORD'] || '',
  
  // 🔒 Optional: Additional security configuration
  security: {
    sessionTimeoutMinutes: 30,
    enableMFA: true,
    enforceHTTPS: true,
    logSecurityEvents: true
  },
  
  // 🌍 API endpoints (use environment variables)
  api: {
    baseUrl: process.env['API_BASE_URL'] || '',
    // Don't expose internal URLs in client code
  }
};

// 🛡️ Security Checklist for this file:
// ✅ No hardcoded secrets
// ✅ Uses environment variables  
// ✅ Production settings configured
// ✅ Security options enabled
// ✅ No development artifacts