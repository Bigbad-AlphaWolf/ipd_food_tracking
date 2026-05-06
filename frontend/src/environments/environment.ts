// Development environment - uses local .env or fallback values
export const environment = {
  production: false,
  firebase: {
    apiKey: (globalThis as any)?.NG_APP_FIREBASE_API_KEY || 'YOUR_API_KEY',
    authDomain: (globalThis as any)?.NG_APP_FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT_ID.firebaseapp.com',
    projectId: (globalThis as any)?.NG_APP_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
    storageBucket: (globalThis as any)?.NG_APP_FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT_ID.appspot.com',
    messagingSenderId: (globalThis as any)?.NG_APP_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
    appId: (globalThis as any)?.NG_APP_FIREBASE_APP_ID || 'YOUR_APP_ID',
  },
  adminPassword: (globalThis as any)?.NG_APP_ADMIN_PASSWORD || 'CHANGE_ME_BEFORE_DEPLOY',
};
