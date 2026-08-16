export interface DisruptionInput {
  atcCongestionOrigin?: number;
  atcCongestionDest?: number;
  weatherOriginCode?: number;
  weatherDestCode?: number;
  delayMinutesSoFar?: number;
  historicalOtpRate?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeAtcFactor(origin = 30, dest = 20): number {
  return clamp((origin + dest) / 2, 0, 100);
}

function computeWeatherFactor(originSeverity = 20, destSeverity = 15): number {
  return clamp(Math.max(originSeverity, destSeverity), 0, 100);
}

function computeDelayFactor(minutesLate = 0): number {
  if (minutesLate <= 0) return 0;
  if (minutesLate >= 120) return 100;
  return clamp((minutesLate / 120) * 100, 0, 100);
}

function computeOtpFactor(onTimePercentage = 85): number {
  return clamp(100 - onTimePercentage, 0, 100);
}

export function calculateDisruptionScore(input: DisruptionInput): number {
  const atc = computeAtcFactor(input.atcCongestionOrigin ?? 35, input.atcCongestionDest ?? 25);
  const weather = computeWeatherFactor(input.weatherOriginCode ?? 40, input.weatherDestCode ?? 15);
  const delay = computeDelayFactor(input.delayMinutesSoFar ?? 45);
  const otp = computeOtpFactor(input.historicalOtpRate ?? 78);

  const rawScore = 0.4 * atc + 0.25 * weather + 0.2 * delay + 0.15 * otp;
  return Math.round(clamp(rawScore, 0, 100));
}
