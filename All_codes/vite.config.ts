import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Only these are safe to ship in the client bundle — they're Firebase's public
// web-app identifiers, not secrets (Firebase access control is enforced by
// Firestore/Storage security rules and Cloud Functions auth checks, not by
// hiding this config). Everything else in .env (GROQ_API_KEY, OPENSKY_*,
// AVIATIONSTACK_KEY, OPENWEATHER_KEY, FIREBASE_SERVICE_ACCOUNT_JSON) must
// never reach the browser — those calls live in functions/ instead.
const PUBLIC_ENV_KEYS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const publicEnv = Object.fromEntries(PUBLIC_ENV_KEYS.map((key) => [key, env[key] || '']));
  return {
    plugins: [react()],
    define: {
      'process.env': JSON.stringify(publicEnv),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});

