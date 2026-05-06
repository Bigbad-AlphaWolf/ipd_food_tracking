export const environment = {
  production: true,
  firebase: {
    // IMPORTANT: Update these with your production Firebase config
    // Get from Firebase Console > Project Settings > Your apps
    apiKey: 'UPDATE-WITH-PRODUCTION-API-KEY',
    authDomain: 'update-with-production-project.firebaseapp.com',
    projectId: 'update-with-production-project-id',
    storageBucket: 'update-with-production-project-id.appspot.com',
    messagingSenderId: 'UPDATE-WITH-PRODUCTION-SENDER-ID',
    appId: 'UPDATE-WITH-PRODUCTION-APP-ID',
  },
  
  // SECURITY: Use a secure password for production
  // Generate one using: openssl rand -base64 24 | tr -d "=+/" | cut -c1-24
  adminPassword: 'GENERATE-SECURE-PASSWORD-FOR-PRODUCTION',
  
  // Production security configuration
  security: {
    sessionTimeoutMinutes: 30,
    enableMFA: true,
    enforceHTTPS: true,
    logSecurityEvents: true
  },
  
  // Production API configuration
  api: {
    timeout: 10000,
    retries: 3
  }
};

// Production validation
if (environment.firebase.apiKey.includes('UPDATE-WITH') ||
    environment.adminPassword.includes('GENERATE-SECURE')) {
  console.error('SECURITY WARNING: Update production environment values before deployment');
}