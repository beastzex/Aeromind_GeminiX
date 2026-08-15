import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

import { processAdvisorChat } from './advisorChat';
import { searchRealFlights } from './flightSearch';
import { getRealFlightStatus } from './flightStatus';
import { parseBoardingPassImage } from './parseBoardingPass';

admin.initializeApp();

const groqApiKey = defineSecret('GROQ_API_KEY');
const aviationStackKey = defineSecret('AVIATIONSTACK_KEY');
const openSkyClientId = defineSecret('OPENSKY_CLIENT_ID');
const openSkyClientSecret = defineSecret('OPENSKY_CLIENT_SECRET');

export const advisorChat = onCall(
  { secrets: [groqApiKey, aviationStackKey, openSkyClientId, openSkyClientSecret] },
  async (request) => {
    const message = request.data?.message;
    if (typeof message !== 'string' || !message.trim()) {
      throw new HttpsError('invalid-argument', 'message is required');
    }

    const auth = request.auth
      ? { uid: request.auth.uid, email: request.auth.token.email }
      : undefined;

    return processAdvisorChat(message, auth, {
      groqApiKey: groqApiKey.value(),
      aviationStackKey: aviationStackKey.value(),
      openSkyClientId: openSkyClientId.value(),
      openSkyClientSecret: openSkyClientSecret.value(),
    });
  }
);

export const searchFlights = onCall({ secrets: [aviationStackKey] }, async (request) => {
  const query = request.data?.query;
  if (typeof query !== 'string') {
    throw new HttpsError('invalid-argument', 'query is required');
  }
  return searchRealFlights(query, aviationStackKey.value());
});

export const flightStatus = onCall(
  { secrets: [aviationStackKey, openSkyClientId, openSkyClientSecret] },
  async (request) => {
    const flightNo = request.data?.flightNo;
    const date = request.data?.date || new Date().toISOString().slice(0, 10);
    if (typeof flightNo !== 'string' || !flightNo.trim()) {
      throw new HttpsError('invalid-argument', 'flightNo is required');
    }
    return getRealFlightStatus(flightNo, date, {
      aviationStackKey: aviationStackKey.value(),
      openSkyClientId: openSkyClientId.value(),
      openSkyClientSecret: openSkyClientSecret.value(),
    });
  }
);

export const parseBoardingPass = onCall(
  { secrets: [groqApiKey], timeoutSeconds: 60 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in to scan a boarding pass');
    }
    const { imageBase64, mimeType } = request.data ?? {};
    if (typeof imageBase64 !== 'string' || typeof mimeType !== 'string') {
      throw new HttpsError('invalid-argument', 'imageBase64 and mimeType are required');
    }
    try {
      return await parseBoardingPassImage(imageBase64, mimeType, groqApiKey.value());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not parse boarding pass';
      throw new HttpsError('failed-precondition', msg);
    }
  }
);
