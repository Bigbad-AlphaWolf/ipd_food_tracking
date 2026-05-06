// Production environment - reads from environment variables
export const environment = {
  production: true,
  firebase: {
    apiKey: (globalThis as any)?.NG_APP_FIREBASE_API_KEY || '',
    authDomain: (globalThis as any)?.NG_APP_FIREBASE_AUTH_DOMAIN || '',
    projectId: (globalThis as any)?.NG_APP_FIREBASE_PROJECT_ID || '',
    storageBucket: (globalThis as any)?.NG_APP_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: (globalThis as any)?.NG_APP_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: (globalThis as any)?.NG_APP_FIREBASE_APP_ID || '',
  },
  adminPassword: (globalThis as any)?.NG_APP_ADMIN_PASSWORD || '',
  
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
if (!environment.firebase.apiKey || !environment.adminPassword) {
  console.error('CONFIGURATION ERROR: Required environment variables not set. Check NG_APP_* variables.');
}