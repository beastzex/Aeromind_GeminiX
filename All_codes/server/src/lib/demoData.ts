// Mirrors the demo account defined in src/lib/mockData.ts on the client.
// Duplicated here (rather than imported) because functions/ builds as its own
// TypeScript project with a different module target than the Vite app.
export const DEMO_EMAIL = 'alex.vance@aeromind.ai';

export function isDemoAccount(email?: string | null): boolean {
  return !email || email.toLowerCase() === DEMO_EMAIL;
}

export const DEMO_FLIGHT_CONTEXT = {
  flightNo: 'AI302',
  route: 'DEL → SFO',
  gate: 'B22',
  terminal: 'T3',
  delayMinutes: 85,
  disruptionScore: 74,
};
