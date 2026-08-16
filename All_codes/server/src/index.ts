import 'dotenv/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import * as admin from 'firebase-admin';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';

import { processAdvisorChat } from './lib/advisorChat';
import { searchRealFlights } from './lib/flightSearch';
import { getRealFlightStatus } from './lib/flightStatus';
import { parseBoardingPassImage } from './lib/parseBoardingPass';
import { mintGeminiLiveToken, mintDeepgramAgentToken } from './lib/mintVoiceToken';

// ---------------------------------------------------------------------------
// Firebase Admin — used only to verify ID tokens and read Firestore. All the
// third-party API calls below run natively, so no Cloud Functions, no Secret
// Manager, and no Blaze plan are involved.
// ---------------------------------------------------------------------------
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (serviceAccountPath) {
  const resolved = path.resolve(__dirname, '..', serviceAccountPath);
  const serviceAccount = JSON.parse(readFileSync(resolved, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
} else {
  // Falls back to GOOGLE_APPLICATION_CREDENTIALS / gcloud ADC.
  admin.initializeApp();
}

const keys = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
  aviationStackKey: process.env.AVIATIONSTACK_KEY,
  openSkyClientId: process.env.OPENSKY_CLIENT_ID,
  openSkyClientSecret: process.env.OPENSKY_CLIENT_SECRET,
  deepgramApiKey: process.env.DEEPGRAM_API_KEY,
};

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const app = express();
const PORT = Number(process.env.PORT) || 8080;
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
// Boarding-pass scans arrive as base64, so the default 100kb limit is too small.
app.use(express.json({ limit: '15mb' }));

// Request log — one line per call, emitted on response so it carries the real
// status and duration. Bodies are never logged: they contain boarding-pass
// images and chat content.
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - startedAt;
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const who = req.headers.authorization ? 'auth' : 'anon';
    const mark = res.statusCode >= 500 ? '✗' : res.statusCode >= 400 ? '!' : '✓';
    console.log(
      `${mark} ${time}  ${req.method} ${req.originalUrl}  ${res.statusCode}  ${ms}ms  [${who}]`
    );
  });
  next();
});

/** HTTP status + message, mirroring the HttpsError codes the callables used. */
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type AuthContext = { uid: string; email?: string | null } | undefined;

/**
 * Verifies the Firebase ID token sent as `Authorization: Bearer <token>`.
 * The callable protocol did this implicitly via `request.auth`; natively we
 * verify it ourselves. Returns undefined for anonymous callers rather than
 * throwing — only routes that require sign-in reject on undefined.
 */
async function readAuth(req: Request): Promise<AuthContext> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  try {
    const decoded = await admin.auth().verifyIdToken(header.slice(7));
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return undefined;
  }
}

const route =
  (handler: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).then((body) => res.json(body)).catch(next);
  };

// ---------------------------------------------------------------------------
// Routes — one per former callable
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    providers: {
      gemini: Boolean(keys.geminiApiKey),
      groq: Boolean(keys.groqApiKey),
      aviationStack: Boolean(keys.aviationStackKey),
      openSky: Boolean(keys.openSkyClientId && keys.openSkyClientSecret),
      deepgram: Boolean(keys.deepgramApiKey),
    },
  });
});

app.get(('/'), (_req, res) => {
  res.json({
    message: 'Welcome to the AeroMind API!',
    routes: [
      '/api/health',
      '/api/advisor-chat',
      '/api/flights/search',
      '/api/flights/status',
      '/api/boarding-pass/parse',
      '/api/voice/token',
    ],
  });
});

app.post(
  '/api/advisor-chat',
  route(async (req) => {
    const { message } = req.body ?? {};
    if (typeof message !== 'string' || !message.trim()) {
      throw new ApiError(400, 'message is required');
    }
    const result = await processAdvisorChat(message, await readAuth(req), keys);
    // Which model actually answered — Gemini 503s fall back to Groq silently.
    const provider = result.citations.find((c) => c.toolName === 'ai_model')?.data?.provider;
    if (provider) console.log(`    └ answered by ${provider}`);
    return result;
  })
);

app.post(
  '/api/flights/search',
  route(async (req) => {
    const { query } = req.body ?? {};
    if (typeof query !== 'string') {
      throw new ApiError(400, 'query is required');
    }
    if (!keys.aviationStackKey) {
      throw new ApiError(503, 'AVIATIONSTACK_KEY is not configured on the server');
    }
    return searchRealFlights(query, keys.aviationStackKey);
  })
);

app.post(
  '/api/flights/status',
  route(async (req) => {
    const { flightNo, date } = req.body ?? {};
    if (typeof flightNo !== 'string' || !flightNo.trim()) {
      throw new ApiError(400, 'flightNo is required');
    }
    return getRealFlightStatus(flightNo, date || new Date().toISOString().slice(0, 10), keys);
  })
);

app.post(
  '/api/voice/token',
  route(async (req) => {
    const { provider } = req.body ?? {};
    if (provider !== 'gemini' && provider !== 'deepgram') {
      throw new ApiError(400, 'provider must be "gemini" or "deepgram"');
    }
    if (provider === 'gemini') {
      if (!keys.geminiApiKey) throw new ApiError(503, 'GEMINI_API_KEY is not configured on the server');
      try {
        return await mintGeminiLiveToken(keys.geminiApiKey);
      } catch (err) {
        throw new ApiError(502, err instanceof Error ? err.message : 'Could not mint Gemini Live token');
      }
    }
    if (!keys.deepgramApiKey) throw new ApiError(503, 'DEEPGRAM_API_KEY is not configured on the server');
    try {
      return await mintDeepgramAgentToken(keys.deepgramApiKey);
    } catch (err) {
      throw new ApiError(502, err instanceof Error ? err.message : 'Could not mint Deepgram token');
    }
  })
);

app.post(
  '/api/boarding-pass/parse',
  route(async (req) => {
    const auth = await readAuth(req);
    if (!auth) throw new ApiError(401, 'Sign in to scan a boarding pass');

    const { imageBase64, mimeType } = req.body ?? {};
    if (typeof imageBase64 !== 'string' || typeof mimeType !== 'string') {
      throw new ApiError(400, 'imageBase64 and mimeType are required');
    }
    try {
      return await parseBoardingPassImage(imageBase64, mimeType, keys);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not parse boarding pass';
      throw new ApiError(422, msg);
    }
  })
);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status = err instanceof ApiError ? err.status : 500;
  const message = err instanceof Error ? err.message : 'Internal error';
  if (status >= 500) console.error(err);
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`AeroMind API listening on http://localhost:${PORT}`);
  console.log(`  CORS origins: ${ALLOWED_ORIGINS.join(', ')}`);
});
